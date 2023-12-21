/// <reference types="node" />
import Header from "./Header";
import ProtocolResponse from "../Response";
export default class Response extends ProtocolResponse {
    header: Header;
    static parse(buffer: Buffer): Response;
    serialize(): Buffer;
}
