import { Structure } from "../Packet";

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
    length: 2,
    defaultValue: 33
  },
  infoType: {
    length: 1,
    defaultValue: InfoType.File
  },
  fileInfoClass: {
    length: 1,
    defaultValue: FileInfoClass.EndOfFileInformation
  },
  bufferLength: {
    length: 4
  },
  bufferOffset: {
    length: 2,
    defaultValue: 96
  },
  reserved: {
    length: 2
  },
  additionalInformation: {
    length: 4
  },
  fileId: {
    length: 16
  },
  buffer: {
    length: "bufferLength"
  }
};

const responseStructure: Structure = {
  structureSize: {
    length: 2
  }
};

export default {
  requestStructure,
  responseStructure
};