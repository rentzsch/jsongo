"use strict";

const ObjectID = require("bson-objectid");
const mingo = require("mingo");
const sortKeys = require("sort-keys");
const valueOrJson = require("value-or-json");

const fs = require("fs");
const pathFormat = require("path").format;

function db({ dirPath }) {
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
  collections() {
    return this._collections;
  }
  save() {
    for (const collection of this._collections) {
      collection.saveFile();
    }
  }
}

class JsongoCollection {
  constructor({ db, name }) {
    this._db = db;
    this._name = name;
    // this._dirty = false; // TODO
  }
  save(document) {
    const docs = this.docs();
    if (document._id === undefined) {
      // Doesn't have an _id, it's an insert.
      document._id = ObjectID().toHexString();
    } else {
      // Has an _id, probably an update but may be an insert with a custom _id.
      const docIdx = this._findDocumentIndex(
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
  count() {
    return this.docs().length;
  }
  deleteOne(query) {
    const mingoQuery = new mingo.Query(query);
    const docIdx = this._findDocumentIndex(mingoQuery);
    if (docIdx === null) {
      return { deletedCount: 0 };
    } else {
      this.docs().splice(docIdx, 1);
      return { deletedCount: 1 };
    }
  }
  find(query) {
    return mingo.find(this.docs(), query);
  }
  findOne(query) {
    const cursor = this.find(query);
    if (cursor.hasNext()) {
      return cursor.next();
    } else {
      return null;
    }
  }
  docs() {
    if (this._docs === undefined) {
      try {
        const jsonBuf = fs.readFileSync(this._filePath());
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
  find(query) {
    const mingoQuery = new mingo.Query(query);
    return mingoQuery.find(this.docs());
  }
  upsert(doc) {
    let matchCount = 0;
    const mingoQuery = new mingo.Query(doc);
    for (const docItr of this.docs()) {
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
      return this.save(doc);
    }
  }
  toJsonObj() {
    const docs = this.docs();
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
  toJson() {
    return JSON.stringify(this.toJsonObj(), null, 2);
  }
  saveFile() {
    fs.writeFileSync(this._filePath(), this.toJson() + "\n");
  }
  //--
  _findDocumentIndex(mingoQuery) {
    const docs = this.docs();
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
