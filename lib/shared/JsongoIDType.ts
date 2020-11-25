/** Any unique string, can be long. */
export type StringID = string;

/** Short unique string. */
export type CallsignID = string;

/** 24 lowercase hex chars. */
export type ObjectID = string;

/** Positive non-zero integer. */
export type IntegerID = number;

/* Composite object ID */
export type CompoundID = object;

// TODO not fully compatible with compound IDs yet.
// How to detect missing compound IDs on insertMany/upsertMany?
export type JsongoID = StringID | CallsignID | ObjectID | IntegerID// | CompoundID;
