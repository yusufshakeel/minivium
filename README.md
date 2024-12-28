# minivium
Minimalistic JSON database.

[![Build Status](https://github.com/yusufshakeel/minivium/actions/workflows/ci.yml/badge.svg)](https://github.com/yusufshakeel/minivium/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yusufshakeel/minivium)
[![npm version](https://img.shields.io/badge/npm-0.1.17-blue.svg)](https://www.npmjs.com/package/minivium)
[![npm Downloads](https://img.shields.io/npm/dm/minivium.svg)](https://www.npmjs.com/package/minivium)

![img.webp](assets/img.webp)

## Features
* Minimalistic
* Atomic Writes
* JSON Database
* Query Language
* Schema Definition

## Table of Contents
* [Getting Started](#getting-started)
  * [Install the package](#install-the-package)
  * [Import](#import)
  * [Create schema registry and data directory](#create-schema-registry-and-data-directory)
    * [Collection](#Collection)
  * [Minivium reference](#minivium-reference)
  * [Initialise the collections](#initialise-the-collections)
  * [Drop collection](#drop-collection)
  * [Drop all collection](#drop-all-collection)
* [Query](#query)
  * [Insert](#insert)
  * [Select](#select)
  * [Update](#update)
  * [Delete](#delete)
* [Attributes](#attributes)
* [Alias for attributes](#alias-for-attributes)
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
* [Limit](#limit)
* [Offset](#offset)
* [Limit and Offset](#limit-and-offset)
* [Limitations](#limitations)
* [Contribution](#contribution)
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

We register our collections via `SchemaRegistry`.

The `dataDir` is the path to the data directory. 
Minivium will save the collection files in this directory.

```js
const dataDir = '/path/to/data';
const schemaRegistry = new SchemaRegistry({
  collections: [
    {
      name: 'users',
      columns: [
        { name: 'id', isUnique: true },
        { name: 'username', isRequired: true, isUnique: true },
        { name: 'email', isRequired: true, isUnique: true },
        { name: 'score', isRequired: true },
        { name: 'phoneNumber' },
        { name: 'status', isRequired: true },
        { name: 'createdAt', isRequired: true }
      ]
    }
  ]
});
```

#### Collection

A collection (similar to a table in PostgreSQL) consists of a name and columns.


| Attribute | Purpose                                                                                    |
|-----------|--------------------------------------------------------------------------------------------|
| name      | Name of the collection                                                                     |
| columns   | Array of columns. Can be set to empty array `[]` if we don't want strict schema structure. |

Attributes for columns.

| Attribute  | Purpose                                                                               |
|------------|---------------------------------------------------------------------------------------|
| name       | This is the name of the column                                                        |
| isRequired | Set this to `true` if you want the column to have a value. Default is `false`.        |
| isUnique   | Set this to `true` if you want the column to have a unique value. Default is `false`. |


### Minivium reference

```js
const db = minivium({ dataDir, schemaRegistry });
```

### Initialise the collections

This will create collections mentioned in the schema registry.
If a collection exists then it will be skipped.

```js
db.init();
```

### Drop collection

```js
db.dropCollection('users');
```

### Drop all collection

```js
db.dropAllCollections();
```

## Query

Syntax `query.type(collectionName, [data], [option])`

| Particular       | Purpose                                                             |
|------------------|---------------------------------------------------------------------|
| `type`           | This represents the query type. Example `insert` query.             |
| `collectionName` | This is the name of the collection we want the query to run on.     |
| `[data]`         | This represents the data to [insert](#insert) or [update](#update). |
| `[option]`       | (Optional) This is the option for the query.                        |

#### Option

| Option         | Purpose                                                                                                  |
|----------------|----------------------------------------------------------------------------------------------------------|
| `[where]`      | This represents the where clause and it consists of the common [operators](#operators-for-where-clause). |
| `[limit]`      | This helps in selecting the first N rows. Refer [limit](#limit)                                          |
| `[offset]`     | This helps in skipping M rows. Refer [offset](#offset)                                                   |
| `[attributes]` | This helps in selecting specific columns and also to give alias. Refer [attributes](#attributes)         |


### Insert

Syntax `insert(collectionName, dataToInsert)`

Where, `dataToInsert` is an object consisting of column names
and their values.

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

Syntax `select(collectionName, [option])`

Where, `option` consists fo the `where` clause.

Refer [Operators for where clause](#operators-for-where-clause)

```js
const rows = db.query.select(
  'users', 
  { where: { id } }
);
```
Don't pass the `option` with `where` clause if you want to select everything.

### Update

Syntax `update(collectionName, dataToUpdate, [option])`

```js
const updatedRowCount = db.query.update(
  'users',
  { phoneNumber: '1234' },
  { where: { id } }
);
```
**If `option` with `where` clause is not provided then all the rows will be updated.**

This behavior is similar to databases like PostgreSQL.

### Delete

Syntax `delete(collectionName, [option])`

```js
const deletedRowCount = db.query.delete(
  'users', 
  { where: { id } }
);
```
**If `option` with `where` clause is not provided then all the rows will be deleted.**

This behavior is similar to databases like PostgreSQL.

## Attributes

Set the `attributes` option to pick the desired columns.

```js
db.query.select('users', { attributes: ['id', 'username'] });
```

SQL equivalent

```sql
select id, username from users;
```

## Alias for attributes

Pass `[columnName, aliasName]` tuple in the `attributes` option to set an alias for a column.

```js
db.query.select(
  'users', 
  {
    attributes: [
      'id', 
      'username', 
      ['score', 'totalScore']
    ]
  }
);
```

SQL equivalent

```sql
select id, username, score as totalScore from users;
```

## Operators for where clause

Minivium comes with a simple query language that is inspired by Sequalize and Mango Query.

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

Alternatively,

```js
db.query.select(
  'users',
  {
    where: {
      status: 'active'
    }
  }
);
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

### Combination of `and` and `or`

```js
db.query.select(
  'users',
  {
    [Op.and]: [
      { status: 'active' },
      {
        [Op.or]: [
          { username: 'yusuf' },
          { score: { [Op.gte]: 40 } }
        ]
      }
    ]
  }
);
```

SQL equivalent

```sql
select * from users
where status = 'active' 
and (
  username = 'yusuf'
  or score >= 40
);
```

## Limit

Restricts the query to return only the first N rows from the collection.

```js
db.query.select('users', { limit: 3 });
```

SQL equivalent

```sql
select * from users limit 3;
```

A `{ limit: 0 }` means that the query will return 0 rows, regardless of the data in the collection.

**Limit must not be negative** 

## Offset

Skips a specified number of rows before starting to return rows from a query.

```js
db.query.select('users', { offset: 2 });
```

**Limit must not be negative**

## Limit and Offset

The `offset` clause is typically used in conjunction with the `limit` clause to implement pagination.
* offset `n`: Skips the first `n` rows.
* limit `m`: Returns the next `m` rows after the skipped rows.

```js
db.query.select('users', { limit: 3, offset: 3 });
```

SQL equivalent

```sql
select * from users limit 3 offset 3;
```

## Limitations

This will work well with small data (about 5MB). You may face performance issues with
larger data size because the content is serialized using `JSON.stringify` and
then saved in a file.

If you are planning to have more data then check out PostgreSQL.

## Contribution

[CONTRIBUTING.md](https://github.com/yusufshakeel/minivium/blob/main/CONTRIBUTING.md)

## License

It's free :smiley:

[MIT License](https://github.com/yusufshakeel/minivium/blob/main/LICENSE) Copyright (c) 2024 Yusuf Shakeel

## Donate

Feeling generous :smiley: [Donate via PayPal](https://www.paypal.me/yusufshakeel)
