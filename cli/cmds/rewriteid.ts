import { fsDB } from "../../lib";
import { CommandModule, Arguments } from "yargs";

export default {
  command: "rewriteid",
  describe: "replace all occurances of object ID",
  handler: rewriteIDCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      demandOption: true,
    },
    collection: {
      describe: "Name of the collection",
      demandOption: true,
      type: "string",
    },
    oldID: {
      describe: "Old ID",
      demandOption: true,
      type: "string",
    },
    newID: {
      describe: "New ID",
      demandOption: true,
      type: "string",
    },
  },
} as CommandModule;

interface RewriteIDArgs extends Arguments {
  dataDir: string;
  collection: string;
  oldID: string;
  newID: string;
}

function rewriteIDCmd(argv: Arguments) {
  const {
    dataDir,
    collection: collectionName,
    oldID,
    newID,
  } = argv as RewriteIDArgs;

  // TODO preflight to ensure newID is unqiue in collection.

  const collectionRelationKey = `${collectionName}_id`;

  const db = fsDB(dataDir);

  for (const collection of db.collections()) {
    const docs = collection.docs();
    let dirty = false;

    if (collection.name() === collectionName) {
      // The collection that hold the document with oldID.
      for (const doc of docs) {
        if (doc._id === oldID) {
          doc._id = newID;
          dirty = true;
        }
      }
    } else {
      // A collection that may have a reference to oldID.
      for (const document of docs) {
        let value = document[collectionRelationKey];
        if (value === undefined) continue;

        if (value instanceof Array) {
          const idx = value.indexOf(oldID);
          if (idx !== -1) {
            value[idx] = newID;
            dirty = true;
          }
        } else if (value === oldID) {
          document[collectionRelationKey] = newID;
          dirty = true;
        }
      }
    }
    if (dirty) {
      collection.save();
    }
  }
}
