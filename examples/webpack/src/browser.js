import { memDB } from "jsongo";

const db = memDB();
db.users.insertOne({ name: "guest" });
db.users.insertOne({ name: "anonymous" });

const users = db.users.find({});
for (const user of users) {
  console.log(user);
}
