import os from "os";
import moment from "moment-timezone";
import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import StatusCode from "../../../protocols/smb2/StatusCode";
import SessionFlag from "../../../protocols/smb2/SessionFlag";

import ntlmv2, {
  MessageType as NtlmMessageType,
  NegotiateFlag,
  AttributeValueId
} from "ntlmv2";

export default (req: Request, res: Response) => {
  const buffer = req.body.buffer as Buffer;
  const messageType = ntlmv2.parseMessageType(buffer);
  if (messageType === NtlmMessageType.Negotiation) {
    handleNegotiationRequest(req, res);
  } else if (messageType === NtlmMessageType.Authentication) {
    handleAuthenticationRequest(req, res);
  }
};

const handleNegotiationRequest = (req: Request, res: Response) => {
  const buffer = req.body.buffer as Buffer;
  const negotiationMessage = ntlmv2.parseNegotiationMessage(buffer);

  if ((negotiationMessage.negotiateFlags & NegotiateFlag.ExtendedSessionSecurity) > 0) {
    req.client.useExtendedSessionSecurity = true;
  }

  const ntlmChallengeNegotiationFlags = syncNegotiationFlags(negotiationMessage.negotiateFlags);

  const hostname = os.hostname();
  const targetInfo = [{
    id: AttributeValueId.NetBiosDomainName,
    value: hostname
  }, {
    id: AttributeValueId.NetBiosComputerName,
    value: hostname
  }, {
    id: AttributeValueId.DnsDomainName,
    value: hostname
  }, {
    id: AttributeValueId.DnsComputerName,
    value: hostname
  }, {
    id: AttributeValueId.Timestamp,
    value: moment().toDate()
  }];

  const serverChallenge = ntlmv2.generateServerChallenge();
  req.client.serverChallenge = serverChallenge;
  const challengeMessage = ntlmv2.serializeChallengeMessage(hostname, targetInfo, ntlmChallengeNegotiationFlags, serverChallenge);

  req.client.session = req.server.createSession();

  res.status(StatusCode.MoreProcessingRequired);

  res.send({
    structureSize: 9,
    sessionFlags: 0,
    securityBufferOffset: 72,
    securityBufferLength: 178,
    buffer: challengeMessage
  });
};

const handleAuthenticationRequest = (req: Request, res: Response) => {
  const buffer = req.body.buffer as Buffer;
  const authenticationMessage = ntlmv2.parseAuthenticationMessage(buffer);

  let authenticated = false;
  const isRequestingAnonymous = (authenticationMessage.negotiateFlags & NegotiateFlag.Anonymous) > 0;

  if (isRequestingAnonymous) {
    authenticated = true;

    res.status(StatusCode.Success);
    sendEmptyBody(res, {
      sessionFlags: SessionFlag.Guest
    });
    return;
  } else {
    const user = req.server.getUser(authenticationMessage.domain, authenticationMessage.username);
    if (!user) {
      res.status(StatusCode.LogonFailure);
      sendEmptyBody(res);
      return;
    }

    if (req.client.useExtendedSessionSecurity) {
      if (ntlmv2.isExtendedSessionSecurityLmResponse(authenticationMessage.lmResponse)) {
        throw new Error(`not_yet_implemented`);
      } else {
        authenticated = ntlmv2.matchExtendedSessionSecurityPasswordV2(
          user.password,
          req.client.serverChallenge,
          authenticationMessage.lmResponse,
          authenticationMessage.ntResponse,
          authenticationMessage.domain,
          authenticationMessage.username
        );
      }
    } else {
      authenticated = ntlmv2.matchPassword(
        user.password,
        req.client.serverChallenge,
        authenticationMessage.lmResponse,
        authenticationMessage.ntResponse
      );
    }
  }

  if (authenticated) {
    res.status(StatusCode.Success);
  } else {
    res.status(StatusCode.LogonFailure);
  }

  sendEmptyBody(res);
};

const sendEmptyBody = (res: Response, overwrite: any = {}) => {
  res.send({
    structureSize: 9,
    sessionFlags: 0,
    securityBufferOffset: 72,
    securityBufferLength: 0,
    buffer: Buffer.allocUnsafe(0),
    ...overwrite
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
  } else if ((negotiationFlags & NegotiateFlag.OemEncoding) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.OemEncoding;
  }

  if ((negotiationFlags & NegotiateFlag.ExtendedSessionSecurity) > 0) {
    challengeNegotiateFlags |= NegotiateFlag.ExtendedSessionSecurity;
  } else if ((negotiationFlags & NegotiateFlag.LanManagerSessionKey) > 0) {
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