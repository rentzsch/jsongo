import {
  AJsongoCollection,
  JsongoMemCollection,
  JsongoFSCollection,
} from "./JsongoCollection";
import fs from "fs";

//
// AJsongoDB
//

export abstract class AJsongoDB {
  _collections: Map<string, AJsongoCollection>;
  constructor() {
    this._collections = new Map();
  }
  collections(): Array<AJsongoCollection> {
    return Array.from(this._collections.values());
  }
  collectionWithName(collectionName: string): AJsongoCollection {
    const result = this.existingCollectionWithName(collectionName);
    if (result === null) {
      return this.addNewCollection(collectionName);
    } else {
      return result;
    }
  }
  existingCollectionWithName(collectionName: string): AJsongoCollection | null {
    const result = this._collections.get(collectionName);
    return result === undefined ? null : result;
  }
  abstract addNewCollection(collectionName: string): AJsongoCollection;
}

//
// JsongoMemDB
//

export class JsongoMemDB extends AJsongoDB {
  addNewCollection(collectionName: string): AJsongoCollection {
    if (this._collections.get(collectionName) !== undefined) {
      const err = new Error(
        `JsongoFSDB.addNewCollection: ${collectionName} already exists`
      );
      err.name = "JsongoDuplicateCollectionName";
      throw err;
    }
    const collection = new JsongoMemCollection({
      name: collectionName,
      db: this,
    });
    this._collections.set(collectionName, collection);
    return collection;
  }
}

//
// JsongoFSDB
//

export class JsongoFSDB extends AJsongoDB {
  _dirPath: string;
  _fs: typeof fs;

  constructor(args: JsongoFSDBCtr) {
    super();
    this._dirPath = args.dirPath;
    this._fs = args.fs ?? fs;
  }
  addNewCollection(collectionName: string): AJsongoCollection {
    if (this._collections.get(collectionName) !== undefined) {
      const err = new Error(
        `JsongoFSDB.addNewCollection: ${collectionName} already exists`
      );
      err.name = "JsongoDuplicateCollectionName";
      throw err;
    }
    const collection = new JsongoFSCollection({
      name: collectionName,
      db: this,
    });
    this._collections.set(collectionName, collection);
    return collection;
  }
  save() {
    for (const collection of this._collections.values()) {
      collection.saveFile();
    }
  }
}

interface JsongoFSDBCtr {
  dirPath: string;
  fs?: typeof fs;
}
