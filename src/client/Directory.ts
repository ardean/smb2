import Tree from "./Tree";
import { EventEmitter } from "events";
import * as util from "../protocols/util";
import Response from "../protocols/smb2/Response";
import StatusCode from "../protocols/smb2/StatusCode";
import PacketType from "../protocols/smb2/PacketType";
import FileAttribute from "../protocols/smb2/FileAttribute";
import ShareAccessType from "../protocols/smb2/ShareAccessType";
import DirectoryAccess from "../protocols/smb2/DirectoryAccess";
import { CreateOptions } from "../protocols/smb2/packets/Create";
import * as structureUtil from "../protocols/structureUtil";
import DirectoryEntry from "../models/DirectoryEntry";
import { InfoType, FileInfoClass } from "../protocols/smb2/packets/SetInfo";
import CreateDispositionType from "../protocols/smb2/CreateDispositionType";
import { Flags as ChangeNotifyFlags } from "../protocols/smb2/packets/ChangeNotify";

interface OpenOptions {
  desiredAccess?: DirectoryAccess;
  createDisposition?: CreateDispositionType;
  createOptions?: CreateOptions;
}

interface Directory {
  on(event: "open" | "close", callback: (directory: Directory) => void): this;
  on(event: "change", callback: (response: Response) => void): this;

  once(event: "open" | "close", callback: (directory: Directory) => void): this;
  once(event: "change", callback: (response: Response) => void): this;
}

class Directory extends EventEmitter {
  public _id: string;
  public isOpen: boolean = false;
  public watching: boolean = false;
  private watchingMessageIds: bigint[] = [];
  private watchRecursive: boolean;

  constructor(
    private tree: Tree
  ) {
    super();
  }

  async open(path: string, options: OpenOptions = {}) {
    if (this.isOpen) return;

    const buffer = Buffer.from(util.toWindowsFilePath(path), "ucs2");
    const response = await this.tree.request({ type: PacketType.Create }, {
      buffer,
      desiredAccess: typeof options.desiredAccess === "number" ?
        options.desiredAccess :
        (
          DirectoryAccess.ListDirectory |
          DirectoryAccess.ReadAttributes |
          DirectoryAccess.Synchronize
        ),
      fileAttributes: FileAttribute.Directory,
      shareAccess:
        ShareAccessType.Read |
        ShareAccessType.Write |
        ShareAccessType.Delete,
      createDisposition: typeof options.createDisposition === "number" ?
        options.createDisposition :
        CreateDispositionType.Open,
      createOptions: typeof options.createOptions === "number" ?
        options.createOptions :
        CreateOptions.None,
      nameOffset: 0x0078,
      createContextsOffset: 0x007a + buffer.length
    });

    this._id = response.body.fileId as string;
    this.isOpen = true;

    this.emit("open", this);
  }

  async create(path: string) {
    await this.open(path, {
      createDisposition: CreateDispositionType.Create,
      createOptions: CreateOptions.Directory
    });
  }

  async watch(recursive: boolean = true) {
    if (this.watching) return;
    this.watching = true;
    this.watchRecursive = recursive;

    await this.requestWatch();

    this.tree.session.client.addListener("changeNotify", this.onChangeNotify);
  }

  async unwatch() {
    if (!this.watching) return;
    this.watching = false;

    this.tree.session.client.removeListener("changeNotify", this.onChangeNotify);

    await this.close();
  }

  private onChangeNotify = async (response: Response) => {
    const messageId = response.header.messageId;
    const messageIdIndex = this.watchingMessageIds.indexOf(messageId);

    if (messageIdIndex !== -1) {
      this.watchingMessageIds.splice(messageIdIndex, 1);
      this.emit("change", response);

      await this.requestWatch();
    }
  };

  private async requestWatch() {
    const request = this.tree.createRequest(
      { type: PacketType.ChangeNotify },
      {
        flags: this.watchRecursive ?
          ChangeNotifyFlags.WatchTreeRecursively :
          ChangeNotifyFlags.None,
        fileId: this._id
      }
    );
    this.watchingMessageIds.push(request.header.messageId);

    const response = await this.tree.session.client.send(request);
    if (
      response.header.status !== StatusCode.Success &&
      response.header.status !== StatusCode.Pending
    ) throw new Error(`ChangeNotify: ${structureUtil.parseEnumValue(StatusCode, response.header.status)} (${response.header.status})`);

    return response;
  }

  async flush() {
    await this.tree.request({
      type: PacketType.Flush
    }, {
      fileId: this._id
    });
  }

  async read() {
    const response = await this.tree.request({ type: PacketType.QueryDirectory }, {
      fileId: this._id,
      buffer: Buffer.from("*", "ucs2")
    });

    let entries: DirectoryEntry[] = [];
    if (response.data) {
      entries = response.data.filter(x => x.filename !== "." && x.filename !== "..")
    } else {
      console.warn("response without data", response);
    }

    return entries;
  }

  async exists(path: string) {
    try {
      await this.open(path);
    } catch (err) {
      if (
        err.header.status === StatusCode.FileNameNotFound ||
        err.header.status === StatusCode.FilePathNotFound
      ) {
        return false;
      }
      throw err;
    }

    return true;
  }

  async remove() {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(1, 0);

    await this.setInfo(FileInfoClass.DispositionInformation, buffer);
  }

  async rename(newPath: string) {
    const newPathUCS2 = Buffer.from(newPath, "ucs2");
    const buffer = Buffer.alloc(1 + 7 + 8 + 4 + newPathUCS2.length);

    buffer.fill(0x00);
    buffer.writeUInt8(1, 0);
    buffer.writeUInt32LE(newPathUCS2.length, 16);
    buffer.fill(newPathUCS2, 20);

    await this.setInfo(FileInfoClass.RenameInformation, buffer);
  }

  async setInfo(fileInfoClass: number, buffer: Buffer) {
    await this.tree.request({ type: PacketType.SetInfo }, {
      infoType: InfoType.File,
      fileId: this._id,
      fileInfoClass,
      buffer
    });
  }

  async close() {
    if (this.watching) return await this.unwatch();
    if (!this.isOpen) return;
    this.isOpen = false;

    await this.tree.request({ type: PacketType.Close }, { fileId: this._id });

    this.emit("close", this);
  }
}

export default Directory;