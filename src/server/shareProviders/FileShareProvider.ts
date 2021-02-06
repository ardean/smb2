import fs from "fs";
import ShareProvider from "../ShareProvider";

export default class FileShareProvider extends ShareProvider {
  constructor(
    private filename: string
  ) {
    super();
  }

  async init() {
    this.shares = JSON.parse(fs.readFileSync(this.filename, { encoding: "utf-8" }));
  }
}