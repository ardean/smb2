import Request from "../Smb2Request";
import Response from "../Smb2Response";

export default (supportedProtocols: string[]) => (req: Request, res: Response) => {
  if (!supportedProtocols.includes(req.header.protocolId)) throw new Error(`protocol_not_supported: ${req.header.protocolId}`);
};
