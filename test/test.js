"use strict";

const test = require("ava");
const ObjectID = require("bson-objectid");
const jsongo = require("../jsongo.js");

test("basic", t => {
  const db = jsongo.db({ dirPath: "/doesnotexist" });

  t.is(db.collections().length, 0);
  db.flintstones;
  t.is(db.collections().length, 1);
  db.flintstones;
  t.is(db.collections().length, 1);
  // db.flintstones.drop();
  // t.is((db.collections()).length, 0);

  t.deepEqual(db.flintstones.toJsonObj(), []);
  t.is(db.flintstones.count(), 0);

  const pebbles = db.flintstones.save({ firstName: "Pebbles" });
  t.is(db.flintstones.count(), 1);
  t.not(pebbles._id, undefined);
  t.is(pebbles.firstName, "Pebbles");
  t.deepEqual(db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    }
  ]);

  const pebbles2 = db.flintstones.save({ firstName: "Pebbles" });
  t.is(db.flintstones.count(), 2);
  t.not(pebbles2._id, undefined);
  t.not(pebbles2._id, pebbles._id);
  t.is(pebbles2.firstName, "Pebbles");
  t.deepEqual(db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    },
    {
      _id: pebbles2._id,
      firstName: "Pebbles"
    }
  ]);

  t.is(db.flintstones.deleteOne(pebbles2).deletedCount, 1);
  t.is(db.flintstones.count(), 1);
  t.deepEqual(db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    }
  ]);

  t.is(db.flintstones.deleteOne(pebbles2).deletedCount, 0);
  t.is(db.flintstones.count(), 1);
  t.deepEqual(db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    }
  ]);

  const fred = db.flintstones.save({
    firstName: "Fred",
    children: [pebbles._id]
  });
  t.is(db.flintstones.count(), 2);
  t.deepEqual(db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    },
    {
      _id: fred._id,
      firstName: "Fred",
      children: [pebbles._id]
    }
  ]);

  pebbles.parent = fred._id;
  db.flintstones.save(pebbles);
  t.is(db.flintstones.count(), 2);
  t.deepEqual(db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles",
      parent: fred._id
    },
    {
      _id: fred._id,
      firstName: "Fred",
      children: [pebbles._id]
    }
  ]);

  const pebblesFound = db.flintstones.findOne({ _id: pebbles._id });
  t.deepEqual(pebblesFound, {
    _id: pebbles._id,
    firstName: "Pebbles",
    parent: fred._id
  });

  db.flintstones.upsert({ firstName: "Wilma" });
  t.is(db.flintstones.count(), 3);

  db.flintstones.upsert({ firstName: "Wilma" });
  t.is(db.flintstones.count(), 3);
  t.not(db.flintstones.findOne({ firstName: "Fred" }), null);

  db.flintstones.deleteOne({ firstName: "Wilma" });
  t.is(db.flintstones.count(), 2);
});

test("save no _id", t => {
  const db = jsongo.db({ dirPath: "/doesnotexist" });

  // Save new.

  t.is(db.flintstones.count(), 0);
  const fred = db.flintstones.save({
    firstName: "Fred"
  });
  t.is(db.flintstones.count(), 1);
  t.true(ObjectID.isValid(fred._id));
  t.deepEqual(fred, { _id: fred._id, firstName: "Fred" });

  // Update existing.

  const fred2 = db.flintstones.save({
    _id: fred._id,
    firstName: "Fred",
    age: 42
  });
  t.is(db.flintstones.count(), 1);
  t.deepEqual(fred2, { _id: fred._id, firstName: "Fred", age: 42 });
});

test("save custom _id", t => {
  const db = jsongo.db({ dirPath: "/doesnotexist" });

  // Save new.

  t.is(db.flintstones.count(), 0);
  const fred = db.flintstones.save({
    _id: "Fred"
  });
  t.is(db.flintstones.count(), 1);
  t.deepEqual(fred, { _id: "Fred" });

  // Update existing.

  const fred2 = db.flintstones.save({
    _id: "Fred",
    age: 42
  });
  t.is(db.flintstones.count(), 1);
  t.deepEqual(fred2, { _id: "Fred", age: 42 });
});
