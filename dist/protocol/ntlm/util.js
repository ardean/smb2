"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServerChallenge = exports.encodeAuthenticationMessage = exports.decodeChallengeMessage = exports.encodeChallengeMessage = exports.decodeNegotiationMessage = exports.encodeNegotiationMessage = void 0;
const crypto_1 = __importDefault(require("crypto"));
const httpntlm_1 = __importDefault(require("httpntlm"));
const NegotiateFlag_1 = __importDefault(require("./NegotiateFlag"));
exports.encodeNegotiationMessage = (hostname, domain) => {
    hostname = hostname.toUpperCase();
    domain = domain.toUpperCase();
    const hostnameLength = Buffer.byteLength(hostname, 'ascii');
    const domainLength = Buffer.byteLength(domain, 'ascii');
    let offset = 0;
    const buffer = Buffer.alloc(32 + hostnameLength + domainLength);
    buffer.write('NTLMSSP', offset, 7, 'ascii');
    offset += 7;
    buffer.writeUInt8(0, offset);
    offset += 1;
    buffer.writeUInt32LE(1, offset);
    offset += 4;
    const negotiateFlags = NegotiateFlag_1.default.UnicodeEncoding |
        NegotiateFlag_1.default.NTLMSessionSecurity |
        NegotiateFlag_1.default.AlwaysSign;
    buffer.writeUInt32LE(negotiateFlags, offset);
    offset += 4;
    buffer.writeUInt16LE(domainLength, offset);
    offset += 2;
    buffer.writeUInt16LE(domainLength, offset);
    offset += 2;
    const domainOffset = 0x20 + hostnameLength;
    buffer.writeUInt32LE(domainOffset, offset);
    offset += 4;
    buffer.writeUInt16LE(hostnameLength, offset);
    offset += 2;
    buffer.writeUInt16LE(hostnameLength, offset);
    offset += 2;
    buffer.writeUInt32LE(0x20, offset);
    offset += 4;
    buffer.write(hostname, 0x20, hostnameLength, 'ascii');
    buffer.write(domain, domainOffset, domainLength, 'ascii');
    return buffer;
};
exports.decodeNegotiationMessage = (buffer) => {
    let offset = 0;
    const protocol = buffer.slice(0, 7).toString('ascii');
    if (protocol !== 'NTLMSSP' || buffer.readInt8(7) !== 0x00)
        throw new Error('ntlmssp_header_not_found');
    offset += 8;
    const type = buffer.readUInt32LE(offset);
    if (type !== 0x01)
        throw new Error('ntlmssp_type_is_not_one');
    offset += 4;
    const negotiateFlags = buffer.readUInt32LE(offset);
    offset += 4;
    const domainLength = buffer.readUInt16LE(offset);
    offset += 2;
    const domainMaxLength = buffer.readUInt16LE(offset);
    offset += 2;
    const domainOffset = buffer.readUInt32LE(offset);
    offset += 4;
    const hostnameLength = buffer.readUInt16LE(offset);
    offset += 2;
    const hostnameMaxLength = buffer.readUInt16LE(offset);
    offset += 2;
    const hostnameOffset = buffer.readUInt32LE(offset);
    offset += 4;
    const domain = buffer
        .slice(domainOffset, domainOffset + domainLength)
        .toString('ascii');
    const hostname = buffer
        .slice(hostnameOffset, hostnameOffset + hostnameLength)
        .toString('ascii');
    return {
        negotiateFlags,
        domain,
        hostname
    };
};
exports.encodeChallengeMessage = (negotiateFlags) => {
    let offset = 0;
    const buffer = Buffer.alloc(64);
    buffer.write('NTLMSSP', offset, 7, 'ascii');
    offset += 7;
    buffer.writeUInt8(0, offset);
    offset += 1;
    buffer.writeUInt32LE(2, offset);
    offset += 4;
    buffer.writeUInt16LE(0, offset);
    offset += 2;
    buffer.writeUInt16LE(0, offset);
    offset += 2;
    buffer.writeUInt32LE(0, offset);
    offset += 4;
    buffer.writeUInt32LE(negotiateFlags, offset);
    offset += 4;
    exports.generateServerChallenge().copy(buffer, offset);
    offset += 8;
    buffer.fill(0, offset, offset + 8);
    offset += 8;
    return buffer;
};
exports.decodeChallengeMessage = (buffer) => {
    let offset = 0;
    const protocol = buffer.slice(0, 7).toString('ascii');
    if (protocol !== 'NTLMSSP' || buffer.readInt8(7) !== 0x00)
        throw new Error('ntlmssp_header_not_found');
    offset += 8;
    const type = buffer.readUInt32LE(offset);
    if (type !== 0x02)
        throw new Error('ntlmssp_type_is_not_two');
    offset += 4;
    const targetNameLength = buffer.readUInt16LE(offset);
    offset += 2;
    const targetNameMaxLength = buffer.readUInt16LE(offset);
    offset += 2;
    const targetNameOffset = buffer.readUInt32LE(offset);
    offset += 4;
    const negotiateFlags = buffer.readUInt32LE(offset);
    offset += 4;
    const serverChallenge = buffer.slice(offset, offset + 8);
    offset += 8;
    offset += 8; // Reserved
    return serverChallenge;
};
exports.encodeAuthenticationMessage = (username, hostname, domain, nonce, password) => {
    hostname = hostname.toUpperCase();
    domain = domain.toUpperCase();
    const lmHash = Buffer.alloc(21);
    createLmHash(password).copy(lmHash);
    lmHash.fill(0x00, 16);
    const ntHash = Buffer.alloc(21);
    createNtHash(password).copy(ntHash);
    ntHash.fill(0x00, 16);
    const lmResponse = createResponse(lmHash, nonce);
    const ntResponse = createResponse(ntHash, nonce);
    const usernameLength = Buffer.byteLength(username, 'ucs2');
    const hostnameLength = Buffer.byteLength(hostname, 'ucs2');
    const domainLength = Buffer.byteLength(domain, 'ucs2');
    const lmResponseLength = 0x18;
    const ntResponseLength = 0x18;
    const domainOffset = 0x40;
    const usernameOffset = domainOffset + domainLength;
    const hostnameOffset = usernameOffset + usernameLength;
    const lmResponseOffset = hostnameOffset + hostnameLength;
    const ntResponseOffset = lmResponseOffset + lmResponseLength;
    let offset = 0;
    const messageLength = 64 +
        domainLength +
        usernameLength +
        hostnameLength +
        lmResponseLength +
        ntResponseLength;
    const buffer = Buffer.alloc(messageLength);
    buffer.write('NTLMSSP', offset, 7, 'ascii'); // byte protocol[8];
    offset += 7;
    buffer.writeUInt8(0, offset);
    offset++;
    buffer.writeUInt8(0x03, offset); // byte type;
    offset++;
    buffer.fill(0x00, offset, offset + 3); // byte zero[3];
    offset += 3;
    buffer.writeUInt16LE(lmResponseLength, offset); // short lm_resp_len;
    offset += 2;
    buffer.writeUInt16LE(lmResponseLength, offset); // short lm_resp_len;
    offset += 2;
    buffer.writeUInt16LE(lmResponseOffset, offset); // short lm_resp_off;
    offset += 2;
    buffer.fill(0x00, offset, offset + 2); // byte zero[2];
    offset += 2;
    buffer.writeUInt16LE(ntResponseLength, offset); // short nt_resp_len;
    offset += 2;
    buffer.writeUInt16LE(ntResponseLength, offset); // short nt_resp_len;
    offset += 2;
    buffer.writeUInt16LE(ntResponseOffset, offset); // short nt_resp_off;
    offset += 2;
    buffer.fill(0x00, offset, offset + 2); // byte zero[2];
    offset += 2;
    buffer.writeUInt16LE(domainLength, offset); // short dom_len;
    offset += 2;
    buffer.writeUInt16LE(domainLength, offset); // short dom_len;
    offset += 2;
    buffer.writeUInt16LE(domainOffset, offset); // short dom_off;
    offset += 2;
    buffer.fill(0x00, offset, offset + 2); // byte zero[2];
    offset += 2;
    buffer.writeUInt16LE(usernameLength, offset); // short user_len;
    offset += 2;
    buffer.writeUInt16LE(usernameLength, offset); // short user_len;
    offset += 2;
    buffer.writeUInt16LE(usernameOffset, offset); // short user_off;
    offset += 2;
    buffer.fill(0x00, offset, offset + 2); // byte zero[2];
    offset += 2;
    buffer.writeUInt16LE(hostnameLength, offset); // short host_len;
    offset += 2;
    buffer.writeUInt16LE(hostnameLength, offset); // short host_len;
    offset += 2;
    buffer.writeUInt16LE(hostnameOffset, offset); // short host_off;
    offset += 2;
    buffer.fill(0x00, offset, offset + 6); // byte zero[6];
    offset += 6;
    buffer.writeUInt16LE(messageLength, offset); // short msg_len;
    offset += 2;
    buffer.fill(0x00, offset, offset + 2); // byte zero[2];
    offset += 2;
    const negotiateFlags = NegotiateFlag_1.default.UnicodeEncoding |
        NegotiateFlag_1.default.NTLMSessionSecurity |
        NegotiateFlag_1.default.AlwaysSign;
    buffer.writeUInt32LE(negotiateFlags, offset);
    offset += 4;
    buffer.write(domain, domainOffset, domainLength, 'ucs2');
    buffer.write(username, usernameOffset, usernameLength, 'ucs2');
    buffer.write(hostname, hostnameOffset, hostnameLength, 'ucs2');
    lmResponse.copy(buffer, lmResponseOffset, 0, lmResponseLength);
    ntResponse.copy(buffer, ntResponseOffset, 0, ntResponseLength);
    return buffer;
};
exports.generateServerChallenge = () => {
    return crypto_1.default.randomBytes(8);
};
const createLmHash = (text) => httpntlm_1.default.ntlm.create_LM_hashed_password(text);
const createNtHash = (str) => httpntlm_1.default.ntlm.create_NT_hashed_password(str);
const createResponse = (hash, nonce) => httpntlm_1.default.ntlm.calc_resp(hash, nonce);
