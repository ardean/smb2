"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestStructure = {
    structureSize: {
        type: Number,
        size: 2,
        defaultValue: 24
    },
    flags: {
        type: Number,
        size: 2
    },
    reserved: {
        type: Number,
        size: 4
    },
    fileId: {
        type: String,
        encoding: "hex",
        size: 16
    }
};
const responseStructure = {
    structureSize: {
        type: Number,
        size: 2
    },
    flags: {
        type: Number,
        size: 2
    },
    reserved: {
        type: Number,
        size: 4
    },
    creationTime: {
        type: Number,
        size: 8
    },
    lastAccessTime: {
        type: Number,
        size: 8
    },
    lastWriteTime: {
        type: Number,
        size: 8
    },
    changeTime: {
        type: Number,
        size: 8
    },
    allocationSize: {
        type: Number,
        size: 8
    },
    endOfFile: {
        type: Number,
        signedness: "Signed",
        size: 8
    },
    fileAttributes: {
        type: Number,
        size: 4
    }
};
exports.default = {
    requestStructure,
    responseStructure
};
