import Structure from "../Structure";
import * as packets from "./packets";
import HeaderFlag from "./HeaderFlag";
import PacketType from "./PacketType";
import * as structureUtil from "../structureUtil";
import Header, { headerStructure, headerSize } from "./Header";

export default class Packet {
  static getPacketTypeName(packetType: PacketType) {
    return structureUtil.parseEnumValue(PacketType, packetType);
  }

  static getPacketByPacketType(packetType: PacketType) {
    const typeName = structureUtil.parseEnumValue(PacketType, packetType);
    return Packet.getPacket(typeName);
  }

  static getPacket(typeName: string) {
    const packet = packets[typeName];
    if (!packet) throw new Error(`packet_not_found: ${typeName}`);
    return packet;
  }

  static getStructure(header: Header) {
    const packet = Packet.getPacketByPacketType(header.type);
    const isResponse = (header.flags & HeaderFlag.Response) === 1;
    const structure = packet[`${isResponse ? "response" : "request"}Structure`] as Structure;
    return structure;
  }

  static serialize(header: Header, body: any) {
    const structure = Packet.getStructure(header);

    const headerBuffer = Packet.serializeHeader(header);
    const bodyBuffer = structureUtil.serializeStructure(structure, body, { addOffset: headerSize });

    const buffer = Buffer.concat([headerBuffer, bodyBuffer]);
    const prefixedBuffer = Buffer.allocUnsafe(buffer.length + 4);
    prefixedBuffer.writeUInt8(0x00, 0);
    prefixedBuffer.writeUInt8((0xff0000 & buffer.length) >> 16, 1);
    prefixedBuffer.writeUInt16BE(0xffff & buffer.length, 2);
    buffer.copy(prefixedBuffer, 4, 0, buffer.length);

    return prefixedBuffer;
  }

  static parse(buffer: Buffer) {
    const {
      header,
      bodyBuffer
    } = Packet.parseHeader(buffer);

    const structure = Packet.getStructure(header);
    const body = structureUtil.parseStructure(bodyBuffer, structure, { subtractOffset: headerSize });

    return {
      header,
      body
    };
  }

  static parseHeader(buffer: Buffer) {
    const header = structureUtil.parseStructure(buffer, headerStructure) as Header;
    const bodyBuffer = buffer.slice(headerSize);
    return {
      header,
      bodyBuffer
    };
  }

  static serializeHeader(header: Header) {
    return structureUtil.serializeStructure(headerStructure, header);
  }
}