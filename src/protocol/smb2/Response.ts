import Header from "./Header";
import Packet from "./Packet";
import HeaderFlag from "./HeaderFlag";
import ProtocolResponse from "../Response";

export default class Response extends ProtocolResponse<Header> {
  typeName: string;
  data: any;

  constructor(header: Header, body?: any) {
    super(header, body);

    this.header.flags |= HeaderFlag.Response;

    this.typeName = Packet.getPacketTypeName(this.header.type);
    const packet = Packet.getPacketByPacketType(this.header.type);
    if (Buffer.isBuffer(this.body.buffer) && packet.parseResponseBuffer) {
      this.data = packet.parseResponseBuffer(this.body.buffer);
    }
  }

  static parse(buffer: Buffer) {
    const { header, body } = Packet.parse(buffer);
    return new Response(header, body);
  }

  serialize() {
    return Packet.serialize(this.header, this.body);
  }
}