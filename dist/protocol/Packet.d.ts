/// <reference types="node" />
import StructureField from "./StructureField";
export declare const protocolIdStructureField: StructureField;
export default class Packet {
    static parseProtocolId(buffer: Buffer): string;
    static getChunks(buffer: Buffer): {
        chunks: Buffer[];
        restChunk: Buffer;
    };
}
