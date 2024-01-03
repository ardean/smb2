import Response from "./Response";

export default abstract class Request {
  response?: Response;

  constructor(
    header: any = {},
    body: any = {}
  ) { }

  abstract serialize(): Buffer;
}