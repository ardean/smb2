import Request from "./Request";
import Value from "../protocol/Value";
import ProtocolSmbResponse from "../protocol/smb/Response";

export default class SmbResponse extends ProtocolSmbResponse {
  sent: boolean = false;
  redirectedReq: Request;

  public status(status: number) {
    this.header.status = status;

    return this;
  }

  public set(name: string, value: Value) {
    this.header[name] = value;
  }

  public send(data: any) {
    this.body = data;
    this.sent = true;
  }

  public redirect(req: Request) {
    this.redirectedReq = req;
  }
}