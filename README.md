# minivium
Minimalistic JSON database.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yusufshakeel/minivium)
[![npm version](https://img.shields.io/badge/npm-0.1.0-blue.svg)](https://www.npmjs.com/package/minivium)
[![npm Downloads](https://img.shields.io/npm/dm/minivium.svg)](https://www.npmjs.com/package/minivium)

## Features
* Minimalistic
* Atomic writes
* JSON file database

## Getting started

Install the repository

```shell
npm i minivium
```

Import/Require

```js
// ESM
import { minivium } from "minivium";

// CommonJs
const { minivium } = require("minivium");
```

## Limits

This will work well with small data (less than 10MB).
If you are planning to have more data then check out PostgreSQL.

## License

It's free :smiley:

[MIT License](https://github.com/yusufshakeel/minivium/blob/main/LICENSE) Copyright (c) 2024 Yusuf Shakeel

### Donate

Feeling generous :smiley: [Donate via PayPal](https://www.paypal.me/yusufshakeel)