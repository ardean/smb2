import * as util from "../util";
import Packet, { Structure } from "../Packet";
import DirectoryEntry from "../DirectoryEntry";
import FileAttributeMask from "../FileAttributeMask";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 33
  },
  fileInformationClass: {
    length: 1,
    defaultValue: 37 // FileIdBothDirectoryInformation
  },
  flags: {
    length: 1
  },
  fileIndex: {
    length: 4
  },
  fileId: {
    length: 16
  },
  fileNameOffset: {
    length: 2,
    defaultValue: 96
  },
  fileNameLength: {
    length: 2
  },
  outputBufferLength: {
    length: 4,
    defaultValue: 0x00010000
  },
  buffer: {
    length: "fileNameLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  outputBufferOffset: {
    length: 2
  },
  outputBufferLength: {
    length: 4
  },
  buffer: {
    length: "outputBufferLength"
  }
};

const parseBodyBuffer = (buffer: Buffer) => {
  if (buffer.length === 0) return;

  const entries: DirectoryEntry[] = [];
  let currentOffset = 0;
  let nextEntryOffset = -1;
  while (nextEntryOffset !== 0) {
    nextEntryOffset = buffer.readUInt32LE(currentOffset);
    const entryBuffer = buffer.slice(
      currentOffset + 4,
      nextEntryOffset ? currentOffset + nextEntryOffset : buffer.length
    );

    let offset = 0;
    const index = entryBuffer.readUInt32LE(offset);
    offset += 4;

    const creationTime = Packet.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;

    const lastAccessTime = Packet.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;

    const lastWriteTime = Packet.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;

    const changeTime = Packet.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;

    const fileSize = entryBuffer.readBigUInt64LE(offset);
    offset += 8;

    const allocationSize = entryBuffer.readBigUInt64LE(offset);
    offset += 8;

    const fileAttributes = Packet.parseEnumValues(FileAttributeMask, entryBuffer.readUInt32LE(offset));
    offset += 4;

    const filenameLength = entryBuffer.readUInt32LE(offset);
    offset += 4;

    const eaSize = entryBuffer.readUInt32LE(offset);
    offset += 4;

    const shortNameLength = entryBuffer.readUInt8(offset);
    offset += 1;

    const fileId = entryBuffer.slice(offset, offset + 8);
    offset += 8;

    offset += 27;

    const filename = util.toUnixFilePath(
      entryBuffer
        .slice(offset, offset + filenameLength)
        .toString("ucs2")
    );

    entries.push({
      type: fileAttributes.includes("Directory") ? "Directory" : "File",
      index,
      creationTime,
      lastAccessTime,
      lastWriteTime,
      changeTime,
      fileSize,
      allocationSize,
      fileId,
      filename,
      fileAttributes
    });

    currentOffset += nextEntryOffset;
  }

  return entries;
};

export default {
  requestStructure,
  responseStructure,
  parseBodyBuffer
};