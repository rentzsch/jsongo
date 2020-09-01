import { fsDB } from "jsongo";

const db = fsDB("./db");
db.users.save({ name: "guest" });
db.users.save({ name: "anonymous" });
db.save();

const users = db.users.find({});
for (const user of users) {
  console.log(user);
}
