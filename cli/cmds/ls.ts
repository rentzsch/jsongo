import { jsonFileNames } from "../utils";
import { CommandModule, Arguments } from "yargs";
import path from "path";

export default {
  command: "fsck",
  describe: "Lists collection names",
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
  console.log(
    JSON.stringify(
      jsonFileNames(dataDir).map((fileName) => path.parse(fileName).name),
      null,
      2
    )
  );
}
