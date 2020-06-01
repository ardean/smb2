import * as structureUtil from "../structureUtil";
import Header, { headerSize, headerStructure } from "./Header";

export default class Packet {
  static parse(buffer: Buffer) {
    const {
      header,
      bodyBuffer
    } = Packet.parseHeader(buffer);

    let offset = 0;
    const wordCount = bodyBuffer.readInt8(offset);
    offset += 1;

    const dataCount = bodyBuffer.readUInt16LE(offset);
    offset += 2;

    const dataBuffer = bodyBuffer.slice(offset);
    const dialects = Packet.parseList(dataBuffer) as string[]; // TODO: export into Negotiate packet

    const body: any = {
      dialects
    };

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

  static parseList(buffer: Buffer) {
    let offset = 0;
    let currentBytes: number[] = [];
    let terminated = true;
    let format = 0;
    const list = [];
    while (offset < buffer.length) {
      const byte = buffer.readInt8(offset);
      if (terminated) {
        format = byte;
        offset++;
        terminated = false;
        continue;
      }

      if (byte === 0) {
        if (format === 2) {
          const text = Buffer.from(currentBytes).toString("ascii");
          list.push(text);
        }
        currentBytes = [];
        terminated = true;
      } else {
        currentBytes.push(byte);
      }

      offset++;
    }

    return list;
  }
}