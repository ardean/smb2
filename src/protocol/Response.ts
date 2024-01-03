import Request from "./Request";

export default abstract class Response {
  request?: Request;

  constructor(
    header: any = {},
    body: any = {}
  ) { }

  abstract serialize(): Buffer;
}