import { JsongoFSDB } from "../../lib";
import { Volume } from "memfs";
import fs from "fs";

export function memFSDB(dirPath?: string) {
  const vol = Volume.fromJSON({});
  if (dirPath) {
    vol.mkdirpSync(dirPath);
  } else {
    dirPath = "/";
  }
  const db = new JsongoFSDB(dirPath, (vol as unknown) as typeof fs);
  return { db, vol };
}
