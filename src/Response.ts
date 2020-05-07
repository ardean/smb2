import Request from "./Request";
import * as packets from "./packets";
import StatusCodes from "./StatusCodes";
import Packet, { headerStructure, headerSize, PacketType, Data } from "./Packet";

export default class Response {
  typeName: string;
  request?: Request;
  status: {
    code: string;
    message: string;
    severity: { message: string };
  };
  data: any;

  constructor(
    public type: PacketType,
    public headers: Data = {},
    public body: Data = {}
  ) {
    this.typeName = Packet.parseEnumValue(PacketType, type);

    const messageIdHigh = Packet.parseValue(this.headers.messageIdHigh as Buffer);
    const messageIdLow = Packet.parseValue(this.headers.messageIdLow as Buffer);

    this.status = StatusCodes.getInfo((this.headers.status as Buffer).readUInt32LE(0));
    this.headers.messageId = (messageIdHigh << 4) | messageIdLow;
    const packet = packets[this.typeName] as Packet;

    if (Buffer.isBuffer(this.body.buffer) && packet.parseBodyBuffer) {
      this.data = packet.parseBodyBuffer(this.body.buffer as Buffer);
    }
  }

  static fromBuffer(buffer: Buffer) {
    const headers = Packet.parseStructure(buffer, headerStructure);

    const type = Packet.parseValue(headers.type as Buffer);
    const typeName = Packet.parseEnumValue(PacketType, type);
    const packet = packets[typeName] as Packet;

    const body = Packet.parseStructure(buffer, packet.responseStructure, headerSize);
    return new Response(type, headers, body);
  }
}