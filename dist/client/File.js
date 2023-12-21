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
const events_1 = require("events");
const util = __importStar(require("../protocol/util"));
const StatusCode_1 = __importDefault(require("../protocol/smb2/StatusCode"));
const PacketType_1 = __importDefault(require("../protocol/smb2/PacketType"));
const FileAttribute_1 = __importDefault(require("../protocol/smb2/FileAttribute"));
const ShareAccessType_1 = __importDefault(require("../protocol/smb2/ShareAccessType"));
const Create_1 = require("../protocol/smb2/packets/Create");
const CreateDispositionType_1 = __importDefault(require("../protocol/smb2/CreateDispositionType"));
const FilePipePrinterAccess_1 = __importDefault(require("../protocol/smb2/FilePipePrinterAccess"));
const SetInfo_1 = require("../protocol/smb2/packets/SetInfo");
const maxReadChunkLength = 0x00010000;
const maxWriteChunkLength = 0x00010000 - 0x71;
class File extends events_1.EventEmitter {
    constructor(tree) {
        super();
        this.tree = tree;
    }
    async open(path, options = {}) {
        if (this.isOpen)
            return;
        const buffer = Buffer.from(util.toWindowsFilePath(path), "ucs2");
        const response = await this.tree.request({ type: PacketType_1.default.Create }, {
            buffer,
            desiredAccess: typeof options.desiredAccess === "number" ?
                options.desiredAccess :
                FilePipePrinterAccess_1.default.ReadData,
            fileAttributes: FileAttribute_1.default.Normal,
            shareAccess: ShareAccessType_1.default.Read |
                ShareAccessType_1.default.Write |
                ShareAccessType_1.default.Delete,
            createDisposition: typeof options.createDisposition === "number" ?
                options.createDisposition :
                CreateDispositionType_1.default.Open,
            createOptions: typeof options.createDisposition === "number" ?
                options.createDisposition :
                Create_1.CreateOptions.None,
            nameOffset: 0x0078,
            createContextsOffset: 0x007a + buffer.length
        });
        this._id = response.body.fileId;
        this.fileSize = response.body.endOfFile;
        this.isOpen = true;
        this.emit("open", this);
    }
    async create(path) {
        await this.open(path, {
            desiredAccess: FilePipePrinterAccess_1.default.WriteData,
            createDisposition: CreateDispositionType_1.default.Create
        });
    }
    async remove() {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(1, 0);
        await this.setInfo(SetInfo_1.FileInfoClass.DispositionInformation, buffer);
    }
    async rename(newPath) {
        const newPathUCS2 = Buffer.from(newPath, "ucs2");
        const buffer = Buffer.alloc(1 + 7 + 8 + 4 + newPathUCS2.length);
        buffer.fill(0x00);
        buffer.writeUInt8(1, 0);
        buffer.writeUInt32LE(newPathUCS2.length, 16);
        buffer.fill(newPathUCS2, 20);
        await this.setInfo(SetInfo_1.FileInfoClass.RenameInformation, buffer);
    }
    async setSize(size) {
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64LE(size);
        await this.setInfo(SetInfo_1.FileInfoClass.EndOfFileInformation, buffer);
    }
    async setInfo(fileInfoClass, buffer) {
        await this.tree.request({ type: PacketType_1.default.SetInfo }, {
            infoType: SetInfo_1.InfoType.File,
            fileId: this._id,
            fileInfoClass,
            buffer
        });
    }
    async write(content) {
        const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
        const chunkCount = Math.ceil(buffer.length / maxWriteChunkLength);
        for (let index = 0; index < chunkCount; index++) {
            const offset = index * maxWriteChunkLength;
            const nextOffset = (index + 1) * maxWriteChunkLength;
            const length = nextOffset > buffer.length ? buffer.length - offset : nextOffset - offset;
            const chunk = buffer.slice(offset, offset + length);
            const offsetBuffer = Buffer.alloc(8);
            offsetBuffer.writeBigUInt64LE(BigInt(offset));
            await this.tree.request({ type: PacketType_1.default.Write }, {
                fileId: this._id,
                buffer: chunk,
                offset: offsetBuffer
            });
        }
    }
    async read() {
        const fileSize = Number(this.fileSize);
        const chunkCount = Math.ceil(fileSize / maxReadChunkLength);
        const buffer = Buffer.alloc(fileSize);
        for (let index = 0; index < chunkCount; index++) {
            const offset = index * maxReadChunkLength;
            const nextOffset = (index + 1) * maxReadChunkLength;
            const length = nextOffset > fileSize ? fileSize - offset : nextOffset - offset;
            const lengthBuffer = Buffer.alloc(4);
            lengthBuffer.writeInt32LE(length, 0);
            const offsetBuffer = Buffer.alloc(8);
            offsetBuffer.writeBigUInt64LE(BigInt(offset));
            const response = await this.tree.request({ type: PacketType_1.default.Read }, {
                fileId: this._id,
                length: lengthBuffer,
                offset: offsetBuffer
            });
            response.body.buffer.copy(buffer, offset);
        }
        return buffer;
    }
    async exists(path) {
        try {
            await this.open(path);
        }
        catch (err) {
            if (err.header.status === StatusCode_1.default.FileNameNotFound ||
                err.header.status === StatusCode_1.default.FilePathNotFound) {
                return false;
            }
            throw err;
        }
        return true;
    }
    async close() {
        if (!this.isOpen)
            return;
        this.isOpen = false;
        await this.tree.request({ type: PacketType_1.default.Close }, { fileId: this._id });
        this.emit("close", this);
    }
}
exports.default = File;
