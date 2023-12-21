/// <reference types="node" />
import Structure from "../Structure";
import PacketType from "./PacketType";
import Header from "./Header";
export default class Packet {
    static getPacketTypeName(packetType: PacketType): string;
    static getPacketByPacketType(packetType: PacketType): any;
    static getPacket(typeName: string): any;
    static getStructure(header: Header): Structure;
    static serialize(header: Header, body: any): Buffer;
    static parse(buffer: Buffer): {
        header: Header;
        body: any;
    };
    static parseHeader(buffer: Buffer): {
        header: Header;
        bodyBuffer: Buffer;
    };
    static serializeHeader(header: Header): Buffer;
}
