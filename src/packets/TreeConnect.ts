import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 9
  },
  reserved: {
    length: 2
  },
  pathOffset: {
    length: 2,
    defaultValue: 72
  },
  pathLength: {
    length: 2
  },
  buffer: {
    length: "pathLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  },
  shareType: {
    length: 1
  },
  reserved: {
    length: 1
  },
  shareFlags: {
    length: 4
  },
  capabilities: {
    length: 4
  },
  maximalAccess: {
    length: 4
  }
};

export default {
  requestStructure,
  responseStructure
};