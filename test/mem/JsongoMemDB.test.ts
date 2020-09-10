import { JsongoMemDB } from "../../lib";
import test from "ava";

//
// JsongoDB
//

test("memdb.collections()", (t) => {
  const db = new JsongoMemDB();
  t.deepEqual(db.collections(), []);

  const family = db.addNewCollection("family");
  const person = db.addNewCollection("person");
  const pet = db.addNewCollection("pet");

  t.deepEqual(db.collections(), [family, person, pet]);
});

test("memdb.collectionNames()", (t) => {
  const db = new JsongoMemDB();
  t.deepEqual(db.collectionNames(), []);

  db.addNewCollection("family");
  db.addNewCollection("person");
  db.addNewCollection("pet");

  t.deepEqual(db.collectionNames(), ["family", "person", "pet"]);
});

test("memdb.collectionWithName()", (t) => {
  const db = new JsongoMemDB();

  // creates a new collection
  const person = db.collectionWithName("person");
  t.deepEqual(db.collections(), [person]);

  // returns the existing collection
  t.deepEqual(db.collectionWithName("person"), person);
  t.deepEqual(db.collections(), [person]); // didn't change
});

test("memdb.existingCollectionWithName()", (t) => {
  const db = new JsongoMemDB();

  t.is(db.existingCollectionWithName("person"), null);

  const person = db.addNewCollection("person");
  t.is(db.existingCollectionWithName("person"), person);
});

//
// JsongoMemDB
//

test("memdb._collections", (t) => {
  const db = new JsongoMemDB();
  t.deepEqual(db["_collections"], new Map()); // initialized
});

test("memdb.addNewCollection()", (t) => {
  const db = new JsongoMemDB();
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
  const db = new JsongoMemDB();
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
