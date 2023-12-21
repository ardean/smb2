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
const Tree_1 = __importDefault(require("./Tree"));
const events_1 = require("events");
const Dialect_1 = __importDefault(require("../protocol/smb2/Dialect"));
const ntlmUtil = __importStar(require("../protocol/ntlm/util"));
const PacketType_1 = __importDefault(require("../protocol/smb2/PacketType"));
class Session extends events_1.EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.authenticated = false;
        this.connectedTrees = [];
    }
    async connectTree(path) {
        const tree = new Tree_1.default(this);
        this.registerTree(tree);
        await tree.connect(path);
        return tree;
    }
    createRequest(header = {}, body = {}) {
        return this.client.createRequest({
            sessionId: this._id,
            ...header
        }, body);
    }
    async request(header = {}, body = {}) {
        return await this.client.request({
            sessionId: this._id,
            ...header
        }, body);
    }
    async authenticate(options) {
        if (this.authenticated)
            return;
        await this.request({
            type: PacketType_1.default.Negotiate
        }, {
            dialects: [
                Dialect_1.default.Smb202,
                Dialect_1.default.Smb210
            ]
        });
        const sessionSetupResponse = await this.request({ type: PacketType_1.default.SessionSetup }, { buffer: ntlmUtil.encodeNegotiationMessage(this.client.host, options.domain) });
        this._id = sessionSetupResponse.header.sessionId;
        const nonce = ntlmUtil.decodeChallengeMessage(sessionSetupResponse.body.buffer);
        await this.request({ type: PacketType_1.default.SessionSetup }, {
            buffer: ntlmUtil.encodeAuthenticationMessage(options.username, this.client.host, options.domain, nonce, options.password)
        });
        this.authenticated = true;
        this.emit("authenticate", this);
    }
    registerTree(tree) {
        tree
            .once("connect", () => this.connectedTrees.push(tree))
            .once("disconnect", () => this.connectedTrees.splice(this.connectedTrees.indexOf(tree), 1));
    }
    async logoff() {
        if (!this.authenticated)
            return;
        this.authenticated = false;
        await Promise.all(this.connectedTrees.map(x => x.disconnect()));
        await this.request({ type: PacketType_1.default.LogOff });
        delete this._id;
        this.emit("logoff", this);
    }
}
exports.default = Session;
