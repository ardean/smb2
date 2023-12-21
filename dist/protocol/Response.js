"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(header = {}, body = {}) {
        this.header = header;
        this.body = body;
    }
}
exports.default = Response;
