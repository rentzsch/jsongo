import { JsongoID } from "./JsongoIDType";
import { RawObject } from "mingo/types";

export class DuplicateCollectionName extends Error {
  name = "JsongoDuplicateCollectionName";

  constructor(collectionName: string) {
    super(`Collection already exists: ${collectionName}`);
  }
}

export class CollectionNotFound extends Error {
  name = "JsongoCollectionNotFound";

  constructor(collectionName: string) {
    super(`Collection doesn't exist: ${collectionName}`);
  }
}

export class DocumentNotFound extends Error {
  name = "JsongoDocumentNotFound";

  constructor(criteria: RawObject) {
    super(
      `No document matches this search criteria: ${JSON.stringify(criteria)}`
    );
  }
}

export class DuplicateDocumentID extends Error {
  name = "JsongoDuplicateDocumentID";

  constructor(_id: JsongoID, collectionName: string) {
    super(`Document with _id ${_id} already exists in ${collectionName}`);
  }
}

export class DuplicateInputID extends Error {
  name = "JsongoDuplicateInputID";

  constructor(_id: JsongoID) {
    super(`Duplicate _id not allowed: ${_id}`);
  }
}
