import Client from "./Client";
import Request from "./Request";
import net, { Socket } from "net";
import Response from "./Response";
import moment from "moment-timezone";
import Middleware from "./Middleware";
import SmbResponse from "./SmbResponse";
import * as util from "../protocol/util";
import Smb2Response from "./Smb2Response";
import SmbHeader from "../protocol/smb/Header";
import Smb2Header from "../protocol/smb2/Header";
import requestType from "./middlewares/requestType";
import * as protocolIds from "../protocol/protocolIds";
import SmbPacketType from "../protocol/smb/PacketType";
import Smb2PacketType from "../protocol/smb2/PacketType";
import * as smbRequestHandlers from "./requestHandlers/smb";
import * as smb2RequestHandlers from "./requestHandlers/smb2";
import supportedProtocols from "./middlewares/supportedProtocols";

export default class Server {
  public port: number;
  private clients: Client[] = [];
  private server = net.createServer();
  public startDate: Date;
  public guid = util.generateGuid();
  private middlewares: Middleware[] = [];

  constructor() {
    this.use(supportedProtocols([protocolIds.smb, protocolIds.smb2]));

    const smb2RequestHandlerTypes = Object.keys(smb2RequestHandlers);
    for (const smb2RequestHandlerType of smb2RequestHandlerTypes) {
      const handler = requestType(
        protocolIds.smb2,
        Smb2PacketType[smb2RequestHandlerType],
        smb2RequestHandlers[smb2RequestHandlerType]
      );
      this.use(handler);
    }

    const smbRequestHandlerTypes = Object.keys(smbRequestHandlers);
    for (const smbRequestHandlerType of smbRequestHandlerTypes) {
      const handler = requestType(
        protocolIds.smb,
        SmbPacketType[smbRequestHandlerType],
        smbRequestHandlers[smbRequestHandlerType]
      );
      this.use(handler);
    }

    this.server.addListener("connection", this.onConnection);
  }

  async listen(port: number = 445) {
    this.port = port;

    await new Promise<void>((resolve) => {
      this.server.listen({ port }, () => {
        resolve();
      });
    });

    this.startDate = moment().toDate();

    return this.server;
  }

  private onConnection = (socket: Socket) => {
    const client = new Client(this, socket);
    client.on("request", this.onRequest(client));
    client.setup();
    this.clients.push(client);
  }

  onRequest = (client: Client) => async (req: Request) => {
    this.initRequest(req, client);
    await this.handleRequest(req);
  }

  initRequest(req: Request, client: Client) {
    req.server = this;
    req.client = client;
    return req;
  }

  async handleRequest(req: Request) {
    let res: Response;
    if (req.header.protocolId === protocolIds.smb) {
      const header = req.header as SmbHeader;
      res = new SmbResponse({
        protocolId: header.protocolId,
        type: header.type,
        treeId: header.treeId,
        userId: header.userId
      });
    } else {
      const header = req.header as Smb2Header;
      res = new Smb2Response({
        protocolId: header.protocolId,
        type: header.type,
        messageId: header.messageId,
        clientId: header.clientId,
        treeId: header.treeId,
        sessionId: header.sessionId,
        signature: header.signature
      });
    }

    req.response = res;

    for (const middleware of this.middlewares) {
      await middleware(req, res);
      if (res.sent) return req.client.send(res);
      if (res.redirectedReq) return await this.redirect(req, res.redirectedReq);
    }
  }

  async redirect(from: Request, to: Request) {
    this.initRequest(to, from.client);
    await this.handleRequest(to);
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }
}