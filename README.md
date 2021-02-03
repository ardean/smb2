# @bulentv/smb2

> A SMB2 implementation in TypeScript.

[![Github Version](https://img.shields.io/github/release/bulentv/smb2.svg)](https://github.com/ardean/smb2)
[![NPM Version](https://img.shields.io/npm/v/@bulentv/smb2.svg)](https://npmjs.org/package/@stifani/smb2)
[![NPM Downloads](https://img.shields.io/npm/dm/@bulentv/smb2.svg)](https://npmjs.org/package/@stifani/smb2)
[![License](https://img.shields.io/npm/l/@bulentv/smb2.svg)](LICENSE.md)

## Installation
```sh
$ npm i @bulentv/smb2
```

## Usage
```ts
import smb2 from "@bulentv/smb2";

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
- create, read & remove files
- create, list & remove directories
- check directory/file exists

## WIP
- SMB
- Server

## License

[MIT](LICENSE.md)
