"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requestStructure = {
    structureSize: {
        type: Number,
        size: 2,
        defaultValue: 4
    },
    reserved: {
        type: Number,
        size: 2
    }
};
const responseStructure = {
    structureSize: {
        type: Number,
        size: 2
    },
    reserved: {
        type: Number,
        size: 2
    }
};
exports.default = {
    requestStructure,
    responseStructure
};
