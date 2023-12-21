import PacketType from "./PacketType";
import StructureField from "../StructureField";
export declare const headerSize = 32;
export default interface Header {
    protocolId?: string;
    type?: PacketType;
    status?: number;
    flags?: number;
    flags2?: number;
    processIdHigh?: number;
    securityFeatures?: number;
    securitySignature?: number;
    key?: number;
    connectionId?: number;
    sequenceNumber?: number;
    reserved?: number;
    treeId?: number;
    processIdLow?: number;
    userId?: number;
    multiplexId?: number;
}
export declare type HeaderName = ("protocolId" | "type" | "status" | "flags" | "flags2" | "processIdHigh" | "securityFeatures" | "securitySignature" | "key" | "connectionId" | "sequenceNumber" | "reserved" | "treeId" | "processIdLow" | "userId" | "multiplexId");
export declare type HeaderStructure = {
    [key in HeaderName]?: StructureField;
};
export declare const headerStructure: HeaderStructure;
