import Header from "./Header";
import Packet from "./Packet";
import ProtocolResponse from "../Response";

export default class Response extends ProtocolResponse<Header> {
  static parse(buffer: Buffer) {
    const { header, body } = Packet.parse(buffer);
    return new Response(header, body);
  }

  serialize() {
    return Buffer.from([]);
    // return Packet.serialize(this.header, this.body);
  }
}