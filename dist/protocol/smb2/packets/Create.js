"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOptions = void 0;
const ShareAccessType_1 = __importDefault(require("../ShareAccessType"));
const CreateDispositionType_1 = __importDefault(require("../CreateDispositionType"));
var CreateOptions;
(function (CreateOptions) {
    CreateOptions[CreateOptions["None"] = 0] = "None";
    CreateOptions[CreateOptions["Directory"] = 1] = "Directory";
})(CreateOptions = exports.CreateOptions || (exports.CreateOptions = {}));
const requestStructure = {
    structureSize: {
        type: Number,
        size: 2,
        defaultValue: 57
    },
    securityFlags: {
        type: Number,
        size: 1
    },
    requestedOplockLevel: {
        type: Number,
        size: 1
    },
    impersonationLevel: {
        type: Number,
        size: 4,
        defaultValue: 0x00000002
    },
    smbCreateFlags: {
        type: Number,
        size: 8
    },
    reserved: {
        type: Number,
        size: 8
    },
    desiredAccess: {
        type: Number,
        size: 4,
        defaultValue: 0x00100081
    },
    fileAttributes: {
        type: Number,
        size: 4
    },
    shareAccess: {
        type: Number,
        size: 4,
        defaultValue: ShareAccessType_1.default.Read |
            ShareAccessType_1.default.Write |
            ShareAccessType_1.default.Delete
    },
    createDisposition: {
        type: Number,
        size: 4,
        defaultValue: CreateDispositionType_1.default.Open
    },
    createOptions: {
        type: Number,
        size: 4,
        defaultValue: CreateOptions.None
    },
    nameOffset: {
        type: Number,
        size: 2
    },
    nameLength: {
        type: Number,
        size: 2
    },
    createContextsOffset: {
        type: Number,
        size: 4
    },
    createContextsLength: {
        type: Number,
        size: 4
    },
    buffer: {
        type: Buffer,
        sizeFieldName: "nameLength"
    },
    reserved2: {
        type: Number,
        size: 2,
        defaultValue: 0x4200
    },
    createContexts: {
        type: Number,
        sizeFieldName: "createContextsLength",
        defaultValue: ""
    }
};
const responseStructure = {
    structureSize: {
        type: Number,
        size: 2
    },
    oplockLevel: {
        type: Number,
        size: 1
    },
    flags: {
        type: Number,
        size: 1
    },
    createAction: {
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
        size: 8
    },
    fileAttributes: {
        type: Number,
        size: 4
    },
    reserved2: {
        type: Number,
        size: 4
    },
    fileId: {
        type: String,
        encoding: "hex",
        size: 16
    },
    createContextsOffset: {
        type: Number,
        size: 4
    },
    createContextsLength: {
        type: Number,
        size: 4
    },
    buffer: {
        type: Buffer,
        sizeFieldName: "createContextsLength"
    }
};
exports.default = {
    requestStructure,
    responseStructure
};
