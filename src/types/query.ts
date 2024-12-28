import { Filter } from './where';

export type QueryOption = {
  where: Filter;
};

export type SelectQueryOption = {
  where?: Filter;
  limit?: number;
  offset?: number;
};