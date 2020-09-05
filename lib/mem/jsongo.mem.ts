import { JsongoMemDB } from "./JsongoMemDB";
import { JsongoMemCollection } from "./JsongoMemCollection";
import { createDBProxy } from "../shared";

export const memDB = () =>
  createDBProxy<JsongoMemDB, JsongoMemCollection>(new JsongoMemDB());
