import { JsongoFSDB } from "./JsongoFSDB";
import { JsongoFSCollection } from "./JsongoFSCollection";
import { createDBProxy } from "../shared";
import nodeFS from "fs";

// type keyOfFSDB = keyof JsongoFSDB;
// type nonKeyOfFSDB = Exclude<string, keyOfFSDB>;

// interface FSDBProxy extends JsongoFSDB {
//   // TODO key is a string other that own or reserved prop, that resolves to
//   [key: nonKeyOfFSDB]: JsongoFSCollection | null;
// }

type FSDBProxy = JsongoFSDB & Record<string, JsongoFSCollection | null>;

export const fsDB = (dirPath: string, fs?: typeof nodeFS): FSDBProxy =>
  createDBProxy(new JsongoFSDB(dirPath, fs));
