"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headerStructure = exports.headerSize = void 0;
const Packet_1 = require("../Packet");
exports.headerSize = 32;
exports.headerStructure = {
    protocolId: Packet_1.protocolIdStructureField,
    type: {
        type: Number,
        size: 1
    },
    status: {
        type: Number,
        size: 4
    },
    flags: {
        type: Number,
        size: 1
    },
    flags2: {
        type: Number,
        size: 2
    },
    processIdHigh: {
        type: Number,
        size: 2
    },
    securityFeatures: {
        type: Number,
        size: 8
    },
    securitySignature: {
        type: Number,
        size: 8
    },
    key: {
        type: Number,
        size: 4
    },
    connectionId: {
        type: Number,
        size: 2
    },
    sequenceNumber: {
        type: Number,
        size: 2
    },
    reserved: {
        type: Number,
        size: 2
    },
    treeId: {
        type: Number,
        size: 2
    },
    processIdLow: {
        type: Number,
        size: 2
    },
    userId: {
        type: Number,
        size: 2
    },
    multiplexId: {
        type: Number,
        size: 2
    }
};
