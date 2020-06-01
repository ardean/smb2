import Request from "./Request";

export default abstract class Response {
  request?: Request;

  constructor(
    public header: any = {},
    public body: any = {}
  ) { }

  abstract serialize(): Buffer;
}