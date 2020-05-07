enum FileAttributeMask {
  None = 0,
  ReadOnly = 1 << 0,
  Hidden = 1 << 1,
  System = 1 << 2,
  Directory = 1 << 4,
  Archive = 1 << 5,
  Normal = 1 << 7,
  Temporary = 1 << 8,
  SparseFile = 1 << 9,
  ReparsePoint = 1 << 10,
  Compressed = 1 << 11,
  Offline = 1 << 12,
  NotContentIndexed = 1 << 13,
  Encrypted = 1 << 14,
  IntegrityStream = 1 << 15,
  NoScrubData = 1 << 17
}

export default FileAttributeMask;