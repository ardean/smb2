enum ControlCode {
  DfsGetReferrals = 0x00060194,
  PipeSeek = 0x0011400C,
  PipeWait = 0x00110018,
  PipeTransceive = 0x0011C017,
  SrvCopyChunk = 0x001440F2,
  SrvEnumerateSnapshots = 0x00144064,
  SrvRequestResumeKey = 0x00140078,
  SrvReadHash = 0x001441bb,
  SrvCopyChunkWrite = 0x001480F2,
  LmrRequestResiliency = 0x001401D4,
  QueryNetworkInterfaceInfo = 0x001401FC,
  SetReparsePoint = 0x000900A4,
  DfsGetReferralsEx = 0x000601B0,
  FileLevelTrim = 0x00098208,
  ValidateNegotiateInfo = 0x00140204
}

export default ControlCode;