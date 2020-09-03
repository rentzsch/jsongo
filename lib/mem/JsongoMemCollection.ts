import { JsongoCollection } from "../shared";

//
// JsongoMemCollection
//

export class JsongoMemCollection extends JsongoCollection {
  _readAndParseJson(): void {
    this._docs = [];
  }
}
