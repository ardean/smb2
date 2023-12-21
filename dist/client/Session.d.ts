/// <reference types="node" />
import Tree from "./Tree";
import Client from "./Client";
import { EventEmitter } from "events";
import Header from "../protocol/smb2/Header";
export interface AuthenticateOptions {
    domain: string;
    username: string;
    password: string;
}
interface Session {
    on(event: "authenticate" | "logoff", callback: (session: Session) => void): this;
    once(event: "authenticate" | "logoff", callback: (session: Session) => void): this;
}
declare class Session extends EventEmitter {
    client: Client;
    _id: string;
    authenticated: boolean;
    connectedTrees: Tree[];
    constructor(client: Client);
    connectTree(path: string): Promise<Tree>;
    createRequest(header?: Header, body?: any): import("../protocol/smb2/Request").default;
    request(header?: Header, body?: any): Promise<import("../protocol/smb2/Response").default>;
    authenticate(options: AuthenticateOptions): Promise<void>;
    private registerTree;
    logoff(): Promise<void>;
}
export default Session;
