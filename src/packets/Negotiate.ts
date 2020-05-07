import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 36
  },
  dialectCount: {
    length: 2,
    defaultValue: 2
  },
  securityMode: {
    length: 2,
    defaultValue: 1
  },
  reserved: {
    length: 2
  },
  capabilities: {
    length: 4
  },
  clientGuid: {
    length: 16
  },
  clientStartTime: {
    length: 8
  },
  dialects: {
    length: 4,
    defaultValue: Buffer.from([0x02, 0x02, 0x10, 0x02])
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  securityMode: {
    length: 2
  },
  dialectRevision: {
    length: 2
  },
  reserved: {
    length: 2
  },
  serverGuid: {
    length: 16
  },
  capabilities: {
    length: 4
  },
  maxTransactSize: {
    length: 4
  },
  maxReadSize: {
    length: 4
  },
  maxWriteSize: {
    length: 4
  },
  systemTime: {
    length: 8
  },
  serverStartTime: {
    length: 8
  },
  securityBufferOffset: {
    length: 2
  },
  securityBufferLength: {
    length: 2
  },
  reserved2: {
    length: 4
  },
  buffer: {
    length: "securityBufferLength"
  }
};

export default {
  requestStructure,
  responseStructure
};