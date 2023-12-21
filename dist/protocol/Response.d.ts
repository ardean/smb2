/// <reference types="node" />
import Request from "./Request";
export default abstract class Response {
    header: any;
    body: any;
    request?: Request;
    constructor(header?: any, body?: any);
    abstract serialize(): Buffer;
}
