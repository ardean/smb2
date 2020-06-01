import { default as Client } from "./client/Client";

import { default as Server } from "./server/Server";

import ServerAuthenticationProvider from "./server/AuthenticationProvider";
import * as serverAuthenticationProviders from "./server/authenticationProviders";

import ServerShareProvider from "./server/ShareProvider";
import * as serverShareProviders from "./server/shareProviders";

export {
  Client,

  Server,

  ServerAuthenticationProvider,
  serverAuthenticationProviders,

  ServerShareProvider,
  serverShareProviders
};

export default {
  Client,

  Server,

  ServerAuthenticationProvider,
  serverAuthenticationProviders,

  ServerShareProvider,
  serverShareProviders
};