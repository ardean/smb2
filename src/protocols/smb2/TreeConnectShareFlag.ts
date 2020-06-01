enum TreeConnectShareFlag {
  ManualCaching = 0x00000000,
  AutoCaching = 0x00000010,
  VdoCaching = 0x00000020,
  NoCaching = 0x00000030,
  Dfs = 0x00000001,
  DfsRoot = 0x00000002,
  RestrictExclusiveOpens = 0x00000100,
  ForceSharedDelete = 0x00000200,
  AllowNamespaceCaching = 0x00000400,
  AccessBasedDirectoryEnum = 0x00000800,
  ForceLevel2Oplock = 0x00001000,
  EnableHashV1 = 0x00002000,
  EnableHashV2 = 0x00004000,
  EncryptData = 0x00008000
}

export default TreeConnectShareFlag;