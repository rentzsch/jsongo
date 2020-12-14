import { homeFixture, personFixture } from "../fixtures";
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
  t.is(person.count(), 18);
}

export function docs(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;

  t.is(person["_docs"], null);
  t.deepEqual(person.docs(), []); // initializes

  person.insertMany(personFixture);
  const docs = person.docs();
  t.is(docs.length, 18);
  t.deepEqual(docs, personFixture);
}

export function name(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  t.is(person.name(), "person");
}

export function find(t: ExecutionContext, db: JsongoDB, CollectionClass: any) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.find({}).count(), 18); // all
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
  const home = new CollectionClass("car", db) as JsongoCollection;

  // smoke test
  const doc = { name: "Bart" };
  const bart = person.insertOne(doc);
  const docs = person.find({ _id: bart._id }).all();
  t.is(docs.length, 1);
  t.like(docs[0], doc);

  // smoke test with composite _id
  home.insertOne(homeFixture[1]);
  t.deepEqual(home.docs()[0], homeFixture[1]);

  // auto-generates _id
  t.true(typeof bart._id === "string" && ObjectID.isValid(bart._id));

  // accepts custom non-BSON _id
  const lisa = person.insertOne({ _id: "Lisa" });
  t.is(lisa._id, "Lisa");

  // fails on duplicate _id
  t.throws(() => person.insertOne({ _id: bart._id }), {
    name: "JsongoDuplicateDocumentID",
  });

  // fails on duplicate composite _id
  t.throws(() => home.insertOne(homeFixture[1]), {
    name: "JsongoDuplicateDocumentID",
  });
}

export function insertMany(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  const home = new CollectionClass("car", db) as JsongoCollection;

  // smoke test
  person.insertMany(personFixture);
  const persons = person.find({}).all();
  t.is(persons.length, 18);
  t.deepEqual(persons, personFixture);

  // smoke test with composite _id
  home.insertMany(homeFixture);
  const homes = home.find({}).all();
  t.is(homes.length, 4);
  t.deepEqual(homes, homeFixture);

  // fails on duplicate input _id
  t.throws(
    () => person.insertMany([{ _id: "Jill" }, { _id: "Bob" }, { _id: "Jill" }]),
    { name: "JsongoDuplicateInputID" }
  );
  t.is(person.count(), 18); // didn't change

  // fails on duplicate input composite _id
  const newHome = { _id: { family_id: "Jetson", person_id: "Elroy" } };
  t.throws(() => home.insertMany([newHome, newHome]), {
    name: "JsongoDuplicateInputID",
  });
  t.is(home.count(), 4);

  // fails on duplicate existing _id
  t.throws(
    () =>
      person.insertMany([{ name: "Ben" }, personFixture[5], { name: "Jane" }]),
    { name: "JsongoDuplicateDocumentID" }
  );
  t.is(person.count(), 18);

  // fails on duplicate existing composite _id
  t.throws(() => home.insertMany([newHome, homeFixture[2]]), {
    name: "JsongoDuplicateDocumentID",
  });
  t.is(home.count(), 4);
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
  t.true(typeof doc!._id === "string" && ObjectID.isValid(doc!._id));

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
  const home = new CollectionClass("car", db) as JsongoCollection;

  const homer = { name: "Homer" };
  const bart = { name: "Bart" };
  const lisa = { name: "Lisa", extra: "key" };
  person.insertMany([homer, bart, lisa]);
  const lisaId = person.findOne(lisa)!._id;

  const evergreenT = homeFixture[0];
  const walnutSt = homeFixture[1];
  home.insertMany([evergreenT, walnutSt]);
  const pikelandAve = homeFixture[3];

  // smoke test
  person.upsertMany([{ name: "Elroy" }, { _id: lisaId, name: "Lisa II" }]);
  const persons = person.find({}).all();
  t.is(persons.length, 4);
  t.deepEqual(persons[2], { _id: lisaId, name: "Lisa II" }); // extra key gone
  t.like(persons[3], { name: "Elroy" }); // inserted doc

  // smoke test with composite _id
  const updatedWalnutSt = { ...homeFixture[1], address: "58a Walnut St" };
  home.upsertMany([pikelandAve, updatedWalnutSt]);
  const homes = home.find({}).all();
  t.is(homes.length, 3);
  t.deepEqual(homes[1], updatedWalnutSt); // updated key
  t.deepEqual(homes[2], pikelandAve); // inserted doc

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

  t.is(person.count(), 18);
  const res = person.deleteOne({ _id: "Bart" });
  t.is(res.deletedCount, 1);
  t.is(person.count(), 17);
  t.is(person.findOne({ _id: "Bart" }), null);
}

export function deleteMany(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  person.insertMany(personFixture);

  t.is(person.count(), 18); // before
  const res = person.deleteMany({ family_id: "Simpson" });
  t.is(person.count(), 13); // after
  t.is(res.deletedCount, 5); // diff

  const resBogus = person.deleteMany({ family_id: "bogus" });
  t.is(person.count(), 13); // not affected
  t.is(resBogus.deletedCount, 0);
}

export function toJsonObj(
  t: ExecutionContext,
  db: JsongoDB,
  CollectionClass: any
) {
  const person = new CollectionClass("person", db) as JsongoCollection;
  const doc = {
    _id: {
      lastName: "Simpson",
      firstName: "Homer",
    },
    occupation: "Safety Inspector",
    children: ["Maggie", "Lisa", "Bart"], // should keep order
    dob: "1956-05-12",
    hair: "brown",
    location: "Springfield",
  };
  person.insertOne(doc);

  const [homer] = person.toJsonObj();

  t.deepEqual(
    JSON.stringify(homer),
    JSON.stringify({
      _id: {
        firstName: "Homer",
        lastName: "Simpson",
      },
      children: ["Maggie", "Lisa", "Bart"], // should keep order
      dob: "1956-05-12",
      hair: "brown",
      location: "Springfield",
      occupation: "Safety Inspector",
    })
  );
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
