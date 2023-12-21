/// <reference types="node" />
import Structure from "../../Structure";
import ChangeEntry from "../../models/ChangeEntry";
export declare enum Flags {
    None = 0,
    WatchTreeRecursively = 1
}
export declare enum CompletionFilter {
    FilenameChange = 1,
    DirnameChange = 2,
    AttributesChange = 4,
    SizeChange = 8,
    LastWriteChange = 16,
    LastAccessChange = 32,
    CreationChange = 64,
    EaChange = 128,
    SecurityChange = 256,
    StreamNameChange = 512,
    StreamSizeChange = 1024,
    StreamWriteChange = 2048
}
declare const _default: {
    requestStructure: Structure;
    responseStructure: Structure;
    parseResponseBuffer: (buffer: Buffer) => ChangeEntry[];
};
export default _default;
