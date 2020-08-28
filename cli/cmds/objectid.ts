import ObjectID from "bson-objectid";

export default {
  command: "objectid",
  describe: "returns a new unique ObjectID in hex coding",
  handler: objectidCmd,
};

function objectidCmd() {
  console.log((ObjectID as Function)().toHexString());
}
