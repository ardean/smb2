"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Client_1 = __importDefault(require("./client/Client"));
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return Client_1.default; } });
exports.default = {
    Client: Client_1.default,
};
