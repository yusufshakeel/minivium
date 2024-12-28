import { Filter } from './where';

export type QueryOption = {
  where: Filter;
};

export type SelectQueryAttribute = (string | [string, string]);

export type SelectQueryOption = {
  where?: Filter;
  limit?: number;
  offset?: number;
  attributes?: SelectQueryAttribute[];
};