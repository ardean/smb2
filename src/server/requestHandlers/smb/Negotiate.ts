import Request from "../../SmbRequest";
import Response from "../../SmbResponse";
import Smb2Request from "../../Smb2Request";
import Dialect from "../../../protocols/smb2/Dialect";
import * as ProtocolIds from "../../../protocols/ProtocolIds";
import Smb2PacketType from "../../../protocols/smb2/PacketType";

const supportedDialects = [
  "NT LM 0.12",
  "SMB 2.002",
  "SMB 2.???"
];

export default (req: Request, res: Response) => {
  const dialects = req.body.dialects as string[];

  const matchingDialects = dialects.filter(dialect => supportedDialects.indexOf(dialect) !== -1);

  if (matchingDialects.length === 0) throw new Error(`no_dialect_supported`);

  if (matchingDialects.find(x => x.startsWith("SMB 2."))) {
    const newReq = new Smb2Request({
      protocolId: ProtocolIds.Smb2,
      type: Smb2PacketType.Negotiate
    }, {
      dialects: [
        Dialect.Smb210,
        Dialect.Smb202,
        Dialect.Smb2xx
      ]
    });
    res.redirect(newReq);
  } else {
    throw new Error("smb_not_implemented_yet");
  }
};