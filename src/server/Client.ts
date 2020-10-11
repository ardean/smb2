import { Socket } from "net";
import Server from "./Server";
import { EventEmitter } from "events";
import SmbRequest from "./SmbRequest";
import Smb2Request from "./Smb2Request";
import Packet from "../protocols/Packet";
import Request from "../protocols/Request";
import Response from "../protocols/Response";
import * as ProtocolIds from "../protocols/ProtocolIds";
import Dialect, { formatDialectName } from "../protocols/smb2/Dialect";

interface Client {
  on(event: "request", callback: (req: Request) => void): this;
  on(event: "destroy", callback: () => void): this;

  once(event: "request", callback: (req: Request) => void): this;
  once(event: "destroy", callback: () => void): this;
}

class Client extends EventEmitter {
  private restChunk: Buffer;
  public targetDialect: Dialect;
  public targetDialectName: string;
  public serverChallenge: Buffer;
  public useExtendedSessionSecurity: boolean = false;

  constructor(
    private server: Server,
    private socket: Socket
  ) {
    super();
  }

  init() {
    this.socket.setNoDelay(true);

    this.socket.addListener("data", this.onData);
    this.socket.addListener("error", this.onError);
    this.socket.addListener("close", this.onClose);
  }

  setTargetDialect(dialect: Dialect) {
    this.targetDialect = dialect;
    this.targetDialectName = formatDialectName(dialect);
  }

  private onData = (buffer: Buffer) => {
    if (this.restChunk) {
      buffer = Buffer.concat([this.restChunk, buffer]);
      this.restChunk = undefined;
    }

    const {
      chunks,
      restChunk
    } = Packet.getChunks(buffer);
    this.restChunk = restChunk;

    for (const chunk of chunks) {
      const protocolId = Packet.parseProtocolId(chunk);
      if (protocolId === ProtocolIds.Smb) {
        const request = SmbRequest.parse(chunk);
        this.emit("request", request);
      } else {
        const request = Smb2Request.parse(chunk);
        this.emit("request", request);
      }
    }
  }

  private onError = (err: Error) => {
    this.destroy();
  }

  private onClose = () => {
    this.destroy();
  }

  destroy() {
    this.socket.destroy();
    this.socket.removeAllListeners();
    delete this.socket;

    this.emit("destroy");
  }

  send(response: Response) {
    const buffer = response.serialize();
    this.socket.write(buffer);
  }
}

export default Client;