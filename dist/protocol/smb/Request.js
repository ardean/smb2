"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Packet_1 = __importDefault(require("./Packet"));
const Request_1 = __importDefault(require("../Request"));
class Request extends Request_1.default {
    static parse(buffer) {
        const { header, body } = Packet_1.default.parse(buffer);
        return new Request(header, body);
    }
    serialize() {
        return Buffer.from([]);
        // return Packet.serialize(this.header, this.body);
    }
}
exports.default = Request;
