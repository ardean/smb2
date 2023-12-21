"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Packet_1 = __importDefault(require("./Packet"));
const HeaderFlag_1 = __importDefault(require("./HeaderFlag"));
const Response_1 = __importDefault(require("../Response"));
class Response extends Response_1.default {
    constructor(header, body) {
        super(header, body);
        this.header.flags |= HeaderFlag_1.default.Response;
        this.typeName = Packet_1.default.getPacketTypeName(this.header.type);
        const packet = Packet_1.default.getPacketByPacketType(this.header.type);
        if (Buffer.isBuffer(this.body.buffer) && packet.parseResponseBuffer) {
            this.data = packet.parseResponseBuffer(this.body.buffer);
        }
    }
    static parse(buffer) {
        const { header, body } = Packet_1.default.parse(buffer);
        return new Response(header, body);
    }
    serialize() {
        return Packet_1.default.serialize(this.header, this.body);
    }
}
exports.default = Response;
