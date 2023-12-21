/// <reference types="node" />
import { Socket } from "net";
import { EventEmitter } from "events";
import Request from "../protocol/smb2/Request";
import Response from "../protocol/smb2/Response";
import Header from "../protocol/smb2/Header";
import Session, { AuthenticateOptions } from "./Session";
export interface Options {
    port?: number;
    connectTimeout?: number;
    requestTimeout?: number;
}
interface Client {
    on(event: "error", callback: (error: Error) => void): this;
    on(event: "changeNotify", callback: (response: Response) => void): this;
    once(event: "error", callback: (error: Error) => void): this;
    once(event: "changeNotify", callback: (response: Response) => void): this;
}
declare class Client extends EventEmitter {
    host: string;
    options: Options;
    _id: string;
    socket: Socket;
    nextMessageId: bigint;
    responseRestChunk: Buffer;
    responseMap: Map<bigint, Response>;
    responseCallbackMap: Map<bigint, (response: Response) => void>;
    connected: boolean;
    port: number;
    connectTimeout: number;
    connectTimeoutId: NodeJS.Timer;
    requestTimeout: number;
    requestTimeoutIdMap: Map<bigint, NodeJS.Timeout>;
    sessions: Session[];
    constructor(host: string, options?: Options);
    connect(): Promise<void>;
    createRequest(header?: Header, body?: any): Request;
    request(header?: Header, body?: any): Promise<Response>;
    send(request: Request): Promise<Response>;
    onData: (buffer: Buffer) => void;
    onResponse(response: Response): void;
    onError: (err: Error) => void;
    onClose: (hadError: boolean) => void;
    echo(): Promise<Response>;
    authenticate(options: AuthenticateOptions): Promise<Session>;
    private destroySocket;
    private registerSession;
    close(): Promise<void>;
}
export default Client;
