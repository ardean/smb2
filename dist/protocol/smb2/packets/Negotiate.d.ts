import Structure from "../../Structure";
import Capability from "../Capability";
export interface RequestBody {
    structureSize?: number;
    dialects: number[];
    securityMode?: number;
    capabilities: Capability;
    clientGuid: string;
    clientStartDate: Date;
}
declare const _default: {
    requestStructure: Structure;
    responseStructure: Structure;
};
export default _default;
