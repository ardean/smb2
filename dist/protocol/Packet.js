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
exports.protocolIdStructureField = void 0;
const protocolIds = __importStar(require("./protocolIds"));
const structureUtil = __importStar(require("./structureUtil"));
exports.protocolIdStructureField = {
    type: String,
    encoding: "hex",
    size: 4,
    defaultValue: protocolIds.smb2
};
class Packet {
    static parseProtocolId(buffer) {
        return structureUtil.parseValue(buffer, exports.protocolIdStructureField);
    }
    static getChunks(buffer) {
        const chunks = [];
        while (buffer.length > 4) {
            const netBiosType = buffer.readUInt8(0);
            if (netBiosType !== 0x00)
                throw new Error("no_net_bios_message");
            const packetLength = buffer.readUInt32BE(0);
            if (packetLength > buffer.length - 4)
                break;
            buffer = buffer.slice(4);
            chunks.push(buffer.slice(0, packetLength));
            buffer = buffer.slice(packetLength);
        }
        return {
            chunks,
            restChunk: buffer
        };
    }
}
exports.default = Packet;
