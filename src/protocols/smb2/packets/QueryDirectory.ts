import dtyp from "dtyp";
import * as util from "../../util";
import Structure from "../../Structure";
import FileAttribute from "../FileAttribute";
import * as structureUtil from "../../structureUtil";
import DirectoryEntry from "../../../models/DirectoryEntry";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 33
  },
  fileInformationClass: {
    type: Number,
    size: 1,
    defaultValue: 37 // FileIdBothDirectoryInformation
  },
  flags: {
    type: Number,
    size: 1
  },
  fileIndex: {
    type: Number,
    size: 4
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
  },
  fileNameOffset: {
    type: Number,
    size: 2,
    defaultValue: 96
  },
  fileNameLength: {
    type: Number,
    size: 2
  },
  outputBufferLength: {
    type: Number,
    size: 4,
    defaultValue: 0x00010000
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "fileNameLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  outputBufferOffset: {
    type: Number,
    size: 2
  },
  outputBufferLength: {
    type: Number,
    size: 4
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "outputBufferLength"
  }
};

const parseDirectoryEntry = (entryBuffer: Buffer): DirectoryEntry => {
  let offset = 0;
  const index = entryBuffer.readUInt32LE(offset);
  offset += 4;

  const creationTime = dtyp.parseFiletime(entryBuffer.slice(offset, offset + 8));
  offset += 8;

  const lastAccessTime = dtyp.parseFiletime(entryBuffer.slice(offset, offset + 8));
  offset += 8;

  const lastWriteTime = dtyp.parseFiletime(entryBuffer.slice(offset, offset + 8));
  offset += 8;

  const changeTime = dtyp.parseFiletime(entryBuffer.slice(offset, offset + 8));
  offset += 8;

  const fileSize = entryBuffer.readBigUInt64LE(offset);
  offset += 8;

  const allocationSize = entryBuffer.readBigUInt64LE(offset);
  offset += 8;

  const fileAttributes = structureUtil.parseEnumValues(FileAttribute, entryBuffer.readUInt32LE(offset));
  offset += 4;

  const filenameLength = entryBuffer.readUInt32LE(offset);
  offset += 4;

  const eaSize = entryBuffer.readUInt32LE(offset);
  offset += 4;

  const shortNameLength = entryBuffer.readUInt8(offset);
  offset += 1;

  offset += 1; // reserved

  let shortFilename: string;
  if (shortNameLength !== 0) {
    shortFilename = util.toUnixFilePath(
      entryBuffer
        .slice(offset, offset + shortNameLength)
        .toString("ucs2")
    );
  }
  offset += 24;

  offset += 2; // reserved

  const fileId = structureUtil.parseString(entryBuffer.slice(offset, offset + 8).reverse(), { type: String, encoding: "hex" });
  offset += 8;

  const filename = util.toUnixFilePath(
    entryBuffer
      .slice(offset, offset + filenameLength)
      .toString("ucs2")
  );
  offset += filenameLength;

  return {
    type: fileAttributes.includes("Directory") ? "Directory" : "File",
    index,
    creationTime,
    lastAccessTime,
    lastWriteTime,
    changeTime,
    fileSize,
    allocationSize,
    eaSize,
    shortFilename,
    fileId,
    filename,
    fileAttributes
  };
};

const parseResponseBuffer = (buffer: Buffer) => {
  return structureUtil.parseList<DirectoryEntry>(buffer, parseDirectoryEntry);
};

export default {
  requestStructure,
  responseStructure,
  parseResponseBuffer
};