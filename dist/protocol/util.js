"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGuid = exports.getRandomInt = exports.toWindowsPath = exports.toUnixPath = exports.toWindowsFilePath = exports.toUnixFilePath = void 0;
const crypto_1 = __importDefault(require("crypto"));
exports.toUnixFilePath = (value) => {
    value = exports.toUnixPath(value);
    if (value[0] !== "/" && value[0] !== ".")
        value = `./${value}`;
    if (value[0] === "/")
        value = `.${value}`;
    return value;
};
exports.toWindowsFilePath = (value) => {
    if (value[0] === ".")
        value = value.substring(1);
    if (value[0] === "/")
        value = value.substring(1);
    value = exports.toWindowsPath(value);
    return value;
};
exports.toUnixPath = (value) => {
    value = value.replace(/\\/g, "/");
    return value;
};
exports.toWindowsPath = (value) => {
    value = value.replace(/\//g, "\\");
    return value;
};
exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.generateGuid = () => {
    const timeLow = exports.getRandomInt(0, Math.pow(2, 32) - 1);
    const timeMiddle = exports.getRandomInt(0, Math.pow(2, 16) - 1);
    const timeHighAndVersion = 0x4000 | exports.getRandomInt(0, Math.pow(2, 12) - 1);
    const clockSequenceHighAndReserved = 0x80 | exports.getRandomInt(0, Math.pow(2, 6) - 1);
    const clockSequenceLow = exports.getRandomInt(0, Math.pow(2, 8) - 1);
    const node = crypto_1.default.randomBytes(6);
    const buffer = Buffer.alloc(16);
    let offset = 0;
    buffer.writeUInt32LE(timeLow, offset);
    offset += 4;
    buffer.writeUInt16LE(timeMiddle, offset);
    offset += 2;
    buffer.writeUInt16LE(timeHighAndVersion, offset);
    offset += 2;
    buffer.writeUInt8(clockSequenceHighAndReserved, offset);
    offset += 1;
    buffer.writeUInt8(clockSequenceLow, offset);
    offset += 1;
    node.copy(buffer, offset);
    return buffer;
};
