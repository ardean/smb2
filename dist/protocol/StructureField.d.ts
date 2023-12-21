/// <reference types="node" />
import Value from "./Value";
declare type StructureField = {
    type: NumberConstructor | typeof Buffer | StringConstructor;
    enum?: any;
    signedness?: "Signed" | "Unsigned";
    encoding?: "hex";
    countFieldName?: string;
    count?: number;
    sizeFieldName?: string;
    size?: number;
    defaultValue?: Value;
};
export default StructureField;
