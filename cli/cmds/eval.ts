import { fsDB } from "../../lib";
import { CommandModule, Arguments } from "yargs";

export default {
  command: "eval",
  describe: "Evaluates given JavaScript code",
  handler: evalCmd,
  builder: {
    dataDir: {
      describe: "Path to the data directory",
      type: "string",
      default: ".",
    },
    code: {
      describe: "Block of code to run (has `db` variable in local scope)",
      type: "string",
    },
  },
} as CommandModule;

interface EvalArgs extends Arguments {
  dataDir: string;
  code: string;
}

function evalCmd(argv: Arguments) {
  const { dataDir, code } = argv as EvalArgs;

  const db = fsDB(dataDir);
  const cmdFunctionStr = `(() => {
    "use strict";
    return (${code});
  })()`;
  console.log(eval(cmdFunctionStr));
}
