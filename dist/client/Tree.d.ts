/// <reference types="node" />
import File from "./File";
import Session from "./Session";
import Directory from "./Directory";
import { EventEmitter } from "events";
import Header from "../protocol/smb2/Header";
import Response from "../protocol/smb2/Response";
interface Tree {
    on(event: "connect" | "disconnect", callback: (tree: Tree) => void): this;
    once(event: "connect" | "disconnect", callback: (tree: Tree) => void): this;
}
declare class Tree extends EventEmitter {
    session: Session;
    _id: number;
    connected: boolean;
    connecting: boolean;
    openFiles: File[];
    openDirectories: Directory[];
    constructor(session: Session);
    connect(path: string): Promise<void>;
    disconnect(): Promise<void>;
    createDirectory(path: string): Promise<void>;
    removeDirectory(path: string): Promise<void>;
    renameDirectory(path: string, newPath: string): Promise<void>;
    watch(onChange?: (response: Response) => void, recursive?: boolean): Promise<() => Promise<void>>;
    watchDirectory(path: string, onChange: (response: Response) => void, recursive?: boolean): Promise<() => Promise<void>>;
    readDirectory(path?: string): Promise<import("../protocol/models/DirectoryEntry").default[]>;
    exists(path: string): Promise<boolean>;
    createFile(path: string, content?: Buffer | string): Promise<void>;
    removeFile(path: string): Promise<void>;
    renameFile(path: string, newPath: string): Promise<void>;
    readFile(path: string): Promise<Buffer>;
    private registerFile;
    private registerDirectory;
    createRequest(header?: Header, body?: any): import("../protocol/smb2/Request").default;
    request(header?: Header, body?: any): Promise<Response>;
}
export default Tree;
