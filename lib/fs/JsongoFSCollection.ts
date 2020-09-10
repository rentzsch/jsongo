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

  save(): void {
    this._saveFile();
  }

  remove(): void {
    this._removeFile();
  }

  private _saveFile(): void {
    this._fs().writeFileSync(this._filePath(), this.toJson() + "\n");
  }

  private _removeFile(): void {
    this._fs().unlinkSync(this._filePath());
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
    return this._db;
  }

  private _fs(): typeof fs {
    return this._fsdb().fs();
  }

  static parseFileName(fileName: string): string {
    return path.parse(fileName).name;
  }
}
