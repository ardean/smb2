declare enum DirectoryAccess {
    ListDirectory = 1,
    AddFile = 2,
    AddSubDirectory = 4,
    ReadEa = 8,
    WriteEa = 16,
    Traverse = 32,
    DeleteChild = 64,
    ReadAttributes = 128,
    WriteAttributes = 256,
    Delete = 65536,
    ReadControl = 131072,
    WriteDiscretionaryAccessControl = 262144,
    WriteOwner = 524288,
    Synchronize = 1048576,
    AccessSystemSecurity = 16777216,
    MaximumAllowed = 33554432,
    GenericAll = 268435456,
    GenericExecute = 536870912,
    GenericWrite = 1073741824,
    GenericRead = -2147483648
}
export default DirectoryAccess;
