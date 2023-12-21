"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Packet_1 = __importDefault(require("./Packet"));
const Request_1 = __importDefault(require("../Request"));
class Request extends Request_1.default {
    constructor(header, body) {
        super(header, body);
        this.typeName = Packet_1.default.getPacketTypeName(this.header.type);
        const packet = Packet_1.default.getPacketByPacketType(this.header.type);
        if (Buffer.isBuffer(this.body.buffer) && packet.parseRequestBuffer) {
            this.data = packet.parseRequestBuffer(this.body.buffer);
        }
    }
    static parse(buffer) {
        const { header, body } = Packet_1.default.parse(buffer);
        return new Request(header, body);
    }
    serialize() {
        return Packet_1.default.serialize(this.header, this.body);
    }
}
exports.default = Request;
