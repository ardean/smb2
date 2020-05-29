enum PacketType {
  Negotiate = 0x0000,
  SessionSetup = 0x0001,
  LogOff = 0x0002,
  TreeConnect = 0x0003,
  TreeDisconnect = 0x0004,
  Create = 0x0005,
  Close = 0x0006,
  Flush = 0x0007,
  Read = 0x0008,
  Write = 0x0009,
  Lock = 0x000a,
  InputOutputControl = 0x000b,
  Cancel = 0x000c,
  Echo = 0x000d,
  QueryDirectory = 0x000e,
  ChangeNotify = 0x000f,
  QueryInfo = 0x0010,
  SetInfo = 0x0011,
  OplockBreak = 0x0012
};

export default PacketType;