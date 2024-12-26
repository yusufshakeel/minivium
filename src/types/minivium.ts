import { Query } from '../core/Query';

export type MiniviumType = {
  init: () => void;
  query: Query;
};