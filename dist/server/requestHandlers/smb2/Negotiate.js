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
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const StatusCode_1 = __importDefault(require("../../../protocol/smb2/StatusCode"));
const Capability_1 = __importDefault(require("../../../protocol/smb2/Capability"));
const Dialect_1 = __importDefault(require("../../../protocol/smb2/Dialect"));
const Header_1 = require("../../../protocol/smb2/Header");
const structureUtil = __importStar(require("../../../protocol/structureUtil"));
const supportedDialects = [
    Dialect_1.default.Smb210,
    Dialect_1.default.Smb202,
    Dialect_1.default.Smb2xx
];
exports.default = (req, res) => {
    const dialects = req.body.dialects;
    const targetDialect = supportedDialects.find(supportedDialect => dialects.find(dialect => dialect === supportedDialect));
    const targetDialectName = structureUtil.parseEnumValue(Dialect_1.default, targetDialect);
    const securityBuffer = Buffer.alloc(0);
    res.status(StatusCode_1.default.Success);
    res.set("clientId", req.header.clientId);
    res.send({
        structureSize: 0x0041,
        securityMode: 0,
        dialectRevision: targetDialect,
        reserved: 0,
        serverGuid: req.server.guid,
        capabilities: Capability_1.default.DistributedFileSystem | Capability_1.default.MultiCreditSupport,
        maxTransactSize: 0x00100000,
        maxReadSize: 0x00100000,
        maxWriteSize: 0x00100000,
        systemTime: structureUtil.serializeDate(moment_timezone_1.default().toDate()),
        serverStartTime: structureUtil.serializeDate(req.server.startDate),
        securityBufferOffset: Header_1.headerSize + 64,
        securityBufferLength: securityBuffer.length,
        reserved2: 0,
        buffer: securityBuffer
    });
};
