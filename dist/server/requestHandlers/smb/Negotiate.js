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
const Smb2Request_1 = __importDefault(require("../../Smb2Request"));
const Dialect_1 = __importDefault(require("../../../protocol/smb2/Dialect"));
const protocolIds = __importStar(require("../../../protocol/protocolIds"));
const PacketType_1 = __importDefault(require("../../../protocol/smb2/PacketType"));
const supportedDialects = [
    "NT LM 0.12",
    "SMB 2.002",
    "SMB 2.???"
];
exports.default = (req, res) => {
    const dialects = req.body.dialects;
    const matchingDialects = dialects.filter(dialect => supportedDialects.indexOf(dialect) !== -1);
    if (matchingDialects.length === 0)
        throw new Error(`no_dialect_supported`);
    if (matchingDialects.find(x => x.startsWith("SMB 2."))) {
        const newReq = new Smb2Request_1.default({
            protocolId: protocolIds.smb2,
            type: PacketType_1.default.Negotiate
        }, {
            dialects: [
                Dialect_1.default.Smb210,
                Dialect_1.default.Smb202,
                Dialect_1.default.Smb2xx
            ]
        });
        res.redirect(newReq);
    }
    else {
        throw new Error("smb_not_implemented_yet");
    }
};
