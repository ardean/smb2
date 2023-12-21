/// <reference types="node" />
import Header from "./Header";
import ProtocolRequest from "../Request";
export default class Request extends ProtocolRequest {
    header: Header;
    typeName: string;
    data: any;
    constructor(header?: Header, body?: any);
    static parse(buffer: Buffer): Request;
    serialize(): Buffer;
}
