import crypto from "crypto";
import Version from "./Version";
import MessageType from "./MessageType";
import NegotiateFlag from "./NegotiateFlag";
import * as attributeValueUtil from "./attributeValue/util";
import AttributeValuePair from "./attributeValue/AttributeValuePair";

export const serializeNegotiationMessage = (hostname: string, domain: string) => {
  hostname = hostname.toUpperCase();
  domain = domain.toUpperCase();

  const hostnameLength = Buffer.byteLength(hostname, "ascii");
  const domainLength = Buffer.byteLength(domain, "ascii");

  let offset = 0;
  const buffer = Buffer.alloc(32 + hostnameLength + domainLength);

  buffer.write("NTLMSSP", offset, 7, "ascii");
  offset += 7;
  buffer.writeUInt8(0, offset);
  offset += 1;

  buffer.writeUInt32LE(MessageType.Negotiation, offset);
  offset += 4;

  const negotiateFlags = NegotiateFlag.UnicodeEncoding |
    NegotiateFlag.NTLMSessionSecurity |
    NegotiateFlag.AlwaysSign;
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

  buffer.write(hostname, 0x20, hostnameLength, "ascii");
  buffer.write(domain, domainOffset, domainLength, "ascii");

  return buffer;
};

export const parseNegotiationMessage = (buffer: Buffer) => {
  let offset = 0;

  const protocol = buffer.slice(0, 7).toString("ascii");
  if (
    protocol !== "NTLMSSP" ||
    buffer.readInt8(7) !== 0x00
  ) throw new Error("ntlmssp_header_not_found");
  offset += 8;

  const type = parseMessageType(buffer);
  if (type !== MessageType.Negotiation) throw new Error("ntlm_message_type_is_not_negotiation");
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

  const domain = buffer.slice(domainOffset, domainOffset + domainLength).toString("ascii");
  const hostname = buffer.slice(hostnameOffset, hostnameOffset + hostnameLength).toString("ascii");

  return {
    negotiateFlags,
    domain,
    hostname
  };
};

export const serializeChallengeMessage = (
  targetName: string,
  targetInfo: AttributeValuePair[],
  negotiateFlags: number,
  serverChallenge: Buffer
) => {
  let targetNameBuffer: Buffer;
  if ((negotiateFlags & NegotiateFlag.TargetNameSupplied) === 0) {
    targetNameBuffer = Buffer.from([]);
  } else {
    targetNameBuffer = Buffer.from(targetName, "ucs2");
  }

  let targetInfoBuffer: Buffer;
  if ((negotiateFlags & NegotiateFlag.TargetInfo) === 0) {
    targetInfoBuffer = Buffer.from([]);
  } else {
    targetInfoBuffer = attributeValueUtil.serializePairs(targetInfo);
  }

  let bufferLength = 48;
  const shouldSupplyVersion = (negotiateFlags & NegotiateFlag.Version) > 0;
  if (shouldSupplyVersion) {
    bufferLength += 8;
  }

  let offset = 0;
  const buffer = Buffer.alloc(
    bufferLength +
    targetNameBuffer.length +
    targetInfoBuffer.length
  );

  buffer.write("NTLMSSP", offset, 7, "ascii");
  offset += 7;
  buffer.writeUInt8(0, offset);
  offset += 1;

  buffer.writeUInt32LE(MessageType.Challenge, offset);
  offset += 4;

  const targetNameBufferPointerOffset = offset;
  offset += 8;

  buffer.writeUInt32LE(negotiateFlags, offset);
  offset += 4;

  serverChallenge.copy(buffer, offset);
  offset += 8;

  buffer.fill(0, offset, offset + 8);
  offset += 8;

  const targetInfoBufferPointerOffset = offset;
  offset += 8;

  if (shouldSupplyVersion) {
    Version.Server2003.serialize().copy(buffer, offset);
    offset += 8;
  }

  serializeBufferPointer(targetNameBuffer.length, offset).copy(buffer, targetNameBufferPointerOffset);
  targetNameBuffer.copy(buffer, offset);
  offset += targetNameBuffer.length;

  serializeBufferPointer(targetInfoBuffer.length, offset).copy(buffer, targetInfoBufferPointerOffset);
  targetInfoBuffer.copy(buffer, offset);
  offset += targetInfoBuffer.length;

  return buffer;
};

