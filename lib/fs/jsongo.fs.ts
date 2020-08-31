import { JsongoFSDB } from "./JsongoFSDB";
import nodeFS from "fs";

const db = (dirPath: string, fs?: typeof nodeFS) =>
  new JsongoFSDB({ dirPath, fs });

export default db;