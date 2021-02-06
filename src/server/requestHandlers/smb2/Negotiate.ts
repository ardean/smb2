import dtyp from "dtyp";
import moment from "moment-timezone";
import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import Smb2Dialect from "../../../protocols/smb2/Dialect";
import StatusCode from "../../../protocols/smb2/StatusCode";
import Capability from "../../../protocols/smb2/Capability";
import { headerSize } from "../../../protocols/smb2/Header";
import SecurityMode from "../../../protocols/smb2/SecurityMode";

export default (req: Request, res: Response) => {
  const dialects = req.body.dialects as Smb2Dialect[];
  const targetDialect = req.server.supportedSmb2Dialects.find(
    supportedDialect => dialects.find(
      dialect => dialect === supportedDialect
    )
  );

  req.client.setTargetDialect(targetDialect);

  let capabilities = Capability.DistributedFileSystem;
  if (
    targetDialect !== Smb2Dialect.Smb202
  ) {
    capabilities |= Capability.Leasing;
    capabilities |= Capability.LargeMtu;
  }

  const securityBuffer = Buffer.alloc(0);

  res.status(StatusCode.Success);

  res.send({
    structureSize: 0x0041,
    securityMode: SecurityMode.SigningEnabled,
    dialectRevision: targetDialect,
    reserved: 0,
    serverGuid: req.server.guid,
    capabilities,
    maxTransactionSize: 0x00800000,
    maxReadSize: 0x00800000,
    maxWriteSize: 0x00800000,
    systemTime: dtyp.serializeFiletime(moment().toDate()),
    serverStartTime: dtyp.serializeFiletime(req.server.startDate),
    securityBufferOffset: headerSize + 64,
    securityBufferLength: securityBuffer.length,
    reserved2: 0,
    buffer: securityBuffer
  });
};