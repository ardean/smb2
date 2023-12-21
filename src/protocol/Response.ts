import Request from "./Request";

export default abstract class Response<T extends {}> {
  request?: Request<T>;

  constructor(
    public header: T = {} as T,
    public body: any = {}
  ) { }

  abstract serialize(): Buffer;
}