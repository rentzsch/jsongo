import { jsonFileNames } from "../utils";
import { fsDB } from "../../";
import { CommandModule, Arguments } from "yargs";
import path from "path";

export default {
  command: "fmt",
  describe: "Sorts data records",
  handler: fmtCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      default: ".",
    },
  },
} as CommandModule;

interface FmtArgs extends Arguments {
  dataDir: string;
}

function fmtCmd(argv: Arguments) {
  const { dataDir } = argv as FmtArgs;
  const db = fsDB(dataDir);
  for (const jsonFileName of jsonFileNames(dataDir)) {
    const collectionName = path.parse(jsonFileName).name;
    db[collectionName].docs();
  }
  db.save();
}
