import User from "./User";

export default class AuthenticationProvider {
  public domain: string;
  public users: User[] = [];

  async init() { }

  matchDomain(domain: string) {
    if (!this.domain) return true;
    return this.domain === domain;
  }

  getUser(domain: string, username: string) {
    if (!this.matchDomain(domain)) return null;

    const user = this.users.find(x => x.name === username);
    return user || null;
  }
}