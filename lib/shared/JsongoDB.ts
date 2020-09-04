import { JsongoCollection } from "./JsongoCollection";

//
// JsongoDB
//

export abstract class JsongoDB {
  _collections: Map<string, JsongoCollection>;
  constructor() {
    this._collections = new Map();
  }
  collections(): Array<JsongoCollection> {
    return Array.from(this._collections.values());
  }
  collectionWithName(collectionName: string): JsongoCollection {
    const result = this.existingCollectionWithName(collectionName);
    if (result === null) {
      return this.addNewCollection(collectionName);
    } else {
      return result;
    }
  }
  existingCollectionWithName(collectionName: string): JsongoCollection | null {
    const result = this._collections.get(collectionName);
    return result === undefined ? null : result;
  }
  abstract addNewCollection(collectionName: string): JsongoCollection;
  abstract save(): void;
}
