/// <reference types="node" />
import Structure from "../../Structure";
import DirectoryEntry from "../../models/DirectoryEntry";
declare const _default: {
    requestStructure: Structure;
    responseStructure: Structure;
    parseResponseBuffer: (buffer: Buffer) => DirectoryEntry[];
};
export default _default;
