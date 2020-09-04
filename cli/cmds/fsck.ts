import { jsonFileNames } from "../utils";
import { CommandModule, Arguments } from "yargs";
import findDupKeys from "find-duplicated-property-keys";
import fs from "fs";

export default {
  command: "fsck",
  describe: "Checks consistency of data",
  handler: fsckCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      default: ".",
    },
  },
} as CommandModule;

/*
  jsongo fsck
    walk .json files
      all JSON parsable
      all arrays of records
    keys are sorted
    every record has an _id
    all _id's are unique
    every reference is valid
  jsongo rewrite-id <collection> <oldid> <newid>
*/

interface FsckArgs extends Arguments {
  dataDir: string;
}

function fsckCmd(argv: Arguments) {
  const { dataDir } = argv as FsckArgs;

  for (const jsonFileName of jsonFileNames(dataDir)) {
    console.log(`checking ${jsonFileName}`);
    const jsonBuf = fs.readFileSync(jsonFileName, "utf-8");
    const dups = findDupKeys(jsonBuf);

    for (const record of dups) {
      console.error(`Found duplicate key: ${record.key}`);
    }
  }
}
