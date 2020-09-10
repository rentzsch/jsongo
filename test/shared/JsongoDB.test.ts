import { JsongoDB } from "../../lib/shared";
import test, { ExecutionContext } from "ava";

test("test", (t) => t.pass()); // no-op

export function collections(t: ExecutionContext, db: JsongoDB) {
  t.deepEqual(db.collections(), []);

  const family = db.addNewCollection("family");
  const person = db.addNewCollection("person");
  const pet = db.addNewCollection("pet");

  t.deepEqual(db.collections(), [family, person, pet]);
}

export function collectionNames(t: ExecutionContext, db: JsongoDB) {
  t.deepEqual(db.collectionNames(), []);

  db.addNewCollection("family");
  db.addNewCollection("person");
  db.addNewCollection("pet");

  t.deepEqual(db.collectionNames(), ["family", "person", "pet"]);
}

export function collectionWithName(t: ExecutionContext, db: JsongoDB) {
  // creates a new collection
  const person = db.collectionWithName("person");
  t.deepEqual(db.collections(), [person]);

  // returns the existing collection
  t.deepEqual(db.collectionWithName("person"), person);
  t.deepEqual(db.collections(), [person]); // didn't change
}

export function existingCollectionWithName(t: ExecutionContext, db: JsongoDB) {
  t.is(db.existingCollectionWithName("person"), null);

  const person = db.addNewCollection("person");
  t.is(db.existingCollectionWithName("person"), person);
}

export function addNewCollection(t: ExecutionContext, db: JsongoDB) {
  const person = db.addNewCollection("person");
  t.deepEqual(db.collections(), [person]);
  t.throws(
    () => {
      db.addNewCollection("person");
    },
    { name: "JsongoDuplicateCollectionName" }
  );
}

export function dropCollection(t: ExecutionContext, db: JsongoDB) {
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
}
