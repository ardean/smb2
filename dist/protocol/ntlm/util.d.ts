/// <reference types="node" />
export declare const encodeNegotiationMessage: (hostname: string, domain: string) => Buffer;
export declare const decodeNegotiationMessage: (buffer: Buffer) => {
    negotiateFlags: number;
    domain: string;
    hostname: string;
};
export declare const encodeChallengeMessage: (negotiateFlags: number) => Buffer;
export declare const decodeChallengeMessage: (buffer: Buffer) => Buffer;
export declare const encodeAuthenticationMessage: (username: string, hostname: string, domain: string, nonce: Buffer, password: string) => Buffer;
export declare const generateServerChallenge: () => Buffer;
