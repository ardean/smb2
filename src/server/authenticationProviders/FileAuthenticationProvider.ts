import fs from "fs";
import AuthenticationProvider from "../AuthenticationProvider";

export default class FileAuthenticationProvider extends AuthenticationProvider {
  constructor(
    private filename: string
  ) {
    super();
  }

  async init() {
    this.users = JSON.parse(fs.readFileSync(this.filename, { encoding: "utf-8" }));
  }
}