import { JsongoFSDB } from "./JsongoFSDB";
import { createDBProxy } from "../shared";
import nodeFS from "fs";

export const fsDB = (dirPath: string, fs?: typeof nodeFS) =>
  createDBProxy(new JsongoFSDB({ dirPath, fs }));
