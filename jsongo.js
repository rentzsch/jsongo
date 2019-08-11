"use strict";

const ObjectID = require("bson-objectid");
const mingo = require("mingo");
const sortKeys = require("sort-keys");
const valueOrJson = require("value-or-json");

const fs = require("fs");
const pathFormat = require("path").format;
const promisify = require("util").promisify;

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const accessAsync = promisify(fs.access);

async function db({ dirPath }) {
  const dbImpl = new JsongoDB(dirPath);
  return new Proxy(dbImpl, dbImpl._proxyHandlers());
}

class JsongoDB {
  constructor(dirPath) {
    this._dirPath = dirPath;
    this._collections = [];
  }
  _proxyHandlers() {
    const that = this;
    return {
      get: function(obj, prop) {
        if (prop === "then") return obj; // Promise detection.
        if (prop in obj) {
          return obj[prop];
        } else {
          const newCollection = new JsongoCollection({ db: that, name: prop });
          that._collections.push(newCollection);
          that[prop] = newCollection;
          return that[prop];
        }
      }
    };
  }
  async collections() {
    return this._collections;
  }
  async save() {
    for (const collection of this._collections) {
      await collection.saveFile();
    }
  }
}

class JsongoCollection {
  constructor({ db, name }) {
    this._db = db;
    this._name = name;
    // this._dirty = false; // TODO
  }
  async save(document) {
    const docs = await this.docs();
    if (document._id === undefined) {
      // Doesn't have an _id, it's an insert.
      document._id = ObjectID().toHexString();
    } else {
      // Has an _id, probably an update but may be an insert with a custom _id.
      const docIdx = await this._findDocumentIndex(
        new mingo.Query({ _id: document._id })
      );

      if (docIdx === null) {
        // Didn't find an existing document with the same _id, so it's an insert.
      } else {
        // It's an update, delete the original.
        docs.splice(docIdx, 1);
      }
    }
    docs.push(document);
    return document;
  }
  async count() {
    return (await this.docs()).length;
  }
  async deleteOne(query) {
    const mingoQuery = new mingo.Query(query);
    const docIdx = await this._findDocumentIndex(mingoQuery);
    if (docIdx === null) {
      return { deletedCount: 0 };
    } else {
      (await this.docs()).splice(docIdx, 1);
      return { deletedCount: 1 };
    }
  }
  async find(query) {
    return mingo.find(await this.docs(), query);
  }
  async findOne(query) {
    const cursor = await this.find(query);
    if (cursor.hasNext()) {
      return cursor.next();
    } else {
      return null;
    }
  }
  async docs() {
    if (this._docs === undefined) {
      try {
        const jsonBuf = await readFileAsync(this._filePath());
        this._docs = JSON.parse(jsonBuf);
      } catch (ex) {
        if (ex.code === "ENOENT") {
          this._docs = [];
        } else {
          throw ex;
        }
      }
    }
    return this._docs;
  }
  async find(query) {
    const mingoQuery = new mingo.Query(query);
    return mingoQuery.find(await this.docs());
  }
  async upsert(doc) {
    let matchCount = 0;
    const mingoQuery = new mingo.Query(doc);
    for (const docItr of await this.docs()) {
      if (mingoQuery.test(docItr)) {
        if (matchCount === 0) {
          doc._id = docItr._id;
        }
        matchCount++;
      }
    }

    if (matchCount > 1) {
      return null;
    } else {
      return await this.save(doc);
    }
  }
  async toJsonObj() {
    const docs = await this.docs();
    const sortedDocs = docs.sort(function(a, b) {
      const nameA = valueOrJson(a._id).toUpperCase(); // ignore upper and lowercase
      const nameB = valueOrJson(b._id).toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
    return sortedDocs.map(doc => sortKeys(doc, { deep: true }));
  }
  async toJson() {
    return JSON.stringify(await this.toJsonObj(), null, 2);
  }
  async saveFile() {
    await writeFileAsync(this._filePath(), (await this.toJson()) + "\n");
  }
  //--
  async _findDocumentIndex(mingoQuery) {
    const docs = await this.docs();
    for (let docIdx = 0; docIdx < docs.length; docIdx++) {
      if (mingoQuery.test(docs[docIdx])) {
        return docIdx;
      }
    }
    return null;
  }
  _filePath() {
    return pathFormat({
      dir: this._db._dirPath,
      name: this._name,
      ext: ".json"
    });
  }
}

module.exports = { db };
