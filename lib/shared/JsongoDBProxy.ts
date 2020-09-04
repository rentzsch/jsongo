import { JsongoDB } from "./JsongoDB";

export function createDBProxy(realDB: JsongoDB): any {
  return new Proxy(realDB, {
    get: function (target: JsongoDB, prop: string) {
      if (prop === "then") {
        // Promise detection.
        return target;
      }
      if (prop in target) {
        // Direct property found in target, pass it through.
        return (target as any)[prop];
      } else {
        // Property NOT found directly in target, treat it as a collection lookup/lazy-creation request.
        return target.collectionWithName(prop);
      }
    },
  });
}
