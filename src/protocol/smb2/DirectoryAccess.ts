enum DirectoryAccess {
  ListDirectory = 1 << 0,
  AddFile = 1 << 1,
  AddSubDirectory = 1 << 2,
  ReadEa = 1 << 3,
  WriteEa = 1 << 4,
  Traverse = 1 << 5,
  DeleteChild = 1 << 6,
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

export default DirectoryAccess;