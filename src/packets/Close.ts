import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 24
  },
  flags: {
    length: 2
  },
  reserved: {
    length: 4
  },
  fileId: {
    length: 16
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  flags: {
    length: 2
  },
  reserved: {
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
  }
};

export default {
  requestStructure,
  responseStructure
};