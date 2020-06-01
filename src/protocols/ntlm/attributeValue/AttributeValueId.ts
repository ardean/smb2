enum AttributeValueId {
  EndOfLine = 0x0000,
  NetBiosComputerName = 0x0001,
  NetBiosDomainName = 0x0002,
  DnsComputerName = 0x0003,
  DnsDomainName = 0x0004,
  DnsTreeName = 0x0005,
  Flags = 0x0006,
  Timestamp = 0x0007,
  SingleHost = 0x0008,
  TargetName = 0x0009,
  ChannelBindings = 0x000A
}

export default AttributeValueId;