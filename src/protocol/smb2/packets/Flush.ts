import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 24
  },
  reserved: {
    type: Number,
    size: 2
  },
  reserved2: {
    type: Number,
    size: 4
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
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
  }
};

export default {
  requestStructure,
  responseStructure
};