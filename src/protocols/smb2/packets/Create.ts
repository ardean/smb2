import Structure from "../../Structure";
import ShareAccessType from "../ShareAccessType";
import CreateDispositionType from "../CreateDispositionType";

export enum CreateOptions {
  None = 0,
  Directory = 1 << 0
}

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 57
  },
  securityFlags: {
    type: Number,
    size: 1
  },
  requestedOplockLevel: {
    type: Number,
    size: 1
  },
  impersonationLevel: {
    type: Number,
    size: 4,
    defaultValue: 0x00000002
  },
  smbCreateFlags: {
    type: Number,
    size: 8
  },
  reserved: {
    type: Number,
    size: 8
  },
  desiredAccess: {
    type: Number,
    size: 4,
    defaultValue: 0x00100081
  },
  fileAttributes: {
    type: Number,
    size: 4
  },
  shareAccess: {
    type: Number,
    size: 4,
    defaultValue:
      ShareAccessType.Read |
      ShareAccessType.Write |
      ShareAccessType.Delete
  },
  createDisposition: {
    type: Number,
    size: 4,
    defaultValue: CreateDispositionType.Open
  },
  createOptions: {
    type: Number,
    size: 4,
    defaultValue: CreateOptions.None
  },
  nameOffset: {
    type: Number,
    size: 2
  },
  nameLength: {
    type: Number,
    size: 2
  },
  createContextsOffset: {
    type: Number,
    size: 4
  },
  createContextsLength: {
    type: Number,
    size: 4
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "nameLength"
  },
  reserved2: {
    type: Number,
    size: 2,
    defaultValue: 0x4200
  },
  createContexts: {
    type: Number,
    sizeFieldName: "createContextsLength",
    defaultValue: ""
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  oplockLevel: {
    type: Number,
    size: 1
  },
  flags: {
    type: Number,
    size: 1
  },
  createAction: {
    type: Number,
    size: 4
  },
  creationTime: {
    type: Number,
    size: 8
  },
  lastAccessTime: {
    type: Number,
    size: 8
  },
  lastWriteTime: {
    type: Number,
    size: 8
  },
  changeTime: {
    type: Number,
    size: 8
  },
  allocationSize: {
    type: Number,
    size: 8
  },
  endOfFile: {
    type: Number,
    size: 8
  },
  fileAttributes: {
    type: Number,
    size: 4
  },
  reserved2: {
    type: Number,
    size: 4
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
  },
  createContextsOffset: {
    type: Number,
    size: 4
  },
  createContextsLength: {
    type: Number,
    size: 4
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "createContextsLength"
  }
};

export default {
  requestStructure,
  responseStructure
};