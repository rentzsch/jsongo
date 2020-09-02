import { JsongoMemDB } from "./JsongoMemDB";
import { createDBProxy } from "../shared";

export const memDB = () => createDBProxy(new JsongoMemDB());
