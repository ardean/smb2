import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 49
  },
  dataOffset: {
    type: Number,
    size: 2,
    defaultValue: 112
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
  channel: {
    type: Number,
    size: 4
  },
  remainingBytes: {
    type: Number,
    size: 4
  },
  writeChannelInfoOffset: {
    type: Number,
    size: 2
  },
  writeChannelInfoLength: {
    type: Number,
    size: 2
  },
  flags: {
    type: Number,
    size: 4
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "length"
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  reserved: {
    type: Number,
    size: 2
  },
  count: {
    type: Number,
    size: 4
  },
  remaining: {
    type: Number,
    size: 4
  },
  writeChannelInfoOffset: {
    type: Number,
    size: 2
  },
  writeChannelInfoLength: {
    type: Number,
    size: 2
  }
};

export default {
  requestStructure,
  responseStructure
};