import { orderBy } from '../../../src/helpers/order';
import { Order } from '../../../src/types/query';
import { usersForSorting } from '../../testdata/users';

describe('Testing order', () => {
  describe('orderBy', () => {
    describe('when the data is an empty array', () => {
      it('should return empty array', () => {
        expect(orderBy([], [{ attribute: 'username' }]))
          .toStrictEqual([]);
      });
    });

    describe('when all the columns to sort by are the same', () => {
      it('should return the array in the original order', () => {
        const data = [
          { id: 1, name: 'test' },
          { id: 2, name: 'test' }
        ];
        expect(orderBy(data, [{ attribute: 'name' }])).toStrictEqual([
          { id: 1, name: 'test' },
          { id: 2, name: 'test' }
        ]);
      });
    });

    it('should be able to sort in ascending order', () => {
      expect(orderBy(usersForSorting, [{ attribute: 'firstName', order: Order.ASC }]))
        .toStrictEqual([
          { id: 1, firstName: 'Alice', lastName: 'Brown', createdAt: '2025-01-01', updatedAt: '2025-01-03' },
          { id: 3, firstName: 'Alice', lastName: 'Anderson', createdAt: '2025-01-02', updatedAt: '2025-01-04' },
          { id: 4, firstName: 'Bob', lastName: 'Builder', createdAt: '2025-01-02', updatedAt: '2025-01-02' },
          { id: 2, firstName: 'Charlie', lastName: 'Wise', createdAt: '2025-01-01', updatedAt: '2025-01-02' }
        ]);
    });

    it('should be able to sort in descending order', () => {
      expect(orderBy(usersForSorting, [{ attribute: 'firstName', order: Order.DESC }]))
        .toStrictEqual([
          { id: 2, firstName: 'Charlie', lastName: 'Wise', createdAt: '2025-01-01', updatedAt: '2025-01-02' },
          { id: 4, firstName: 'Bob', lastName: 'Builder', createdAt: '2025-01-02', updatedAt: '2025-01-02' },
          { id: 1, firstName: 'Alice', lastName: 'Brown', createdAt: '2025-01-01', updatedAt: '2025-01-03' },
          { id: 3, firstName: 'Alice', lastName: 'Anderson', createdAt: '2025-01-02', updatedAt: '2025-01-04' }
        ]);
    });

    describe('when sorting by multiple columns', () => {
      it('should be able to sort in ascending order', () => {
        const result = orderBy(
          usersForSorting,
          [
            { attribute: 'firstName', order: Order.ASC },
            { attribute: 'lastName', order: Order.ASC }
          ]
        );
        expect(result).toStrictEqual([
          { id: 3, firstName: 'Alice', lastName: 'Anderson', createdAt: '2025-01-02', updatedAt: '2025-01-04' },
          { id: 1, firstName: 'Alice', lastName: 'Brown', createdAt: '2025-01-01', updatedAt: '2025-01-03' },
          { id: 4, firstName: 'Bob', lastName: 'Builder', createdAt: '2025-01-02', updatedAt: '2025-01-02' },
          { id: 2, firstName: 'Charlie', lastName: 'Wise', createdAt: '2025-01-01', updatedAt: '2025-01-02' }
        ]);
      });

      it('should be able to sort in descending order', () => {
        const result = orderBy(
          usersForSorting,
          [
            { attribute: 'firstName', order: Order.DESC },
            { attribute: 'lastName', order: Order.DESC }
          ]
        );
        expect(result).toStrictEqual([
          { id: 2, firstName: 'Charlie', lastName: 'Wise', createdAt: '2025-01-01', updatedAt: '2025-01-02' },
          { id: 4, firstName: 'Bob', lastName: 'Builder', createdAt: '2025-01-02', updatedAt: '2025-01-02' },
          { id: 1, firstName: 'Alice', lastName: 'Brown', createdAt: '2025-01-01', updatedAt: '2025-01-03' },
          { id: 3, firstName: 'Alice', lastName: 'Anderson', createdAt: '2025-01-02', updatedAt: '2025-01-04' }
        ]);
      });

      it('should be able to sort in ascending and descending order', () => {
        const result = orderBy(
          usersForSorting,
          [
            { attribute: 'lastName', order: Order.DESC },
            { attribute: 'updatedAt', order: Order.ASC },
            { attribute: 'createdAt', order: Order.DESC }
          ]
        );
        expect(result).toStrictEqual([
          { id: 2, firstName: 'Charlie', lastName: 'Wise', createdAt: '2025-01-01', updatedAt: '2025-01-02' },
          { id: 4, firstName: 'Bob', lastName: 'Builder', createdAt: '2025-01-02', updatedAt: '2025-01-02' },
          { id: 1, firstName: 'Alice', lastName: 'Brown', createdAt: '2025-01-01', updatedAt: '2025-01-03' },
          { id: 3, firstName: 'Alice', lastName: 'Anderson', createdAt: '2025-01-02', updatedAt: '2025-01-04' }
        ]);
      });
    });
  });
});