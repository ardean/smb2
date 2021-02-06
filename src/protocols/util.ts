import crypto from "crypto";

export const toUnixFilePath = (value: string) => {
  value = toUnixPath(value);
  if (value[0] !== "/" && value[0] !== ".") value = `./${value}`;
  if (value[0] === "/") value = `.${value}`;
  return value;
};

export const toWindowsFilePath = (value: string) => {
  if (value[0] === ".") value = value.substring(1);
  if (value[0] === "/") value = value.substring(1);
  value = toWindowsPath(value);
  return value;
};

export const toUnixPath = (value: string) => {
  value = value.replace(/\\/g, "/");
  return value;
};

export const toWindowsPath = (value: string) => {
  value = value.replace(/\//g, "\\");
  return value;
};

export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateGuid = () => {
  const timeLow = getRandomInt(0, Math.pow(2, 32) - 1);
  const timeMiddle = getRandomInt(0, Math.pow(2, 16) - 1);
  const timeHighAndVersion = 0x4000 | getRandomInt(0, Math.pow(2, 12) - 1);
  const clockSequenceHighAndReserved = 0x80 | getRandomInt(0, Math.pow(2, 6) - 1);
  const clockSequenceLow = getRandomInt(0, Math.pow(2, 8) - 1);
  const node = crypto.randomBytes(6);

  const buffer = Buffer.alloc(16);
  let offset = 0;
  buffer.writeUInt32LE(timeLow, offset);
  offset += 4;
  buffer.writeUInt16LE(timeMiddle, offset);
  offset += 2;
  buffer.writeUInt16LE(timeHighAndVersion, offset);
  offset += 2;
  buffer.writeUInt8(clockSequenceHighAndReserved, offset);
  offset += 1;
  buffer.writeUInt8(clockSequenceLow, offset);
  offset += 1;
  node.copy(buffer, offset);

  return buffer;
};

export const generateUint = (bits = 32) => Math.floor(Math.random() * Math.pow(2, bits));

export const formatBuffer = (buffer: Buffer) =>
  Array.from(buffer)
    .map(byte => {
      const text = byte.toString(16);
      return text.length === 1 ? "0" + text : text;
    })
    .join(" ");

export const stringify = (object: any) => {
  const formattedObject: any = {};
  const keys = Object.keys(object);

  for (const key of keys) {
    const value = object[key];
    formattedObject[key] = stringifyValue(value);
  }

  return JSON.stringify(formattedObject, null, 2);
};

export const stringifyValue = (value: any) => {
  if (Buffer.isBuffer(value)) return formatBuffer(value);
  if (typeof value === "bigint") return value.toString();
  return value;
};