import { JsongoMemDB } from "./JsongoMemDB";
import { JsongoMemCollection } from "./JsongoMemCollection";
import { createDBProxy, DBProxy } from "../shared";

export type MemDBProxy = DBProxy<JsongoMemDB, JsongoMemCollection>;

export const memDB = (): MemDBProxy => createDBProxy(new JsongoMemDB());
