enum TreeConnectShareCapability {
  DistributedFileSystem = 1 << 3,
  ContinuousAvailability = 1 << 4,
  Scaleout = 1 << 5,
  Cluster = 1 << 6
}

export default TreeConnectShareCapability;