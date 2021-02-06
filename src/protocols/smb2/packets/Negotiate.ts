import Structure from "../../Structure";
import Capability from "../Capability";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 36
  },
  dialectCount: {
    type: Number,
    signedness: "Unsigned",
    size: 2
  },
  securityMode: {
    type: Number,
    size: 2,
    defaultValue: 1
  },
  reserved: {
    type: Number,
    size: 2
  },
  capabilities: {
    type: Number,
    size: 4
  },
  clientGuid: {
    type: Number,
    size: 16
  },
  clientStartTime: {
    type: Number,
    size: 8
  },
  dialects: {
    type: Number,
    countFieldName: "dialectCount",
    size: 2
  }
};

export interface RequestBody {
  structureSize?: number;
  dialects: number[];
  securityMode?: number;
  capabilities: Capability;
  clientGuid: string;
  clientStartDate: Date;
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  securityMode: {
    type: Number,
    size: 2
  },
  dialectRevision: {
    type: Number,
    size: 2
  },
  reserved: {
    type: Number,
    size: 2
  },
  serverGuid: {
    type: Number,
    size: 16
  },
  capabilities: {
    type: Number,
    size: 4
  },
  maxTransactionSize: {
    type: Number,
    size: 4
  },
  maxReadSize: {
    type: Number,
    size: 4
  },
  maxWriteSize: {
    type: Number,
    size: 4
  },
  systemTime: {
    type: Number,
    size: 8
  },
  serverStartTime: {
    type: Number,
    size: 8
  },
  securityBufferOffset: {
    type: Number,
    size: 2
  },
  securityBufferLength: {
    type: Number,
    size: 2
  },
  reserved2: {
    type: Number,
    size: 4
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "securityBufferLength"
  }
};

export default {
  requestStructure,
  responseStructure
};