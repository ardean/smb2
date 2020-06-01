export const Smb = Buffer
  .from([
    0xff,
    "S".charCodeAt(0),
    "M".charCodeAt(0),
    "B".charCodeAt(0)
  ])
  .toString("hex");

export const Smb2 = Buffer
  .from([
    0xfe,
    "S".charCodeAt(0),
    "M".charCodeAt(0),
    "B".charCodeAt(0)
  ])
  .toString("hex");