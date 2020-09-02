import ObjectID from "bson-objectid";

export default {
  command: "objectid",
  describe: "returns a new unique ObjectID in hex coding",
  handler: objectIDCmd,
};

function objectIDCmd() {
  console.log(new ObjectID().toHexString());
}
