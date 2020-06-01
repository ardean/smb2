import moment from "moment-timezone";

export const parseFiletime = (buffer: Buffer) => {
  const milliseconds = Number(buffer.readBigUInt64LE(0) / 10000n);
  return moment.utc("1601-01-01").add(milliseconds, "milliseconds").toDate();
};

export const serializeFiletime = (date: Date) => {
  const milliseconds = moment(date).diff(moment.utc("1601-01-01"), "milliseconds");
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeBigInt64LE(BigInt(milliseconds) * 10000n, 0);
  return buffer;
};