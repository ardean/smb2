/// <reference types="node" />
import Header from "./Header";
import ProtocolResponse from "../Response";
export default class Response extends ProtocolResponse {
    header: Header;
    typeName: string;
    data: any;
    constructor(header?: Header, body?: any);
    static parse(buffer: Buffer): Response;
    serialize(): Buffer;
}
