import moment from "moment-timezone";
import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import * as dtypUtil from "../../../protocols/dtyp/util";
import Smb2Dialect from "../../../protocols/smb2/Dialect";
import StatusCode from "../../../protocols/smb2/StatusCode";
import Capability from "../../../protocols/smb2/Capability";
import { headerSize } from "../../../protocols/smb2/Header";
import SecurityMode from "../../../protocols/smb2/SecurityMode";

const supportedDialects = [
  Smb2Dialect.Smb2xx,
  Smb2Dialect.Smb210,
  Smb2Dialect.Smb202
];

export default (req: Request, res: Response) => {
  const dialects = req.body.dialects as Smb2Dialect[];
  const targetDialect = supportedDialects.find(supportedDialect =>
    dialects.find(dialect => dialect === supportedDialect)
  );

  const securityBuffer = Buffer.alloc(0);

  res.status(StatusCode.Success);

  res.send({
    structureSize: 0x0041,
    securityMode: SecurityMode.SigningEnabled,
    dialectRevision: targetDialect,
    reserved: 0,
    serverGuid: req.server.guid,
    capabilities: Capability.DistributedFileSystem | Capability.Leasing | Capability.LargeMtu,
    maxTransactSize: 0x00100000,
    maxReadSize: 0x00100000,
    maxWriteSize: 0x00100000,
    systemTime: dtypUtil.serializeFiletime(moment().toDate()),
    serverStartTime: dtypUtil.serializeFiletime(req.server.startDate),
    securityBufferOffset: headerSize + 64,
    securityBufferLength: securityBuffer.length,
    reserved2: 0,
    buffer: securityBuffer
  });
};