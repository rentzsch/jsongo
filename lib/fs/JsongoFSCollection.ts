import { JsongoFSDB } from "./JsongoFSDB";
import { JsongoCollection, InputDoc, JsongoDoc } from "../shared";
import path from "path";
import fs from "fs";

//
// JsongoFSCollection
//

export class JsongoFSCollection extends JsongoCollection<JsongoFSDB> {
  protected _readAndParseJson(): void {
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

  insertOne(doc: InputDoc): JsongoDoc {
    const newDoc = super.insertOne(doc);
    this._saveFile();
    return newDoc;
  }

  insertMany(docs: Array<InputDoc>): Array<JsongoDoc> {
    const newDocs = super.insertMany(docs);
    this._saveFile();
    return newDocs;
  }

  upsertOne(doc: InputDoc): JsongoDoc {
    const newDoc = super.upsertOne(doc);
    this._saveFile();
    return newDoc;
  }

  upsertMany(docs: Array<InputDoc>): Array<JsongoDoc> {
    const newDocs = super.upsertMany(docs);
    this._saveFile();
    return newDocs;
  }

  deleteOne(criteria: object): { deletedCount: number } {
    const res = super.deleteOne(criteria);
    if (res.deletedCount > 0) {
      this._saveFile();
    }
    return res;
  }

  deleteMany(criteria: object): { deletedCount: number } {
    const res = super.deleteMany(criteria);
    if (res.deletedCount > 0) {
      this._saveFile();
    }
    return res;
  }

  _saveFile(): void {
    this._fs().writeFileSync(this._filePath(), this.toJson() + "\n");
  }

  private _filePath(): string {
    // Note: path.format({dir:"/", name:"uno", ext:".json"}) returns "//uno.json", which is weird but seemingly harmless.
    return path.format({
      dir: this._fsdb().dirPath(),
      name: this._name,
      ext: ".json",
    });
  }

  private _fsdb(): JsongoFSDB {
    return this._db as JsongoFSDB;
  }

  private _fs(): typeof fs {
    return this._fsdb().fs();
  }

  static parseFileName(fileName: string): string {
    return path.parse(fileName).name;
  }
}
