import Value from "./Value";
import Structure from "./Structure";
import StructureField from "./StructureField";

export const parseStructure = (buffer: Buffer, structure: Structure, options: { subtractOffset?: number; } = {}) => {
  let offset = 0;
  const data: any = {};
  const structureFieldNames = Object.keys(structure);
  for (const structureFieldName of structureFieldNames) {
    const structureField = structure[structureFieldName];

    let size: number;
    if (structureField.sizeFieldName) {
      size = data[structureField.sizeFieldName] as number;
      if (typeof size === "undefined") throw new Error(`invalid_size_field_name: ${structureField.sizeFieldName}`);
    } else if (typeof structureField.size === "number") {
      size = structureField.size;
    } else throw new Error(`unknown_field_size`);

    structureField.count = typeof structureField.count === "number" ?
      structureField.count :
      1;
    if (structureField.countFieldName) {
      structureField.count = data[structureField.countFieldName] as number;
      if (typeof structureField.count === "undefined") throw new Error(`invalid_count_field_name: ${structureField.countFieldName}`);
    }

    let currentOffset = offset;
    if (structureField.offsetFieldName) {
      currentOffset = data[structureField.offsetFieldName] as number;
      if (typeof currentOffset === "undefined") throw new Error(`invalid_offset_field_name: ${structureField.offsetFieldName}`);

      if (typeof options.subtractOffset === "number") currentOffset -= options.subtractOffset;
    }

    const value = buffer.slice(currentOffset, currentOffset + (size * structureField.count));
    data[structureFieldName] = parseValue(value, structureField);
    offset += size * structureField.count;
  }

  return data;
};

export const parseNumber = (buffer: Buffer, structureField: StructureField) => {
  if (structureField.size === 2 && buffer.length === 2) {
    return structureField.signedness === "Unsigned" ?
      buffer.readUInt16LE(0) :
      buffer.readInt16LE(0);
  }
  if (structureField.size === 4 && buffer.length === 4) {
    return structureField.signedness === "Unsigned" ?
      buffer.readUInt32LE(0) :
      buffer.readInt32LE(0);
  }
  if (structureField.size === 8 && buffer.length === 8) {
    return structureField.signedness === "Unsigned" ?
      buffer.readBigUInt64LE(0) :
      buffer.readBigInt64LE(0);
  }

  let result = 0;
  for (let index = 0; index < buffer.length; index++) {
    result += buffer.readUInt8(index) << (index * 8);
  }
  return result;
};

export const parseValue = (buffer: Buffer, structureField: StructureField): Value => {
  if (structureField.count > 1) {
    const entryBuffers: Buffer[] = [];
    for (let index = 0; index < structureField.count; index++) {
      const entryBuffer = buffer.slice(index * structureField.size, (index + 1) * structureField.size);
      entryBuffers.push(entryBuffer);
    }
    return entryBuffers.map(entryBuffer => parseValue(entryBuffer, { ...structureField, count: 1 }));
  }

  let value: Value = buffer;
  if (structureField.type === String) value = parseString(buffer, structureField);
  else if (structureField.type === Number) value = parseNumber(buffer, structureField);
  return value;
};

export const parseString = (buffer: Buffer, structureField: StructureField) => {
  return buffer.slice(0, structureField.size).toString(structureField.encoding);
};

export const parseEnumValue = (enumObject: any, value: number | string) => {
  return Object.keys(enumObject)
    .find(x => enumObject[x] === value);
};

export const parseEnumValues = (enumObject: any, value: number) => {
  return Object.keys(enumObject)
    .filter(x => (enumObject[x] & value) !== 0);
};

export const parseList = <EntryType = any>(buffer: Buffer, parser: (entryBuffer: Buffer) => EntryType) => {
  if (buffer.length === 0) return [];

  let currentOffset = 0;
  let nextEntryOffset = -1;

  const list: EntryType[] = [];
  while (nextEntryOffset !== 0) {
    nextEntryOffset = buffer.readUInt32LE(currentOffset);

    const entryBufferStart = currentOffset + 4;
    const entryBufferEnd = nextEntryOffset === 0 ?
      buffer.length :
      currentOffset + nextEntryOffset;
    const entryBuffer = buffer.slice(entryBufferStart, entryBufferEnd);

    list.push(parser(entryBuffer));

    currentOffset += nextEntryOffset;
  }

  return list;
};

export const serializeStructure = (structure: Structure, data: any) => {
  const normalizedData: { [fieldName: string]: { value?: Buffer; size?: number; structureFieldName?: string; structureField?: StructureField; } } = {};
  const structureFieldNames = Object.keys(structure);
  for (const structureFieldName of structureFieldNames) {
    const structureField = structure[structureFieldName];

    const value = typeof data[structureFieldName] !== "undefined" ?
      data[structureFieldName] :
      structureField.defaultValue || 0;

    normalizedData[structureFieldName] = {};

    if (structureField.sizeFieldName) {
      structureField.size = Buffer.isBuffer(value) ?
        value.length :
        0;

      const referencedStructureField = structure[structureField.sizeFieldName];
      normalizedData[structureField.sizeFieldName].value = serializeValue(
        structureField.size,
        referencedStructureField
      );
    }

    structureField.count = typeof structureField.count === "number" ?
      structureField.count :
      1;
    if (structureField.countFieldName) {
      structureField.count = Array.isArray(value) ?
        value.length :
        0;

      const referencedStructureField = structure[structureField.countFieldName];
      normalizedData[structureField.countFieldName].value = serializeValue(
        structureField.count,
        referencedStructureField
      );
    }

    normalizedData[structureFieldName].value = serializeValue(value, structureField);
    normalizedData[structureFieldName].size = structureField.size * structureField.count;
  }

  const normalizedFields = structureFieldNames.map(structureFieldName => {
    const structureField = structure[structureFieldName];
    const normalizedField = normalizedData[structureFieldName];
    normalizedField.structureFieldName = structureFieldName;
    normalizedField.structureField = structureField;

    return normalizedField;
  });
  const bufferSize = normalizedFields.reduce((prev, current) => prev + current.size, 0);
  const buffer = Buffer.allocUnsafe(bufferSize);

  let offset = 0;
  for (const normalizedField of normalizedFields) {
    let currentOffset = offset;
    if (normalizedField.structureField && normalizedField.structureField.offsetFieldName) {
      currentOffset = parseNumber(
        normalizedData[normalizedField.structureField.offsetFieldName].value,
        structure[normalizedField.structureField.offsetFieldName]
      ) as number;
    }
    normalizedField.value.copy(buffer, currentOffset);

    offset += normalizedField.size;
  }

  return buffer;
};

export const serializeValue = (value: Value, structureField: StructureField): Buffer => {
  if (structureField.count > 1 && Array.isArray(value)) {
    const buffers = value.map(listEntry => serializeValue(listEntry, { ...structureField, count: 1 }));
    return Buffer.concat(buffers);
  }
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "string") return serializeString(value, structureField);

  const bignumberValue = BigInt(value);
  const result = Buffer.allocUnsafe(structureField.size);
  for (let index = 0; index < structureField.size; index++) {
    const offset = BigInt(index * 8);
    const byte = 0xffn & (bignumberValue >> offset);
    result.writeUInt8(Number(byte), index);
  }

  return result;
};

export const serializeString = (value: string, structureField: StructureField) => {
  return Buffer.from(value, structureField.encoding);
};