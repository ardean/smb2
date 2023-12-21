"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Response_1 = __importDefault(require("../protocol/smb2/Response"));
class Smb2Response extends Response_1.default {
    constructor() {
        super(...arguments);
        this.sent = false;
    }
    status(status) {
        this.header.status = status;
        return this;
    }
    set(name, value) {
        this.header[name] = value;
    }
    send(data) {
        this.body = data;
        this.sent = true;
    }
    redirect(req) {
        this.redirectedReq = req;
    }
}
exports.default = Smb2Response;
