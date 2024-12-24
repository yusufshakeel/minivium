export type Column = {
  name: string;
  isRequired: boolean;
};

export type Collections = {
  name: string;
  columns: Column[];
};

export type Schema = {
  collections: Collections[];
}