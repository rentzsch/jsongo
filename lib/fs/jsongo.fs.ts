import { JsongoFSDB } from "./JsongoFSDB";
import { JsongoFSCollection } from "./JsongoFSCollection";
import { createDBProxy, DBProxy } from "../shared";
import nodeFS from "fs";

export type FSDBProxy = DBProxy<JsongoFSDB, JsongoFSCollection>;

export const fsDB = (dirPath: string, fs?: typeof nodeFS): FSDBProxy =>
  createDBProxy(new JsongoFSDB(dirPath, fs));
