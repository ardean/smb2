"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeString = exports.serializeDate = exports.serializeValue = exports.serializeStructure = exports.parseList = exports.parseEnumValues = exports.parseEnumValue = exports.parseDate = exports.parseString = exports.parseValue = exports.parseNumber = exports.parseStructure = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
exports.parseStructure = (buffer, structure) => {
    let offset = 0;
    const data = {};
    const structureFieldNames = Object.keys(structure);
    for (const structureFieldName of structureFieldNames) {
        const structureField = structure[structureFieldName];
        let size;
        if (structureField.sizeFieldName) {
            size = data[structureField.sizeFieldName];
            if (typeof size === "undefined")
                throw new Error(`invalid_size_field_name: ${structureField.sizeFieldName}`);
        }
        else if (typeof structureField.size === "number") {
            size = structureField.size;
        }
        else
            throw new Error(`unknown_field_size`);
        structureField.count = typeof structureField.count === "number" ?
            structureField.count :
            1;
        if (structureField.countFieldName) {
            structureField.count = data[structureField.countFieldName];
            if (typeof structureField.count === "undefined")
                throw new Error(`invalid_count_field_name: ${structureField.countFieldName}`);
        }
        const value = buffer.slice(offset, offset + (size * structureField.count));
        data[structureFieldName] = exports.parseValue(value, structureField);
        offset += size * structureField.count;
    }
    return data;
};
exports.parseNumber = (buffer, structureField) => {
    if (structureField.size === 2 && buffer.length === 2) {
        return structureField.signedness === "Unsigned" ?
            buffer.readUInt16LE(0) :
            buffer.readInt16LE(0);
    }
    if (structureField.size === 4 && buffer.length === 4) {
        return structureField.signedness === "Unsigned" ?
            buffer.readUInt32LE(0) :
            buffer.readInt32LE(0);
    }
    if (structureField.size === 8 && buffer.length === 8) {
        return structureField.signedness === "Unsigned" ?
            buffer.readBigUInt64LE(0) :
            buffer.readBigInt64LE(0);
    }
    let result = 0;
    for (let index = 0; index < buffer.length; index++) {
        result += buffer.readUInt8(index) << (index * 8);
    }
    return result;
};
exports.parseValue = (buffer, structureField) => {
    if (structureField.count > 1) {
        const entryBuffers = [];
        for (let index = 0; index < structureField.count; index++) {
            const entryBuffer = buffer.slice(index * structureField.size, (index + 1) * structureField.size);
            entryBuffers.push(entryBuffer);
        }
        return entryBuffers.map(entryBuffer => exports.parseValue(entryBuffer, { ...structureField, count: 1 }));
    }
    let value = buffer;
    if (structureField.type === String)
        value = exports.parseString(buffer, structureField);
    else if (structureField.type === Number)
        value = exports.parseNumber(buffer, structureField);
    return value;
};
exports.parseString = (buffer, structureField) => {
    return buffer.slice(0, structureField.size).toString(structureField.encoding);
};
exports.parseDate = (buffer) => {
    const milliseconds = Number(buffer.readBigUInt64LE(0) / 10000n);
    return moment_timezone_1.default.utc("1601-01-01").add(milliseconds, "milliseconds").toDate();
};
exports.parseEnumValue = (enumObject, value) => {
    return Object.keys(enumObject)
        .find(x => enumObject[x] === value);
};
exports.parseEnumValues = (enumObject, value) => {
    return Object.keys(enumObject)
        .filter(x => (enumObject[x] & value) !== 0);
};
exports.parseList = (buffer, parser) => {
    if (buffer.length === 0)
        return [];
    let currentOffset = 0;
    let nextEntryOffset = -1;
    const list = [];
    while (nextEntryOffset !== 0) {
        nextEntryOffset = buffer.readUInt32LE(currentOffset);
        const entryBufferStart = currentOffset + 4;
        const entryBufferEnd = nextEntryOffset === 0 ?
            buffer.length :
            currentOffset + nextEntryOffset;
        const entryBuffer = buffer.slice(entryBufferStart, entryBufferEnd);
        list.push(parser(entryBuffer));
        currentOffset += nextEntryOffset;
    }
    return list;
};
exports.serializeStructure = (structure, data) => {
    const normalizedData = {};
    const structureFieldNames = Object.keys(structure);
    for (const structureFieldName of structureFieldNames) {
        const structureField = structure[structureFieldName];
        const value = typeof data[structureFieldName] !== "undefined" ?
            data[structureFieldName] :
            structureField.defaultValue || 0;
        normalizedData[structureFieldName] = {};
        if (structureField.sizeFieldName) {
            structureField.size = Buffer.isBuffer(value) ?
                value.length :
                0;
            const referencedStructureField = structure[structureField.sizeFieldName];
            normalizedData[structureField.sizeFieldName].value = exports.serializeValue(structureField.size, referencedStructureField);
        }
        structureField.count = typeof structureField.count === "number" ?
            structureField.count :
            1;
        if (structureField.countFieldName) {
            structureField.count = Array.isArray(value) ?
                value.length :
                0;
            const referencedStructureField = structure[structureField.countFieldName];
            normalizedData[structureField.countFieldName].value = exports.serializeValue(structureField.count, referencedStructureField);
        }
        normalizedData[structureFieldName].value = exports.serializeValue(value, structureField);
        normalizedData[structureFieldName].size = structureField.size * structureField.count;
    }
    const normalizedFields = structureFieldNames.map(x => normalizedData[x]);
    const bufferSize = normalizedFields.reduce((prev, current) => prev + current.size, 0);
    const buffer = Buffer.allocUnsafe(bufferSize);
    let offset = 0;
    for (const normalizedField of normalizedFields) {
        normalizedField.value.copy(buffer, offset);
        offset += normalizedField.size;
    }
    return buffer;
};
exports.serializeValue = (value, structureField) => {
    if (structureField.count > 1 && Array.isArray(value)) {
        const buffers = value.map(listEntry => exports.serializeValue(listEntry, { ...structureField, count: 1 }));
        return Buffer.concat(buffers);
    }
    if (Buffer.isBuffer(value))
        return value;
    if (typeof value === "string")
        return exports.serializeString(value, structureField);
    const bignumberValue = BigInt(value);
    const result = Buffer.allocUnsafe(structureField.size);
    for (let index = 0; index < structureField.size; index++) {
        const offset = BigInt(index * 8);
        const byte = 0xffn & (bignumberValue >> offset);
        result.writeUInt8(Number(byte), index);
    }
    return result;
};
exports.serializeDate = (date) => {
    const milliseconds = moment_timezone_1.default(date).diff(moment_timezone_1.default.utc("1601-01-01"), "milliseconds");
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigInt64LE(BigInt(milliseconds) * 10000n, 0);
    return buffer;
};
exports.serializeString = (value, structureField) => {
    return Buffer.from(value, structureField.encoding);
};
