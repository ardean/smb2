import url from "url";
import Request from "../../Smb2Request";
import Response from "../../Smb2Response";
import * as util from "../../../protocols/util";
import StatusCode from "../../../protocols/smb2/StatusCode";
import TreeConnectShareType from "../../../protocols/smb2/TreeConnectShareType";
import TreeConnectShareFlag from "../../../protocols/smb2/TreeConnectShareFlag";
import FilePipePrinterAccess from "../../../protocols/smb2/FilePipePrinterAccess";
import TreeConnectShareCapability from "../../../protocols/smb2/TreeConnectShareCapability";

export default (req: Request, res: Response) => {
  const buffer = req.body.buffer as Buffer;
  const fullUrl = util.toUnixPath(buffer.toString("ucs2"));
  const parsedUrl = url.parse("smb:" + fullUrl);
  const pathname = parsedUrl.pathname;

  const treeId = util.generateUint(32);

  const cachingMode = TreeConnectShareFlag.ManualCaching;

  if (pathname === "/IPC$") {
    res.status(StatusCode.Success);
    res.set("treeId", treeId);
    res.send({
      shareType: TreeConnectShareType.Pipe,
      shareFlags: (
        cachingMode
      ),
      maximalAccess: (
        FilePipePrinterAccess.ReadData |
        FilePipePrinterAccess.ReadEa |
        FilePipePrinterAccess.Execute |
        FilePipePrinterAccess.ReadAttributes |
        FilePipePrinterAccess.Delete |
        FilePipePrinterAccess.ReadControl |
        FilePipePrinterAccess.WriteDiscretionaryAccessControl |
        FilePipePrinterAccess.WriteOwner |
        FilePipePrinterAccess.Synchronize
      )
    });
    return;
  }

  res.status(StatusCode.Success);
  res.set("treeId", treeId);
  res.send({
    shareType: TreeConnectShareType.Disk,
    shareFlags: (
      cachingMode |
      TreeConnectShareFlag.DistributedFileSystem |
      TreeConnectShareFlag.DistributedFileSystemRoot
    ),
    capabilities: (
      TreeConnectShareCapability.DistributedFileSystem
    ),
    maximalAccess: 0x001f01ff
  });
};