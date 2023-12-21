/// <reference types="node" />
import Tree from "./Tree";
import { EventEmitter } from "events";
import { CreateOptions } from "../protocol/smb2/packets/Create";
import CreateDispositionType from "../protocol/smb2/CreateDispositionType";
import FilePipePrinterAccess from "../protocol/smb2/FilePipePrinterAccess";
interface OpenOptions {
    desiredAccess?: FilePipePrinterAccess;
    createDisposition?: CreateDispositionType;
    createOptions?: CreateOptions;
}
interface File {
    on(event: "open" | "close", callback: (file: File) => void): this;
    once(event: "open" | "close", callback: (file: File) => void): this;
}
declare class File extends EventEmitter {
    private tree;
    _id: Buffer;
    isOpen: boolean;
    fileSize: bigint;
    constructor(tree: Tree);
    open(path: string, options?: OpenOptions): Promise<void>;
    create(path: string): Promise<void>;
    remove(): Promise<void>;
    rename(newPath: string): Promise<void>;
    setSize(size: bigint): Promise<void>;
    setInfo(fileInfoClass: number, buffer: Buffer): Promise<void>;
    write(content: Buffer | string): Promise<void>;
    read(): Promise<Buffer>;
    exists(path: string): Promise<boolean>;
    close(): Promise<void>;
}
export default File;
