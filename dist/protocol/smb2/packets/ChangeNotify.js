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
exports.CompletionFilter = exports.Flags = void 0;
const util = __importStar(require("../../util"));
const FileAction_1 = __importDefault(require("../FileAction"));
const structureUtil = __importStar(require("../../structureUtil"));
var Flags;
(function (Flags) {
    Flags[Flags["None"] = 0] = "None";
    Flags[Flags["WatchTreeRecursively"] = 1] = "WatchTreeRecursively";
})(Flags = exports.Flags || (exports.Flags = {}));
var CompletionFilter;
(function (CompletionFilter) {
    CompletionFilter[CompletionFilter["FilenameChange"] = 1] = "FilenameChange";
    CompletionFilter[CompletionFilter["DirnameChange"] = 2] = "DirnameChange";
    CompletionFilter[CompletionFilter["AttributesChange"] = 4] = "AttributesChange";
    CompletionFilter[CompletionFilter["SizeChange"] = 8] = "SizeChange";
    CompletionFilter[CompletionFilter["LastWriteChange"] = 16] = "LastWriteChange";
    CompletionFilter[CompletionFilter["LastAccessChange"] = 32] = "LastAccessChange";
    CompletionFilter[CompletionFilter["CreationChange"] = 64] = "CreationChange";
    CompletionFilter[CompletionFilter["EaChange"] = 128] = "EaChange";
    CompletionFilter[CompletionFilter["SecurityChange"] = 256] = "SecurityChange";
    CompletionFilter[CompletionFilter["StreamNameChange"] = 512] = "StreamNameChange";
    CompletionFilter[CompletionFilter["StreamSizeChange"] = 1024] = "StreamSizeChange";
    CompletionFilter[CompletionFilter["StreamWriteChange"] = 2048] = "StreamWriteChange";
})(CompletionFilter = exports.CompletionFilter || (exports.CompletionFilter = {}));
const requestStructure = {
    structureSize: {
        type: Number,
        size: 2,
        defaultValue: 32
    },
    flags: {
        type: Number,
        size: 2,
        defaultValue: Flags.WatchTreeRecursively
    },
    outputBufferLength: {
        type: Number,
        size: 4,
        defaultValue: 0x00010000
    },
    fileId: {
        type: String,
        encoding: "hex",
        size: 16
    },
    completionFilter: {
        type: Number,
        size: 4,
        defaultValue: CompletionFilter.FilenameChange |
            CompletionFilter.DirnameChange |
            CompletionFilter.AttributesChange |
            CompletionFilter.SizeChange |
            CompletionFilter.LastWriteChange |
            CompletionFilter.LastAccessChange |
            CompletionFilter.CreationChange |
            CompletionFilter.EaChange |
            CompletionFilter.SecurityChange |
            CompletionFilter.StreamNameChange |
            CompletionFilter.StreamSizeChange |
            CompletionFilter.StreamWriteChange
    },
    reserved: {
        type: Number,
        size: 4
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
const parseChangeEntry = (entryBuffer) => {
    const action = entryBuffer.readUInt32LE(0);
    const filenameLength = entryBuffer.readUInt32LE(4);
    const filename = util.toUnixFilePath(entryBuffer
        .slice(8, 8 + filenameLength)
        .toString("ucs2"));
    const actionName = structureUtil.parseEnumValue(FileAction_1.default, action);
    return {
        action,
        actionName,
        filename
    };
};
const parseResponseBuffer = (buffer) => {
    return structureUtil.parseList(buffer, parseChangeEntry);
};
exports.default = {
    requestStructure,
    responseStructure,
    parseResponseBuffer
};
