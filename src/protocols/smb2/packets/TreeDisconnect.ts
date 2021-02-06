import Structure from "../../Structure";

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 4
  },
  reserved: {
    type: Number,
    size: 2
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