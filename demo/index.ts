import runServer from "./runServer";
import runClient from "./runClient";

(async () => {
  const {
    HOST: host = "localhost",
    DOMAIN: domain = "domain",
    USERNAME: username = "test",
    PASSWORD: password = "1234",
    SHARE: share = "test"
  } = process.env;

  await runServer();
  // await runClient(host, domain, username, password, share);
})();