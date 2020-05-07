import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 4
  },
  reserved: {
    length: 2
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 4
  },
  reserved: {
    length: 2
  }
};

export default {
  requestStructure,
  responseStructure
};