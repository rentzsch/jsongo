import { memDB } from "jsongo";

const db = memDB();
db.users.save({ name: "guest" });
db.users.save({ name: "anonymous" });

const users = db.users.find({});
for (const user of users) {
  console.log(user);
}
