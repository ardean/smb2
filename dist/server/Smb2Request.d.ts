import Client from "./Client";
import Server from "./Server";
import ProtocolSmb2Request from "../protocol/smb2/Request";
export default class Smb2Request extends ProtocolSmb2Request {
    server?: Server;
    client?: Client;
}
