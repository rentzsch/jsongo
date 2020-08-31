import { JsongoFSDB } from "./JsongoFSDB";
import nodeFS from "fs";

export const fsDB = (dirPath: string, fs?: typeof nodeFS) =>
  new JsongoFSDB({ dirPath, fs });
