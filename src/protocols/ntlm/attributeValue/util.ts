import * as dtypUtil from "../../dtyp/util";
import AttributeValueId from "./AttributeValueId";
import AttributeValuePair from "./AttributeValuePair";
import moment from "moment-timezone";

export const serializePairs = (pairs: AttributeValuePair[]) => {
  for (const pair of pairs) {
    serializePair(pair);
  }

  const length = pairs.reduce((prev, current) =>
    prev + (current.buffer.length + 4),
    0
  ) + 4;

  const buffer = Buffer.allocUnsafe(length);
  let offset = 0;
  for (const pair of pairs) {
    buffer.writeUInt16LE(pair.id, offset);
    offset += 2;

    buffer.writeUInt16LE(pair.buffer.length, offset);
    offset += 2;

    pair.buffer.copy(buffer, offset);
    offset += pair.buffer.length;
  }

  buffer.writeUInt16LE(AttributeValueId.EndOfLine, offset);
  offset += 2;

  buffer.writeUInt16LE(0, offset);
  offset += 2;

  return buffer;
};

export const serializePair = (pair: AttributeValuePair) => {
  if (Buffer.isBuffer(pair.buffer)) return pair;

  if (
    pair.id === AttributeValueId.NetBiosComputerName ||
    pair.id === AttributeValueId.NetBiosDomainName ||
    pair.id === AttributeValueId.DnsComputerName ||
    pair.id === AttributeValueId.DnsDomainName ||
    pair.id === AttributeValueId.DnsTreeName
  ) {
    pair.buffer = Buffer.from(pair.value as string, "ucs2");
    delete pair.value;
  } else if (pair.id === AttributeValueId.Timestamp) {
    pair.buffer = dtypUtil.serializeFiletime(pair.value as Date);
    delete pair.value;
  }

  return pair;
};

export const parsePairs = (buffer: Buffer) => {
  let offset = 0;

  let lastId: AttributeValueId;

  const pairs: AttributeValuePair[] = [];
  while (AttributeValueId.EndOfLine !== lastId) {
    lastId = buffer.readUInt16LE(offset);
    offset += 2;

    const length = buffer.readUInt16LE(offset);
    offset += 2;

    const data = buffer.slice(offset, offset + length);
    offset += length;

    const pair = {
      id: lastId,
      buffer: data
    };

    parsePair(pair);

    pairs.push(pair);
  }

  offset += 4;

  pairs.pop();

  return pairs;
};

export const parsePair = (pair: AttributeValuePair) => {
  if (
    pair.id === AttributeValueId.NetBiosComputerName ||
    pair.id === AttributeValueId.NetBiosDomainName ||
    pair.id === AttributeValueId.DnsComputerName ||
    pair.id === AttributeValueId.DnsDomainName ||
    pair.id === AttributeValueId.DnsTreeName
  ) {
    if (typeof pair.value === "string") return pair;

    pair.value = pair.buffer.toString("ucs2");
    delete pair.buffer;
  } else if (pair.id === AttributeValueId.Timestamp) {
    if (pair.value instanceof Date) return pair;

    pair.value = dtypUtil.parseFiletime(pair.buffer);
    delete pair.buffer;
  }

  return pair;
};