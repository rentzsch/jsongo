import * as dbTest from "../shared/JsongoDB.test";
import { JsongoMemDB } from "../../lib";
import test from "ava";

//
// JsongoDB
//

test("memdb.collections()", (t) => {
  dbTest.collections(t, new JsongoMemDB());
});

test("memdb.collectionNames()", (t) => {
  dbTest.collectionNames(t, new JsongoMemDB());
});

test("memdb.collectionWithName()", (t) => {
  dbTest.collectionWithName(t, new JsongoMemDB());
});

test("memdb.existingCollectionWithName()", (t) => {
  dbTest.existingCollectionWithName(t, new JsongoMemDB());
});

//
// JsongoMemDB
//

test("memdb._collections", (t) => {
  const db = new JsongoMemDB();
  t.deepEqual(db["_collections"], new Map()); // initialized
});

test("memdb.addNewCollection()", (t) => {
  dbTest.addNewCollection(t, new JsongoMemDB());
});

test("fsdb.dropCollection()", (t) => {
  dbTest.dropCollection(t, new JsongoMemDB());
});
