enum FilePipePrinterAccessMask {
  ReadData = 1 << 0,
  WriteData = 1 << 1,
  AppendData = 1 << 2,
  ReadEa = 1 << 3,
  WriteEa = 1 << 4,
  DeleteChild = 1 << 5,
  Execute = 1 << 6,
  ReadAttributes = 1 << 7,
  WriteAttributes = 1 << 8,
  Delete = 1 << 16,
  ReadControl = 1 << 17,
  WriteDiscretionaryAccessControl = 1 << 18,
  WriteOwner = 1 << 19,
  Synchronize = 1 << 20,
  AccessSystemSecurity = 1 << 24,
  MaximumAllowed = 1 << 25,
  GenericAll = 1 << 28,
  GenericExecute = 1 << 29,
  GenericWrite = 1 << 30,
  GenericRead = 1 << 31
}

export default FilePipePrinterAccessMask;