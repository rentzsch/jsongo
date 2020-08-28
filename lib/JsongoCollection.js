"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsongoFSCollection = exports.JsongoMemCollection = exports.parseJsongoRelationName = exports.AJsongoCollection = void 0;
const ObjectID = require("bson-objectid");
const mingo_1 = __importDefault(require("mingo"));
const query_1 = require("mingo/query");
const sortKeys = require("sort-keys");
const valueOrJson = require("value-or-json");
const path_1 = __importDefault(require("path"));
const util_1 = require("mingo/util");
//
// AJsongoCollection
//
class AJsongoCollection {
    constructor(args) {
        this._name = args.name;
        this._db = args.db;
        this._docs = null;
        this._isDirty = false;
    }
    find(criteria) {
        return mingo_1.default.find(this.docs(), criteria);
    }
    findOne(criteria) {
        const cursor = this.find(criteria);
        if (cursor.hasNext()) {
            return cursor.next();
        }
        else {
            return null;
        }
    }
    docs() {
        if (this._docs === null) {
            this._readAndParseJson();
        }
        return this._docs;
    }
    count() {
        return this.docs().length;
    }
    save(doc) {
        const docs = this.docs();
        if (doc._id === undefined) {
            // Doesn't have an _id, it's an insert.
            doc._id = ObjectID().toHexString();
        }
        else {
            // Has an _id, probably an update but may be an insert with a custom _id.
            const docIdx = this._findDocumentIndex(new query_1.Query({ _id: doc._id }));
            if (docIdx === null) {
                // Didn't find an existing document with the same _id, so it's an insert.
            }
            else {
                // It's an update, delete the original.
                docs.splice(docIdx, 1);
            }
        }
        docs.push(doc);
        return doc;
    }
    upsert(doc) {
        let matchCount = 0;
        const query = new mingo_1.default.Query(doc);
        for (const docItr of this.docs()) {
            if (query.test(docItr)) {
                if (matchCount === 0) {
                    doc._id = doc._id;
                }
                matchCount++;
            }
        }
        if (matchCount > 1) {
            return null;
        }
        else {
            return this.save(doc);
        }
    }
    deleteOne(criteria) {
        const query = new query_1.Query(criteria);
        const docIdx = this._findDocumentIndex(query);
        if (docIdx === null) {
            return { deletedCount: 0 };
        }
        else {
            this.docs().splice(docIdx, 1);
            return { deletedCount: 1 };
        }
    }
    isDirty() {
        return this._isDirty;
    }
    toJsonObj() {
        const docs = this.docs();
        const sortedDocs = docs.sort(function (a, b) {
            const nameA = valueOrJson(a._id).toUpperCase(); // ignore upper and lowercase
            const nameB = valueOrJson(b._id).toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            // names must be equal
            return 0;
        });
        return sortedDocs.map((doc) => sortKeys(doc, { deep: true }));
    }
    toJson() {
        return JSON.stringify(this.toJsonObj(), null, 2);
    }
    fsck() {
        const thisCollectionName = this._name;
        const thisDB = this._db;
        const errors = [];
        for (const docItr of this.docs()) {
        }
        function fsckDoc(doc) {
            for (const [key, value] of Object.entries(doc)) {
                const relationName = parseJsongoRelationName(key);
                if (relationName !== null) {
                    if (Array.isArray(value)) {
                        // TODO
                        util_1.assert(false, "TODO615");
                    }
                    else {
                        const relatedDocs = thisDB
                            .collectionWithName(relationName)
                            .find({ _id: value })
                            .all();
                        if (relatedDocs.length < 1) {
                            errors.push({
                                error: "No matching related document",
                                offending: {
                                    collection: thisCollectionName,
                                    doc,
                                    key,
                                },
                            });
                        }
                        else if (relatedDocs.length > 1) {
                            errors.push({
                                error: "More than one related document",
                                offending: {
                                    collection: thisCollectionName,
                                    doc,
                                    key,
                                },
                            });
                        }
                    }
                }
            }
        }
    }
    _findDocumentIndex(query) {
        const docs = this.docs();
        for (let docIdx = 0; docIdx < docs.length; docIdx++) {
            if (query.test(docs[docIdx])) {
                return docIdx;
            }
        }
        return null;
    }
}
exports.AJsongoCollection = AJsongoCollection;
function parseJsongoRelationName(fieldName) {
    if (fieldName.length > 3 && fieldName.endsWith("_id")) {
        return fieldName.substring(0, fieldName.length - 3);
    }
    else if (fieldName.length > 5 && fieldName.endsWith("_id)")) {
        const lastOpenParenIdx = fieldName.lastIndexOf("(");
        return fieldName.substring(lastOpenParenIdx + 1, fieldName.length - 4);
    }
    else {
        return null;
    }
}
exports.parseJsongoRelationName = parseJsongoRelationName;
//
// JsongoMemCollection
//
class JsongoMemCollection extends AJsongoCollection {
    _readAndParseJson() {
        this._docs = [];
    }
    saveFile() {
        // No-op since the docs are already in memory.
    }
}
exports.JsongoMemCollection = JsongoMemCollection;
//
// JsongoFSCollection
//
class JsongoFSCollection extends AJsongoCollection {
    _readAndParseJson() {
        try {
            const jsonBuf = this._fs().readFileSync(this._filePath());
            this._docs = JSON.parse(jsonBuf);
        }
        catch (ex) {
            if (ex.code === "ENOENT") {
                this._docs = [];
                this._isDirty = true;
                // console.log("ENOENT", this);
            }
            else {
                throw ex;
            }
        }
    }
    saveFile() {
        this._fs().writeFileSync(this._filePath(), this.toJson() + "\n");
    }
    _filePath() {
        // Note: path.format({dir:"/", name:"uno", ext:".json"}) returns "//uno.json", which is weird but seemingly harmless.
        return path_1.default.format({
            dir: this._fsdb()._dirPath,
            name: this._name,
            ext: ".json",
        });
    }
    _fsdb() {
        return this._db;
    }
    _fs() {
        return this._fsdb()._fs;
    }
}
exports.JsongoFSCollection = JsongoFSCollection;
