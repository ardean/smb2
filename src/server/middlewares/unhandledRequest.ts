import Request from "../Request";
import Response from "../Response";
import * as util from "../../protocols/util";

export default (req: Request, res: Response) => {
  throw new Error(`unhandled request: ${util.stringify(req.header)} ${util.stringify(req.body)}`);
};