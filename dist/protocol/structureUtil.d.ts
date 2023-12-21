/// <reference types="node" />
import Value from "./Value";
import Structure from "./Structure";
import StructureField from "./StructureField";
export declare const parseStructure: (buffer: Buffer, structure: Structure) => any;
export declare const parseNumber: (buffer: Buffer, structureField: StructureField) => number | bigint;
export declare const parseValue: (buffer: Buffer, structureField: StructureField) => Value;
export declare const parseString: (buffer: Buffer, structureField: StructureField) => string;
export declare const parseDate: (buffer: Buffer) => Date;
export declare const parseEnumValue: (enumObject: any, value: number | string) => string;
export declare const parseEnumValues: (enumObject: any, value: number) => string[];
export declare const parseList: <EntryType = any>(buffer: Buffer, parser: (entryBuffer: Buffer) => EntryType) => EntryType[];
export declare const serializeStructure: (structure: Structure, data: any) => Buffer;
export declare const serializeValue: (value: Value, structureField: StructureField) => Buffer;
export declare const serializeDate: (date: Date) => Buffer;
export declare const serializeString: (value: string, structureField: StructureField) => Buffer;
