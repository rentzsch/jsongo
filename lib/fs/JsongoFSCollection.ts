import { JsongoFSDB } from "./JsongoFSDB";
import { JsongoCollection, PartialDoc, JsongoDoc } from "../shared";
import path from "path";
import fs from "fs";

//
// JsongoFSCollection
//

export class JsongoFSCollection extends JsongoCollection {
  _readAndParseJson(): void {
    try {
      const jsonBuf = this._fs().readFileSync(this._filePath(), "utf-8");
      this._docs = JSON.parse(jsonBuf);
    } catch (ex) {
      if (ex.code === "ENOENT") {
        this._docs = [];
        this._isDirty = true;
        // console.log("ENOENT", this);
      } else {
        throw ex;
      }
    }
  }
  insertOne(doc: PartialDoc, updateOnDuplicateKey = false): JsongoDoc {
    const newDoc = super.insertOne(doc, updateOnDuplicateKey);
    this._saveFile();
    return newDoc;
  }
  _saveFile(): void {
    this._fs().writeFileSync(this._filePath(), this.toJson() + "\n");
  }
  _filePath(): string {
    // Note: path.format({dir:"/", name:"uno", ext:".json"}) returns "//uno.json", which is weird but seemingly harmless.
    return path.format({
      dir: this._fsdb()._dirPath,
      name: this._name,
      ext: ".json",
    });
  }
  _fsdb(): JsongoFSDB {
    return this._db as JsongoFSDB;
  }
  _fs(): typeof fs {
    return this._fsdb()._fs;
  }
}
