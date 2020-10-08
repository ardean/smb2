export const formatDialectName = (dialect: Dialect) => dialect.toString(16);

enum Dialect {
  Smb202 = 0x0202,
  Smb210 = 0x0210,
  Smb2xx = 0x02ff,
  Smb300 = 0x0300,
  Smb302 = 0x0302,
  Smb311 = 0x0311,
  Smb3xx = 0x03ff
}

export default Dialect;