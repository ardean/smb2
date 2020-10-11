import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import StatusCode from "../../../protocols/smb2/StatusCode";
import Capability from "../../../protocols/smb2/Capability";
import ControlCode from "../../../protocols/smb2/ControlCode";
import SecurityMode from "../../../protocols/smb2/SecurityMode";
import * as structureUtil from "../../../protocols/structureUtil";

export default (req: Request, res: Response) => {
  const controlCode = req.body.controlCode as number;

  if (controlCode === ControlCode.ValidateNegotiateInfo) {
    if (req.body.fileId !== "f".repeat(32)) throw new Error(`invalid_validate_negotiate_info_request`);

    const input = structureUtil.parseStructure(req.body.input, {
      capabilities: {
        type: Number,
        size: 4
      },
      fileId: {
        type: String,
        encoding: "hex",
        size: 16
      },
      securityMode: {
        type: Number,
        size: 2,
        defaultValue: 1
      },
      dialectCount: {
        type: Number,
        signedness: "Unsigned",
        size: 2
      },
      dialects: {
        type: Number,
        countFieldName: "dialectCount",
        size: 2
      }
    });

    const output = structureUtil.serializeStructure({
      capabilities: {
        type: Number,
        size: 4
      },
      fileId: {
        type: String,
        encoding: "hex",
        size: 16
      },
      securityMode: {
        type: Number,
        size: 2,
        defaultValue: 1
      },
      dialect: {
        type: Number,
        signedness: "Unsigned",
        size: 2
      }
    }, {
      capabilities: Capability.DistributedFileSystem,
      fileId: req.server.guid,
      securityMode: SecurityMode.SigningEnabled,
      dialect: req.client.targetDialect
    });

    res.status(StatusCode.Success);
    res.send({
      controlCode,
      fileId: req.body.fileId,
      outputCount: output.length,
      output
    });
    return;
  }

  throw new Error(`not_yet_implemented`);
};