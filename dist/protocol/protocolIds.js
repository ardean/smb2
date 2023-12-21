"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smb2 = exports.smb = void 0;
exports.smb = Buffer
    .from([
    0xff,
    "S".charCodeAt(0),
    "M".charCodeAt(0),
    "B".charCodeAt(0)
])
    .toString("hex");
exports.smb2 = Buffer
    .from([
    0xfe,
    "S".charCodeAt(0),
    "M".charCodeAt(0),
    "B".charCodeAt(0)
])
    .toString("hex");
