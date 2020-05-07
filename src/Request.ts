import * as packets from "./packets";
import Packet, { PacketType, Structure, headerStructure, headerSize, Data } from "./Packet";

export default class Request {
  typeName: string;
  structure: Structure;

  constructor(
    public type: PacketType,
    public headers: Data = {},
    public body: Data = {}
  ) {
    this.typeName = Packet.parseEnumValue(PacketType, type);

    this.headers.type = type;
    this.headers.messageIdLow = (this.headers.messageId as number) & 0xff;
    this.headers.messageIdHigh = ((this.headers.messageId as number) & 0xff00) >> 4;

    const packet = packets[this.typeName];
    if (!packet) throw new Error(`packet_not_found: ${this.typeName}`);

    this.structure = packet.requestStructure;
    if (!this.structure) throw new Error(`request_structure_not_found: ${type}`);
  }

  serialize() {
    const buffer = Buffer.allocUnsafe(0xffff);
    Packet.serializeStructure(buffer, headerStructure, this.headers);
    Packet.serializeStructure(buffer, this.structure, this.body, headerSize);

    const prefixedBuffer = Buffer.allocUnsafe(buffer.length + 4);
    prefixedBuffer.writeUInt8(0x00, 0);
    prefixedBuffer.writeUInt8((0xff0000 & buffer.length) >> 16, 1);
    prefixedBuffer.writeUInt16BE(0xffff & buffer.length, 2);

    buffer.copy(prefixedBuffer, 4, 0, buffer.length);

    return prefixedBuffer;
  }
}