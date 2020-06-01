import PacketType from "./PacketType";
import StatusCode from "./StatusCode";
import StructureField from "../StructureField";
import { protocolIdStructureField } from "../Packet";

export const headerSize = 64;

export default interface Header {
  protocolId?: string;
  structureSize?: number;
  creditCharge?: number;
  status?: StatusCode;
  type?: PacketType;
  credit?: number;
  flags?: number;
  nextCommand?: number;
  messageId?: bigint;
  clientId?: string;
  treeId?: number;
  sessionId?: string;
  signature?: number;
}

export type HeaderName = (
  "protocolId" |
  "structureSize" |
  "creditCharge" |
  "status" |
  "type" |
  "credit" |
  "flags" |
  "nextCommand" |
  "messageId" |
  "clientId" |
  "treeId" |
  "sessionId" |
  "signature"
);

export type HeaderStructure = {
  [key in HeaderName]?: StructureField;
};

export const headerStructure: HeaderStructure = {
  protocolId: protocolIdStructureField,
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: headerSize
  },
  creditCharge: {
    type: Number,
    size: 2
  },
  status: {
    type: Number,
    signedness: "Unsigned",
    size: 4
  },
  type: {
    type: Number,
    size: 2,
    defaultValue: 2
  },
  credit: {
    type: Number,
    size: 2,
    defaultValue: 126
  },
  flags: {
    type: Number,
    size: 4
  },
  nextCommand: {
    type: Number,
    size: 4
  },
  messageId: {
    type: Number,
    size: 8
  },
  clientId: {
    type: String,
    encoding: "hex",
    size: 4
  },
  treeId: {
    type: String,
    encoding: "hex",
    size: 4
  },
  sessionId: {
    type: String,
    encoding: "hex",
    size: 8
  },
  signature: {
    type: Number,
    size: 16
  }
};