import Request from "./Request";
import Value from "../protocol/Value";
import ProtocolSmb2Response from "../protocol/smb2/Response";
export default class Smb2Response extends ProtocolSmb2Response {
    sent: boolean;
    redirectedReq: Request;
    status(status: number): this;
    set(name: string, value: Value): void;
    send(data: any): void;
    redirect(req: Request): void;
}
