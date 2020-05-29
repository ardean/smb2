import { Server } from "../src";

export default async () => {
  const server = new Server();
  await server.listen();
  console.log("server started", server.port);
};