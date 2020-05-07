import moment from "moment-timezone";

export enum PacketType {
  Negotiate = 0x0000,
  SessionSetup = 0x0001,
  LogOff = 0x0002,
  TreeConnect = 0x0003,
  TreeDisconnect = 0x0004,
  Create = 0x0005,
  Close = 0x0006,
  Flush = 0x0007,
  Read = 0x0008,
  Write = 0x0009,
  Lock = 0x000a,
  Ioctl = 0x000b,
  Cancel = 0x000c,
  Echo = 0x000d,
  QueryDirectory = 0x000e,
  ChangeNotify = 0x000f,
  QueryInfo = 0x0010,
  SetInfo = 0x0011,
  OplockBreak = 0x0012
};

export default class Packet {
  requestStructure: Structure;
  responseStructure: Structure;
  parseBodyBuffer?: (buffer: Buffer) => any;

  static serializeStructure(buffer: Buffer, structure: Structure, data: Data, offset: number = 0): number {
    const normalizedData: { [fieldName: string]: { value?: Buffer; size?: number; } } = {};
    const structureFieldNames = Object.keys(structure);
    for (const structureFieldName of structureFieldNames) {
      const structureField = structure[structureFieldName];

      const value = typeof data[structureFieldName] !== "undefined" ?
        data[structureFieldName] :
        structureField.defaultValue || 0;

      normalizedData[structureFieldName] = {};

      let size = structureField.length as number;
      if (typeof structureField.length === "string") {
        size = Buffer.isBuffer(value) ? value.length : 0;

        const referencedStructureFieldName = structureField.length;
        const referencedStructureField = structure[referencedStructureFieldName];

        normalizedData[structureField.length].value = this.serializeValue(
          size,
          referencedStructureField.length as number
        );
      }

      normalizedData[structureFieldName].value = this.serializeValue(value, size);
      normalizedData[structureFieldName].size = size;
    }

    for (const structureFieldName of structureFieldNames) {
      const normalizedField = normalizedData[structureFieldName];

      normalizedField.value.copy(buffer, offset);

      offset += normalizedField.size;
    }

    return offset;
  }

  static serializeValue(value: Value, size: number): Buffer {
    if (Buffer.isBuffer(value)) return value;

    if (typeof value === "string") return Buffer.from(value);

    const result = Buffer.allocUnsafe(size);
    for (let i = 0; i < size; i++) {
      result.writeUInt8(0xff & (value >> (i * 8)), i);
    }

    return result;
  }

  static parseStructure(buffer: Buffer, structure: Structure, offset: number = 0) {
    const data: Data = {};

    const structureFieldNames = Object.keys(structure);
    for (const structureFieldName of structureFieldNames) {
      const structureField = structure[structureFieldName];

      let size: number;
      if (typeof structureField.length === "number") {
        size = structureField.length;
      } else if (typeof structureField.length === "string") {
        size = this.parseValue(data[structureField.length] as Buffer);
      }

      const value = buffer.slice(offset, offset + size);
      data[structureFieldName] = value;
      offset += size;
    }

    return data;
  }

  static parseValue(buffer: Buffer) {
    let result = 0;
    for (let i = 0; i < buffer.length; i++) {
      result += buffer.readUInt8(i) << (i * 8);
    }
    return result;
  }

  static parseDate(buffer: Buffer) {
    const milliseconds = Number(buffer.readBigUInt64LE(0) / 10000n);
    return moment.utc("1601-01-01").add(milliseconds, "milliseconds").toDate();
  }

  static parseEnumValue(enumObject: any, value: number) {
    return Object.keys(enumObject)
      .find(x => enumObject[x] === value);
  }

  static parseEnumValues(enumObject: any, value: number) {
    return Object.keys(enumObject)
      .filter(x => (enumObject[x] & value) !== 0);
  }
}

export type Value = number | string | Buffer;

export type Data = { [key: string]: Value; };

export type StructureField = {
  length: number | string;
  defaultValue?: Value;
};

export type Structure = {
  [key: string]: StructureField;
};

export const headerSize = 64;

export const protocolId = Buffer.from([
  0xfe,
  "S".charCodeAt(0),
  "M".charCodeAt(0),
  "B".charCodeAt(0)
]);

export const headerStructure: Structure = {
  protocolId: {
    length: 4,
    defaultValue: protocolId
  },
  structureSize: {
    length: 2,
    defaultValue: headerSize
  },
  creditCharge: {
    length: 2
  },
  status: {
    length: 4
  },
  type: {
    length: 2,
    defaultValue: 2
  },
  credit: {
    length: 2,
    defaultValue: 126
  },
  flags: {
    length: 4
  },
  nextCommand: {
    length: 4
  },
  messageIdLow: {
    length: 4
  },
  messageIdHigh: {
    length: 4
  },
  connectionId: {
    length: 4
  },
  treeId: {
    length: 4
  },
  sessionId: {
    length: 8
  },
  signature: {
    length: 16
  }
};