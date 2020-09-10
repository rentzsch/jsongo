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

  constructor(criteria: object) {
    super(
      `No document matches this search criteria: ${JSON.stringify(criteria)}`
    );
  }
}

export class DuplicateDocumentID extends Error {
  name = "JsongoDuplicateDocumentID";

  constructor(_id: string, collectionName: string) {
    super(`Document with _id ${_id} already exists in ${collectionName}`);
  }
}

export class DuplicateInputID extends Error {
  name = "JsongoDuplicateInputID";

  constructor(_id: string) {
    super(`Duplicate _id not allowed: ${_id}`);
  }
}
