import Share from "./Share";

export default abstract class ShareProvider {
  public shares: Share[] = [];

  async init() { }

  getShare(name: string) {
    const share = this.shares.find(x => x.name === name);
    return share || null;
  }
}