export const Server2003Revision = 0x0F;

export default class Version {
  public static WindowsXP = new Version(5, 1, 2600, Server2003Revision);
  public static Server2003 = new Version(5, 2, 3790, Server2003Revision);

  constructor(
    public majorVersion: number,
    public minorVersion: number,
    public buildNumber: number,
    public revision: number
  ) { }

  serialize() {
    let offset = 0;

    const buffer = Buffer.allocUnsafe(8);

    buffer.writeInt8(this.majorVersion, offset);
    offset += 1;

    buffer.writeInt8(this.minorVersion, offset);
    offset += 1;

    buffer.writeUInt16LE(this.buildNumber, offset);
    offset += 2;

    buffer.writeInt8(0, offset);
    offset += 1;

    buffer.writeInt8(0, offset);
    offset += 1;

    buffer.writeInt8(0, offset);
    offset += 1;

    buffer.writeInt8(this.revision, offset);
    offset += 1;

    return buffer;
  }

  static parse(buffer: Buffer) {
    let offset = 0;

    const majorVersion = buffer.readInt8(offset);
    offset += 1;

    const minorVersion = buffer.readInt8(offset);
    offset += 1;

    const buildNumber = buffer.readUInt16LE(offset);
    offset += 2;

    offset += 3;

    const revision = buffer.readInt8(offset);
    offset += 1;

    return new Version(majorVersion, minorVersion, buildNumber, revision);
  }
}