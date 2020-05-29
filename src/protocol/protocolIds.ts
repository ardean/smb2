export const smb = Buffer
  .from([
    0xff,
    "S".charCodeAt(0),
    "M".charCodeAt(0),
    "B".charCodeAt(0)
  ])
  .toString("hex");

export const smb2 = Buffer
  .from([
    0xfe,
    "S".charCodeAt(0),
    "M".charCodeAt(0),
    "B".charCodeAt(0)
  ])
  .toString("hex");