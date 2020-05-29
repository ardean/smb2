import moment from "moment-timezone";
import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import StatusCode from "../../../protocol/smb2/StatusCode";
import Capability from "../../../protocol/smb2/Capability";
import Smb2Dialect from "../../../protocol/smb2/Dialect";
import { headerSize } from "../../../protocol/smb2/Header";
import * as structureUtil from "../../../protocol/structureUtil";

const supportedDialects = [
  Smb2Dialect.Smb210,
  Smb2Dialect.Smb202,
  Smb2Dialect.Smb2xx
];

export default (req: Request, res: Response) => {
  const dialects = req.body.dialects as Smb2Dialect[];
  const targetDialect = supportedDialects.find(supportedDialect =>
    dialects.find(dialect => dialect === supportedDialect)
  );
  const targetDialectName = structureUtil.parseEnumValue(Smb2Dialect, targetDialect);

  const securityBuffer = Buffer.alloc(0);

  res.status(StatusCode.Success);
  res.set("clientId", req.header.clientId);

  res.send({
    structureSize: 0x0041,
    securityMode: 0,
    dialectRevision: targetDialect,
    reserved: 0, // NegotiateContextCount
    serverGuid: req.server.guid,
    capabilities: Capability.DistributedFileSystem | Capability.MultiCreditSupport,
    maxTransactSize: 0x00100000,
    maxReadSize: 0x00100000,
    maxWriteSize: 0x00100000,
    systemTime: structureUtil.serializeDate(moment().toDate()),
    serverStartTime: structureUtil.serializeDate(req.server.startDate),
    securityBufferOffset: headerSize + 64,
    securityBufferLength: securityBuffer.length,
    reserved2: 0, // NegotiateContextOffset
    buffer: securityBuffer
  });
};