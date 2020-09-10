import { memFSDB } from "./utils";
import { petFixture } from "../fixtures";
import * as dbTest from "../shared/JsongoDB.test";
import { JsongoFSDB, JsongoFSCollection } from "../../lib";
import test from "ava";
import { Volume } from "memfs";
import fs from "fs";

//
// JsongoDB
//

test("memdb.collections()", (t) => {
  dbTest.collections(t, memFSDB().db);
});

test("fsdb.collectionNames()", (t) => {
  dbTest.collectionNames(t, memFSDB().db);
});

test("fsdb.collectionWithName()", (t) => {
  dbTest.collectionWithName(t, memFSDB().db);
});

test("fsdb.existingCollectionWithName()", (t) => {
  dbTest.existingCollectionWithName(t, memFSDB().db);
});

//
// JsongoFSDB
//

test("fsdb._collections", (t) => {
  const vol = Volume.fromJSON({
    "/db/person.json": "[]\n",
    "/db/extra.txt": "bogus text",
    "/db/pet.json": "[]\n",
  });
  const db = new JsongoFSDB("/db", (vol as unknown) as typeof fs);
  t.deepEqual([...db["_collections"].keys()], ["person", "pet"]); // initialized
});

test("fsdb.dirPath()", (t) => {
  const { db } = memFSDB("/path/to/db");
  t.is(db.dirPath(), "/path/to/db");
});

test("fsdb.fs()", (t) => {
  const { db, vol } = memFSDB();
  t.is(db.fs(), (vol as unknown) as typeof fs);
});

test("fsdb.addNewCollection()", (t) => {
  dbTest.addNewCollection(t, memFSDB().db);
});

test("fsdb.dropCollection()", (t) => {
  dbTest.dropCollection(t, memFSDB().db);
});

test("fsdb.save()", (t) => {
  const vol = Volume.fromJSON({
    "/db/person.json": "[]\n",
    "/db/pet.json": `${JSON.stringify(petFixture)}\n`,
  });
  const db = new JsongoFSDB("/db", (vol as unknown) as typeof fs);
  const pet = db.existingCollectionWithName("pet") as JsongoFSCollection;

  db.addNewCollection("family");
  db.dropCollection("person");
  pet.insertOne({ _id: "Fido", family_id: "Flintstone" });
  pet.deleteMany({ family_id: "Simpson" });
  pet.upsertOne({ _id: "Dino", family_id: "Jetson" });
  db.save();

  const expectedPetDocs = [
    { _id: "Astro", family_id: "Jetson" },
    { _id: "Dino", family_id: "Jetson" },
    { _id: "Fido", family_id: "Flintstone" },
  ];
  t.deepEqual(vol.toJSON(), {
    "/db/pet.json": `${JSON.stringify(expectedPetDocs, null, 2)}\n`,
    "/db/family.json": "[]\n",
  });
});
