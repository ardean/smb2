import crypto from 'crypto';
import desjs from 'des.js';
import jsmd4 from 'js-md4';
import NegotiateFlag from './NegotiateFlag';

export const encodeNegotiationMessage = (hostname: string, domain: string) => {
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

  const negotiateFlags =
    NegotiateFlag.UnicodeEncoding |
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

  buffer.write(hostname, 0x20, hostnameLength, 'ascii');
  buffer.write(domain, domainOffset, domainLength, 'ascii');

  return buffer;
};

export const decodeNegotiationMessage = (buffer: Buffer) => {
  let offset = 0;

  const protocol = buffer.slice(0, 7).toString('ascii');
  if (protocol !== 'NTLMSSP' || buffer.readInt8(7) !== 0x00)
    throw new Error('ntlmssp_header_not_found');
  offset += 8;

  const type = buffer.readUInt32LE(offset);
  if (type !== 0x01) throw new Error('ntlmssp_type_is_not_one');
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

export const encodeChallengeMessage = (negotiateFlags: number) => {
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

  generateServerChallenge().copy(buffer, offset);
  offset += 8;

  buffer.fill(0, offset, offset + 8);
  offset += 8;

  return buffer;
};

export const decodeChallengeMessage = (buffer: Buffer) => {
  let offset = 0;

  const protocol = buffer.slice(0, 7).toString('ascii');
  if (protocol !== 'NTLMSSP' || buffer.readInt8(7) !== 0x00)
    throw new Error('ntlmssp_header_not_found');
  offset += 8;

  const type = buffer.readUInt32LE(offset);
  if (type !== 0x02) throw new Error('ntlmssp_type_is_not_two');
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

export const encodeAuthenticationMessage = (
  username: string,
  hostname: string,
  domain: string,
  nonce: Buffer,
  password: string
) => {
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
  const messageLength =
    64 +
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

  const negotiateFlags =
    NegotiateFlag.UnicodeEncoding |
    NegotiateFlag.NTLMSessionSecurity |
    NegotiateFlag.AlwaysSign;
  buffer.writeUInt32LE(negotiateFlags, offset);
  offset += 4;

  buffer.write(domain, domainOffset, domainLength, 'ucs2');
  buffer.write(username, usernameOffset, usernameLength, 'ucs2');
  buffer.write(hostname, hostnameOffset, hostnameLength, 'ucs2');
  lmResponse.copy(buffer, lmResponseOffset, 0, lmResponseLength);
  ntResponse.copy(buffer, ntResponseOffset, 0, ntResponseLength);

  return buffer;
};

export const generateServerChallenge = () => {
  return crypto.randomBytes(8);
};

const bytes2binaryArray = (buf: Buffer): number[] => {
  const hex2binary = {
    0: [0, 0, 0, 0],
    1: [0, 0, 0, 1],
    2: [0, 0, 1, 0],
    3: [0, 0, 1, 1],
    4: [0, 1, 0, 0],
    5: [0, 1, 0, 1],
    6: [0, 1, 1, 0],
    7: [0, 1, 1, 1],
    8: [1, 0, 0, 0],
    9: [1, 0, 0, 1],
    A: [1, 0, 1, 0],
    B: [1, 0, 1, 1],
    C: [1, 1, 0, 0],
    D: [1, 1, 0, 1],
    E: [1, 1, 1, 0],
    F: [1, 1, 1, 1]
  };

  const hexString = buf.toString('hex').toUpperCase();
  let array: number[] = [];
  for (let i = 0; i < hexString.length; i++) {
    const hexchar = hexString.charAt(i);
    array = array.concat(hex2binary[hexchar]);
  }
  return array;
};

const binaryArray2bytes = (array: number[]): Buffer => {
  const binary2hex = {
    '0000': 0,
    '0001': 1,
    '0010': 2,
    '0011': 3,
    '0100': 4,
    '0101': 5,
    '0110': 6,
    '0111': 7,
    '1000': 8,
    '1001': 9,
    '1010': 'A',
    '1011': 'B',
    '1100': 'C',
    '1101': 'D',
    '1110': 'E',
    '1111': 'F'
  };

  const bufArray: Buffer[] = [];

  for (let i = 0; i < array.length; i += 8) {
    if (i + 7 > array.length) break;

    const binString1 =
      '' + array[i] + '' + array[i + 1] + '' + array[i + 2] + '' + array[i + 3];
    const binString2 =
      '' +
      array[i + 4] +
      '' +
      array[i + 5] +
      '' +
      array[i + 6] +
      '' +
      array[i + 7];
    const hexchar1 = binary2hex[binString1];
    const hexchar2 = binary2hex[binString2];

    const buf = Buffer.from(hexchar1 + '' + hexchar2, 'hex');
    bufArray.push(buf);
  }

  return Buffer.concat(bufArray);
};

const insertZerosEvery7Bits = (buf: Buffer): Buffer => {
  const binaryArray = bytes2binaryArray(buf);
  const newBinaryArray = [];
  for (let i = 0; i < binaryArray.length; i++) {
    newBinaryArray.push(binaryArray[i]);

    if ((i + 1) % 7 === 0) {
      newBinaryArray.push(0);
    }
  }
  return binaryArray2bytes(newBinaryArray);
};

const createLmHash = (password: string): Buffer => {
  // fix the password length to 14 bytes
  password = password.toUpperCase();
  const passwordBytes = Buffer.from(password, 'ascii');

  const passwordBytesPadded = Buffer.alloc(14);
  passwordBytesPadded.fill('\0');
  let sourceEnd = 14;
  if (passwordBytes.length < 14) sourceEnd = passwordBytes.length;
  passwordBytes.copy(passwordBytesPadded, 0, 0, sourceEnd);

  // split into 2 parts of 7 bytes:
  const firstPart = passwordBytesPadded.slice(0, 7);
  const secondPart = passwordBytesPadded.slice(7);

  function encrypt(buf) {
    const key = insertZerosEvery7Bits(buf);
    const des = desjs.DES.create({ type: 'encrypt', key: key });
    const magicKey = Buffer.from('KGS!@#$%', 'ascii'); // page 57 in [MS-NLMP]
    const encrypted = des.update(magicKey);
    return Buffer.from(encrypted);
  }

  const firstPartEncrypted = encrypt(firstPart);
  const secondPartEncrypted = encrypt(secondPart);

  return Buffer.concat([firstPartEncrypted, secondPartEncrypted]);
};

const createNtHash = (password: string): Buffer => {
  const buf = Buffer.from(password, 'utf16le');
  const md4 = jsmd4.create();
  md4.update(buf);
  return Buffer.from(md4.digest());
};

const createResponse = (hash: Buffer, nonce: Buffer) => {
  // padding with zeros to make the hash 21 bytes long
  const passHashPadded = Buffer.alloc(21);
  passHashPadded.fill('\0');
  hash.copy(passHashPadded, 0, 0, hash.length);

  const resArray = [];

  const des1 = desjs.DES.create({
    type: 'encrypt',
    key: insertZerosEvery7Bits(passHashPadded.slice(0, 7))
  });
  resArray.push(Buffer.from(des1.update(nonce.slice(0, 8))));

  const des2 = desjs.DES.create({
    type: 'encrypt',
    key: insertZerosEvery7Bits(passHashPadded.slice(7, 14))
  });
  resArray.push(Buffer.from(des2.update(nonce.slice(0, 8))));

  const des3 = desjs.DES.create({
    type: 'encrypt',
    key: insertZerosEvery7Bits(passHashPadded.slice(14, 21))
  });
  resArray.push(Buffer.from(des3.update(nonce.slice(0, 8))));

  return Buffer.concat(resArray);
};
