import { Structure } from "../Packet";

const requestStructure: Structure = {
  structureSize: {
    length: 2,
    defaultValue: 24
  },
  reserved: {
    length: 2
  },
  reserved2: {
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
  reserved: {
    length: 2
  }
};

export default {
  requestStructure,
  responseStructure
};