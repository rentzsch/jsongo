import { JsongoCollection } from "./JsongoCollection";

//
// JsongoDB
//

export abstract class JsongoDB<
  AJsongoCollection extends JsongoCollection<JsongoDB> = JsongoCollection<any>
> {
  protected abstract _collections: Map<string, AJsongoCollection>;

  collections(): Array<AJsongoCollection> {
    return Array.from(this._collections.values());
  }

  collectionNames(): Array<string> {
    return Array.from(this._collections.keys());
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

  abstract dropCollection(collectionName: string): AJsongoCollection;
}
