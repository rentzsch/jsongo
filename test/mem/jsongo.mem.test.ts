import { memDB } from "../../lib";
import { personFixture, petFixture } from "../fixtures";
import test from "ava";

test("memDB()", (t) => {
  const db = memDB();
  const person = db.addNewCollection("person");
  person.insertMany(personFixture);

  t.deepEqual(db.collectionNames(), ["person"]);
  t.deepEqual(db.person.docs(), personFixture); // existing collection

  db.pet.insertMany(petFixture);
  t.deepEqual(db.pet.docs(), petFixture); // new collection
});
