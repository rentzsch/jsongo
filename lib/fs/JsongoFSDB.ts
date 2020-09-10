import { JsongoFSCollection } from "./JsongoFSCollection";
import { JsongoDB, DuplicateCollectionName } from "../shared";
import fs from "fs";

//
// JsongoFSDB
//

export class JsongoFSDB extends JsongoDB<JsongoFSCollection> {
  _collections: Map<string, JsongoFSCollection> = this._collectionsFromDir();

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

  save(): void {
    for (const collection of this._collections.values()) {
      // TODO check if _isDirty
      collection.save();
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
