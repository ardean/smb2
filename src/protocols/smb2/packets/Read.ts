import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 49
  },
  padding: {
    type: Number,
    size: 1,
    defaultValue: 80
  },
  flags: {
    type: Number,
    size: 1
  },
  length: {
    type: Number,
    size: 4
  },
  offset: {
    type: Number,
    size: 8
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
  },
  minimumCount: {
    type: Number,
    size: 4
  },
  channel: {
    type: Number,
    size: 4
  },
  remainingBytes: {
    type: Number,
    size: 4
  },
  readChannelInfoOffset: {
    type: Number,
    size: 2
  },
  readChannelInfoLength: {
    type: Number,
    size: 2
  },
  buffer: {
    type: Buffer,
    size: 1
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  dataOffset: {
    type: Number,
    size: 1
  },
  reserved: {
    type: Number,
    size: 1
  },
  dataLength: {
    type: Number,
    size: 4
  },
  dataRemaining: {
    type: Number,
    size: 4
  },
  reserved2: {
    type: Number,
    size: 4
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "dataLength"
  }
};

export default {
  requestStructure,
  responseStructure
};