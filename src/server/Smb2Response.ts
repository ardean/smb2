import Request from "./Request";
import Value from "../protocol/Value";
import ProtocolSmb2Response from "../protocol/smb2/Response";

export default class Smb2Response extends ProtocolSmb2Response {
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