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

  const person = db.collectionWithName("person"); // new
  t.deepEqual(db.collections(), [person]);

  t.deepEqual(db.collectionWithName("person"), person); // same
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
