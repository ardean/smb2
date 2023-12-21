/// <reference types="node" />
import { Socket } from "net";
import Server from "./Server";
import { EventEmitter } from "events";
import Request from "../protocol/Request";
import Response from "../protocol/Response";
import Dialect from "../protocol/smb2/Dialect";
interface Client {
    on(event: "request", callback: (req: Request) => void): this;
    once(event: "request", callback: (req: Request) => void): this;
}
declare class Client extends EventEmitter {
    private server;
    private socket;
    private restChunk;
    targetDialect: Dialect;
    targetDialectName: string;
    constructor(server: Server, socket: Socket);
    setup(): void;
    private onData;
    send(response: Response): void;
}
export default Client;
