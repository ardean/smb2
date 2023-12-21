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
const util = __importStar(require("../../util"));
const FileAttribute_1 = __importDefault(require("../FileAttribute"));
const structureUtil = __importStar(require("../../structureUtil"));
const requestStructure = {
    structureSize: {
        type: Number,
        size: 2,
        defaultValue: 33
    },
    fileInformationClass: {
        type: Number,
        size: 1,
        defaultValue: 37 // FileIdBothDirectoryInformation
    },
    flags: {
        type: Number,
        size: 1
    },
    fileIndex: {
        type: Number,
        size: 4
    },
    fileId: {
        type: String,
        encoding: "hex",
        size: 16
    },
    fileNameOffset: {
        type: Number,
        size: 2,
        defaultValue: 96
    },
    fileNameLength: {
        type: Number,
        size: 2
    },
    outputBufferLength: {
        type: Number,
        size: 4,
        defaultValue: 0x00010000
    },
    buffer: {
        type: Buffer,
        sizeFieldName: "fileNameLength"
    }
};
const responseStructure = {
    structureSize: {
        type: Number,
        size: 2
    },
    outputBufferOffset: {
        type: Number,
        size: 2
    },
    outputBufferLength: {
        type: Number,
        size: 4
    },
    buffer: {
        type: Buffer,
        sizeFieldName: "outputBufferLength"
    }
};
const parseDirectoryEntry = (entryBuffer) => {
    let offset = 0;
    const index = entryBuffer.readUInt32LE(offset);
    offset += 4;
    const creationTime = structureUtil.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;
    const lastAccessTime = structureUtil.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;
    const lastWriteTime = structureUtil.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;
    const changeTime = structureUtil.parseDate(entryBuffer.slice(offset, offset + 8));
    offset += 8;
    const fileSize = entryBuffer.readBigUInt64LE(offset);
    offset += 8;
    const allocationSize = entryBuffer.readBigUInt64LE(offset);
    offset += 8;
    const fileAttributes = structureUtil.parseEnumValues(FileAttribute_1.default, entryBuffer.readUInt32LE(offset));
    offset += 4;
    const filenameLength = entryBuffer.readUInt32LE(offset);
    offset += 4;
    const eaSize = entryBuffer.readUInt32LE(offset);
    offset += 4;
    const shortNameLength = entryBuffer.readUInt8(offset);
    offset += 1;
    offset += 1; // reserved
    let shortFilename;
    if (shortNameLength !== 0) {
        shortFilename = util.toUnixFilePath(entryBuffer
            .slice(offset, offset + shortNameLength)
            .toString("ucs2"));
    }
    offset += 24;
    offset += 2; // reserved
    const fileId = structureUtil.parseString(entryBuffer.slice(offset, offset + 8).reverse(), { type: String, encoding: "hex" });
    offset += 8;
    const filename = util.toUnixFilePath(entryBuffer
        .slice(offset, offset + filenameLength)
        .toString("ucs2"));
    offset += filenameLength;
    return {
        type: fileAttributes.includes("Directory") ? "Directory" : "File",
        index,
        creationTime,
        lastAccessTime,
        lastWriteTime,
        changeTime,
        fileSize,
        allocationSize,
        eaSize,
        shortFilename,
        fileId,
        filename,
        fileAttributes
    };
};
const parseResponseBuffer = (buffer) => {
    return structureUtil.parseList(buffer, parseDirectoryEntry);
};
exports.default = {
    requestStructure,
    responseStructure,
    parseResponseBuffer
};
