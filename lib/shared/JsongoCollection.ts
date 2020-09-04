import { JsongoDB } from "./JsongoDB";
import { ObjectID } from "./JsongoIDType";

import BSONObjectID from "bson-objectid";
import mingo from "mingo";
import { Cursor } from "mingo/cursor";
import { Query } from "mingo/query";
import sortKeys from "sort-keys";
import valueOrJson from "value-or-json";

//
// JsongoCollection
//

export abstract class JsongoCollection {
  protected _name: string;
  protected _db: JsongoDB;
  protected _docs: Array<JsongoDoc> | null;
  protected _isDirty: boolean;

  constructor(args: JsongoCollectionCtr) {
    this._name = args.name;
    this._db = args.db;

    this._docs = null;
    this._isDirty = false;
  }

  name() {
    return this._name;
  }

  find(criteria: object): Cursor {
    return mingo.find(this.docs(), criteria);
  }

  findOne(criteria: object): JsongoDoc | null {
    const cursor = this.find(criteria);
    if (cursor.hasNext()) {
      return cursor.next();
    } else {
      return null;
    }
  }

  findOneOrFail(criteria: object): JsongoDoc {
    const doc = this.findOne(criteria);
    if (doc === null) {
      throw new Error(
        `Could not find document with the following criteria: ${JSON.stringify(
          criteria
        )}`
      );
    }
    return doc;
  }

  findAll(criteria: object): Array<JsongoDoc> {
    return this.find(criteria).all();
  }

  docs(): Array<JsongoDoc> {
    if (this._docs === null) {
      this._readAndParseJson();
    }
    return this._docs as Array<JsongoDoc>;
  }

  count(): number {
    return this.docs().length;
  }

  insertOne(doc: PartialDoc, updateOnDuplicateKey = false): JsongoDoc {
    const docs = this.docs();
    if (doc._id === undefined) {
      // Doesn't have an _id, generate one.
      doc._id = new BSONObjectID().toHexString();
    } else {
      if (!BSONObjectID.isValid(doc._id)) {
        throw new Error(`Invalid BSON Object ID ${doc._id}`);
      }

      // Has an _id, probably an update but may be an insert with a custom _id.
      const docIdx = this._findDocumentIndex(new Query({ _id: doc._id }));

      if (docIdx === null) {
        // Didn't find an existing document with the same _id.
      } else {
        if (updateOnDuplicateKey) {
          // It's an update, delete the original.
          docs.splice(docIdx, 1);
        } else {
          // Update not allowed, abort.
          throw new Error(
            `Document with _id ${doc._id} already exists in ${this._name}`
          );
        }
      }
    }
    // At this point, doc has an _id.
    const newDoc = doc as JsongoDoc;
    docs.push(newDoc);
    return newDoc;
  }

  upsertOne(doc: PartialDoc): JsongoDoc | null {
    let matchCount = 0;
    const query = new mingo.Query(doc);
    for (const docItr of this.docs()) {
      if (query.test(docItr)) {
        if (matchCount === 0) {
          doc._id = docItr._id;
        }
        matchCount++;
      }
    }

    if (matchCount > 1) {
      return null;
    } else {
      return this.insertOne(doc, true);
    }
  }

  deleteOne(criteria: object): { deletedCount: number } {
    const query = new Query(criteria);
    const docIdx = this._findDocumentIndex(query);
    if (docIdx === null) {
      return { deletedCount: 0 };
    } else {
      this.docs().splice(docIdx, 1);
      return { deletedCount: 1 };
    }
  }

  isDirty() {
    return this._isDirty;
  }

  toJsonObj() {
    const docs = this.docs();
    const sortedDocs = docs.sort(function (a: any, b: any) {
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
    return sortedDocs.map((doc: any) => sortKeys(doc, { deep: true }));
  }

  toJson() {
    return JSON.stringify(this.toJsonObj(), null, 2);
  }

  fsck() {
    const thisCollectionName = this._name;
    const thisDB = this._db;
    const errors: object[] = [];

    for (const docItr of this.docs()) {
      // TODO
    }
    function fsckDoc(doc: JsongoDoc) {
      for (const [key, value] of Object.entries(doc)) {
        const relationName = parseJsongoRelationName(key);
        if (relationName !== null) {
          if (Array.isArray(value)) {
            // TODO
            throw new Error("TODO615");
          } else {
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
            } else if (relatedDocs.length > 1) {
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

  protected _findDocumentIndex(query: Query) {
    const docs = this.docs();
    for (let docIdx = 0; docIdx < docs.length; docIdx++) {
      if (query.test(docs[docIdx])) {
        return docIdx;
      }
    }
    return null;
  }

  abstract _readAndParseJson(): void;
}

interface JsongoCollectionCtr {
  name: string;
  db: JsongoDB;
}

export function parseJsongoRelationName(fieldName: string): null | string {
  if (fieldName.length > 3 && fieldName.endsWith("_id")) {
    return fieldName.substring(0, fieldName.length - 3);
  } else if (fieldName.length > 5 && fieldName.endsWith("_id)")) {
    const lastOpenParenIdx = fieldName.lastIndexOf("(");
    return fieldName.substring(lastOpenParenIdx + 1, fieldName.length - 4);
  } else {
    return null;
  }
}

// POJO with an obligatory _id key
export interface JsongoDoc {
  _id: ObjectID;
  [key: string]: any;
}

// User-supplied POJO with an optional _id key
export interface PartialDoc {
  _id?: ObjectID;
  [key: string]: any;
}
