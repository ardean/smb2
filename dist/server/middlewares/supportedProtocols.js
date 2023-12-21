"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (supportedProtocols) => (req, res) => {
    if (!supportedProtocols.includes(req.header.protocolId))
        throw new Error(`protocol_not_supported: ${req.header.protocolId}`);
};
