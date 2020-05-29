import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 25
  },
  flags: {
    type: Number,
    size: 1
  },
  securityMode: {
    type: Number,
    size: 1,
    defaultValue: 1
  },
  capabilities: {
    type: Number,
    size: 4,
    defaultValue: 1
  },
  channel: {
    type: Number,
    size: 4
  },
  securityBufferOffset: {
    type: Number,
    size: 2,
    defaultValue: 88
  },
  securityBufferLength: {
    type: Number,
    size: 2
  },
  previousSessionId: {
    type: Number,
    size: 8
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "securityBufferLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  sessionFlags: {
    type: Number,
    size: 2
  },
  securityBufferOffset: {
    type: Number,
    size: 2
  },
  securityBufferLength: {
    type: Number,
    size: 2
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