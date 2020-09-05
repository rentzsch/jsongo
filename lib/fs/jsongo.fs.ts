import { JsongoFSDB } from "./JsongoFSDB";
import { JsongoFSCollection } from "./JsongoFSCollection";
import { createDBProxy } from "../shared";
import nodeFS from "fs";

export const fsDB = (dirPath: string, fs?: typeof nodeFS) =>
  createDBProxy<JsongoFSDB, JsongoFSCollection>(new JsongoFSDB(dirPath, fs));
