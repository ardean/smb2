import Response from "./Response";

export default abstract class Request {
  response?: Response;

  constructor(
    public header: any = {},
    public body: any = {}
  ) { }

  abstract serialize(): Buffer;
}