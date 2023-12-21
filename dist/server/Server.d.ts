/// <reference types="node" />
import Client from "./Client";
import Request from "./Request";
import net from "net";
import Middleware from "./Middleware";
export default class Server {
    port: number;
    private clients;
    private server;
    startDate: Date;
    guid: Buffer;
    private middlewares;
    constructor();
    listen(port?: number): Promise<net.Server>;
    private onConnection;
    onRequest: (client: Client) => (req: Request) => Promise<void>;
    initRequest(req: Request, client: Client): Request;
    handleRequest(req: Request): Promise<void>;
    redirect(from: Request, to: Request): Promise<void>;
    use(middleware: Middleware): void;
}
