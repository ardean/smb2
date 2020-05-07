export const toUnixFilePath = (value: string) => {
  value = toUnixPath(value);
  if (value[0] !== "/" && value[0] !== ".") value = `./${value}`;
  if (value[0] === "/") value = `.${value}`;
  return value;
};

export const toWindowsFilePath = (value: string) => {
  if (value[0] === ".") value = value.substring(1);
  if (value[0] === "/") value = value.substring(1);
  value = toWindowsPath(value);
  return value;
};

export const toUnixPath = (value: string) => {
  value = value.replace(/\\/g, "/");
  return value;
};

export const toWindowsPath = (value: string) => {
  value = value.replace(/\//g, "\\");
  return value;
};