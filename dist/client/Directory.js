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
const DirectoryAccess_1 = __importDefault(require("../protocol/smb2/DirectoryAccess"));
const Create_1 = require("../protocol/smb2/packets/Create");
const structureUtil = __importStar(require("../protocol/structureUtil"));
const SetInfo_1 = require("../protocol/smb2/packets/SetInfo");
const CreateDispositionType_1 = __importDefault(require("../protocol/smb2/CreateDispositionType"));
const ChangeNotify_1 = require("../protocol/smb2/packets/ChangeNotify");
class Directory extends events_1.EventEmitter {
    constructor(tree) {
        super();
        this.tree = tree;
        this.isOpen = false;
        this.watching = false;
        this.watchingMessageIds = [];
        this.onChangeNotify = async (response) => {
            const messageId = response.header.messageId;
            const messageIdIndex = this.watchingMessageIds.indexOf(messageId);
            if (messageIdIndex !== -1) {
                this.watchingMessageIds.splice(messageIdIndex, 1);
                this.emit("change", response);
                await this.requestWatch();
            }
        };
    }
    async open(path, options = {}) {
        if (this.isOpen)
            return;
        const buffer = Buffer.from(util.toWindowsFilePath(path), "ucs2");
        const response = await this.tree.request({ type: PacketType_1.default.Create }, {
            buffer,
            desiredAccess: typeof options.desiredAccess === "number" ?
                options.desiredAccess :
                (DirectoryAccess_1.default.ListDirectory |
                    DirectoryAccess_1.default.ReadAttributes |
                    DirectoryAccess_1.default.Synchronize),
            fileAttributes: FileAttribute_1.default.Directory,
            shareAccess: ShareAccessType_1.default.Read |
                ShareAccessType_1.default.Write |
                ShareAccessType_1.default.Delete,
            createDisposition: typeof options.createDisposition === "number" ?
                options.createDisposition :
                CreateDispositionType_1.default.Open,
            createOptions: typeof options.createOptions === "number" ?
                options.createOptions :
                Create_1.CreateOptions.None,
            nameOffset: 0x0078,
            createContextsOffset: 0x007a + buffer.length
        });
        this._id = response.body.fileId;
        this.isOpen = true;
        this.emit("open", this);
    }
    async create(path) {
        await this.open(path, {
            createDisposition: CreateDispositionType_1.default.Create,
            createOptions: Create_1.CreateOptions.Directory
        });
    }
    async watch(recursive = true) {
        if (this.watching)
            return;
        this.watching = true;
        this.watchRecursive = recursive;
        await this.requestWatch();
        this.tree.session.client.addListener("changeNotify", this.onChangeNotify);
    }
    async unwatch() {
        if (!this.watching)
            return;
        this.watching = false;
        this.tree.session.client.removeListener("changeNotify", this.onChangeNotify);
        await this.close();
    }
    async requestWatch() {
        const request = this.tree.createRequest({ type: PacketType_1.default.ChangeNotify }, {
            flags: this.watchRecursive ?
                ChangeNotify_1.Flags.WatchTreeRecursively :
                ChangeNotify_1.Flags.None,
            fileId: this._id
        });
        this.watchingMessageIds.push(request.header.messageId);
        const response = await this.tree.session.client.send(request);
        if (response.header.status !== StatusCode_1.default.Success &&
            response.header.status !== StatusCode_1.default.Pending)
            throw new Error(`ChangeNotify: ${structureUtil.parseEnumValue(StatusCode_1.default, response.header.status)} (${response.header.status})`);
        return response;
    }
    async flush() {
        await this.tree.request({
            type: PacketType_1.default.Flush
        }, {
            fileId: this._id
        });
    }
    async read() {
        const response = await this.tree.request({ type: PacketType_1.default.QueryDirectory }, {
            fileId: this._id,
            buffer: Buffer.from("*", "ucs2")
        });
        let entries = [];
        if (response.data) {
            entries = response.data.filter(x => x.filename !== "." && x.filename !== "..");
        }
        else {
            console.warn("response without data", response);
        }
        return entries;
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
    async setInfo(fileInfoClass, buffer) {
        await this.tree.request({ type: PacketType_1.default.SetInfo }, {
            infoType: SetInfo_1.InfoType.File,
            fileId: this._id,
            fileInfoClass,
            buffer
        });
    }
    async close() {
        if (this.watching)
            return await this.unwatch();
        if (!this.isOpen)
            return;
        this.isOpen = false;
        await this.tree.request({ type: PacketType_1.default.Close }, { fileId: this._id });
        this.emit("close", this);
    }
}
exports.default = Directory;
