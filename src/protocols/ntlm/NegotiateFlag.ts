enum NegotiateFlag {
  UnicodeEncoding = 1 << 0,
  OemEncoding = 1 << 1,
  TargetNameSupplied = 1 << 2,

  Sign = 1 << 4,
  Seal = 1 << 5,
  Diagram = 1 << 6,

  LanManagerSessionKey = 1 << 7,
  NTLMSessionSecurity = 1 << 9,

  Anonymous = 1 << 11,

  DomainNameSupplied = 1 << 12,
  WorkstationNameSupplied = 1 << 13,

  AlwaysSign = 1 << 15,
  TargetTypeDomain = 1 << 16,
  TargetTypeServer = 1 << 17,

  ExtendedSessionSecurity = 1 << 19,
  Identify = 1 << 20,

  RequestNonNtSessionKey = 1 << 22,
  TargetInfo = 1 << 23,

  Version = 1 << 25,

  Use128BitEncryption = 1 << 29,
  KeyExchange = 1 << 30,
  Use56BitEncryption = 1 << 31
}

export default NegotiateFlag;