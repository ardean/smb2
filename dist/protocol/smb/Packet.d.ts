/// <reference types="node" />
import Header from "./Header";
export default class Packet {
    static parse(buffer: Buffer): {
        header: Header;
        body: any;
    };
    static parseHeader(buffer: Buffer): {
        header: Header;
        bodyBuffer: Buffer;
    };
    static parseList(buffer: Buffer): any[];
}
