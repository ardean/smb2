enum HeaderFlag {
  Response = 1 << 0,
  Async = 1 << 1,
  Chained = 1 << 2,
  Signed = 1 << 3,
  Priority = 1 << 4,
  DfsOperation = 1 << 5,
  ReplayOperation = 1 << 6
}

export default HeaderFlag;