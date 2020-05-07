import ntlm from "ntlm";
import Tree from "./Tree";
import Connection from "./Connection";
import { EventEmitter } from "events";
import { PacketType, Data } from "./Packet";

export interface AuthenticateOptions {
  domain: string;
  username: string;
  password: string;
}

interface Session {
  on(event: "authenticate" | "logoff", callback: (session: Session) => void): this;

  once(event: "authenticate" | "logoff", callback: (session: Session) => void): this;
}

class Session extends EventEmitter {
  _id: Buffer;
  authenticated: boolean = false;

  connectedTrees: Tree[] = [];

  constructor(
    public connection: Connection
  ) {
    super();
  }

  async connectTree(path: string) {
    const tree = new Tree(this);
    this.registerTree(tree);
    await tree.connect(path);

    return tree;
  }

  createRequest(packetType: PacketType, headers: Data = {}, body: Data = {}) {
    return this.connection.createRequest(packetType, {
      sessionId: this._id,
      ...headers
    }, body);
  }

  async request(packetType: PacketType, headers: Data = {}, body: Data = {}) {
    return await this.connection.request(packetType, {
      sessionId: this._id,
      ...headers
    }, body);
  }

  async authenticate(options: AuthenticateOptions) {
    if (this.authenticated) return;

    await this.request(PacketType.Negotiate);
    const sessionSetupResponse = await this.request(PacketType.SessionSetup, {}, { buffer: ntlm.encodeType1(this.connection.host, options.domain) });
    this._id = sessionSetupResponse.headers.sessionId as Buffer;

    const nonce = ntlm.decodeType2(sessionSetupResponse.body.buffer) as Buffer;
    await this.request(PacketType.SessionSetup, {}, {
      buffer: ntlm.encodeType3(
        options.username,
        this.connection.host,
        options.domain,
        nonce,
        options.password
      )
    });

    this.authenticated = true;

    this.emit("authenticate", this);
  }

  private registerTree(tree: Tree) {
    tree
      .once("connect", () => this.connectedTrees.push(tree))
      .once("disconnect", () => this.connectedTrees.splice(this.connectedTrees.indexOf(tree), 1));
  }

  async logoff() {
    if (!this.authenticated) return;
    this.authenticated = false;

    await Promise.all(this.connectedTrees.map(x => x.disconnect()));

    await this.request(PacketType.LogOff);
    delete this._id;

    this.emit("logoff", this);
  }
}

export default Session;