import { fsDB } from "../../lib";
import { CommandModule, Arguments } from "yargs";

export default {
  command: "fmt",
  describe: "normalize and sort data records",
  handler: fmtCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      demandOption: true,
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
