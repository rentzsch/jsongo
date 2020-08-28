"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bson_objectid_1 = __importDefault(require("bson-objectid"));
exports.default = {
    command: "objectid",
    describe: "returns a new unique ObjectID in hex coding",
    handler: objectidCmd,
};
function objectidCmd() {
    console.log(bson_objectid_1.default().toHexString());
}
