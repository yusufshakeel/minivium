import { Query } from '../core/Query';

export type MiniviumType = {
  init: () => void;
  // eslint-disable-next-line no-unused-vars
  dropCollection: (collectionName: string) => void;
  dropAllCollections: () => void;
  query: Query;
};