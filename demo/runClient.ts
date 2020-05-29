import smb2 from "../src";

const directoryName = "/directory";
const filename = "/file.txt";

export default async (host: string, domain: string, username: string, password: string, share: string) => {
  try {
    const client = new smb2.Client(host);
    const session = await client.authenticate({
      domain,
      username,
      password
    });
    const tree = await session.connectTree(share);

    const entries = await tree.readDirectory("/");
    console.log(entries);

    const unwatch = await tree.watch(response => {
      console.log("changed", response.data);
    });

    if (!await tree.exists(directoryName)) await tree.createDirectory(directoryName);
    console.log("directory content", await tree.readDirectory(directoryName));

    if (!await tree.exists(`${directoryName}/${filename}`)) await tree.createFile(`${directoryName}/${filename}`, "1234");
    console.log("file content", (await tree.readFile(`${directoryName}/${filename}`)).toString());
    setTimeout(async () => {
      try {
        await tree.removeFile(`${directoryName}/${filename}`);
      } catch (err) {
        console.error("failed remove file", err);
      }
    }, 3 * 1000);

    setTimeout(async () => {
      try {
        await tree.removeDirectory(directoryName);
      } catch (err) {
        console.error("failed remove dir", err);
      }
    }, 5 * 1000);

    setTimeout(async () => {
      await unwatch();
      console.log("no longer watching");

      await client.close();
      console.log("client closed");
    }, 8 * 1000);
  } catch (err) {
    console.error("error", err);
  }
};