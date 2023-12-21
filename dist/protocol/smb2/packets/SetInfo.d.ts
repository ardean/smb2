import Structure from "../../Structure";
export declare enum InfoType {
    File = 1,
    Filesystem = 2,
    Security = 3,
    Quota = 4
}
export declare enum FileInfoClass {
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
declare const _default: {
    requestStructure: Structure;
    responseStructure: Structure;
};
export default _default;
