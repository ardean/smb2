"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = __importDefault(require("./Client"));
const net_1 = __importDefault(require("net"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const SmbResponse_1 = __importDefault(require("./SmbResponse"));
const util = __importStar(require("../protocol/util"));
const Smb2Response_1 = __importDefault(require("./Smb2Response"));
const requestType_1 = __importDefault(require("./middlewares/requestType"));
const protocolIds = __importStar(require("../protocol/protocolIds"));
const PacketType_1 = __importDefault(require("../protocol/smb/PacketType"));
const PacketType_2 = __importDefault(require("../protocol/smb2/PacketType"));
const smbRequestHandlers = __importStar(require("./requestHandlers/smb"));
const smb2RequestHandlers = __importStar(require("./requestHandlers/smb2"));
const supportedProtocols_1 = __importDefault(require("./middlewares/supportedProtocols"));
class Server {
    constructor() {
        this.clients = [];
        this.server = net_1.default.createServer();
        this.guid = util.generateGuid();
        this.middlewares = [];
        this.onConnection = (socket) => {
            const client = new Client_1.default(this, socket);
            client.on("request", this.onRequest(client));
            client.setup();
            this.clients.push(client);
        };
        this.onRequest = (client) => async (req) => {
            this.initRequest(req, client);
            await this.handleRequest(req);
        };
        this.use(supportedProtocols_1.default([protocolIds.smb, protocolIds.smb2]));
        const smb2RequestHandlerTypes = Object.keys(smb2RequestHandlers);
        for (const smb2RequestHandlerType of smb2RequestHandlerTypes) {
            const handler = requestType_1.default(protocolIds.smb2, PacketType_2.default[smb2RequestHandlerType], smb2RequestHandlers[smb2RequestHandlerType]);
            this.use(handler);
        }
        const smbRequestHandlerTypes = Object.keys(smbRequestHandlers);
        for (const smbRequestHandlerType of smbRequestHandlerTypes) {
            const handler = requestType_1.default(protocolIds.smb, PacketType_1.default[smbRequestHandlerType], smbRequestHandlers[smbRequestHandlerType]);
            this.use(handler);
        }
        this.server.addListener("connection", this.onConnection);
    }
    async listen(port = 445) {
        this.port = port;
        await new Promise((resolve) => {
            this.server.listen({ port }, () => {
                resolve();
            });
        });
        this.startDate = moment_timezone_1.default().toDate();
        return this.server;
    }
    initRequest(req, client) {
        req.server = this;
        req.client = client;
        return req;
    }
    async handleRequest(req) {
        let res;
        if (req.header.protocolId === protocolIds.smb) {
            const header = req.header;
            res = new SmbResponse_1.default({
                protocolId: header.protocolId,
                type: header.type,
                treeId: header.treeId,
                userId: header.userId
            });
        }
        else {
            const header = req.header;
            res = new Smb2Response_1.default({
                protocolId: header.protocolId,
                type: header.type,
                messageId: header.messageId,
                clientId: header.clientId,
                treeId: header.treeId,
                sessionId: header.sessionId,
                signature: header.signature
            });
        }
        req.response = res;
        for (const middleware of this.middlewares) {
            await middleware(req, res);
            if (res.sent)
                return req.client.send(res);
            if (res.redirectedReq)
                return await this.redirect(req, res.redirectedReq);
        }
    }
    async redirect(from, to) {
        this.initRequest(to, from.client);
        await this.handleRequest(to);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
}
exports.default = Server;
