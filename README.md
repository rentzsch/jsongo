# jsongo

**Jsongo** is a simple, lightweight, yet flexible database system.

To install the [library](#library):

    $ yarn add jsongo

To use the `jsongo` [tool](#cli-tool):

    $ npx jsongo

To make `jsongo` tool globally available:

    $ npm install --global jsongo

## Backgrounder

Jsongo prioritizes human-friendliness and an obvious data format that's of archival quality (its data should be able to be easily read far into the future past when JSON and Git are legacy technologies).

It consists of a [data format](#data-format), a [code library](#library), and a [CLI tool](#cli-tool).

Pros:

- Freeform Record Format
- Human (Developer) Interaction Prioritized
- Highly Semantic
  - Simple and obvious named data files
  - Textually explorable
  - Archival Quality
  - Easily utilize semantic "callsign" primary keys
- Version Control Friendly
- Version Control Agnostic

Cons:

- Freeform Record Format
- Inefficient
  - Slow to load
  - Slow to search
  - Large on Disk (uncompressed)
  - Large in Memory
- Bad at long-form text, dates, and blobs
- Though intended for direct editing, JSON Extraneous Comma Syntax Error is irritating
- Easy to Add Inconsistent Information (no constraints mechanism)
- No concurrent writing (reading is fine)
- No change notifications
- Lossily sorts Record's keys when saved

## Data Format

Jsongo's data format is basically the same as [MongoDB's](https://en.wikipedia.org/wiki/MongoDB) semantic data model:

    Database <->> Collection <->> Document

On-disk, the database is represented as a directory and the collections as JSON files:

    database/
    └─collection.json

In general it's a bad idea to put non-Jsongo `*.json` files in a Jsongo database directory. The code assumes that all JSON files in a directory is part of a database.

A collection has an array of Documents.

The Document format is a superset of JSON:

1. On-disk it's pretty-printed with 2-space indent (`JSON.stringify(, null, 2)`).
2. Object keys are sorted.
3. Records are sorted by their `_id`.

Sorting Object keys makes Jsongo even slower, but greatly aids in creating simple diffs and merging changes.

Keys are sorted with [Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) using the standard `compareFunction` (a custom one isn't supplied).

## Relations

When a document has a key that ends in `_id`, it's interpreted to mean a foreign key.

Consider `person.json` collection:

```json
{
  "Homer": {
    "family_id": "Simpson"
  },
  "Marge": {
    "family_id": "Simpson"
  }
}
```

This implies a `family.json` with at least the following data:

```json
{
  "Simpson": {}
}
```

`jsongo fsck` will follow such relations and ensure they all exist.

<!-- TODO compound _id -->

## Library

Jsongo offers two database drivers:

- file system (using `.json` files)
- in-memory (using POJOs at runtime)

In Node, you can use either driver. For example:

```js
import { fsDB } from "jsongo";
const db = fsDB("./path/to/cartoon");
const simpsonFamilyMembers = db.person.find({ family_id: "Simpson" }).all();
console.log(simpsonFamilyMembers);
```

```json
[
  {
    "_id": "Bart",
    "family_id": "Simpson"
  },
  {
    "_id": "Homer",
    "family_id": "Simpson"
  },
  {
    "_id": "Lisa",
    "family_id": "Simpson"
  },
  {
    "_id": "Maggie",
    "family_id": "Simpson"
  },
  {
    "_id": "Marge",
    "family_id": "Simpson"
  }
]
```

<!-- TODO FIX ordering above -->

In browsers, use the memory driver:

```js
import { memDB } from "jsongo";
const db = memDB();
```

For more examples including project configuration, see [`/examples`](./examples).

## CLI Tool

Sorted by most commonly used:

### `jsongo fmt --dataDir <path>`

Reads the collection json files, inserting an `_id` if the record doesn't already have one and pretty-printing the output.

### `jsongo fsck --dataDir <path>`

Checks consistency of entire database.

### `jsongo ls --dataDir <path>`

Lists names of the database collections.

### `jsongo rewrite-id --dataDir <path> --collection <name> --oldID <object_id> --newID <object_id>`

Makes it easy to replace an automatically generated `_id` with a semantic one.

    jsongo rewrite-id --dataDir data --collection person --oldID 5e58083b2459f248bcdc2032 --newID fflintstone

### `jsongo objectid --times [number]`

When you need to generate a new ObjectID.

    $ jsongo objectid
    5e78113ce16c4b07694a2bf1

    $ jsongo objectid --times 3
    5f53202fe9f96f47744b482b
    5f53202fe9f96f47744b482c
    5f53202fe9f96f47744b482d

### `jsongo eval --dataDir <path> --code <string>`

Runs JavaScript code with access to a local `db` var.

    $ jsongo eval --code "db.person.find({}).all()"
    [ { _id: '5f531ca259e05c432b15aa89', name: 'Jeff' } ]
