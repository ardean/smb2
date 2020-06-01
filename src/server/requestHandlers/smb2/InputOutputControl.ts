import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import StatusCode from "../../../protocols/smb2/StatusCode";
import ControlCode from "../../../protocols/smb2/ControlCode";

export default (req: Request, res: Response) => {
  const controlCode = req.body.controlCode as number;

  if (controlCode === ControlCode.ValidateNegotiateInfo) {
    if (req.body.fileId !== "ffffffffffffffffffffffffffffffff") throw new Error(`invalid_validate_negotiate_info_request`);

    console.log(req.body.input);

    res.status(StatusCode.Success);
    res.send({
      controlCode,
      fileId: req.body.fileId
    });
    return;
  }

  throw new Error(`not_yet_implemented`);
};