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
const File_1 = __importDefault(require("./File"));
const Directory_1 = __importDefault(require("./Directory"));
const events_1 = require("events");
const util = __importStar(require("../protocol/util"));
const PacketType_1 = __importDefault(require("../protocol/smb2/PacketType"));
const DirectoryAccess_1 = __importDefault(require("../protocol/smb2/DirectoryAccess"));
const FilePipePrinterAccess_1 = __importDefault(require("../protocol/smb2/FilePipePrinterAccess"));
class Tree extends events_1.EventEmitter {
    constructor(session) {
        super();
        this.session = session;
        this.connected = false;
        this.connecting = false;
        this.openFiles = [];
        this.openDirectories = [];
    }
    async connect(path) {
        if (this.connected || this.connecting)
            return;
        this.connecting = true;
        const buffer = Buffer.from(util.toWindowsPath(`//${this.session.client.host}:${this.session.client.port}/${path}`), "ucs2");
        const response = await this.request({ type: PacketType_1.default.TreeConnect }, { buffer });
        this._id = response.header.treeId;
        this.connecting = false;
        this.connected = true;
        this.emit("connect", this);
    }
    async disconnect() {
        if (!this.connected)
            return;
        this.connected = false;
        await Promise.all([
            ...this.openFiles.map(x => x.close()),
            ...this.openDirectories.map(x => x.close())
        ]);
        await this.request({ type: PacketType_1.default.TreeDisconnect });
        this.emit("disconnect", this);
    }
    async createDirectory(path) {
        const directory = new Directory_1.default(this);
        this.registerDirectory(directory);
        await directory.create(path);
        await directory.close();
    }
    async removeDirectory(path) {
        const directory = new Directory_1.default(this);
        this.registerDirectory(directory);
        await directory.open(path, { desiredAccess: DirectoryAccess_1.default.Delete });
        await directory.remove();
        await directory.close();
    }
    async renameDirectory(path, newPath) {
        const directory = new Directory_1.default(this);
        this.registerDirectory(directory);
        await directory.open(path, { desiredAccess: DirectoryAccess_1.default.MaximumAllowed });
        await directory.rename(newPath);
        await directory.close();
    }
    async watch(onChange, recursive) {
        return await this.watchDirectory("", onChange, recursive);
    }
    async watchDirectory(path = "/", onChange, recursive) {
        const directory = new Directory_1.default(this);
        this.registerDirectory(directory);
        await directory.open(path);
        await directory.watch(recursive);
        directory.addListener("change", onChange);
        return async () => {
            directory.removeListener("change", onChange);
            await directory.unwatch();
        };
    }
    async readDirectory(path = "/") {
        const directory = new Directory_1.default(this);
        this.registerDirectory(directory);
        await directory.open(path);
        const entries = await directory.read();
        await directory.close();
        return entries;
    }
    async exists(path) {
        const file = new File_1.default(this);
        this.registerFile(file);
        const exists = await file.exists(path);
        await file.close();
        return exists;
    }
    async createFile(path, content) {
        const file = new File_1.default(this);
        this.registerFile(file);
        await file.create(path);
        if (typeof content !== "undefined") {
            await file.setSize(BigInt(content.length));
            await file.write(content);
        }
        await file.close();
    }
    async removeFile(path) {
        const file = new File_1.default(this);
        this.registerFile(file);
        await file.open(path, { desiredAccess: FilePipePrinterAccess_1.default.Delete });
        await file.remove();
        await file.close();
    }
    async renameFile(path, newPath) {
        const file = new File_1.default(this);
        this.registerFile(file);
        await file.open(path, { desiredAccess: FilePipePrinterAccess_1.default.MaximumAllowed });
        await file.rename(newPath);
        await file.close();
    }
    async readFile(path) {
        const file = new File_1.default(this);
        this.registerFile(file);
        await file.open(path);
        const buffer = await file.read();
        await file.close();
        return buffer;
    }
    registerFile(file) {
        file
            .once("open", () => this.openFiles.push(file))
            .once("close", () => this.openFiles.splice(this.openFiles.indexOf(file), 1));
    }
    registerDirectory(directory) {
        directory
            .once("open", () => this.openDirectories.push(directory))
            .once("close", () => this.openDirectories.splice(this.openDirectories.indexOf(directory), 1));
    }
    createRequest(header = {}, body = {}) {
        return this.session.createRequest({
            treeId: this._id,
            ...header
        }, body);
    }
    request(header = {}, body = {}) {
        return this.session.request({
            treeId: this._id,
            ...header
        }, body);
    }
}
exports.default = Tree;
