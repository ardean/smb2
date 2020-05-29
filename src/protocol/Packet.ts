import * as protocolIds from "./protocolIds";
import StructureField from "./StructureField";
import * as structureUtil from "./structureUtil";

export const protocolIdStructureField: StructureField = {
  type: String,
  encoding: "hex",
  size: 4,
  defaultValue: protocolIds.smb2
};

export default class Packet {
  static parseProtocolId(buffer: Buffer) {
    return structureUtil.parseValue(buffer, protocolIdStructureField) as string;
  }

  static getChunks(buffer: Buffer) {
    const chunks: Buffer[] = [];
    while (buffer.length > 4) {
      const netBiosType = buffer.readUInt8(0);
      if (netBiosType !== 0x00) throw new Error("no_net_bios_message");

      const packetLength = buffer.readUInt32BE(0);
      if (packetLength > buffer.length - 4) break;

      buffer = buffer.slice(4);

      chunks.push(buffer.slice(0, packetLength));

      buffer = buffer.slice(packetLength);
    }

    return {
      chunks,
      restChunk: buffer
    };
  }
}