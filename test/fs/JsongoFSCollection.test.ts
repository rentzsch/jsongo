import { memFSDB } from "./utils";
import { personFixture } from "../fixtures";
import * as collectionTest from "../shared/JsongoCollection.test";
import { JsongoFSCollection, JsongoFSDB } from "../../lib";
import test from "ava";
import { Volume } from "memfs";
import fs from "fs";

//
// JsongoDB
//

test("fsdb.collection.count()", (t) => {
  collectionTest.count(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.docs()", (t) => {
  collectionTest.docs(t, memFSDB().db, JsongoFSCollection);
});

test.todo("fsdb.collection.isDirty()");

test("fsdb.collection.name()", (t) => {
  collectionTest.name(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.find()", (t) => {
  collectionTest.find(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.findOne()", (t) => {
  collectionTest.findOne(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.findOneOrFail()", (t) => {
  collectionTest.findOneOrFail(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.exists()", (t) => {
  collectionTest.exists(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.insertOne()", (t) => {
  collectionTest.insertOne(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.insertMany()", (t) => {
  collectionTest.insertMany(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.upsertOne()", (t) => {
  collectionTest.upsertOne(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.upsertMany()", (t) => {
  collectionTest.upsertMany(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.deleteOne()", (t) => {
  collectionTest.deleteOne(t, memFSDB().db, JsongoFSCollection);
});

test("fsdb.collection.deleteMany()", (t) => {
  collectionTest.deleteMany(t, memFSDB().db, JsongoFSCollection);
});

test.todo("fsdb.collection.toJsonObj()");

test.todo("fsdb.collection.toJson()");

test.todo("fsdb.collection.fsck()");

test("fsdb.collection._findDocumentIndex()", (t) => {
  collectionTest._findDocumentIndex(t, memFSDB().db, JsongoFSCollection);
});

//
// JsongoFSCollection
//

test("fsdb.collection._readAndParseJson()", (t) => {
  const vol = Volume.fromJSON({
    "/db/person.json": `${JSON.stringify(personFixture, null, 2)}\n`,
  });
  const db = new JsongoFSDB("/db", (vol as unknown) as typeof fs);
  const person = db.existingCollectionWithName("person") as JsongoFSCollection;

  t.true(person !== null);
  t.deepEqual(person["_docs"], null); // uninitialized

  person["_readAndParseJson"]();
  t.deepEqual(person["_docs"], personFixture); // initialized
});

test("fsdb.collection.save()", (t) => {
  const { db, vol } = memFSDB("/path/to/db");
  const person = db.addNewCollection("person");
  person.insertMany(personFixture);

  db.save();
  t.deepEqual(vol.toJSON(), {
    "/path/to/db/person.json": `${JSON.stringify(personFixture, null, 2)}\n`,
  });
});

test("fsdb.collection.remove()", (t) => {
  const vol = Volume.fromJSON({
    "/db/person.json": `${JSON.stringify(personFixture, null, 2)}\n`,
    "/db/pet.json": "[]\n",
  });
  const db = new JsongoFSDB("/db", (vol as unknown) as typeof fs);
  const person = db.existingCollectionWithName("person") as JsongoFSCollection;

  person.remove();
  t.deepEqual(vol.toJSON(), { "/db/pet.json": "[]\n" });
});

test("fsdb.collection._filePath()", (t) => {
  const { db } = memFSDB("/path/to/db");
  const person = db.addNewCollection("person");
  t.is(person["_filePath"](), "/path/to/db/person.json");
});

test("fsdb.collection._fsdb()", (t) => {
  const { db } = memFSDB();
  const person = db.addNewCollection("person");
  t.is(person["_fsdb"](), db);
});

test("fsdb.collection._fs()", (t) => {
  const { db, vol } = memFSDB();
  const person = db.addNewCollection("person");
  t.is(person["_fs"](), (vol as unknown) as typeof fs);
});

test("JsongoFSCollection.parseFileName()", (t) => {
  const filename = "/path/to/some/file.json";
  t.is(JsongoFSCollection.parseFileName(filename), "file");
});
