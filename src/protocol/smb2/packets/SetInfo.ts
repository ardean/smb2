import Structure from "../../Structure";

export enum InfoType {
  File = 1,
  Filesystem = 2,
  Security = 3,
  Quota = 4
}

export enum FileInfoClass {
  AllocationInformation = 19,
  BasicInformation = 4,
  DispositionInformation = 13,
  EndOfFileInformation = 20,
  FullEaInformation = 15,
  LinkInformation = 11,
  ModeInformation = 16,
  PipeInformation = 23,
  PositionInformation = 14,
  RenameInformation = 10,
  ShortNameInformation = 40,
  ValidDataLengthInformation = 39
}

const requestStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2,
    defaultValue: 33
  },
  infoType: {
    type: Number,
    size: 1,
    defaultValue: InfoType.File
  },
  fileInfoClass: {
    type: Number,
    size: 1,
    defaultValue: FileInfoClass.EndOfFileInformation
  },
  bufferLength: {
    type: Number,
    size: 4
  },
  bufferOffset: {
    type: Number,
    size: 2,
    defaultValue: 96
  },
  reserved: {
    type: Number,
    size: 2
  },
  additionalInformation: {
    type: Number,
    size: 4
  },
  fileId: {
    type: String,
    encoding: "hex",
    size: 16
  },
  buffer: {
    type: Buffer,
    sizeFieldName: "bufferLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    type: Number,
    size: 2
  }
};

export default {
  requestStructure,
  responseStructure
};