import { fsDB } from "jsongo";

const db = fsDB("./db");
db.users.insertOne({ name: "guest" });
db.users.insertOne({ name: "anonymous" });
db.save();

const users = db.users.find({});
for (const user of users) {
  console.log(user);
}
