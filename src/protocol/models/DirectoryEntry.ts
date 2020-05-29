export default interface DirectoryEntry {
  index: number;
  type: "File" | "Directory";
  creationTime: Date;
  lastAccessTime: Date;
  lastWriteTime: Date;
  changeTime: Date;
  fileSize: BigInt;
  allocationSize: BigInt;
  shortFilename?: string;
  eaSize: number;
  fileId: string;
  filename: string;
  fileAttributes: string[];
}