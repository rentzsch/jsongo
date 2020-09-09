import { parseJsongoRelationName } from "../../lib/shared";
import test from "ava";

test("db.collection.parseJsongoRelationName()", (t) => {
  t.is(parseJsongoRelationName(""), null);
  t.is(parseJsongoRelationName("_id"), null);
  t.is(parseJsongoRelationName("x_id"), "x");
  t.is(parseJsongoRelationName("camelCase_id"), "camelCase");
  t.is(parseJsongoRelationName("x(y_id)"), "y");
  t.is(parseJsongoRelationName("_id)"), null);
  t.is(parseJsongoRelationName("(_id)"), null);
  t.is(parseJsongoRelationName("comment(collection_id)"), "collection");
});
