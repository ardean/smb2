"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Packet_1 = __importDefault(require("./Packet"));
const Response_1 = __importDefault(require("../Response"));
class Response extends Response_1.default {
    static parse(buffer) {
        const { header, body } = Packet_1.default.parse(buffer);
        return new Response(header, body);
    }
    serialize() {
        return Buffer.from([]);
        // return Packet.serialize(this.header, this.body);
    }
}
exports.default = Response;
