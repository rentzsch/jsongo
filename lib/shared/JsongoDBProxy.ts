import { JsongoDB } from "./JsongoDB";
import { JsongoCollection } from "./JsongoCollection";

/* Lookup table that returns either own property/method or collection (new/existing) */
export type DBProxy<AJsongoDB = JsongoDB, AJsongoCollection = JsongoCollection> = AJsongoDB &
  Record<string, AJsongoCollection>;

export function createDBProxy<
  AJsongoDB extends JsongoDB,
  AJsongoCollection extends JsongoCollection
>(realDB: AJsongoDB) {
  return new Proxy(realDB, {
    get: function (target: AJsongoDB, prop: string) {
      if (prop in target) {
        // Direct property found in target, pass it through.
        return target[prop as keyof AJsongoDB];
      } else {
        // Property NOT found directly in target, treat it as a collection lookup/lazy-creation request.
        return target.collectionWithName(prop);
      }
    },
  }) as DBProxy<AJsongoDB, AJsongoCollection>;
}
