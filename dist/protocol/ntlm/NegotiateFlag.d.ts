declare enum NegotiateFlag {
    UnicodeEncoding = 1,
    OemEncoding = 2,
    TargetNameSupplied = 4,
    Sign = 16,
    Seal = 32,
    Diagram = 64,
    LanManagerSessionKey = 128,
    NTLMSessionSecurity = 512,
    Anonymous = 2048,
    DomainNameSupplied = 4096,
    WorkstationNameSupplied = 8192,
    AlwaysSign = 32768,
    TargetTypeDomain = 65536,
    TargetTypeServer = 131072,
    ExtendedSessionSecurity = 524288,
    Identify = 1048576,
    RequestNonNtSessionKey = 4194304,
    TargetInfo = 8388608,
    Version = 33554432,
    Use128BitEncryption = 536870912,
    KeyExchange = 1073741824,
    Use56BitEncryption = -2147483648
}
export default NegotiateFlag;