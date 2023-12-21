/// <reference types="node" />
import Tree from "./Tree";
import { EventEmitter } from "events";
import Response from "../protocol/smb2/Response";
import DirectoryAccess from "../protocol/smb2/DirectoryAccess";
import { CreateOptions } from "../protocol/smb2/packets/Create";
import DirectoryEntry from "../protocol/models/DirectoryEntry";
import CreateDispositionType from "../protocol/smb2/CreateDispositionType";
interface OpenOptions {
    desiredAccess?: DirectoryAccess;
    createDisposition?: CreateDispositionType;
    createOptions?: CreateOptions;
}
interface Directory {
    on(event: "open" | "close", callback: (directory: Directory) => void): this;
    on(event: "change", callback: (response: Response) => void): this;
    once(event: "open" | "close", callback: (directory: Directory) => void): this;
    once(event: "change", callback: (response: Response) => void): this;
}
declare class Directory extends EventEmitter {
    private tree;
    _id: string;
    isOpen: boolean;
    watching: boolean;
    private watchingMessageIds;
    private watchRecursive;
    constructor(tree: Tree);
    open(path: string, options?: OpenOptions): Promise<void>;
    create(path: string): Promise<void>;
    watch(recursive?: boolean): Promise<void>;
    unwatch(): Promise<void>;
    private onChangeNotify;
    private requestWatch;
    flush(): Promise<void>;
    read(): Promise<DirectoryEntry[]>;
    exists(path: string): Promise<boolean>;
    remove(): Promise<void>;
    rename(newPath: string): Promise<void>;
    setInfo(fileInfoClass: number, buffer: Buffer): Promise<void>;
    close(): Promise<void>;
}
export default Directory;
