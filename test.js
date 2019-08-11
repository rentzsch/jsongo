"use strict";

import test from "ava";
const ObjectID = require("bson-objectid");
const jsongo = require("./jsongo.js");

test("basic", async t => {
  const db = await jsongo.db({ dirPath: "/doesnotexist" });

  t.is((await db.collections()).length, 0);
  db.flintstones;
  t.is((await db.collections()).length, 1);
  db.flintstones;
  t.is((await db.collections()).length, 1);
  // db.flintstones.drop();
  // t.is((await db.collections()).length, 0);

  t.deepEqual(await db.flintstones.toJsonObj(), []);
  t.is(await db.flintstones.count(), 0);

  const pebbles = await db.flintstones.save({ firstName: "Pebbles" });
  t.is(await db.flintstones.count(), 1);
  t.not(pebbles._id, undefined);
  t.is(pebbles.firstName, "Pebbles");
  t.deepEqual(await db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    }
  ]);

  const pebbles2 = await db.flintstones.save({ firstName: "Pebbles" });
  t.is(await db.flintstones.count(), 2);
  t.not(pebbles2._id, undefined);
  t.not(pebbles2._id, pebbles._id);
  t.is(pebbles2.firstName, "Pebbles");
  t.deepEqual(await db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    },
    {
      _id: pebbles2._id,
      firstName: "Pebbles"
    }
  ]);

  t.is((await db.flintstones.deleteOne(pebbles2)).deletedCount, 1);
  t.is(await db.flintstones.count(), 1);
  t.deepEqual(await db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    }
  ]);

  t.is((await db.flintstones.deleteOne(pebbles2)).deletedCount, 0);
  t.is(await db.flintstones.count(), 1);
  t.deepEqual(await db.flintstones.toJsonObj(), [
    {
      _id: pebbles._id,
      firstName: "Pebbles"
    }
  ]);

  const fred = await db.flintstones.save({
    firstName: "Fred",
    children: [pebbles._id]
  });
  t.is(await db.flintstones.count(), 2);
  t.deepEqual(await db.flintstones.toJsonObj(), [
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
  await db.flintstones.save(pebbles);
  t.is(await db.flintstones.count(), 2);
  t.deepEqual(await db.flintstones.toJsonObj(), [
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

  const pebblesFound = await db.flintstones.findOne({ _id: pebbles._id });
  t.deepEqual(pebblesFound, {
    _id: pebbles._id,
    firstName: "Pebbles",
    parent: fred._id
  });

  await db.flintstones.upsert({ firstName: "Wilma" });
  t.is(await db.flintstones.count(), 3);

  await db.flintstones.upsert({ firstName: "Wilma" });
  t.is(await db.flintstones.count(), 3);
  t.not(await db.flintstones.findOne({ firstName: "Fred" }), null);

  await db.flintstones.deleteOne({ firstName: "Wilma" });
  t.is(await db.flintstones.count(), 2);
});

test("save no _id", async t => {
  const db = await jsongo.db({ dirPath: "/doesnotexist" });

  // Save new.

  t.is(await db.flintstones.count(), 0);
  const fred = await db.flintstones.save({
    firstName: "Fred"
  });
  t.is(await db.flintstones.count(), 1);
  t.true(ObjectID.isValid(fred._id));
  t.deepEqual(fred, { _id: fred._id, firstName: "Fred" });

  // Update existing.

  const fred2 = await db.flintstones.save({
    _id: fred._id,
    firstName: "Fred",
    age: 42
  });
  t.is(await db.flintstones.count(), 1);
  t.deepEqual(fred2, { _id: fred._id, firstName: "Fred", age: 42 });
});

test("save custom _id", async t => {
  const db = await jsongo.db({ dirPath: "/doesnotexist" });

  // Save new.

  t.is(await db.flintstones.count(), 0);
  const fred = await db.flintstones.save({
    _id: "Fred"
  });
  t.is(await db.flintstones.count(), 1);
  t.deepEqual(fred, { _id: "Fred" });

  // Update existing.

  const fred2 = await db.flintstones.save({
    _id: "Fred",
    age: 42
  });
  t.is(await db.flintstones.count(), 1);
  t.deepEqual(fred2, { _id: "Fred", age: 42 });
});
