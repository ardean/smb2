import Header from "./Header";
import Packet from "./Packet";
import ProtocolResponse from "../Response";

export default class Response extends ProtocolResponse {
  header: Header;
  body: Record<string | number | symbol, unknown>;

  static parse(buffer: Buffer) {
    const { header, body } = Packet.parse(buffer);
    return new Response(header, body);
  }

  serialize() {
    return Buffer.from([]);
    // return Packet.serialize(this.header, this.body);
  }
}