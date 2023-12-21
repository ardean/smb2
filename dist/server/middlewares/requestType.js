"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (protocolId, packetType, middleware) => async (req, res) => {
    if (req.header.protocolId === protocolId &&
        req.header.type === packetType)
        return await middleware(req, res);
};
