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
const packets = __importStar(require("./packets"));
const HeaderFlag_1 = __importDefault(require("./HeaderFlag"));
const PacketType_1 = __importDefault(require("./PacketType"));
const structureUtil = __importStar(require("../structureUtil"));
const Header_1 = require("./Header");
class Packet {
    static getPacketTypeName(packetType) {
        return structureUtil.parseEnumValue(PacketType_1.default, packetType);
    }
    static getPacketByPacketType(packetType) {
        const typeName = structureUtil.parseEnumValue(PacketType_1.default, packetType);
        return Packet.getPacket(typeName);
    }
    static getPacket(typeName) {
        const packet = packets[typeName];
        if (!packet)
            throw new Error(`packet_not_found: ${typeName}`);
        return packet;
    }
    static getStructure(header) {
        const packet = Packet.getPacketByPacketType(header.type);
        const isResponse = (header.flags & HeaderFlag_1.default.Response) === 1;
        const structure = packet[`${isResponse ? "response" : "request"}Structure`];
        return structure;
    }
    static serialize(header, body) {
        const structure = Packet.getStructure(header);
        const headerBuffer = Packet.serializeHeader(header);
        const bodyBuffer = structureUtil.serializeStructure(structure, body);
        const buffer = Buffer.concat([headerBuffer, bodyBuffer]);
        const prefixedBuffer = Buffer.allocUnsafe(buffer.length + 4);
        prefixedBuffer.writeUInt8(0x00, 0);
        prefixedBuffer.writeUInt8((0xff0000 & buffer.length) >> 16, 1);
        prefixedBuffer.writeUInt16BE(0xffff & buffer.length, 2);
        buffer.copy(prefixedBuffer, 4, 0, buffer.length);
        return prefixedBuffer;
    }
    static parse(buffer) {
        const { header, bodyBuffer } = Packet.parseHeader(buffer);
        const structure = Packet.getStructure(header);
        const body = structureUtil.parseStructure(bodyBuffer, structure);
        return {
            header,
            body
        };
    }
    static parseHeader(buffer) {
        const header = structureUtil.parseStructure(buffer, Header_1.headerStructure);
        const bodyBuffer = buffer.slice(Header_1.headerSize);
        return {
            header,
            bodyBuffer
        };
    }
    static serializeHeader(header) {
        return structureUtil.serializeStructure(Header_1.headerStructure, header);
    }
}
exports.default = Packet;
