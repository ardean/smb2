import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 9
  },
  reserved: {
    type: Number,
    size: 2
  },
  pathOffset: {
    type: Number,
    size: 2,
    defaultValue: 72
  },
  pathLength: {
    type: Number,
    size: 2
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "pathLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  },
  shareType: {
    type: Number,
    size: 1
  },
  reserved: {
    type: Number,
    size: 1
  },
  shareFlags: {
    type: Number,
    size: 4
  },
  capabilities: {
    type: Number,
    size: 4
  },
  maximalAccess: {
    type: Number,
    size: 4
  }
};

export default {
  requestStructure,
  responseStructure
};