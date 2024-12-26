# minivium
Minimalistic JSON database.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yusufshakeel/minivium)
[![npm version](https://img.shields.io/badge/npm-0.1.1-blue.svg)](https://www.npmjs.com/package/minivium)
[![npm Downloads](https://img.shields.io/npm/dm/minivium.svg)](https://www.npmjs.com/package/minivium)

![logo.webp](assets/logo.webp)

## Features
* Minimalistic
* Atomic writes
* JSON database
* Query language

## Table of Contents
* [Getting Started](#getting-started)
  * [Install the package](#install-the-package)
  * [Import](#import)
  * [Create schema registry and data directory](#create-schema-registry-and-data-directory)
  * [Initialise the collections](#initialise-the-collections)
  * [Drop collection](#drop-collection)
  * [Drop all collection](#drop-all-collection)
* [Query](#query)
  * [Insert](#insert)
  * [Select](#select)
  * [Update](#update)
  * [Delete](#delete)
* [Operators for where clause](#operators-for-where-clause)
  * [Equal](#equal-eq)
  * [Not equal](#not-equal-noteq)
  * [In](#in-in)
  * [Not in](#not-in-notin)
  * [Greater than](#greater-than-gt)
  * [Greater than or equal to](#greater-than-or-equal-to-gte)
  * [Less than](#less-than-lt)
  * [Less than or equal to](#less-than-or-equal-to-lte)
  * [Between](#between-between)
  * [And](#and-and)
  * [Or](#or-or)
* [Limitations](#limitations)
* [License](#license)
* [Donate](#donate)

## Getting started

Data is saved in JSON format in collections. A collection is like a table in relational
database. Each row is saved inside a collection and referred as document (or tuple).

Minivium comes with a simple query language inspired by Sequalize and Mango Query.

### Install the package

```shell
npm i minivium
```

### Import

```js
// ESM
import { minivium, SchemaRegistry } from "minivium";

// CommonJs
const { minivium, SchemaRegistry } = require("minivium");
```

### Create schema registry and data directory.

```js
const dataDir = '/path/to/data';
const schemaRegistry = new SchemaRegistry({
  collections: [
    {
      name: 'users',
      columns: [
        { name: 'username', isRequired: true },
        { name: 'email', isRequired: true },
        { name: 'score', isRequired: true },
        { name: 'phoneNumber' },
        { name: 'status', isRequired: true },
        { name: 'createdAt', isRequired: true }
      ]
    }
  ]
});
```

### Initialise the collections

```js
const db = minivium({ dataDir, schemaRegistry });
db.init();
```

### Drop collection

```js
const db = minivium({ dataDir, schemaRegistry });
db.dropCollection('users');
```

### Drop all collection

```js
const db = minivium({ dataDir, schemaRegistry });
db.dropAllCollections();
```

## Query

### Insert

```js
const id = db.query.insert('users', {
  username: 'yusufshakeel',
  email: 'yusufshakeel@example.com',
  score: 10,
  phoneNumber: '123',
  status: 'active',
  createdAt: '2024-12-26',
});
```

Where `id` is generated by minivium if not provided.

### Select

```js
const rows = db.query.select(
  'users', 
  { where: { id } }
);
```

### Update

```js
const updatedRowCount = db.query.update(
  'users',
  { phoneNumber: '1234' },
  { where: { id } }
);
```

### Delete

```js
const deletedRowCount = db.query.delete(
  'users', 
  { where: { id } }
);
```

## Operators for where clause

```js
// ESM
import { Op } from "minivium";

// CommonJs
const { Op } = require("minivium");
```

### Equal `eq`

```js
db.query.select(
  'users',
  { 
    where: { 
      status: { [Op.eq]: 'active' } 
    }
  }
);
```

SQL equivalent

```sql
select * from users where status = 'active';
```

### Not equal `notEq`

```js
db.query.select(
  'users',
  { 
    where: { 
      status: { [Op.notEq]: 'active' } 
    }
  }
);
```

SQL equivalent

```sql
select * from users where status != 'active';
```

### In `in`

```js
db.query.select(
  'users',
  { 
    where: {
      email: { [Op.in]: ['yusuf@example.com'] } 
    }
  }
);
```

SQL equivalent

```sql
select * from users 
where email in ['yusuf@example.com'];
```

### Not in `notIn`

```js
db.query.select(
  'users',
  { 
    where: {
      email: { [Op.notIn]: ['yusuf@example.com'] } 
    }
  }
);
```

SQL equivalent

```sql
select * from users 
where email not in ['yusuf@example.com'];
```

### Greater than `gt`

```js
db.query.select(
  'users',
  { 
    where: {
      score: { [Op.gt]: 10 } 
    }
  }
);
```

SQL equivalent

```sql
select * from users where score > 10;
```

### Greater than or equal to `gte`

```js
db.query.select(
  'users',
  { 
    where: {
      score: { [Op.gte]: 10 } 
    }
  }
);
```

SQL equivalent

```sql
select * from users where score >= 10;
```

### Less than `lt`

```js
db.query.select(
  'users',
  { 
    where: {
      score: { [Op.lt]: 10 } 
    }
  }
);
```

SQL equivalent

```sql
select * from users where score < 10;
```

### Less than or equal to `lte`

```js
db.query.select(
  'users',
  { 
    where: {
      score: { [Op.lte]: 10 } 
    }
  }
);
```

SQL equivalent

```sql
select * from users where score <= 10;
```

### Between `between`

```js
db.query.select(
  'users',
  { 
    where: {
      score: { [Op.between]: [10, 20] } 
    }
  }
);
```

SQL equivalent

```sql
select * from users
where score between 10 and 20;
```

### And `and`

```js
db.query.select(
  'users',
  { 
    where: {
      [Op.and]: [
        { status: 'active' },
        { score: { [Op.gte]: 40 } }
      ]
    }
  }
);
```

SQL equivalent

```sql
select * from users
where status = 'active' and score >= 40;
```

### Or `or`

```js
db.query.select(
  'users',
  { 
    where: {
      [Op.or]: [
        { status: 'active' },
        { score: { [Op.gte]: 40 } }
      ]
    }
  }
);
```

SQL equivalent

```sql
select * from users
where status = 'active' or score >= 40;
```


## Limitations

This will work well with small data (about 5MB). You may face performance issues with
larger data size because the content is serialized using `JSON.stringify` and
then saved in a file.

If you are planning to have more data then check out PostgreSQL.

## License

It's free :smiley:

[MIT License](https://github.com/yusufshakeel/minivium/blob/main/LICENSE) Copyright (c) 2024 Yusuf Shakeel

## Donate

Feeling generous :smiley: [Donate via PayPal](https://www.paypal.me/yusufshakeel)