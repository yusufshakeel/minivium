export type Condition = {
  [column: string]: any;
};

export type Filter =
  | { and: Filter[] }
  | { or: Filter[] }
  | Condition;