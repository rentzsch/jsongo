import { JsongoFSCollection } from "./JsongoFSCollection";
import { AJsongoDB, AJsongoCollection } from "../shared";
import fs from "fs";

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
