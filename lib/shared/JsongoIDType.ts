/** Any unique string, can be long. */
export type StringID = string;

/** Short unique string. */
export type CallsignID = string;

/** 24 lowercase hex chars. */
export type ObjectID = string;

/** Positive non-zero integer. */
export type IntegerID = number;

/** Composite object ID */
export type CompoundID = object;

export type JsongoID =
  | StringID
  | CallsignID
  | ObjectID
  | IntegerID
  | CompoundID;
