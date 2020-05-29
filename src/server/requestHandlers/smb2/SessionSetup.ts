import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import * as ntlm from "../../../protocol/ntlm/util";
import StatusCode from "../../../protocol/smb2/StatusCode";
import NegotiateFlag from "../../../protocol/ntlm/NegotiateFlag";

export default (req: Request, res: Response) => {
  // console.log(ntlm);
  // console.log(req.body);
  // console.log();
  console.log("SessionSetup");

  const decodedNtlmNegotiation = ntlm.decodeNegotiationMessage(req.body.buffer as Buffer);
  // console.log(ntlmData);

  const ntlmChallengeNegotiationFlags = syncNegotiationFlags(decodedNtlmNegotiation.negotiateFlags);
  const encodedNtlmChallenge = ntlm.encodeChallengeMessage(ntlmChallengeNegotiationFlags);

  // console.log(encodedNtlmChallenge.toString("hex"));
  res.status(StatusCode.MoreProcessingRequired); // first session setup request (second success)
  res.set("clientId", req.header.clientId);

  res.send({
    structureSize: 9,
    sessionFlags: 0,
    securityBufferOffset: 72,
    securityBufferLength: 178,
    buffer: encodedNtlmChallenge
  });
};

const syncNegotiationFlags = (negotiationFlags: number) => {
  let challengeNegotiateFlags = NegotiateFlag.TargetTypeServer |
    NegotiateFlag.TargetInfo |
    NegotiateFlag.TargetNameSupplied |
    NegotiateFlag.Version;

  // [MS-NLMP] NTLMSSP_NEGOTIATE_NTLM MUST be set in the [..] CHALLENGE_MESSAGE to the client.
  challengeNegotiateFlags |= NegotiateFlag.NTLMSessionSecurity;

  if ((negotiationFlags & NegotiateFlag.UnicodeEncoding) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.UnicodeEncoding;
  }
  else if ((negotiationFlags & NegotiateFlag.OemEncoding) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.OemEncoding;
  }

  if ((negotiationFlags & NegotiateFlag.ExtendedSessionSecurity) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.ExtendedSessionSecurity;
  }
  else if ((negotiationFlags & NegotiateFlag.LanManagerSessionKey) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.LanManagerSessionKey;
  }

  if ((negotiationFlags & NegotiateFlag.Sign) > 0) {
    // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_SIGN to the server in the NEGOTIATE_MESSAGE,
    // the server MUST return NTLMSSP_NEGOTIATE_SIGN to the client in the CHALLENGE_MESSAGE.
    challengeNegotiateFlags |= NegotiateFlag.Sign;
  }

  if ((negotiationFlags & NegotiateFlag.Seal) > 0) {
    // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_SEAL to the server in the NEGOTIATE_MESSAGE,
    // the server MUST return NTLMSSP_NEGOTIATE_SEAL to the client in the CHALLENGE_MESSAGE.
    challengeNegotiateFlags |= NegotiateFlag.Seal;
  }

  if ((negotiationFlags & NegotiateFlag.Sign) > 0 ||
    (negotiationFlags & NegotiateFlag.Seal) > 0) {
    if ((negotiationFlags & NegotiateFlag.Use56BitEncryption) > 0) {
      // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_SEAL or NTLMSSP_NEGOTIATE_SIGN with
      // NTLMSSP_NEGOTIATE_56 to the server in the NEGOTIATE_MESSAGE, the server MUST return
      // NTLMSSP_NEGOTIATE_56 to the client in the CHALLENGE_MESSAGE.
      challengeNegotiateFlags |= NegotiateFlag.Use56BitEncryption;
    }
    if ((negotiationFlags & NegotiateFlag.Use128BitEncryption) > 0) {
      // [MS-NLMP] If the client sends NTLMSSP_NEGOTIATE_128 to the server in the NEGOTIATE_MESSAGE,
      // the server MUST return NTLMSSP_NEGOTIATE_128 to the client in the CHALLENGE_MESSAGE only if
      // the client sets NTLMSSP_NEGOTIATE_SEAL or NTLMSSP_NEGOTIATE_SIGN.
      challengeNegotiateFlags |= NegotiateFlag.Use128BitEncryption;
    }
  }

  if ((negotiationFlags & NegotiateFlag.KeyExchange) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.KeyExchange;
  }

  return challengeNegotiateFlags;
};