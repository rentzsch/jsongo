import { AJsongoCollection } from "./JsongoCollection";

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
