import { JsongoFSDB } from "./JsongoFSDB";
import { AJsongoCollection } from "../shared";
import path from "path";
import fs from "fs";

//
// JsongoFSCollection
//

export class JsongoFSCollection extends AJsongoCollection {
  _readAndParseJson(): void {
    try {
      const jsonBuf = this._fs().readFileSync(this._filePath());
      this._docs = JSON.parse(jsonBuf as any);
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
  saveFile(): void {
    this._fs().writeFileSync(this._filePath(), this.toJson() + "\n");
  }
  _filePath() {
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
