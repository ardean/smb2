"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Request {
    constructor(header = {}, body = {}) {
        this.header = header;
        this.body = body;
    }
}
exports.default = Request;
