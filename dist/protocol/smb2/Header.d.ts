import PacketType from "./PacketType";
import StatusCode from "./StatusCode";
import StructureField from "../StructureField";
export declare const headerSize = 64;
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
export declare type HeaderName = ("protocolId" | "structureSize" | "creditCharge" | "status" | "type" | "credit" | "flags" | "nextCommand" | "messageId" | "clientId" | "treeId" | "sessionId" | "signature");
export declare type HeaderStructure = {
    [key in HeaderName]?: StructureField;
};
export declare const headerStructure: HeaderStructure;
