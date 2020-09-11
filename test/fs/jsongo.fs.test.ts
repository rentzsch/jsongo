import { fsDB } from "../../lib";
import { personFixture, petFixture } from "../fixtures";
import { Volume } from "memfs";
import test from "ava";
import fs from "fs";

test("fsDB()", (t) => {
  const dirPath = "/path/to/db";
  const vol = Volume.fromJSON({
    [`${dirPath}/person.json`]: `${JSON.stringify(personFixture, null, 2)}\n`,
  });
  vol.mkdirpSync(dirPath);

  const db = fsDB(dirPath, (vol as unknown) as typeof fs);

  t.deepEqual(db.collectionNames(), ["person"]);
  t.deepEqual(db.person.docs(), personFixture); // existing collection

  db.pet.insertMany(petFixture);
  t.deepEqual(db.pet.docs(), petFixture); // new collection
});
