# @stifani/smb2

> A SMB2 implementation in TypeScript.

[![Github Version](https://img.shields.io/github/release/ardean/smb2.svg)](https://github.com/ardean/smb2)
[![NPM Version](https://img.shields.io/npm/v/@stifani/smb2.svg)](https://npmjs.org/package/@stifani/smb2)
[![NPM Downloads](https://img.shields.io/npm/dm/@stifani/smb2.svg)](https://npmjs.org/package/@stifani/smb2)
[![License](https://img.shields.io/npm/l/@stifani/smb2.svg)](LICENSE.md)
[![CircleCI](https://circleci.com/gh/ardean/smb2.svg?style=svg)](https://circleci.com/gh/ardean/smb2)

## Installation
```sh
$ npm i @stifani/smb2
```

## Usage
```js
import SmbConnection from "@stifani/smb2";

const connection = new Connection(host);
const session = await connection.authenticate({
  domain: "domain",
  username,
  password
});
const tree = await session.connectTree(share);

const entries = await tree.readDirectory("/");
console.log(entries);
```

## Features

- watch shares for file and directory changes
- create, read & remove files
- create, list & remove directories
- check directory/file exists

## License

[MIT](LICENSE.md)