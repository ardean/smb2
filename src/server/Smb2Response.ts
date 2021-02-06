import Request from "./Request";
import Value from "../protocols/Value";
import ProtocolSmb2Response from "../protocols/smb2/Response";

export default class Smb2Response extends ProtocolSmb2Response {
  sent: boolean = false;
  redirectedRequest: Request;

  public status(status: number) {
    this.header.status = status;

    return this;
  }

  public set(name: string, value: Value) {
    this.header[name] = value;
  }

  public send(data: any = {}) {
    this.body = {
      ...(this.body || {}),
      ...data
    };
    this.sent = true;
  }

  public redirect(req: Request) {
    this.redirectedRequest = req;
  }
}