import { JsongoFSCollection } from "./JsongoFSCollection";
import {
  JsongoDB,
  DuplicateCollectionName,
  CollectionNotFound,
} from "../shared";
import fs from "fs";

//
// JsongoFSDB
//

export class JsongoFSDB extends JsongoDB<JsongoFSCollection> {
  _collections: Map<string, JsongoFSCollection> = this._collectionsFromDir();
  _droppedCollections: Map<string, JsongoFSCollection> = new Map();

  constructor(protected _dirPath: string, protected _fs: typeof fs = fs) {
    super();
  }

  dirPath(): string {
    return this._dirPath;
  }

  fs(): typeof fs {
    return this._fs;
  }

  addNewCollection(collectionName: string): JsongoFSCollection {
    if (this._collections.get(collectionName) !== undefined) {
      throw new DuplicateCollectionName(collectionName);
    }
    const collection = new JsongoFSCollection(collectionName, this);
    this._collections.set(collectionName, collection);
    return collection;
  }

  dropCollection(collectionName: string): JsongoFSCollection {
    const collection = this._collections.get(collectionName);
    if (collection === undefined) {
      throw new CollectionNotFound(collectionName);
    }
    this._collections.delete(collectionName);
    this._droppedCollections.set(collectionName, collection);
    return collection;
  }

  save(): void {
    for (const collection of this._collections.values()) {
      // TODO check if _isDirty
      collection.save();
    }
    if (this._droppedCollections.size > 0) {
      for (const collection of this._droppedCollections.values()) {
        collection.remove();
      }
      this._droppedCollections.clear();
    }
  }

  private _jsonFileNames(): Array<string> {
    return this._fs
      .readdirSync(this._dirPath)
      .filter((fileName) => fileName.endsWith(".json"));
  }

  private _collectionsFromDir(): Map<string, JsongoFSCollection> {
    const collections = new Map();
    const jsonFileNames = this._jsonFileNames();

    for (const fileName of jsonFileNames) {
      const collectionName = JsongoFSCollection.parseFileName(fileName);
      const collection = new JsongoFSCollection(collectionName, this);
      collections.set(collectionName, collection);
    }

    return collections;
  }
}
