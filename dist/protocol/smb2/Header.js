"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerStructure = exports.headerSize = void 0;
const Packet_1 = require("../Packet");
exports.headerSize = 64;
exports.headerStructure = {
    protocolId: Packet_1.protocolIdStructureField,
    structureSize: {
        type: Number,
        size: 2,
        defaultValue: exports.headerSize
    },
    creditCharge: {
        type: Number,
        size: 2
    },
    status: {
        type: Number,
        signedness: "Unsigned",
        size: 4
    },
    type: {
        type: Number,
        size: 2,
        defaultValue: 2
    },
    credit: {
        type: Number,
        size: 2,
        defaultValue: 126
    },
    flags: {
        type: Number,
        size: 4
    },
    nextCommand: {
        type: Number,
        size: 4
    },
    messageId: {
        type: Number,
        size: 8
    },
    clientId: {
        type: String,
        encoding: "hex",
        size: 4
    },
    treeId: {
        type: Number,
        size: 4
    },
    sessionId: {
        type: String,
        encoding: "hex",
        size: 8
    },
    signature: {
        type: Number,
        size: 16
    }
};
