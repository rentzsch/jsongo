import { JsongoMemDB } from "../../lib";
import test from "ava";

//
// JsongoDB
//

test("memdb.collections()", (t) => {
  const db = new JsongoMemDB();
  t.deepEqual(db.collections(), []);

  const family = db.addNewCollection("family");
  const people = db.addNewCollection("people");
  const pet = db.addNewCollection("pet");

  t.deepEqual(db.collections(), [family, people, pet]);
});

test("memdb.collectionNames()", (t) => {
  const db = new JsongoMemDB();
  t.deepEqual(db.collectionNames(), []);

  db.addNewCollection("family");
  db.addNewCollection("people");
  db.addNewCollection("pet");

  t.deepEqual(db.collectionNames(), ["family", "people", "pet"]);
});

test("memdb.collectionWithName()", (t) => {
  const db = new JsongoMemDB();

  const people = db.collectionWithName("people"); // new
  t.deepEqual(db.collections(), [people]);

  t.deepEqual(db.collectionWithName("people"), people); // same
  t.deepEqual(db.collections(), [people]); // didn't change
});

test("memdb.existingCollectionWithName()", (t) => {
  const db = new JsongoMemDB();

  t.is(db.existingCollectionWithName("people"), null);

  const people = db.addNewCollection("people");
  t.is(db.existingCollectionWithName("people"), people);
});

//
// JsongoMemDB
//

test("memdb.addNewCollection()", (t) => {
  const db = new JsongoMemDB();
  const people = db.addNewCollection("people");
  t.deepEqual(db.collections(), [people]);
  t.throws(
    () => {
      db.addNewCollection("people");
    },
    { name: "JsongoDuplicateCollectionName" }
  );
});
