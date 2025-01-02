import { Order, OrderByAttribute } from '../types/query';

export function orderBy(allRows: object[], orderBy: OrderByAttribute[]) {
  return allRows.sort((a: any, b: any) => {
    for (const { attribute, order = Order.ASC } of orderBy) {
      const valueA = a[attribute];
      const valueB = b[attribute];

      // compare the values and sort by the specified order
      if (valueA < valueB) {
        return order === Order.ASC ? -1 : 1;
      } else if (valueA > valueB) {
        return order === Order.ASC ? 1 : -1;
      }
    }

    // if all the columns to sort by have equal values, then keep the original order
    return 0;
  });
}