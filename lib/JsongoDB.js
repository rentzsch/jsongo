"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsongoFSDB = exports.JsongoMemDB = exports.AJsongoDB = void 0;
const JsongoCollection_1 = require("./JsongoCollection");
const fs_1 = __importDefault(require("fs"));
//
// AJsongoDB
//
class AJsongoDB {
    constructor() {
        this._collections = new Map();
    }
    collections() {
        return Array.from(this._collections.values());
    }
    collectionWithName(collectionName) {
        const result = this.existingCollectionWithName(collectionName);
        if (result === null) {
            return this.addNewCollection(collectionName);
        }
        else {
            return result;
        }
    }
    existingCollectionWithName(collectionName) {
        const result = this._collections.get(collectionName);
        return result === undefined ? null : result;
    }
}
exports.AJsongoDB = AJsongoDB;
//
// JsongoMemDB
//
class JsongoMemDB extends AJsongoDB {
    addNewCollection(collectionName) {
        if (this._collections.get(collectionName) !== undefined) {
            const err = new Error(`JsongoFSDB.addNewCollection: ${collectionName} already exists`);
            err.name = "JsongoDuplicateCollectionName";
            throw err;
        }
        const collection = new JsongoCollection_1.JsongoMemCollection({
            name: collectionName,
            db: this,
        });
        this._collections.set(collectionName, collection);
        return collection;
    }
}
exports.JsongoMemDB = JsongoMemDB;
//
// JsongoFSDB
//
class JsongoFSDB extends AJsongoDB {
    constructor(args) {
        var _a;
        super();
        this._dirPath = args.dirPath;
        this._fs = (_a = args.fs) !== null && _a !== void 0 ? _a : fs_1.default;
    }
    addNewCollection(collectionName) {
        if (this._collections.get(collectionName) !== undefined) {
            const err = new Error(`JsongoFSDB.addNewCollection: ${collectionName} already exists`);
            err.name = "JsongoDuplicateCollectionName";
            throw err;
        }
        const collection = new JsongoCollection_1.JsongoFSCollection({
            name: collectionName,
            db: this,
        });
        this._collections.set(collectionName, collection);
        return collection;
    }
    save() {
        for (const collection of this._collections.values()) {
            collection.saveFile();
        }
    }
}
exports.JsongoFSDB = JsongoFSDB;