export const parseChallengeMessage = (buffer: Buffer) => {
  let offset = 0;

  const protocol = buffer.slice(0, 7).toString("ascii");
  if (
    protocol !== "NTLMSSP" ||
    buffer.readInt8(7) !== 0x00
  ) throw new Error("ntlmssp_header_not_found");
  offset += 8;

  const type = parseMessageType(buffer);
  if (type !== MessageType.Challenge) throw new Error("ntlm_message_type_is_not_challenge");
  offset += 4;

  const targetNameBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const targetName = buffer.slice(
    targetNameBufferPointer.offset,
    targetNameBufferPointer.offset + targetNameBufferPointer.length
  ).toString("ucs2");
  offset += 8;

  const negotiateFlags = buffer.readUInt32LE(offset);
  offset += 4;

  const serverChallenge = buffer.slice(offset, offset + 8);
  offset += 8;

  offset += 8; // Reserved

  const targetInfoBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const targetInfo = attributeValueUtil.parsePairs(
    buffer.slice(
      targetInfoBufferPointer.offset,
      targetInfoBufferPointer.offset + targetInfoBufferPointer.length
    )
  );
  offset += 8;

  let version: Version;
  if ((negotiateFlags & NegotiateFlag.Version) > 0) {
    version = Version.parse(buffer.slice(offset, offset + 8));
  }

  return {
    targetName,
    negotiateFlags,
    serverChallenge,
    targetInfo,
    version
  };
}

export const serializeAuthenticationMessage = (username: string, hostname: string, domain: string, serverChallenge: Buffer, password: string) => {
  hostname = hostname.toUpperCase();
  domain = domain.toUpperCase();

  const lmResponse = createLmResponse(password, serverChallenge);
  const ntResponse = createNtResponse(password, serverChallenge);

  const usernameLength = Buffer.byteLength(username, "ucs2");
  const hostnameLength = Buffer.byteLength(hostname, "ucs2");
  const domainLength = Buffer.byteLength(domain, "ucs2");

  const lmResponseLength = 24;
  const ntResponseLength = 24;

  const domainOffset = 64;
  const usernameOffset = domainOffset + domainLength;
  const hostnameOffset = usernameOffset + usernameLength;
  const lmResponseOffset = hostnameOffset + hostnameLength;
  const ntResponseOffset = lmResponseOffset + lmResponseLength;

  let offset = 0;
  const messageLength = 64 + domainLength + usernameLength + hostnameLength + lmResponseLength + ntResponseLength;
  const buffer = Buffer.alloc(messageLength);

  buffer.write("NTLMSSP", offset, 7, "ascii");
  offset += 7;
  buffer.writeUInt8(0, offset);
  offset += 1;

  buffer.writeUInt32LE(MessageType.Authentication, offset);
  offset += 4;

  serializeBufferPointer(lmResponseLength, lmResponseOffset).copy(buffer, offset);
  offset += 8;

  serializeBufferPointer(ntResponseLength, ntResponseOffset).copy(buffer, offset);
  offset += 8;

  serializeBufferPointer(domainLength, domainOffset).copy(buffer, offset);
  offset += 8;

  serializeBufferPointer(usernameLength, usernameOffset).copy(buffer, offset);
  offset += 8;

  serializeBufferPointer(hostnameLength, hostnameOffset).copy(buffer, offset);
  offset += 8;

  buffer.writeUInt32LE(messageLength, offset);
  offset += 4;

  const negotiateFlags = NegotiateFlag.UnicodeEncoding |
    NegotiateFlag.NTLMSessionSecurity |
    NegotiateFlag.AlwaysSign;
  buffer.writeUInt32LE(negotiateFlags, offset);
  offset += 4;

  lmResponse.copy(buffer, lmResponseOffset, 0, lmResponseLength);
  ntResponse.copy(buffer, ntResponseOffset, 0, ntResponseLength);
  buffer.write(domain, domainOffset, domainLength, "ucs2");
  buffer.write(username, usernameOffset, usernameLength, "ucs2");
  buffer.write(hostname, hostnameOffset, hostnameLength, "ucs2");

  return buffer;
};

