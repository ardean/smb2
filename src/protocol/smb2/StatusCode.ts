enum StatusCode {
  Success = 0x00000000,
  Pending = 0x00000103,
  MoreProcessingRequired = 0xc0000016,
  FileNameNotFound = 0xc0000034,
  FilePathNotFound = 0xc000003a,
  FileClosed = 0xc0000128
}

export default StatusCode;
