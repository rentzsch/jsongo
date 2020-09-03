import { JsongoMemCollection } from "./JsongoMemCollection";
import { JsongoDB, JsongoCollection } from "../shared";

//
// JsongoMemDB
//

export class JsongoMemDB extends JsongoDB {
  addNewCollection(collectionName: string): JsongoCollection {
    if (this._collections.get(collectionName) !== undefined) {
      const err = new Error(
        `JsongoMemDB.addNewCollection: ${collectionName} already exists`
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
