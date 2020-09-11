import * as collectionTest from "../shared/JsongoCollection.test";
import { JsongoMemDB, JsongoMemCollection } from "../../lib";
import test from "ava";

//
// JsongoCollection
//

test("memdb.collection.count()", (t) => {
  collectionTest.count(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.docs()", (t) => {
  collectionTest.docs(t, new JsongoMemDB(), JsongoMemCollection);
});

test.todo("memdb.collection.isDirty()");

test("memdb.collection.name()", (t) => {
  collectionTest.name(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.find()", (t) => {
  collectionTest.find(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.findOne()", (t) => {
  collectionTest.findOne(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.findOneOrFail()", (t) => {
  collectionTest.findOneOrFail(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.findAll()", (t) => {
  collectionTest.findAll(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.exists()", (t) => {
  collectionTest.exists(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.insertOne()", (t) => {
  collectionTest.insertOne(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.insertMany()", (t) => {
  collectionTest.insertMany(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.upsertOne()", (t) => {
  collectionTest.upsertOne(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.upsertMany()", (t) => {
  collectionTest.upsertMany(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.deleteOne()", (t) => {
  collectionTest.deleteOne(t, new JsongoMemDB(), JsongoMemCollection);
});

test("memdb.collection.deleteMany()", (t) => {
  collectionTest.deleteMany(t, new JsongoMemDB(), JsongoMemCollection);
});

test.todo("memdb.collection.toJsonObj()");

test.todo("memdb.collection.toJson()");

test.todo("memdb.collection.fsck()");

test("memdb.collection._findDocumentIndex()", (t) => {
  collectionTest._findDocumentIndex(t, new JsongoMemDB(), JsongoMemCollection);
});

//
// JsongoMemCollection
//

test("memdb.collection._readAndParseJson()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);

  t.deepEqual(person["_docs"], null); // uninitialized
  person["_readAndParseJson"]();
  t.deepEqual(person["_docs"], []); // initialized
});
