import Tree from "./Tree";
import * as util from "./util";
import Response from "./Response";
import { EventEmitter } from "events";
import { PacketType } from "./Packet";
import DirectoryEntry from "./DirectoryEntry";
import ShareAccessMask from "./ShareAccessMask";
import { CreateOptions } from "./packets/Create";
import FileAttributeMask from "./FileAttributeMask";
import DirectoryAccessMask from "./DirectoryAccessMask";
import { InfoType, FileInfoClass } from "./packets/SetInfo";
import CreateDispositionType from "./CreateDispositionType";
import { Flags as ChangeNotifyFlags } from "./packets/ChangeNotify";

interface OpenOptions {
  desiredAccess?: DirectoryAccessMask;
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
  public _id: Buffer;
  public isOpen: boolean = false;
  public watching: boolean = false;
  private watchingMessageIds: number[] = [];
  private watchRecursive: boolean;

  constructor(
    private tree: Tree
  ) {
    super();
  }

  async open(path: string, options: OpenOptions = {}) {
    if (this.isOpen) return;

    const buffer = Buffer.from(util.toWindowsFilePath(path), "ucs2");
    const response = await this.tree.request(PacketType.Create, {}, {
      buffer,
      desiredAccess: typeof options.desiredAccess === "number" ?
        options.desiredAccess :
        (
          DirectoryAccessMask.ListDirectory |
          DirectoryAccessMask.ReadAttributes |
          DirectoryAccessMask.Synchronize
        ),
      fileAttributes: FileAttributeMask.Directory,
      shareAccess:
        ShareAccessMask.Read |
        ShareAccessMask.Write |
        ShareAccessMask.Delete,
      createDisposition: typeof options.createDisposition === "number" ?
        options.createDisposition :
        CreateDispositionType.Open,
      createOptions: typeof options.createOptions === "number" ?
        options.createOptions :
        CreateOptions.None,
      nameOffset: 0x0078,
      createContextsOffset: 0x007a + buffer.length
    });

    this._id = response.body.fileId as Buffer;
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

    this.tree.session.connection.addListener("changeNotify", this.onChangeNotify);
  }

  async unwatch() {
    if (!this.watching) return;
    this.watching = false;

    this.tree.session.connection.removeListener("changeNotify", this.onChangeNotify);

    await this.close();
  }

  private onChangeNotify = async (response: Response) => {
    const messageId = response.headers.messageId as number;
    const messageIdIndex = this.watchingMessageIds.indexOf(messageId);

    if (messageIdIndex !== -1) {
      this.watchingMessageIds.splice(messageIdIndex, 1);
      this.emit("change", response);

      await this.requestWatch();
    }
  };

  private async requestWatch() {
    const request = this.tree.createRequest(PacketType.ChangeNotify, {}, {
      flags: this.watchRecursive ?
        ChangeNotifyFlags.WatchTreeRecursively :
        ChangeNotifyFlags.None,
      fileId: this._id
    });
    this.watchingMessageIds.push(request.headers.messageId as number);

    const response = await this.tree.session.connection.send(request);
    if (
      response.status.code !== "STATUS_SUCCESS" &&
      response.status.code !== "STATUS_PENDING"
    ) throw new Error(response.status.message + " (" + response.status.code + ")");

    return response;
  }

  async flush() {
    await this.tree.request(PacketType.Flush, {
      fileId: this._id
    });
  }

  async read() {
    const response = await this.tree.request(PacketType.QueryDirectory, {}, {
      fileId: this._id,
      buffer: Buffer.from("*", "ucs2")
    });

    let entries: DirectoryEntry[] = [];
    if (response.data) {
      entries = response.data.filter(x => x.filename !== "." && x.filename !== "..")
    } else {
      console.warn("reponse without data", response);
    }

    return entries;
  }

  async exists(path: string) {
    try {
      await this.open(path);
    } catch (err) {
      if (
        err.status &&
        (
          err.status.code === "STATUS_OBJECT_NAME_NOT_FOUND" ||
          err.status.code === "STATUS_OBJECT_PATH_NOT_FOUND"
        )
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

  async setInfo(fileInfoClass: number, buffer: Buffer) {
    await this.tree.request(PacketType.SetInfo, {}, {
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

    await this.tree.request(PacketType.Close, {}, { fileId: this._id });

    this.emit("close", this);
  }
}

export default Directory;