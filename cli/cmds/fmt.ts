import { fsDB } from "../../";
import { CommandModule, Arguments } from "yargs";

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
  for (const collection of db.collections()) {
    collection.docs();
  }
  db.save();
}
