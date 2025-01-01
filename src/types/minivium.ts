import { Query } from '../core/Query';

export type MiniviumType = {
  init: () => void;
  initAsync: () => Promise<void>;
  dropCollection: (collectionName: string) => void;
  dropCollectionAsync: (collectionName: string) => Promise<void>;
  dropAllCollections: () => void;
  dropAllCollectionsAsync: () => Promise<void>;
  query: Query;
};