import Client from "./Client";
import Request from "./Request";
import net, { Socket } from "net";
import Response from "./Response";
import moment from "moment-timezone";
import Middleware from "./Middleware";
import SmbResponse from "./SmbResponse";
import * as util from "../protocols/util";
import Smb2Response from "./Smb2Response";
import ShareProvider from "./ShareProvider";
import SmbHeader from "../protocols/smb/Header";
import Smb2Header from "../protocols/smb2/Header";
import requestType from "./middlewares/requestType";
import Smb2Dialect from "../protocols/smb2/Dialect";
import * as ProtocolIds from "../protocols/ProtocolIds";
import SmbPacketType from "../protocols/smb/PacketType";
import Smb2PacketType from "../protocols/smb2/PacketType";
import * as smbRequestHandlers from "./requestHandlers/smb";
import * as smb2RequestHandlers from "./requestHandlers/smb2";
import unhandledRequest from "./middlewares/unhandledRequest";
import AuthenticationProvider from "./AuthenticationProvider";
import supportedProtocols from "./middlewares/supportedProtocols";

export default class Server {
  public port: number;
  private clients: Client[] = [];
  private server = net.createServer();
  public startDate: Date;
  public guid = util.generateGuid();
  private middlewares: Middleware[] = [];
  private authenticationProviders: AuthenticationProvider[] = [];
  private shareProviders: ShareProvider[] = [];
  private nextSessionId: bigint = 0n;
  public supportedSmb2Dialects = [
    Smb2Dialect.Smb202
  ];
  async init() {
    this.use(supportedProtocols([ProtocolIds.Smb, ProtocolIds.Smb2]));

    const smb2RequestHandlerTypes = Object.keys(smb2RequestHandlers);
    for (const smb2RequestHandlerType of smb2RequestHandlerTypes) {
      const handler = requestType(
        ProtocolIds.Smb2,
        Smb2PacketType[smb2RequestHandlerType],
        smb2RequestHandlers[smb2RequestHandlerType]
      );
      this.use(handler);
    }

    const smbRequestHandlerTypes = Object.keys(smbRequestHandlers);
    for (const smbRequestHandlerType of smbRequestHandlerTypes) {
      const handler = requestType(
        ProtocolIds.Smb,
        SmbPacketType[smbRequestHandlerType],
        smbRequestHandlers[smbRequestHandlerType]
      );
      this.use(handler);
    }

    this.use(unhandledRequest);

    for (const authenticationProvider of this.authenticationProviders) {
      await authenticationProvider.init();
    }

    for (const shareProvider of this.shareProviders) {
      await shareProvider.init();
    }

    this.server.addListener("connection", this.onConnection);
  }

  async listen(port: number = 445) {
    this.port = port;

    await new Promise<void>(resolve => {
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
    client.once("destroy", () => {
      const index = this.clients.indexOf(client);
      if (index !== -1) this.clients.splice(index, 1);
    });
    client.init();
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
    if (req.header.protocolId === ProtocolIds.Smb) {
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
        sessionId: header.sessionId
      });
    }

    req.response = res;

    try {
      for (const middleware of this.middlewares) {
        await middleware(req, res);
        if (res.sent) return req.client.send(res);
        if (res.redirectedRequest) return await this.redirect(req, res.redirectedRequest);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async redirect(from: Request, to: Request) {
    this.initRequest(to, from.client);
    await this.handleRequest(to);
  }

  use(element: Middleware | AuthenticationProvider | ShareProvider) {
    if (element instanceof AuthenticationProvider) {
      this.authenticationProviders.push(element);
    } else if (element instanceof ShareProvider) {
      this.shareProviders.push(element);
    } else {
      this.middlewares.push(element);
    }
  }

  getUser(domain: string, username: string) {
    for (const authenticationProvider of this.authenticationProviders) {
      const user = authenticationProvider.getUser(domain, username);
      if (user) return user;
    }
    return null;
  }

  getShare(name: string) {
    for (const shareProvider of this.shareProviders) {
      const share = shareProvider.getShare(name);
      if (share) return share;
    }
    return null;
  }
}