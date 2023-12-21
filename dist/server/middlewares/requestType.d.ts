import Request from "../Smb2Request";
import Response from "../Smb2Response";
import Middleware from "../Middleware";
import PacketType from "../../protocol/smb2/PacketType";
declare const _default: (protocolId: string, packetType: PacketType, middleware: Middleware) => (req: Request, res: Response) => Promise<void>;
export default _default;
