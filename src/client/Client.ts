import crypto from "crypto";
import { Socket } from "net";
import { EventEmitter } from "events";
import Packet from "../protocol/Packet";
import Request from "../protocol/smb2/Request";
import Response from "../protocol/smb2/Response";
import Header from "../protocol/smb2/Header";
import StatusCode from "../protocol/smb2/StatusCode";
import Smb2PacketType from "../protocol/smb2/PacketType";
import Session, { AuthenticateOptions } from "./Session";
import * as structureUtil from "../protocol/structureUtil";

export interface Options {
  port?: number;
  connectTimeout?: number;
  requestTimeout?: number;
}

interface Client {
  on(event: "error", callback: (error: Error) => void): this;
  on(event: "changeNotify", callback: (response: Response) => void): this;

  once(event: "error", callback: (error: Error) => void): this;
  once(event: "changeNotify", callback: (response: Response) => void): this;
}

class Client extends EventEmitter {
  _id = crypto.randomBytes(4).toString("hex");
  socket: Socket;
  nextMessageId: bigint = 0n;

  responseRestChunk: Buffer;
  responseMap = new Map<bigint, Response>();
  responseCallbackMap = new Map<bigint, (response: Response) => void>();

  connected: boolean = false;

  port: number = 445;

  connectTimeout: number = 5 * 1000;
  connectTimeoutId: NodeJS.Timer;

  requestTimeout: number = 5 * 1000;
  requestTimeoutIdMap = new Map<bigint, NodeJS.Timeout>();

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

  createRequest(header: Header = {}, body: any = {}) {
    const messageId = this.nextMessageId++;

    return new Request(
      {
        messageId,
        clientId: this._id,
        ...header
      },
      body
    );
  }

  async request(header?: Header, body?: any) {
    const request = this.createRequest(header, body);
    return await this.send(request);
  }

  async send(request: Request) {
    if (!this.connected) throw new Error("not_connected");

    const buffer = request.serialize();
    this.socket.write(buffer);

    const messageId = request.header.messageId;
    const sendPromise = new Promise<Response>((resolve, reject) => {
      const requestTimeoutId = setTimeout(
        () => {
          const err = new Error(`request_timeout: ${structureUtil.parseEnumValue(Smb2PacketType, request.header.type)}(${messageId})`);
          reject(err);
        },
        this.requestTimeout
      );

      this.requestTimeoutIdMap.set(messageId, requestTimeoutId);

      const finishRequest = (response: Response) => {
        response.request = request;

        if (
          response.header.status !== StatusCode.Success &&
          response.header.status !== StatusCode.Pending &&
          response.header.status !== StatusCode.MoreProcessingRequired &&
          response.header.status !== StatusCode.FileClosed
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

  onData = (buffer: Buffer) => {
    if (this.responseRestChunk) {
      buffer = Buffer.concat([this.responseRestChunk, buffer]);
      this.responseRestChunk = undefined;
    }

    const {
      chunks,
      restChunk
    } = Packet.getChunks(buffer);
    this.responseRestChunk = restChunk;

    for (const chunk of chunks) {
      const response = Response.parse(chunk);
      this.onResponse(response);
    }
  }

  onResponse(response: Response) {
    if (
      response.header.type === Smb2PacketType.ChangeNotify &&
      response.header.status === StatusCode.Success
    ) {
      this.emit("changeNotify", response);
    }

    const messageId = response.header.messageId;
    if (this.responseCallbackMap.has(messageId)) {
      this.responseCallbackMap.get(messageId)(response);
      this.responseCallbackMap.delete(messageId);
    } else {
      this.responseMap.set(messageId, response);
    }
  }

  onError = (err: Error) => {
    console.error(err);
  }

  onClose = (hadError: boolean) => {
    this.connected = false;
  }

  async echo() {
    return await this.request({
      type: Smb2PacketType.Echo
    });
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

export default Client;