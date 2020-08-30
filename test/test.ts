import { AJsongoDB, JsongoMemDB, JsongoFSDB } from "../lib/JsongoDB";
import { parseJsongoRelationName } from "../lib/JsongoCollection";

import test from "ava";
import { Volume } from "memfs";

import fs from "fs";

//
//
//

test("fsdb", (t) => {
  const [memFSDB, vol] = newMemFSDB();

  t.is(vol.readdirSync("/").length, 0);

  const collection = memFSDB.addNewCollection("uno");
  t.is(collection.count(), 0);
  collection.save({ name: "fred" });
  t.is(collection.count(), 1);
  collection.saveFile();

  t.deepEqual(vol.readdirSync("/"), ["uno.json"]);

  const jsonBuf: string = vol.readFileSync("/uno.json", "utf-8");
  const json = JSON.parse(jsonBuf);
  t.is(json[0].name, "fred");
});

test("parseJsongoRelationName", (t) => {
  t.is(parseJsongoRelationName(""), null);
  t.is(parseJsongoRelationName("_id"), null);
  t.is(parseJsongoRelationName("x_id"), "x");
  t.is(parseJsongoRelationName("camelCase_id"), "camelCase");
  t.is(parseJsongoRelationName("x(y_id)"), "y");
  t.is(parseJsongoRelationName("_id)"), null);
  t.is(parseJsongoRelationName("(_id)"), null);
  t.is(parseJsongoRelationName("comment(collection_id)"), "collection");
});
/*
test("fsck", (t) => {
  testAgainstMemAndMemFSDB(testDB);
  function testDB(db: AJsongoDB) {
    const person = db.addNewCollection("person");
    person.save({_id:"Homer", "spouse(person_id)":"Marge"});

    const fsckResults1 = person.fsck();
  }
});
*/
test("don't allow duplicate collection names", (t) => {
  testAgainstMemAndMemFSDB(testDB);
  function testDB(db: AJsongoDB) {
    db.addNewCollection("uno");
    t.throws(
      () => {
        db.addNewCollection("uno");
      },
      { name: "JsongoDuplicateCollectionName" }
    );
  }
});

function testAgainstMemAndMemFSDB(testFunc: Function) {
  [new JsongoMemDB(), newMemFSDB()[0]].map((db) => testFunc(db));
}

function newMemFSDB(): [JsongoFSDB, typeof fs] {
  const vol: typeof fs = Volume.fromJSON({}) as any;
  return [new JsongoFSDB({ dirPath: "/", fs: vol }), vol];
}

function toVolumeJSON(volData: { [index: string]: string | object }) {
  const result: { [index: string]: string } = {};
  for (const [key, value] of Object.entries(volData)) {
    result[key] = JSON.stringify(value, null, 2);
  }
  return result;
}
