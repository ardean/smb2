import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 57
  },
  reserved: {
    type: Number,
    size: 2
  },
  controlCode: {
    type: Number,
    size: 4
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
  },
  inputOffset: {
    type: Number,
    size: 4
  },
  inputCount: {
    type: Number,
    size: 4
  },
  maxInputResponse: {
    type: Number,
    size: 4
  },
  outputOffset: {
    type: Number,
    size: 4
  },
  outputCount: {
    type: Number,
    size: 4
  },
  maxOutputResponse: {
    type: Number,
    size: 4
  },
  flags: {
    type: Number,
    size: 4
  },
  reserved2: {
    type: Number,
    size: 4
  },
  input: {
    type: Buffer,
    offsetFieldName: "inputOffset",
    sizeFieldName: "inputCount"
  },
  output: {
    type: Buffer,
    offsetFieldName: "outputOffset",
    sizeFieldName: "outputCount"
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 49
  },
  reserved: {
    type: Number,
    size: 2
  },
  controlCode: {
    type: Number,
    size: 4
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
  },
  inputOffset: {
    type: Number,
    size: 4
  },
  inputCount: {
    type: Number,
    size: 4
  },
  outputOffset: {
    type: Number,
    size: 4
  },
  outputCount: {
    type: Number,
    size: 4
  },
  flags: {
    type: Number,
    size: 4
  },
  reserved2: {
    type: Number,
    size: 4
  },
  input: {
    type: Buffer,
    offsetFieldName: "inputOffset",
    sizeFieldName: "inputCount"
  },
  output: {
    type: Buffer,
    offsetFieldName: "outputOffset",
    sizeFieldName: "outputCount"
  }
};

export default {
  requestStructure,
  responseStructure
};