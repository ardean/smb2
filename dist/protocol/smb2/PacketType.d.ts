declare enum PacketType {
    Negotiate = 0,
    SessionSetup = 1,
    LogOff = 2,
    TreeConnect = 3,
    TreeDisconnect = 4,
    Create = 5,
    Close = 6,
    Flush = 7,
    Read = 8,
    Write = 9,
    Lock = 10,
    InputOutputControl = 11,
    Cancel = 12,
    Echo = 13,
    QueryDirectory = 14,
    ChangeNotify = 15,
    QueryInfo = 16,
    SetInfo = 17,
    OplockBreak = 18
}
export default PacketType;
