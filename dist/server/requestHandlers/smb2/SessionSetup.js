"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ntlm = __importStar(require("../../../protocol/ntlm/util"));
const StatusCode_1 = __importDefault(require("../../../protocol/smb2/StatusCode"));
const NegotiateFlag_1 = __importDefault(require("../../../protocol/ntlm/NegotiateFlag"));
exports.default = (req, res) => {
    // console.log(ntlm);
    // console.log(req.body);
    // console.log();
    console.log("SessionSetup");
    const decodedNtlmNegotiation = ntlm.decodeNegotiationMessage(req.body.buffer);
    // console.log(ntlmData);
    const ntlmChallengeNegotiationFlags = syncNegotiationFlags(decodedNtlmNegotiation.negotiateFlags);
    const encodedNtlmChallenge = ntlm.encodeChallengeMessage(ntlmChallengeNegotiationFlags);
    // console.log(encodedNtlmChallenge.toString("hex"));
    res.status(StatusCode_1.default.MoreProcessingRequired); // first session setup request (second success)
    res.set("clientId", req.header.clientId);
    res.send({
        structureSize: 9,
        sessionFlags: 0,
        securityBufferOffset: 72,
        securityBufferLength: 178,
        buffer: encodedNtlmChallenge
    });
};
const syncNegotiationFlags = (negotiationFlags) => {
    let challengeNegotiateFlags = NegotiateFlag_1.default.TargetTypeServer |
        NegotiateFlag_1.default.TargetInfo |
        NegotiateFlag_1.default.TargetNameSupplied |
        NegotiateFlag_1.default.Version;
    // [MS-NLMP] NTLMSSP_NEGOTIATE_NTLM MUST be set in the [..] CHALLENGE_MESSAGE to the client.
    challengeNegotiateFlags |= NegotiateFlag_1.default.NTLMSessionSecurity;
    if ((negotiationFlags & NegotiateFlag_1.default.UnicodeEncoding) > 0) {
        challengeNegotiateFlags |= NegotiateFlag_1.default.UnicodeEncoding;
    }
    else if ((negotiationFlags & NegotiateFlag_1.default.OemEncoding) > 0) {
        challengeNegotiateFlags |= NegotiateFlag_1.default.OemEncoding;
    }
    if ((negotiationFlags & NegotiateFlag_1.default.ExtendedSessionSecurity) > 0) {
        challengeNegotiateFlags |= NegotiateFlag_1.default.ExtendedSessionSecurity;
    }
    else if ((negotiationFlags & NegotiateFlag_1.default.LanManagerSessionKey) > 0) {
        challengeNegotiateFlags |= NegotiateFlag_1.default.LanManagerSessionKey;
    }
    if ((negotiationFlags & NegotiateFlag_1.default.Sign) > 0) {
        // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_SIGN to the server in the NEGOTIATE_MESSAGE,
        // the server MUST return NTLMSSP_NEGOTIATE_SIGN to the client in the CHALLENGE_MESSAGE.
        challengeNegotiateFlags |= NegotiateFlag_1.default.Sign;
    }
    if ((negotiationFlags & NegotiateFlag_1.default.Seal) > 0) {
        // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_SEAL to the server in the NEGOTIATE_MESSAGE,
        // the server MUST return NTLMSSP_NEGOTIATE_SEAL to the client in the CHALLENGE_MESSAGE.
        challengeNegotiateFlags |= NegotiateFlag_1.default.Seal;
    }
    if ((negotiationFlags & NegotiateFlag_1.default.Sign) > 0 ||
        (negotiationFlags & NegotiateFlag_1.default.Seal) > 0) {
        if ((negotiationFlags & NegotiateFlag_1.default.Use56BitEncryption) > 0) {
            // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_SEAL or NTLMSSP_NEGOTIATE_SIGN with
            // NTLMSSP_NEGOTIATE_56 to the server in the NEGOTIATE_MESSAGE, the server MUST return
            // NTLMSSP_NEGOTIATE_56 to the client in the CHALLENGE_MESSAGE.
            challengeNegotiateFlags |= NegotiateFlag_1.default.Use56BitEncryption;
        }
        if ((negotiationFlags & NegotiateFlag_1.default.Use128BitEncryption) > 0) {
            // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_128 to the server in the NEGOTIATE_MESSAGE,
            // the server MUST return NTLMSSP_NEGOTIATE_128 to the client in the CHALLENGE_MESSAGE only if
            // the client sets NTLMSSP_NEGOTIATE_SEAL or NTLMSSP_NEGOTIATE_SIGN.
            challengeNegotiateFlags |= NegotiateFlag_1.default.Use128BitEncryption;
        }
    }
    if ((negotiationFlags & NegotiateFlag_1.default.KeyExchange) > 0) {
        challengeNegotiateFlags |= NegotiateFlag_1.default.KeyExchange;
    }
    return challengeNegotiateFlags;
};
