import ObjectID from "bson-objectid";
import { CommandModule, Arguments } from "yargs";

export default {
  command: "objectid",
  describe: "print a new unique BSON ObjectID in hex coding",
  handler: objectIDCmd,
  builder: {
    times: {
      describe: "Number of ObjectIDs to generate",
      type: "number",
      default: 1,
    },
  },
} as CommandModule;

interface ObjectIDArgs extends Arguments {
  times: number;
}

function objectIDCmd(argv: Arguments) {
  const { times } = argv as ObjectIDArgs;

  for (let i = 0; i < times; i++) {
    console.log(new ObjectID().toHexString());
  }
}
