"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInfoClass = exports.InfoType = void 0;
var InfoType;
(function (InfoType) {
    InfoType[InfoType["File"] = 1] = "File";
    InfoType[InfoType["Filesystem"] = 2] = "Filesystem";
    InfoType[InfoType["Security"] = 3] = "Security";
    InfoType[InfoType["Quota"] = 4] = "Quota";
})(InfoType = exports.InfoType || (exports.InfoType = {}));
var FileInfoClass;
(function (FileInfoClass) {
    FileInfoClass[FileInfoClass["AllocationInformation"] = 19] = "AllocationInformation";
    FileInfoClass[FileInfoClass["BasicInformation"] = 4] = "BasicInformation";
    FileInfoClass[FileInfoClass["DispositionInformation"] = 13] = "DispositionInformation";
    FileInfoClass[FileInfoClass["EndOfFileInformation"] = 20] = "EndOfFileInformation";
    FileInfoClass[FileInfoClass["FullEaInformation"] = 15] = "FullEaInformation";
    FileInfoClass[FileInfoClass["LinkInformation"] = 11] = "LinkInformation";
    FileInfoClass[FileInfoClass["ModeInformation"] = 16] = "ModeInformation";
    FileInfoClass[FileInfoClass["PipeInformation"] = 23] = "PipeInformation";
    FileInfoClass[FileInfoClass["PositionInformation"] = 14] = "PositionInformation";
    FileInfoClass[FileInfoClass["RenameInformation"] = 10] = "RenameInformation";
    FileInfoClass[FileInfoClass["ShortNameInformation"] = 40] = "ShortNameInformation";
    FileInfoClass[FileInfoClass["ValidDataLengthInformation"] = 39] = "ValidDataLengthInformation";
})(FileInfoClass = exports.FileInfoClass || (exports.FileInfoClass = {}));
const requestStructure = {
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
const responseStructure = {
    structureSize: {
        type: Number,
        size: 2
    }
};
exports.default = {
    requestStructure,
    responseStructure
};
