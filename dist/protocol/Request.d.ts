/// <reference types="node" />
import Response from "./Response";
export default abstract class Request {
    header: any;
    body: any;
    response?: Response;
    constructor(header?: any, body?: any);
    abstract serialize(): Buffer;
}
