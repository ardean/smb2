import Header from "./Header";
import Packet from "./Packet";
import ProtocolRequest from "../Request";

export default class Request extends ProtocolRequest {
  header: Header;
  body: Record<string | number | symbol, unknown>;

  static parse(buffer: Buffer) {
    const { header, body } = Packet.parse(buffer);
    return new Request(header, body);
  }

  serialize() {
    return Buffer.from([]);
    // return Packet.serialize(this.header, this.body);
  }
}