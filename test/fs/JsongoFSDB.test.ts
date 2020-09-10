import { memFSDB } from "./utils";
import { JsongoFSDB, JsongoFSCollection } from "../../lib";
import { petFixture } from "../fixtures";
import test from "ava";
import { Volume } from "memfs";
import fs from "fs";

//
// JsongoDB
//

test("fsdb.collections()", (t) => {
  const { db } = memFSDB();
  t.deepEqual(db.collections(), []);

  const family = db.addNewCollection("family");
  const person = db.addNewCollection("person");

  t.deepEqual(db.collections(), [family, person]);
});

test("fsdb.collectionNames()", (t) => {
  const { db } = memFSDB();
  t.deepEqual(db.collectionNames(), []);

  db.addNewCollection("family");
  db.addNewCollection("person");
  db.addNewCollection("pet");

  t.deepEqual(db.collectionNames(), ["family", "person", "pet"]);
});

test("fsdb.collectionWithName()", (t) => {
  const { db } = memFSDB();

  // creates a new collection
  const person = db.collectionWithName("person");
  t.deepEqual(db.collections(), [person]);

  // returns the existing collection
  t.deepEqual(db.collectionWithName("person"), person);
  t.deepEqual(db.collections(), [person]); // didn't change
});

test("fsdb.existingCollectionWithName()", (t) => {
  const { db } = memFSDB();

  t.is(db.existingCollectionWithName("person"), null);

  const person = db.addNewCollection("person");
  t.is(db.existingCollectionWithName("person"), person);
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
  const { db } = memFSDB();
  const person = db.addNewCollection("person");
  t.deepEqual(db.collections(), [person]);
  t.throws(
    () => {
      db.addNewCollection("person");
    },
    { name: "JsongoDuplicateCollectionName" }
  );
});

test("fsdb.dropCollection()", (t) => {
  const { db } = memFSDB();
  db.addNewCollection("person");
  const pet = db.addNewCollection("pet");

  db.dropCollection("person");
  t.deepEqual(db.collections(), [pet]);

  t.throws(
    () => {
      db.dropCollection("person");
    },
    { name: "JsongoCollectionNotFound" }
  );
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
