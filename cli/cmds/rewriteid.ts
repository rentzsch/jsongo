import { jsonFileNames } from "../utils";
import { CommandModule, Arguments } from "yargs";
import fs from "fs";
import path from "path";

export default {
  command: "rewriteid",
  describe: "Replaces all occurances of object ID",
  handler: rewriteIDCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      default: ".",
    },
    collectionName: {
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
  const { dataDir, collectionName, oldID, newID } = argv as RewriteIDArgs;

  // TODO preflight to ensure newID is unqiue in collection.

  const collectionRelationKey = `${collectionName}_id`;

  for (const jsonFileName of jsonFileNames(dataDir)) {
    const jsonBuf = fs.readFileSync(jsonFileName, "utf-8");
    const json = JSON.parse(jsonBuf);
    let dirty = false;

    if (path.parse(jsonFileName).name === collectionName) {
      // The collection that hold the document with oldID.
      for (const doc of json) {
        if (doc._id === oldID) {
          doc._id = newID;
          dirty = true;
        }
      }
    } else {
      // A collection that may have a reference to oldID.
      for (const document of json) {
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
      fs.writeFileSync(jsonFileName, JSON.stringify(json, null, 2));
    }
  }
}
