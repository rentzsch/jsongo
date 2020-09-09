import { JsongoMemCollection } from "./JsongoMemCollection";
import { JsongoDB, DuplicateCollectionName } from "../shared";

//
// JsongoMemDB
//

export class JsongoMemDB extends JsongoDB<JsongoMemCollection> {
  protected _collections: Map<string, JsongoMemCollection> = new Map();

  addNewCollection(collectionName: string): JsongoMemCollection {
    if (this._collections.get(collectionName) !== undefined) {
      throw new DuplicateCollectionName(collectionName);
    }
    const collection = new JsongoMemCollection(collectionName, this);
    this._collections.set(collectionName, collection);
    return collection;
  }
}
