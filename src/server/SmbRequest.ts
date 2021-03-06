import Client from "./Client";
import Server from "./Server";
import ProtocolSmbRequest from "../protocol/smb/Request";

export default class SmbRequest extends ProtocolSmbRequest {
  server?: Server;
  client?: Client;
}