import { JsongoCollection } from "../shared";

//
// JsongoMemCollection
//

export class JsongoMemCollection extends JsongoCollection {
  _readAndParseJson(): void {
    this._docs = [];
  }
  saveFile(): void {
    // No-op since the docs are already in memory.
  }
}
