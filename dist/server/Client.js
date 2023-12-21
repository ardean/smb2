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
const events_1 = require("events");
const SmbRequest_1 = __importDefault(require("./SmbRequest"));
const Smb2Request_1 = __importDefault(require("./Smb2Request"));
const Packet_1 = __importDefault(require("../protocol/Packet"));
const protocolIds = __importStar(require("../protocol/protocolIds"));
class Client extends events_1.EventEmitter {
    constructor(server, socket) {
        super();
        this.server = server;
        this.socket = socket;
        this.onData = (buffer) => {
            if (this.restChunk) {
                buffer = Buffer.concat([this.restChunk, buffer]);
                this.restChunk = undefined;
            }
            const { chunks, restChunk } = Packet_1.default.getChunks(buffer);
            this.restChunk = restChunk;
            for (const chunk of chunks) {
                const protocolId = Packet_1.default.parseProtocolId(chunk);
                if (protocolId === protocolIds.smb) {
                    const request = SmbRequest_1.default.parse(chunk);
                    this.emit("request", request);
                }
                else {
                    const request = Smb2Request_1.default.parse(chunk);
                    this.emit("request", request);
                }
            }
        };
    }
    setup() {
        this.socket.setNoDelay(true);
        this.socket.addListener("data", this.onData);
    }
    send(response) {
        const buffer = response.serialize();
        this.socket.write(buffer);
    }
}
exports.default = Client;
