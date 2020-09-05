import { JsongoMemDB } from "./JsongoMemDB";
import { JsongoCollection } from "../shared";

//
// JsongoMemCollection
//

export class JsongoMemCollection extends JsongoCollection<JsongoMemDB> {
  _readAndParseJson(): void {
    this._docs = [];
  }
}
