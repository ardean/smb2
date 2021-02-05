# @stifani/smb2

> A SMB2 implementation in TypeScript.

[![Github Version](https://img.shields.io/github/release/ardean/smb2.svg)](https://github.com/ardean/smb2)
[![NPM Version](https://img.shields.io/npm/v/@stifani/smb2.svg)](https://npmjs.org/package/@stifani/smb2)
[![NPM Downloads](https://img.shields.io/npm/dm/@stifani/smb2.svg)](https://npmjs.org/package/@stifani/smb2)
[![License](https://img.shields.io/npm/l/@stifani/smb2.svg)](LICENSE.md)

## Installation
```sh
$ npm i @stifani/smb2
```

## Usage
```ts
import smb2 from "@stifani/smb2";

const client = new smb2.Client(host);
const session = await client.authenticate({
  domain,
  username,
  password
});
const tree = await session.connectTree(share);

const entries = await tree.readDirectory("/");
console.log(entries);
```

## Features

### Client
- watch shares for file and directory changes
- create, read & remove & rename files
- create, list & remove & rename directories
- check directory/file exists

## WIP
- SMB
- Server

## License

[MIT](LICENSE.md)
