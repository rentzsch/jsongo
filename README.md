**Jsongo** is a simple, lightweight, yet flexible database system.

To use the [library](#library):

    $ yarn add jsongo

To use the `jsongo` [tool](#cli-tool):

    $ npm install --global jsongo

<h2 id="backgrounder">Backgrounder</h2>

It prioritizes human-friendliness and an obvious data format that's of archival quality (it's data should be able to be easily read far into the future past when JSON and Git are legacy technologies).

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

<h2 id="data-format">Data Format</h2>
<!---------------------------------->

Jsongo's data format is basically the same as [MongoDB's](https://en.wikipedia.org/wiki/MongoDB) semantic data model:

    Database <->> Collection <->> Document

On-disk, the database is represented as a directory and the collections as JSON files:

    database/
    └─collection.json

In general it's a bad idea to put non-Jsongo `*.json` files in a Jsongo database directory. The code assumes that all JSON files in a database is part of a database.

A collection has an array of Documents.

The Document format is a superset of JSON:

1. On-disk it's pretty-printed with 2-space indent (`JSON.stringify(, null, 2)`).
2. Object keys are sorted.
3. Records are sorted by their `_id`.

Sorting Object keys makes Jsongo even slower, but greatly aids in creating simple diffs and merging changes.

Keys are sorted with [Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) using the standard `compareFunction` (a custom one isn't supplied).

A Collection JSON file comes in one of two *shapes*, the default *Object shape* or the optional *Array shape*. I use the word "shape" here because the word format is already overloaded with two meanings (data format and format subcommand) in Jsongo.

Here's an example of a collection JSON file which has the default Object shape:

    {
      "fflintstone": {
        "firstName": "Fred",
        "lastName": "Flintstone"
      },
      "wflintstone": {
        "firstName": "Wilma",
        "lastName": "Flintstone"
      }
    }

Here's the same data in Array shape:

    [
      {
        "_id": "fflintstone",
        "firstName": "Fred",
        "lastName": "Flintstone"
      },
      {
        "_id": "wflintstone",
        "firstName": "Wilma",
        "lastName": "Flintstone"
      }
    ]

These are semantically equivalent.

Object shape is slightly smaller on disk, smaller in memory, faster to read, and initially faster to access (when looking up documents by their `_id`).

Array shape has the advantage that it exactly mirrors the in-memory the Jsongo client uses when using documents, it works better with `jsongo fmt` when hand-appending new documents (`fmt` will auto-insert missing `_id`s), and that it can more easily represent document which have compound `_id`'s.

<h2 id="Relations">Relations</h2>
<!---------------------------------->

When a document has a key that ends in `_id`, it's interpreted to mean a foreign key.

Consider `people.json` collection:

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

<h2 id="library">Library</h2>
<!-------------------------->

Usage example:

    const jsongo = require("jsongo");
    const db = jsongo.db({ dirPath: "path/to/simpsons-db" });
    const simpsonFamilyMembers = db.people.findAll({family_id:"Simpson"});
    console.log(simpsonFamilyMembers);
    =>
    {
      "Homer": {
        "family_id": "Simpson"
      },
      "Marge": {
        "family_id": "Simpson"
      },
      "Bart": {
        "family_id": "Simpson"
      },
      "Lisa": {
        "family_id": "Simpson"
      },
      "Maggie": {
        "family_id": "Simpson"
      }
    }

<!-- TODO FIX ordering above -->

<h2 id="cli-tool">CLI Tool</h2>
<!---------------------------->

Sorted by most commonly used:

<h3 id="jsongo-fmt"><code>jsongo fmt</code></h3>

Reads the collection json files, inserting an `_id` if the record doesn't already have one and pretty-printing the output.

<h3 id="jsongo-fsck"><code>jsongo fsck</code></h3>

Checks consistency of entire database.

<h3 id="jsongo-rewrite-id"><code>jsongo rewrite-id &lt;collection> &lt;oldid> &lt;newid></code></h3>

Makes it easy to replace an automatically generated `_id` with a semantic one.

    jsongo rewrite-id collection 5e58083b2459f248bcdc2032 fflintstone

<h3 id="jsongo-objectid"><code>jsongo objectid</code></h3>

When you need to generate a new ObjectID.

    $ jsongo objectid
    5e78113ce16c4b07694a2bf1
