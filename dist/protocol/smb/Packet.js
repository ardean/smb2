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
Object.defineProperty(exports, "__esModule", { value: true });
const structureUtil = __importStar(require("../structureUtil"));
const Header_1 = require("./Header");
class Packet {
    static parse(buffer) {
        const { header, bodyBuffer } = Packet.parseHeader(buffer);
        let offset = 0;
        const wordCount = bodyBuffer.readInt8(offset);
        offset += 1;
        const dataCount = bodyBuffer.readUInt16LE(offset);
        offset += 2;
        const dataBuffer = bodyBuffer.slice(offset);
        const dialects = Packet.parseList(dataBuffer); // TODO: export into Negotiate packet
        const body = {
            dialects
        };
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
    static parseList(buffer) {
        let offset = 0;
        let currentBytes = [];
        let terminated = true;
        let format = 0;
        const list = [];
        while (offset < buffer.length) {
            const byte = buffer.readInt8(offset);
            if (terminated) {
                format = byte;
                offset++;
                terminated = false;
                continue;
            }
            if (byte === 0) {
                if (format === 2) {
                    const text = Buffer.from(currentBytes).toString("ascii");
                    list.push(text);
                }
                currentBytes = [];
                terminated = true;
            }
            else {
                currentBytes.push(byte);
            }
            offset++;
        }
        return list;
    }
}
exports.default = Packet;
