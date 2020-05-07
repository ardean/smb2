import * as util from "../util";
import Packet, { Structure } from "../Packet";

export enum Flags {
  None,
  WatchTreeRecursively = 1 << 0
}

export enum CompletionFilter {
  FilenameChange = 1 << 0,
  DirnameChange = 1 << 1,
  AttributesChange = 1 << 2,
  SizeChange = 1 << 3,
  LastWriteChange = 1 << 4,
  LastAccessChange = 1 << 5,
  CreationChange = 1 << 6,
  EaChange = 1 << 7,
  SecurityChange = 1 << 8,
  StreamNameChange = 1 << 9,
  StreamSizeChange = 1 << 10,
  StreamWriteChange = 1 << 11
}

export enum FileAction {
  Added = 1,
  Removed = 2,
  Modified = 3,
  RenamedOldName = 4,
  RenamedNewName = 5,
  AddedStream = 6,
  RemovedStream = 7,
  ModifiedStream = 8,
  RemovedByDelete = 9,
  IdNotTunnelled = 10,
  TunnelledIdCollision = 11
}

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 32
  },
  flags: {
    length: 2,
    defaultValue: Flags.WatchTreeRecursively
  },
  outputBufferLength: {
    length: 4,
    defaultValue: 0x00010000
  },
  fileId: {
    length: 16
  },
  completionFilter: {
    length: 4,
    defaultValue:
      CompletionFilter.FilenameChange |
      CompletionFilter.DirnameChange |
      CompletionFilter.AttributesChange |
      CompletionFilter.SizeChange |
      CompletionFilter.LastWriteChange |
      CompletionFilter.LastAccessChange |
      CompletionFilter.CreationChange |
      CompletionFilter.EaChange |
      CompletionFilter.SecurityChange |
      CompletionFilter.StreamNameChange |
      CompletionFilter.StreamSizeChange |
      CompletionFilter.StreamWriteChange
  },
  reserved: {
    length: 4
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

  const entries: { action: string; filename: string; }[] = [];

  let currentOffset = 0;
  let nextEntryOffset = -1;
  while (nextEntryOffset !== 0) {
    nextEntryOffset = buffer.readUInt32LE(currentOffset);
    const entryBuffer = buffer.slice(
      currentOffset + 4,
      nextEntryOffset ? currentOffset + nextEntryOffset : buffer.length
    );

    const actionValue = entryBuffer.readUInt32LE(0);
    const filenameLength = entryBuffer.readUInt32LE(4);
    const filename = util.toUnixFilePath(
      entryBuffer
        .slice(8, 8 + filenameLength)
        .toString("ucs2")
    );

    const action = Packet.parseEnumValue(FileAction, actionValue);
    entries.push({
      action,
      filename
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