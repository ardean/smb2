import { Socket } from "net";
import Request from "./Request";
import Response from "./Response";
import { EventEmitter } from "events";
import Packet, { PacketType, Data } from "./Packet";
import Session, { AuthenticateOptions } from "./Session";

export interface Options {
  port?: number;
  connectTimeout?: number;
  requestTimeout?: number;
}

interface Connection {
  on(event: "error", callback: (error: Error) => void): this;
  on(event: "changeNotify", callback: (response: Response) => void): this;

  once(event: "error", callback: (error: Error) => void): this;
  once(event: "changeNotify", callback: (response: Response) => void): this;
}

class Connection extends EventEmitter {
  _id = Buffer.from([
    Math.floor(Math.random() * 256) & 0xff,
    Math.floor(Math.random() * 256) & 0xff,
    Math.floor(Math.random() * 256) & 0xff,
    Math.floor(Math.random() * 256) & 0xfe
  ]);
  socket: Socket;
  nextMessageId: number = 0;

  responseBuffer: Buffer = Buffer.allocUnsafe(0);
  responseMap = new Map<number, Response>();
  responseCallbackMap = new Map<number, (response: Response) => void>();

  connected: boolean = false;

  port: number = 445;

  connectTimeout: number = 5 * 1000;
  connectTimeoutId: NodeJS.Timer;

  requestTimeout: number = 5 * 1000;
  requestTimeoutIdMap = new Map<number, NodeJS.Timeout>();

  sessions: Session[] = [];

  constructor(
    public host: string,
    public options: Options = {}
  ) {
    super();

    if (typeof this.options.port === "number") this.port = this.options.port;
    if (typeof this.options.connectTimeout === "number") this.connectTimeout = this.options.connectTimeout;
    if (typeof this.options.requestTimeout === "number") this.requestTimeout = this.options.requestTimeout;
  }

  async connect() {
    if (this.connected) return;

    this.socket = new Socket({ allowHalfOpen: true })
      .addListener("data", this.onData)
      .addListener("error", this.onError)
      .addListener("close", this.onClose);
    this.socket.setTimeout(0);
    this.socket.setKeepAlive(true);

    const connectPromise = new Promise<void>((resolve, reject) => {
      this.connectTimeoutId = setTimeout(() => {
        reject(new Error("connect_timeout"));
      }, this.connectTimeout);
      this.socket.connect(
        this.port,
        this.host
      );
      this.socket.once("connect", () => {
        resolve();
      });
      this.socket.once("error", (err) => {
        reject(err);
      });
    });

    try {
      await connectPromise;
      clearTimeout(this.connectTimeoutId);
      this.connected = true;
    } catch (err) {
      this.destroySocket();
      throw err;
    }
  }

  createRequest(type: PacketType, headers: Data = {}, body: Data = {}) {
    const messageId = this.nextMessageId++;

    return new Request(type, {
      connectionId: this._id,
      messageId,
      ...headers
    }, body);
  }

  async request(type: PacketType, headers?: Data, body?: Data) {
    const request = this.createRequest(type, headers, body);
    return await this.send(request);
  }

  async send(request: Request) {
    if (!this.connected) throw new Error("not_connected");

    const buffer = request.serialize();
    this.socket.write(buffer);

    const messageId = request.headers.messageId as number;
    const sendPromise = new Promise<Response>((resolve, reject) => {
      const requestTimeoutId = setTimeout(
        () => {
          const err = new Error(`request_timeout: ${Packet.parseEnumValue(PacketType, request.headers.type as number)}(${messageId})`);
          reject(err);
        },
        this.requestTimeout
      );

      this.requestTimeoutIdMap.set(messageId, requestTimeoutId);

      const finishRequest = (response: Response) => {
        response.request = request;

        if (
          response.status.severity.message === "Error" &&
          response.status.code !== "STATUS_MORE_PROCESSING_REQUIRED"
        ) {
          reject(response);
        } else {
          resolve(response);
        }
      };

      if (this.responseMap.has(messageId)) {
        finishRequest(this.responseMap.get(messageId));
        this.responseMap.delete(messageId);
      } else if (!this.responseCallbackMap.has(messageId)) {
        this.responseCallbackMap.set(messageId, finishRequest);
      }
    });

    const response = await sendPromise;
    if (this.requestTimeoutIdMap.has(messageId)) {
      const requestTimeoutId = this.requestTimeoutIdMap.get(messageId);
      clearTimeout(requestTimeoutId);
      this.requestTimeoutIdMap.delete(messageId);
    }

    return response;
  }

  onData = (data: Buffer) => {
    this.responseBuffer = Buffer.concat([
      this.responseBuffer,
      data
    ]);

    let extract = true;
    while (extract) {
      extract = false;
      if (this.responseBuffer.length >= 4) {
        const messageLength = (this.responseBuffer.readUInt8(1) << 16) + this.responseBuffer.readUInt16BE(2);
        if (this.responseBuffer.length >= messageLength + 4) {
          extract = true;
          const responseBuffer = this.responseBuffer.slice(4, messageLength + 4);
          const response = Response.fromBuffer(responseBuffer);
          this.onResponse(response);
          this.responseBuffer = this.responseBuffer.slice(messageLength + 4);
        }
      }
    }
  }

  onResponse(response: Response) {
    if (response.type === PacketType.ChangeNotify && response.status.code === "STATUS_SUCCESS") {
      this.emit("changeNotify", response);
    }

    const messageId = response.headers.messageId as number;
    if (this.responseCallbackMap.has(messageId)) {
      this.responseCallbackMap.get(messageId)(response);
      this.responseCallbackMap.delete(messageId);
    } else {
      this.responseMap.set(messageId, response);
    }
  }

  onError = (err: Error) => {
    this.emit("error", err);
  }

  onClose = (hadError: boolean) => {
    this.connected = false;
    this.emit("error", new Error("connection_closed"));
  }

  async echo() {
    return await this.request(PacketType.Echo);
  }

  async authenticate(options: AuthenticateOptions) {
    if (!this.connected) await this.connect();

    const session = new Session(this);
    this.registerSession(session);
    await session.authenticate(options);
    return session;
  }

  private destroySocket() {
    this.socket
      .removeListener("data", this.onData)
      .removeListener("error", this.onError)
      .removeListener("close", this.onClose);
    this.socket.end();
    this.socket.destroy();

    delete this.socket;
  }

  private registerSession(session: Session) {
    session
      .once("authenticate", () => this.sessions.push(session))
      .once("logoff", () => this.sessions.splice(this.sessions.indexOf(session), 1));
  }

  async close() {
    if (!this.connected) return;

    await Promise.all(this.sessions.map(x => x.logoff()));

    this.destroySocket();

    this.connected = false;
  }
}

export default Connection;