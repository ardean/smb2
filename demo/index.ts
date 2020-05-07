import Connection from "../src";

const directoryName = "/directory/";
const filename = "/file.txt";

(async () => {
  try {
    const {
      HOST: host,
      USERNAME: username,
      PASSWORD: password,
      SHARE: share
    } = process.env;

    if (
      !host ||
      !share ||
      !username ||
      !password
    ) throw new Error("HOST, SHARE, USERNAME & PASSWORD env var required");

    const connection = new Connection(host);
    const session = await connection.authenticate({
      domain: "domain",
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

      await connection.close();
      console.log("connection closed");
    }, 8 * 1000);
  } catch (err) {
    console.error(err);
  }
})();