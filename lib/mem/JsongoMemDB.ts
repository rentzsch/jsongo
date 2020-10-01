import { JsongoMemCollection } from "./JsongoMemCollection";
import {
  JsongoDB,
  DuplicateCollectionName,
  CollectionNotFound,
} from "../shared";

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

  dropCollection(collectionName: string): JsongoMemCollection {
    const collection = this._collections.get(collectionName);
    if (collection === undefined) {
      throw new CollectionNotFound(collectionName);
    }
    this._collections.delete(collectionName);
    return collection;
  }
}
