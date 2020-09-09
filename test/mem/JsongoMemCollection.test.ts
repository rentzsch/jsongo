import personFixture from "../fixtures/cartoon/person.json";
import { JsongoMemDB, JsongoMemCollection } from "../../lib";
import test from "ava";
import ObjectID from "bson-objectid";

//
// JsongoCollection
//

test("memdb.collection.count()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  t.is(person.count(), 0);

  person.insertMany(personFixture);
  t.is(person.count(), 15);
});

test("memdb.collection.docs()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  t.deepEqual(person.docs(), []);

  person.insertMany(personFixture);
  const docs = person.docs();
  t.is(docs.length, 15);
  docs.forEach((doc, idx) => t.like(doc, personFixture[idx]));
});

test.todo("memdb.collection.isDirty()");

test("memdb.collection.name()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  t.is(person.name(), "person");
});

//
// JsongoMemCollection
//

test("memdb.collection.find()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person.insertMany(personFixture);

  t.is(person.find({}).count(), 15); // all
  t.is(person.find({ family_id: "Simpson" }).count(), 5); // subset
  t.is(person.find({ family_id: "Monroe" }).count(), 0); // none
});

test("memdb.collection.findOne()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person.insertMany(personFixture);

  t.is(person.findOne({ _id: "Judy" })!.family_id, "Jetson"); // unique
  t.is(person.findOne({ family_id: "Jetson" })!._id, "Elroy"); // first
  t.is(person.findOne({ _id: "Welma" }), null); // non-existent
});

test("memdb.collection.findOneOrFail()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person.insertMany(personFixture);

  t.is(person.findOneOrFail({ _id: "Judy" })!.family_id, "Jetson");
  t.throws(() => person.findOneOrFail({ _id: "Welma" }));
});

test("memdb.collection.findAll()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person.insertMany(personFixture);

  const items = person.findAll({});
  t.truthy(Array.isArray(items));
  t.is(items.length, 15);
});

test("memdb.collection._prepareForInsert()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  const bart = person.insertOne({ name: "Bart" });

  // appends _id
  const autoGenId = person._prepareForInsert({ name: "Bart" })._id;
  t.true(ObjectID.isValid(autoGenId));

  // doesn't modify custom _id
  const lisa = person._prepareForInsert({ _id: "Lisa" });
  t.is(lisa._id, "Lisa");

  // throws on duplicate
  t.throws(() => person._prepareForInsert({ _id: bart._id }));

  // when passed a flag, removes the old record
  const bart2nd = person._prepareForInsert(
    { _id: bart._id, name: "Bart II" },
    true
  );
  t.is(person.findOne({ name: "Bart" }), null);
  t.is(bart2nd.name, "Bart II");
});

test("memdb.collection.insertOne()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  const homer = { name: "Homer" };

  t.is(person.count(), 0);
  person.insertOne(homer);

  const docs = person.findAll({});
  t.is(docs.length, 1);
  t.like(docs[0], homer);
  t.true(ObjectID.isValid(docs[0]._id));
});

test("memdb.collection.insertMany()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);

  const homer = { name: "Homer" };
  const bart = { name: "Bart" };
  const lisa = { name: "Lisa" };
  person.insertMany([homer, bart, lisa]);

  const docs = person.findAll({});
  t.is(docs.length, 3);
  docs.forEach((doc, idx) => t.like(doc, docs[idx]));

  // existing keys cause insert to fail fast
  t.throws(() => person.insertMany([{ name: "Marge" }, bart]));
  t.deepEqual(person.findAll({}), docs); // no changes
});

test("memdb.collection.upsertOne()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  const judy = { name: "Judy" };

  t.is(person.count(), 0);
  const res = person.upsertOne(judy); // same as insert
  t.true(res !== null);
  t.is(person.count(), 1);
  t.like(person.findOne({}), judy);

  const judy2nd = { _id: res!._id, name: "Judy II" };
  const matched = person.upsertOne(judy2nd);
  t.deepEqual(matched, judy2nd);
  t.is(person.count(), 1); // no new records
  t.deepEqual(person.findOne({}), judy2nd);
});

test("memdb.collection.deleteOne()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person.insertMany(personFixture);

  t.is(person.count(), 15);
  const res = person.deleteOne({ _id: "Bart" });
  t.is(res.deletedCount, 1);
  t.is(person.count(), 14);
  t.is(person.findOne({ _id: "Bart" }), null);
});

test("memdb.collection.deleteMany()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person.insertMany(personFixture);

  t.is(person.count(), 15); // before
  const res = person.deleteMany({ family_id: "Simpson" });
  t.is(person.count(), 10); // after
  t.is(res.deletedCount, 5); // diff

  const resBogus = person.deleteMany({ family_id: "bogus" });
  t.is(person.count(), 10); // not affected
  t.is(resBogus.deletedCount, 0);
});

test.todo("memdb.collection.toJsonObj()");

test.todo("memdb.collection.toJson()");

test.todo("memdb.collection.fsck()");

test.todo("memdb.collection._findDocumentIndex()");

test("memdb.collection._readAndParseJson()", (t) => {
  const db = new JsongoMemDB();
  const person = new JsongoMemCollection("person", db);
  person._readAndParseJson();
  t.deepEqual(person.docs(), []); // no-op
});
