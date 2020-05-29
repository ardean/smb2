import { Socket } from "net";
import Server from "./Server";
import { EventEmitter } from "events";
import SmbRequest from "./SmbRequest";
import Smb2Request from "./Smb2Request";
import Packet from "../protocol/Packet";
import Request from "../protocol/Request";
import Response from "../protocol/Response";
import Dialect from "../protocol/smb2/Dialect";
import * as protocolIds from "../protocol/protocolIds";

interface Client {
  on(event: "request", callback: (req: Request) => void): this;

  once(event: "request", callback: (req: Request) => void): this;
}

class Client extends EventEmitter {
  private restChunk: Buffer;
  public targetDialect: Dialect;
  public targetDialectName: string;

  constructor(
    private server: Server,
    private socket: Socket
  ) {
    super();
  }

  setup() {
    this.socket.setNoDelay(true);

    this.socket.addListener("data", this.onData);
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
      if (protocolId === protocolIds.smb) {
        const request = SmbRequest.parse(chunk);
        this.emit("request", request);
      } else {
        const request = Smb2Request.parse(chunk);
        this.emit("request", request);
      }
    }
  }

  send(response: Response) {
    const buffer = response.serialize();
    this.socket.write(buffer);
  }
}

export default Client;