import {
  Server,
  serverAuthenticationProviders,
  serverShareProviders
} from "../src";

const { FileAuthenticationProvider } = serverAuthenticationProviders;
const { FileShareProvider } = serverShareProviders;

export default async () => {
  const server = new Server();

  const authenticationProvider = new FileAuthenticationProvider(`./users.json`);
  server.use(authenticationProvider);

  const shareProvider = new FileShareProvider(`./shares.json`);
  server.use(shareProvider);

  await server.init();
  await server.listen();
  console.log("server started on port", server.port);
};