export const parseAuthenticationMessage = (buffer: Buffer) => {
  let offset = 0;

  const protocol = buffer.slice(0, 7).toString("ascii");
  if (
    protocol !== "NTLMSSP" ||
    buffer.readInt8(7) !== 0x00
  ) throw new Error("ntlmssp_header_not_found");
  offset += 8;

  const type = parseMessageType(buffer);
  if (type !== MessageType.Authentication) throw new Error("ntlm_message_type_is_not_authentication");
  offset += 4;

  const lmResponseBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const lmResponse = buffer.slice(
    lmResponseBufferPointer.offset,
    lmResponseBufferPointer.offset + lmResponseBufferPointer.length
  );
  offset += 8;

  const ntResponseBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const ntResponse = buffer.slice(
    ntResponseBufferPointer.offset,
    ntResponseBufferPointer.offset + ntResponseBufferPointer.length
  );
  offset += 8;

  const domainBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const domain = buffer.slice(
    domainBufferPointer.offset,
    domainBufferPointer.offset + domainBufferPointer.length
  ).toString("ucs2");
  offset += 8;

  const usernameBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const username = buffer.slice(
    usernameBufferPointer.offset,
    usernameBufferPointer.offset + usernameBufferPointer.length
  ).toString("ucs2");
  offset += 8;

  const hostnameBufferPointer = parseBufferPointer(buffer.slice(offset, offset + 8));
  const hostname = buffer.slice(
    hostnameBufferPointer.offset,
    hostnameBufferPointer.offset + hostnameBufferPointer.length
  ).toString("ucs2");
  offset += 8;

  const messageLength = buffer.readUInt32LE(offset);
  offset += 4;

  const negotiateFlags = buffer.readUInt32LE(offset);
  offset += 4;

  let version: Version;
  if ((negotiateFlags & NegotiateFlag.Version) > 0) {
    version = Version.parse(buffer.slice(offset, offset + 8));
  }

  return {
    lmResponse,
    ntResponse,
    domain,
    username,
    hostname,
    messageLength,
    negotiateFlags,
    version
  };
};

export const generateServerChallenge = () => {
  return crypto.randomBytes(8);
}

export const parseMessageType = (buffer: Buffer) => {
  return buffer.readUInt32LE(8);
};

export const matchPasswordV2 = (password: string, serverChallenge: Buffer, lmResponse: Buffer, ntResponse: Buffer, domain: string, username: string) => {
  if (lmResponse.length === 24) {
    const clientChallenge = lmResponse.slice(16, 24);
    const lmV2Response = createLmV2Response(password, serverChallenge, clientChallenge, domain, username);
    if (lmV2Response.equals(lmResponse)) return true;
  }

  if (isNtV2Response(ntResponse)) {
    const clientProof = ntResponse.slice(0, 16);
    const clientChallenge = ntResponse.slice(16);

    const validClientProof = createNtV2Proof(password, serverChallenge, clientChallenge, domain, username);
    return clientProof.equals(validClientProof);
  }

  return false;
};

export const matchPassword = (password: string, serverChallenge: Buffer, lmResponse: Buffer, ntResponse: Buffer) => {
  const validLmResponse = createLmResponse(password, serverChallenge);
  if (validLmResponse.equals(lmResponse)) return true;

  const validNtResponse = createNtResponse(password, serverChallenge);
  return validNtResponse.equals(ntResponse);
};

const fixOddParity = (buffer: Buffer) => {
  for (let index = 0; index < buffer.length; index++) {
    let parity = 1;
    for (let index2 = 1; index2 < 8; index2++) {
      parity = (parity + ((buffer[index] >> index2) & 1)) % 2;
    }
    buffer[index] |= parity & 1;
  }
  return buffer;
};

const createDESKey = (key56: Buffer) => {
  const key64 = Buffer.alloc(8);

  key64[0] = key56[0] & 0xFE;
  key64[1] = ((key56[0] << 7) & 0xFF) | (key56[1] >> 1);
  key64[2] = ((key56[1] << 6) & 0xFF) | (key56[2] >> 2);
  key64[3] = ((key56[2] << 5) & 0xFF) | (key56[3] >> 3);
  key64[4] = ((key56[3] << 4) & 0xFF) | (key56[4] >> 4);
  key64[5] = ((key56[4] << 3) & 0xFF) | (key56[5] >> 5);
  key64[6] = ((key56[5] << 2) & 0xFF) | (key56[6] >> 6);
  key64[7] = (key56[6] << 1) & 0xFF;

  return key64;
};

const createLmHash = (text: string) => {
  const upperCaseText = text.substring(0, 14).toUpperCase();
  const upperCaseTextLength = Buffer.byteLength(upperCaseText, "ascii");

  const paddingBuffer = Buffer.alloc(14);
  paddingBuffer.write(upperCaseText, 0, upperCaseTextLength, "ascii");
  paddingBuffer.fill(0, upperCaseTextLength);

  const halves = [
    fixOddParity(createDESKey(paddingBuffer.slice(0, 7))),
    fixOddParity(createDESKey(paddingBuffer.slice(7, 14)))
  ];

  const buffer = Buffer.alloc(16);
  let offset = 0;
  for (const halve of halves) {
    const cipher = crypto.createCipheriv("DES-ECB", halve, "");
    const string = cipher.update("KGS!@#$%", "binary", "binary");
    buffer.write(string, offset, offset + 8, "binary");
    offset += 8;
  }

  return buffer;
};

