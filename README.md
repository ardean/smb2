# @awo00/smb2

> A SMB2 implementation in TypeScript.

## Installation
```sh
$ npm i @awo00/smb2
```

## Usage
```ts
import smb2 from "@awo00/smb2";

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
