import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 25
  },
  flags: {
    length: 1
  },
  securityMode: {
    length: 1,
    defaultValue: 1
  },
  capabilities: {
    length: 4,
    defaultValue: 1
  },
  channel: {
    length: 4
  },
  securityBufferOffset: {
    length: 2,
    defaultValue: 88
  },
  securityBufferLength: {
    length: 2
  },
  previousSessionId: {
    length: 8
  },
  buffer: {
    length: "securityBufferLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  sessionFlags: {
    length: 2
  },
  securityBufferOffset: {
    length: 2
  },
  securityBufferLength: {
    length: 2
  },
  buffer: {
    length: "securityBufferLength"
  }
};

export default {
  requestStructure,
  responseStructure
};