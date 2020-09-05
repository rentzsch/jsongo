import { fsDB } from "../../lib";
import { CommandModule, Arguments } from "yargs";

export default {
  command: "ls",
  describe: "list collection names",
  handler: lsCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      default: ".",
    },
  },
} as CommandModule;

interface LsArgs extends Arguments {
  dataDir: string;
}

function lsCmd(argv: Arguments) {
  const { dataDir } = argv as LsArgs;
  const db = fsDB(dataDir);
  console.log(JSON.stringify(db.collectionNames(), null, 2));
}
