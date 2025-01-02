import { Filter } from './where';

export type QueryOption = {
  where: Filter;
};

export type SelectQueryAttribute = (string | [string, string]);

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type OrderByAttribute = {
  attribute: string;
  order?: Order;
}

export type SelectQueryOption = {
  where?: Filter;
  limit?: number;
  offset?: number;
  attributes?: SelectQueryAttribute[];
  orderBy?: OrderByAttribute[]
};