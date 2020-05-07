import { Structure } from "../Packet";
import ShareAccessMask from "../ShareAccessMask";
import CreateDispositionType from "../CreateDispositionType";

export enum CreateOptions {
  None = 0,
  Directory = 1 << 0
}

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 57
  },
  securityFlags: {
    length: 1
  },
  requestedOplockLevel: {
    length: 1
  },
  impersonationLevel: {
    length: 4,
    defaultValue: 0x00000002
  },
  smbCreateFlags: {
    length: 8
  },
  reserved: {
    length: 8
  },
  desiredAccess: {
    length: 4,
    defaultValue: 0x00100081
  },
  fileAttributes: {
    length: 4
  },
  shareAccess: {
    length: 4,
    defaultValue:
      ShareAccessMask.Read |
      ShareAccessMask.Write |
      ShareAccessMask.Delete
  },
  createDisposition: {
    length: 4,
    defaultValue: CreateDispositionType.Open
  },
  createOptions: {
    length: 4,
    defaultValue: CreateOptions.None
  },
  nameOffset: {
    length: 2
  },
  nameLength: {
    length: 2
  },
  createContextsOffset: {
    length: 4
  },
  createContextsLength: {
    length: 4
  },
  buffer: {
    length: "nameLength"
  },
  reserved2: {
    length: 2,
    defaultValue: 0x4200
  },
  createContexts: {
    length: "createContextsLength",
    defaultValue: ""
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  oplockLevel: {
    length: 1
  },
  flags: {
    length: 1
  },
  createAction: {
    length: 4
  },
  creationTime: {
    length: 8
  },
  lastAccessTime: {
    length: 8
  },
  lastWriteTime: {
    length: 8
  },
  changeTime: {
    length: 8
  },
  allocationSize: {
    length: 8
  },
  endOfFile: {
    length: 8
  },
  fileAttributes: {
    length: 4
  },
  reserved2: {
    length: 4
  },
  fileId: {
    length: 16
  },
  createContextsOffset: {
    length: 4
  },
  createContextsLength: {
    length: 4
  },
  buffer: {
    length: "createContextsLength"
  }
};

export default {
  requestStructure,
  responseStructure
};