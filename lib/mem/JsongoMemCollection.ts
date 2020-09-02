import { AJsongoCollection } from "../shared";

//
// JsongoMemCollection
//

export class JsongoMemCollection extends AJsongoCollection {
  _readAndParseJson(): void {
    this._docs = [];
  }
  saveFile(): void {
    // No-op since the docs are already in memory.
  }
}
