enum Capability {
  DistributedFileSystem = 1 << 0,
  Leasing = 1 << 1,
  LargeMtu = 1 << 2,
  MultiChannel = 1 << 3,
  PersistentHandles = 1 << 4,
  DirectoryLeasing = 1 << 5,
  Encryption = 1 << 6
}

export default Capability;