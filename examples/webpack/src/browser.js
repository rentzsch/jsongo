import { memDB } from "jsongo";

const db = memDB();
db.users.insertMany([{ name: "guest" }, { name: "anonymous" }]);

const users = db.users.find({});
for (const user of users) {
  console.log(user);
}
