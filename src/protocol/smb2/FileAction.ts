enum FileAction {
  Added = 1,
  Removed = 2,
  Modified = 3,
  RenamedOldName = 4,
  RenamedNewName = 5,
  AddedStream = 6,
  RemovedStream = 7,
  ModifiedStream = 8,
  RemovedByDelete = 9,
  IdNotTunnelled = 10,
  TunnelledIdCollision = 11
}

export default FileAction;