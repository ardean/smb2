import Request from "../Smb2Request";
import Response from "../Smb2Response";
import Middleware from "../Middleware";
import PacketType from "../../protocols/smb2/PacketType";

export default (protocolId: string, packetType: PacketType, middleware: Middleware) => async (req: Request, res: Response) => {
  if (
    req.header.protocolId === protocolId &&
    req.header.type === packetType
  ) return await middleware(req, res);
};
