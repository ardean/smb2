import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 49
  },
  dataOffset: {
    length: 2,
    defaultValue: 112
  },
  length: {
    length: 4
  },
  offset: {
    length: 8
  },
  fileId: {
    length: 16
  },
  channel: {
    length: 4
  },
  remainingBytes: {
    length: 4
  },
  writeChannelInfoOffset: {
    length: 2
  },
  writeChannelInfoLength: {
    length: 2
  },
  flags: {
    length: 4
  },
  buffer: {
    length: "length"
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  reserved: {
    length: 2
  },
  count: {
    length: 4
  },
  remaining: {
    length: 4
  },
  writeChannelInfoOffset: {
    length: 2
  },
  writeChannelInfoLength: {
    length: 2
  }
};

export default {
  requestStructure,
  responseStructure
};