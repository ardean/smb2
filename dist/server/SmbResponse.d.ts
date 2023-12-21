import Request from "./Request";
import Value from "../protocol/Value";
import ProtocolSmbResponse from "../protocol/smb/Response";
export default class SmbResponse extends ProtocolSmbResponse {
    sent: boolean;
    redirectedReq: Request;
    status(status: number): this;
    set(name: string, value: Value): void;
    send(data: any): void;
    redirect(req: Request): void;
}
