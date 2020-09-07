import { JsongoMemCollection } from "./JsongoMemCollection";
import { JsongoDB } from "../shared";

//
// JsongoMemDB
//

export class JsongoMemDB extends JsongoDB<JsongoMemCollection> {
  protected _collections: Map<string, JsongoMemCollection> = new Map();

  addNewCollection(collectionName: string): JsongoMemCollection {
    if (this._collections.get(collectionName) !== undefined) {
      const err = new Error(
        `JsongoMemDB.addNewCollection: ${collectionName} already exists`
      );
      err.name = "JsongoDuplicateCollectionName";
      throw err;
    }
    const collection = new JsongoMemCollection(collectionName, this);
    this._collections.set(collectionName, collection);
    return collection;
  }
}
