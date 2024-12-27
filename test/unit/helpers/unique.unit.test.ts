import { users as allData } from '../../testdata/users';
import { columnsViolatingUniqueConstraint } from '../../../src/helpers/unique';

describe('unique', () => {
  describe('columnsViolatingUniqueConstraint', () => {
    it('should return empty array when there is no existing data', () => {
      expect(columnsViolatingUniqueConstraint(
        [{ name: 'adam' }],
        ['id', 'name']
      )).toStrictEqual([]);
    });

    it('should return empty array when there is no unique column names', () => {
      expect(columnsViolatingUniqueConstraint(
        allData,
        []
      )).toStrictEqual([]);
    });

    it('should return empty array when there is no unique constraint violation', () => {
      expect(columnsViolatingUniqueConstraint(
        allData,
        ['id', 'name']
      )).toStrictEqual([]);
    });

    it('should return empty array when data does not contain any of the unique columns', () => {
      expect(columnsViolatingUniqueConstraint(
        [{ password: '1234' }],
        ['id', 'name']
      )).toStrictEqual([]);
    });

    it('should be able to return violating column names', () => {
      expect(columnsViolatingUniqueConstraint(
        [...allData, { id: 1, name: 'bruce' }],
        ['id', 'name']
      )).toStrictEqual(['id', 'name']);
    });
  });
});