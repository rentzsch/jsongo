import { JsongoFSDB } from "./JsongoFSDB";
import { createDBProxy } from "../shared";
import nodeFS from "fs";

interface FSDBProxy extends JsongoFSDB {
  // TODO key is a string other that own or reserved prop, that resolves to JsongoFSCollection | null
  [key: string]: any;
}

export const fsDB = (dirPath: string, fs?: typeof nodeFS): FSDBProxy =>
  createDBProxy(new JsongoFSDB({ dirPath, fs }));