const createNtHash = (value: string) => {
  const buffer = Buffer.from(value, "ucs2");
  return createMd4HashBuffer(buffer);
};

const createResponse = (hash: Buffer, serverChallenge: Buffer) => {
  const buffer = Buffer.alloc(24);
  for (let index = 0; index < 3; index++) {
    const keyBuffer = fixOddParity(createDESKey(hash.slice(index * 7, index * 7 + 7)));
    const cipher = crypto.createCipheriv("DES-ECB", keyBuffer, "");
    const string = cipher.update(serverChallenge.toString("binary"), "binary", "binary");
    buffer.write(string, index * 8, index * 8 + 8, "binary");
  }
  return buffer;
};

const serializeBufferPointer = (pointerLength: number, pointerOffset: number) => {
  let offset = 0;

  const buffer = Buffer.allocUnsafe(8);
  buffer.writeUInt16LE(pointerLength, offset);
  offset += 2;

  buffer.writeUInt16LE(pointerLength, offset);
  offset += 2;

  buffer.writeUInt32LE(pointerOffset, offset);
  offset += 4;

  return buffer;
};

const parseBufferPointer = (buffer: Buffer) => {
  let offset = 0;

  const pointerLength = buffer.readUInt16LE(offset);
  offset += 2;

  offset += 2;

  const pointerOffset = buffer.readUInt32LE(offset);
  offset += 4;

  return {
    length: pointerLength,
    offset: pointerOffset
  };
};

const createLmResponse = (password: string, serverChallenge: Buffer) => {
  const lmHash = Buffer.alloc(21);
  createLmHash(password).copy(lmHash);
  lmHash.fill(0x00, 16);

  return createResponse(lmHash, serverChallenge);
};

const createV2Hash = (domain: string, username: string, password: string) => {
  const passwordBuffer = Buffer.from(password, "ucs2");
  const md4Buffer = createMd4HashBuffer(passwordBuffer);

  const phrase = username.toUpperCase() + domain;
  const phraseBuffer = Buffer.from(phrase, "ucs2");

  return createMd5HmacBuffer(phraseBuffer, md4Buffer);
};

const createLmV2Response = (password: string, serverChallenge: Buffer, clientChallenge: Buffer, domain: string, username: string) => {
  const v2Hash = createV2Hash(domain, username, password);

  const challengeBuffer = Buffer.concat([serverChallenge, clientChallenge]);
  const md5Buffer = createMd5HmacBuffer(challengeBuffer, v2Hash);

  return Buffer.concat([md5Buffer, clientChallenge]);
};

const createNtV2Proof = (password: string, serverChallenge: Buffer, clientChallenge: Buffer, domain: string, username: string) => {
  const v2Hash = createV2Hash(domain, username, password);

  const challengeBuffer = Buffer.concat([serverChallenge, clientChallenge]);
  return createMd5HmacBuffer(challengeBuffer, v2Hash);
};

const createNtResponse = (password: string, serverChallenge: Buffer) => {
  const ntHash = Buffer.alloc(21);
  createNtHash(password).copy(ntHash);
  ntHash.fill(0x00, 16);

  return createResponse(ntHash, serverChallenge);
};

export const isExtendedSessionSecurityLmResponse = (lmResponse: Buffer) => {
  if (lmResponse.length === 24) {
    if (lmResponse.slice(0, 8).equals(Buffer.alloc(8, 0))) return false;
    return lmResponse.slice(8, 24).equals(Buffer.alloc(16, 0));
  }
  return false;
}

const ntV2ResponseMinLength = 32;
const ntV2ResponseStructureVersion = 0x01;

const isNtV2Response = (ntResponse: Buffer) => (
  ntResponse.length >= 16 + ntV2ResponseMinLength &&
  ntResponse[16] === ntV2ResponseStructureVersion &&
  ntResponse[17] === ntV2ResponseStructureVersion
);

const createMd4HashBuffer = (buffer: Buffer) => {
  const md4Hash = crypto.createHash("md4");
  md4Hash.update(buffer);
  return Buffer.from(md4Hash.digest("hex"), "hex");
};

const createMd5HmacBuffer = (buffer: Buffer, key: Buffer) => {
  const md5Hmac = crypto.createHmac("md5", key);
  md5Hmac.update(buffer);
  return Buffer.from(md5Hmac.digest("hex"), "hex");
};