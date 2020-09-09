import peopleFixture from "../fixtures/cartoon/people.json";
import { JsongoMemDB, JsongoMemCollection } from "../../lib";
import test from "ava";
import ObjectID from "bson-objectid";

//
// JsongoCollection
//

test("memdb.collection.count()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  t.is(people.count(), 0);

  people.insertMany(peopleFixture);
  t.is(people.count(), 15);
});

test("memdb.collection.docs()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  t.deepEqual(people.docs(), []);

  people.insertMany(peopleFixture);
  const docs = people.docs();
  t.is(docs.length, 15);
  docs.forEach((doc, idx) => t.like(doc, peopleFixture[idx]));
});

test.todo("memdb.collection.isDirty()");

test("memdb.collection.name()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  t.is(people.name(), "people");
});

//
// JsongoMemCollection
//

test("memdb.collection.find()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people.insertMany(peopleFixture);

  t.is(people.find({}).count(), 15); // all
  t.is(people.find({ family_id: "Simpson" }).count(), 5); // subset
  t.is(people.find({ family_id: "Monroe" }).count(), 0); // none
});

test("memdb.collection.findOne()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people.insertMany(peopleFixture);

  t.is(people.findOne({ _id: "Judy" })!.family_id, "Jetson"); // unique
  t.is(people.findOne({ family_id: "Jetson" })!._id, "Elroy"); // first
  t.is(people.findOne({ _id: "Welma" }), null); // non-existent
});

test("memdb.collection.findOneOrFail()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people.insertMany(peopleFixture);

  t.is(people.findOneOrFail({ _id: "Judy" })!.family_id, "Jetson");
  t.throws(() => people.findOneOrFail({ _id: "Welma" }));
});

test("memdb.collection.findAll()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people.insertMany(peopleFixture);

  const items = people.findAll({});
  t.truthy(Array.isArray(items));
  t.is(items.length, 15);
});

test("memdb.collection._prepareForInsert()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  const bart = people.insertOne({ name: "Bart" });

  // appends _id
  const autoGenId = people._prepareForInsert({ name: "Bart" })._id;
  t.true(ObjectID.isValid(autoGenId));

  // doesn't modify custom _id
  const lisa = people._prepareForInsert({ _id: "Lisa" });
  t.is(lisa._id, "Lisa");

  // throws on duplicate
  t.throws(() => people._prepareForInsert({ _id: bart._id }));

  // when passed a flag, removes the old record
  const bart2nd = people._prepareForInsert(
    { _id: bart._id, name: "Bart II" },
    true
  );
  t.is(people.findOne({ name: "Bart" }), null);
  t.is(bart2nd.name, "Bart II");
});

test("memdb.collection.insertOne()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  const homer = { name: "Homer" };

  t.is(people.count(), 0);
  people.insertOne(homer);

  const docs = people.findAll({});
  t.is(docs.length, 1);
  t.like(docs[0], homer);
  t.true(ObjectID.isValid(docs[0]._id));
});

test("memdb.collection.insertMany()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);

  const homer = { name: "Homer" };
  const bart = { name: "Bart" };
  const lisa = { name: "Lisa" };
  people.insertMany([homer, bart, lisa]);

  const docs = people.findAll({});
  t.is(docs.length, 3);
  docs.forEach((doc, idx) => t.like(doc, docs[idx]));

  // existing keys cause insert to fail fast
  t.throws(() => people.insertMany([{ name: "Marge" }, bart]));
  t.deepEqual(people.findAll({}), docs); // no changes
});

test("memdb.collection.upsertOne()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  const judy = { name: "Judy" };

  t.is(people.count(), 0);
  const res = people.upsertOne(judy); // same as insert
  t.true(res !== null);
  t.is(people.count(), 1);
  t.like(people.findOne({}), judy);

  const judy2nd = { _id: res!._id, name: "Judy II" };
  const matched = people.upsertOne(judy2nd);
  t.deepEqual(matched, judy2nd);
  t.is(people.count(), 1); // no new records
  t.deepEqual(people.findOne({}), judy2nd);
});

test("memdb.collection.deleteOne()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people.insertMany(peopleFixture);

  t.is(people.count(), 15);
  const res = people.deleteOne({ _id: "Bart" });
  t.is(res.deletedCount, 1);
  t.is(people.count(), 14);
  t.is(people.findOne({ _id: "Bart" }), null);
});

test("memdb.collection.deleteMany()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people.insertMany(peopleFixture);

  t.is(people.count(), 15); // before
  const res = people.deleteMany({ family_id: "Simpson" });
  t.is(people.count(), 10); // after
  t.is(res.deletedCount, 5); // diff

  const resBogus = people.deleteMany({ family_id: "bogus" });
  t.is(people.count(), 10); // not affected
  t.is(resBogus.deletedCount, 0);
});

test.todo("memdb.collection.toJsonObj()");

test.todo("memdb.collection.toJson()");

test.todo("memdb.collection.fsck()");

test.todo("memdb.collection._findDocumentIndex()");

test("memdb.collection._readAndParseJson()", (t) => {
  const db = new JsongoMemDB();
  const people = new JsongoMemCollection("people", db);
  people._readAndParseJson();
  t.deepEqual(people.docs(), []); // no-op
});
