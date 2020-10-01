import { personFixture } from "../fixtures";
import {
  parseJsongoRelationName,
  JsongoDB,
  JsongoCollection,
} from "../../lib/shared";
import test, { ExecutionContext } from "ava";
import ObjectID from "bson-objectid";

export function count(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  t.is(person.count(), 0);

  person.insertMany(personFixture);
  t.is(person.count(), 15);
}

export function docs(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;

  t.is(person["_docs"], null);
  t.deepEqual(person.docs(), []); // initializes

  person.insertMany(personFixture);
  const docs = person.docs();
  t.is(docs.length, 15);
  docs.forEach((doc, idx) => t.like(doc, personFixture[idx]));
}

export function name(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  t.is(person.name(), "person");
}

export function find(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.find({}).count(), 15); // all
  t.is(person.find({ family_id: "Simpson" }).count(), 5); // subset
  t.is(person.find({ family_id: "Monroe" }).count(), 0); // none
}

export function findOne(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.findOne({ _id: "Judy" })!.family_id, "Jetson"); // unique
  t.is(person.findOne({ family_id: "Jetson" })!._id, "Elroy"); // first
  t.is(person.findOne({ _id: "Welma" }), null); // non-existent
}

export function findOneOrFail(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.findOneOrFail({ _id: "Judy" }).family_id, "Jetson");
  t.throws(() => person.findOneOrFail({ _id: "Welma" }), {
    name: "JsongoDocumentNotFound",
  });
}

export function exists(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  t.false(person.exists({ name: "Bart" }));
  person.insertOne({ name: "Bart" });
  t.true(person.exists({ name: "Bart" }));
}

export function insertOne(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;

  // smoke test
  const doc = { name: "Bart" };
  const bart = person.insertOne(doc);
  const docs = person.find({ _id: bart._id }).all();
  t.is(docs.length, 1);
  t.like(docs[0], doc);

  // auto-generates _id
  t.true(ObjectID.isValid(bart._id));

  // accepts custom non-BSON _id
  const lisa = person.insertOne({ _id: "Lisa" });
  t.is(lisa._id, "Lisa");

  // fails on duplicate _id
  t.throws(() => person.insertOne({ _id: bart._id }), {
    name: "JsongoDuplicateDocumentID",
  });
}

export function insertMany(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;

  // smoke test
  person.insertMany(personFixture);
  const docs = person.find({}).all();
  t.is(docs.length, 15);
  docs.forEach((doc, idx) => t.like(doc, personFixture[idx]));

  // fails on duplicate input _id
  t.throws(
    () => person.insertMany([{ _id: "Jill" }, { _id: "Bob" }, { _id: "Jill" }]),
    { name: "JsongoDuplicateInputID" }
  );

  // fails on duplicate existing _id
  t.throws(
    () =>
      person.insertMany([{ name: "Ben" }, personFixture[5], { name: "Jane" }]),
    { name: "JsongoDuplicateDocumentID" }
  );
}

export function upsertOne(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  const judy = { name: "Judy", extra: "key" };

  // inserts a new doc
  t.is(person.count(), 0);
  person.upsertOne(judy);
  const doc = person.findOne(judy);
  t.is(person.count(), 1);
  t.like(doc, judy);
  t.true(ObjectID.isValid(doc!._id));

  // replaces when found a match
  const judy2nd = { _id: doc!._id, name: "Judy II" };
  person.upsertOne(judy2nd);
  const docs = person.find({}).all();
  t.is(docs.length, 1); // no new records
  t.deepEqual(docs[0], judy2nd); // extra key gone
}

export function upsertMany(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;

  const homer = { name: "Homer" };
  const bart = { name: "Bart" };
  const lisa = { name: "Lisa", extra: "key" };
  person.insertMany([homer, bart, lisa]);
  const lisaId = person.findOne(lisa)!._id;

  // smoke test
  person.upsertMany([{ name: "Elroy" }, { _id: lisaId, name: "Lisa II" }]);
  const docs = person.find({}).all();
  t.is(docs.length, 4);
  t.deepEqual(docs[2], { _id: lisaId, name: "Lisa II" }); // extra key gone
  t.like(docs[3], { name: "Elroy" });

  // fails on duplicate input _id
  t.throws(
    () => person.upsertMany([{ _id: "Marge" }, homer, { _id: "Marge" }]),
    { name: "JsongoDuplicateInputID" }
  );
}

export function deleteOne(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.count(), 15);
  const res = person.deleteOne({ _id: "Bart" });
  t.is(res.deletedCount, 1);
  t.is(person.count(), 14);
  t.is(person.findOne({ _id: "Bart" }), null);
}

export function deleteMany(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.count(), 15); // before
  const res = person.deleteMany({ family_id: "Simpson" });
  t.is(person.count(), 10); // after
  t.is(res.deletedCount, 5); // diff

  const resBogus = person.deleteMany({ family_id: "bogus" });
  t.is(person.count(), 10); // not affected
  t.is(resBogus.deletedCount, 0);
}

export function _findDocumentIndex(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person["_findDocumentIndex"]({ _id: "Betty" }), 3); // unique
  t.is(person["_findDocumentIndex"]({ family_id: "Flintstone" }), 5); // first match
  t.is(person["_findDocumentIndex"]({ _id: "Scooby" }), null); // bogus
}

test("db.collection.parseJsongoRelationName()", (t) => {
  t.is(parseJsongoRelationName(""), null);
  t.is(parseJsongoRelationName("_id"), null);
  t.is(parseJsongoRelationName("x_id"), "x");
  t.is(parseJsongoRelationName("camelCase_id"), "camelCase");
  t.is(parseJsongoRelationName("x(y_id)"), "y");
  t.is(parseJsongoRelationName("_id)"), null);
  t.is(parseJsongoRelationName("(_id)"), null);
  t.is(parseJsongoRelationName("comment(collection_id)"), "collection");
});
