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
const crypto_1 = __importDefault(require("crypto"));
const net_1 = require("net");
const events_1 = require("events");
const Packet_1 = __importDefault(require("../protocol/Packet"));
const Request_1 = __importDefault(require("../protocol/smb2/Request"));
const Response_1 = __importDefault(require("../protocol/smb2/Response"));
const StatusCode_1 = __importDefault(require("../protocol/smb2/StatusCode"));
const PacketType_1 = __importDefault(require("../protocol/smb2/PacketType"));
const Session_1 = __importDefault(require("./Session"));
const structureUtil = __importStar(require("../protocol/structureUtil"));
class Client extends events_1.EventEmitter {
    constructor(host, options = {}) {
        super();
        this.host = host;
        this.options = options;
        this._id = crypto_1.default.randomBytes(4).toString("hex");
        this.nextMessageId = 0n;
        this.responseMap = new Map();
        this.responseCallbackMap = new Map();
        this.connected = false;
        this.port = 445;
        this.connectTimeout = 5 * 1000;
        this.requestTimeout = 5 * 1000;
        this.requestTimeoutIdMap = new Map();
        this.sessions = [];
        this.onData = (buffer) => {
            if (this.responseRestChunk) {
                buffer = Buffer.concat([this.responseRestChunk, buffer]);
                this.responseRestChunk = undefined;
            }
            const { chunks, restChunk } = Packet_1.default.getChunks(buffer);
            this.responseRestChunk = restChunk;
            for (const chunk of chunks) {
                const response = Response_1.default.parse(chunk);
                this.onResponse(response);
            }
        };
        this.onError = (err) => {
            this.emit("error", err);
        };
        this.onClose = (hadError) => {
            this.connected = false;
            this.emit("error", new Error("client_closed"));
        };
        if (typeof this.options.port === "number")
            this.port = this.options.port;
        if (typeof this.options.connectTimeout === "number")
            this.connectTimeout = this.options.connectTimeout;
        if (typeof this.options.requestTimeout === "number")
            this.requestTimeout = this.options.requestTimeout;
    }
    async connect() {
        if (this.connected)
            return;
        this.socket = new net_1.Socket({ allowHalfOpen: true })
            .addListener("data", this.onData)
            .addListener("error", this.onError)
            .addListener("close", this.onClose);
        this.socket.setTimeout(0);
        this.socket.setKeepAlive(true);
        const connectPromise = new Promise((resolve, reject) => {
            this.connectTimeoutId = setTimeout(() => {
                reject(new Error("connect_timeout"));
            }, this.connectTimeout);
            this.socket.connect(this.port, this.host);
            this.socket.once("connect", () => {
                resolve();
            });
            this.socket.once("error", (err) => {
                reject(err);
            });
        });
        try {
            await connectPromise;
            clearTimeout(this.connectTimeoutId);
            this.connected = true;
        }
        catch (err) {
            this.destroySocket();
            throw err;
        }
    }
    createRequest(header = {}, body = {}) {
        const messageId = this.nextMessageId++;
        return new Request_1.default({
            messageId,
            clientId: this._id,
            ...header
        }, body);
    }
    async request(header, body) {
        const request = this.createRequest(header, body);
        return await this.send(request);
    }
    async send(request) {
        if (!this.connected)
            throw new Error("not_connected");
        const buffer = request.serialize();
        this.socket.write(buffer);
        const messageId = request.header.messageId;
        const sendPromise = new Promise((resolve, reject) => {
            const requestTimeoutId = setTimeout(() => {
                const err = new Error(`request_timeout: ${structureUtil.parseEnumValue(PacketType_1.default, request.header.type)}(${messageId})`);
                reject(err);
            }, this.requestTimeout);
            this.requestTimeoutIdMap.set(messageId, requestTimeoutId);
            const finishRequest = (response) => {
                response.request = request;
                if (response.header.status !== StatusCode_1.default.Success &&
                    response.header.status !== StatusCode_1.default.Pending &&
                    response.header.status !== StatusCode_1.default.MoreProcessingRequired &&
                    response.header.status !== StatusCode_1.default.FileClosed) {
                    reject(response);
                }
                else {
                    resolve(response);
                }
            };
            if (this.responseMap.has(messageId)) {
                finishRequest(this.responseMap.get(messageId));
                this.responseMap.delete(messageId);
            }
            else if (!this.responseCallbackMap.has(messageId)) {
                this.responseCallbackMap.set(messageId, finishRequest);
            }
        });
        const response = await sendPromise;
        if (this.requestTimeoutIdMap.has(messageId)) {
            const requestTimeoutId = this.requestTimeoutIdMap.get(messageId);
            clearTimeout(requestTimeoutId);
            this.requestTimeoutIdMap.delete(messageId);
        }
        return response;
    }
    onResponse(response) {
        if (response.header.type === PacketType_1.default.ChangeNotify &&
            response.header.status === StatusCode_1.default.Success) {
            this.emit("changeNotify", response);
        }
        const messageId = response.header.messageId;
        if (this.responseCallbackMap.has(messageId)) {
            this.responseCallbackMap.get(messageId)(response);
            this.responseCallbackMap.delete(messageId);
        }
        else {
            this.responseMap.set(messageId, response);
        }
    }
    async echo() {
        return await this.request({
            type: PacketType_1.default.Echo
        });
    }
    async authenticate(options) {
        if (!this.connected)
            await this.connect();
        const session = new Session_1.default(this);
        this.registerSession(session);
        await session.authenticate(options);
        return session;
    }
    destroySocket() {
        this.socket
            .removeListener("data", this.onData)
            .removeListener("error", this.onError)
            .removeListener("close", this.onClose);
        this.socket.end();
        this.socket.destroy();
        delete this.socket;
    }
    registerSession(session) {
        session
            .once("authenticate", () => this.sessions.push(session))
            .once("logoff", () => this.sessions.splice(this.sessions.indexOf(session), 1));
    }
    async close() {
        if (!this.connected)
            return;
        await Promise.all(this.sessions.map(x => x.logoff()));
        this.destroySocket();
        this.connected = false;
    }
}
exports.default = Client;
