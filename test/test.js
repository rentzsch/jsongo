"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JsongoDB_1 = require("../lib/JsongoDB");
const JsongoCollection_1 = require("../lib/JsongoCollection");
const ava_1 = __importDefault(require("ava"));
const memfs_1 = require("memfs");
//
//
//
ava_1.default("fsdb", (t) => {
    const [memFSDB, vol] = newMemFSDB();
    t.is(vol.readdirSync("/").length, 0);
    const collection = memFSDB.addNewCollection("uno");
    t.is(collection.count(), 0);
    collection.save({ name: "fred" });
    t.is(collection.count(), 1);
    collection.saveFile();
    t.deepEqual(vol.readdirSync("/"), ["uno.json"]);
    const jsonBuf = vol.readFileSync("/uno.json", "utf-8");
    const json = JSON.parse(jsonBuf);
    t.is(json[0].name, "fred");
});
ava_1.default("parseJsongoRelationName", (t) => {
    t.is(JsongoCollection_1.parseJsongoRelationName(""), null);
    t.is(JsongoCollection_1.parseJsongoRelationName("_id"), null);
    t.is(JsongoCollection_1.parseJsongoRelationName("x_id"), "x");
    t.is(JsongoCollection_1.parseJsongoRelationName("camelCase_id"), "camelCase");
    t.is(JsongoCollection_1.parseJsongoRelationName("x(y_id)"), "y");
    t.is(JsongoCollection_1.parseJsongoRelationName("_id)"), null);
    t.is(JsongoCollection_1.parseJsongoRelationName("(_id)"), null);
    t.is(JsongoCollection_1.parseJsongoRelationName("comment(collection_id)"), "collection");
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
ava_1.default("don't allow duplicate collection names", (t) => {
    testAgainstMemAndMemFSDB(testDB);
    function testDB(db) {
        db.addNewCollection("uno");
        t.throws(() => {
            db.addNewCollection("uno");
        }, { name: "JsongoDuplicateCollectionName" });
    }
});
function testAgainstMemAndMemFSDB(testFunc) {
    [new JsongoDB_1.JsongoMemDB(), newMemFSDB()[0]].map((db) => testFunc(db));
}
function newMemFSDB() {
    const vol = memfs_1.Volume.fromJSON({});
    return [new JsongoDB_1.JsongoFSDB({ dirPath: "/", fs: vol }), vol];
}
function toVolumeJSON(volData) {
    const result = {};
    for (const [key, value] of Object.entries(volData)) {
        result[key] = JSON.stringify(value, null, 2);
    }
    return result;
}
