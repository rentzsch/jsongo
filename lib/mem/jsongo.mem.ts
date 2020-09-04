import { JsongoMemDB } from "./JsongoMemDB";
import { createDBProxy } from "../shared";

interface MemDBProxy extends JsongoMemDB {
  // TODO key is a string other that own or reserved prop, that resolves to JsongoMemCollection | null
  [key: string]: any;
}

export const memDB = (): MemDBProxy => createDBProxy(new JsongoMemDB());
