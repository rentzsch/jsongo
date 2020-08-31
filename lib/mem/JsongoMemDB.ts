import { JsongoMemCollection } from "./JsongoMemCollection";
import { AJsongoDB, AJsongoCollection } from "../shared";

//
// JsongoMemDB
//

export class JsongoMemDB extends AJsongoDB {
  addNewCollection(collectionName: string): AJsongoCollection {
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
