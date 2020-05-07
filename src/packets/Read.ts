import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 49
  },
  padding: {
    length: 1,
    defaultValue: 80
  },
  flags: {
    length: 1
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
  minimumCount: {
    length: 4
  },
  channel: {
    length: 4
  },
  remainingBytes: {
    length: 4
  },
  readChannelInfoOffset: {
    length: 2
  },
  readChannelInfoLength: {
    length: 2
  },
  buffer: {
    length: 1
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  dataOffset: {
    length: 1
  },
  reserved: {
    length: 1
  },
  dataLength: {
    length: 4
  },
  dataRemaining: {
    length: 4
  },
  reserved2: {
    length: 4
  },
  buffer: {
    length: "dataLength"
  }
};

export default {
  requestStructure,
  responseStructure
};