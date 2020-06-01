import File from "./File";
import Session from "./Session";
import Directory from "./Directory";
import { EventEmitter } from "events";
import Header from "../protocols/smb2/Header";
import * as util from "../protocols/util";
import Response from "../protocols/smb2/Response";
import PacketType from "../protocols/smb2/PacketType";
import DirectoryAccess from "../protocols/smb2/DirectoryAccess";
import FilePipePrinterAccess from "../protocols/smb2/FilePipePrinterAccess";

interface Tree {
  on(event: "connect" | "disconnect", callback: (tree: Tree) => void): this;

  once(event: "connect" | "disconnect", callback: (tree: Tree) => void): this;
}

class Tree extends EventEmitter {
  _id: number;
  connected: boolean = false;
  connecting: boolean = false;
  openFiles: File[] = [];
  openDirectories: Directory[] = [];

  constructor(
    public session: Session
  ) {
    super();
  }

  async connect(path: string) {
    if (this.connected || this.connecting) return;
    this.connecting = true;

    const buffer = Buffer.from(
      util.toWindowsPath(`//${this.session.client.host}:${this.session.client.port}/${path}`),
      "ucs2"
    );
    const response = await this.request({ type: PacketType.TreeConnect }, { buffer });
    this._id = response.header.treeId;

    this.connecting = false;
    this.connected = true;

    this.emit("connect", this);
  }

  async disconnect() {
    if (!this.connected) return;
    this.connected = false;

    await Promise.all([
      ...this.openFiles.map(x => x.close()),
      ...this.openDirectories.map(x => x.close())
    ]);

    await this.request({ type: PacketType.TreeDisconnect });

    this.emit("disconnect", this);
  }

  async createDirectory(path: string) {
    const directory = new Directory(this);
    this.registerDirectory(directory);

    await directory.create(path);
    await directory.close();
  }

  async removeDirectory(path: string) {
    const directory = new Directory(this);
    this.registerDirectory(directory);

    await directory.open(path, { desiredAccess: DirectoryAccess.Delete });
    await directory.remove();
    await directory.close();
  }

  async watch(onChange?: (response: Response) => void, recursive?: boolean) {
    return await this.watchDirectory("", onChange, recursive);
  }

  async watchDirectory(path: string = "/", onChange: (response: Response) => void, recursive?: boolean) {
    const directory = new Directory(this);
    this.registerDirectory(directory);

    await directory.open(path);
    await directory.watch(recursive);
    directory.addListener("change", onChange);

    return async () => {
      directory.removeListener("change", onChange);
      await directory.unwatch();
    };
  }

  async readDirectory(path: string = "/") {
    const directory = new Directory(this);
    this.registerDirectory(directory);

    await directory.open(path);
    const entries = await directory.read();
    await directory.close();
    return entries;
  }

  async exists(path: string) {
    const file = new File(this);
    this.registerFile(file);
    const exists = await file.exists(path);
    await file.close();
    return exists;
  }

  async createFile(path: string, content?: Buffer | string) {
    const file = new File(this);
    this.registerFile(file);
    await file.create(path);
    if (typeof content !== "undefined") {
      await file.setSize(BigInt(content.length));
      await file.write(content);
    }
    await file.close();
  }

  async removeFile(path: string) {
    const file = new File(this);
    this.registerFile(file);
    await file.open(path, { desiredAccess: FilePipePrinterAccess.Delete });
    await file.remove();
    await file.close();
  }

  async readFile(path: string) {
    const file = new File(this);
    this.registerFile(file);

    await file.open(path);
    const buffer = await file.read();
    await file.close();
    return buffer;
  }

  private registerFile(file: File) {
    file
      .once("open", () => this.openFiles.push(file))
      .once("close", () => this.openFiles.splice(this.openFiles.indexOf(file), 1));
  }

  private registerDirectory(directory: Directory) {
    directory
      .once("open", () => this.openDirectories.push(directory))
      .once("close", () => this.openDirectories.splice(this.openDirectories.indexOf(directory), 1));
  }

  createRequest(header: Header = {}, body: any = {}) {
    return this.session.createRequest(
      {
        treeId: this._id,
        ...header
      },
      body
    );
  }

  request(header: Header = {}, body: any = {}) {
    return this.session.request(
      {
        treeId: this._id,
        ...header
      },
      body
    );
  }
}

export default Tree;