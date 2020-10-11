import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import StatusCode from "../../../protocols/smb2/StatusCode";

export default (req: Request, res: Response) => {
  // TODO: proper logoff
  res.status(StatusCode.Success);
  res.send();
};