import { users as allData } from '../../testdata/users';
import { columnsViolatingUniqueConstraint } from '../../../src/helpers/unique';

describe('unique', () => {
  describe('columnsViolatingUniqueConstraint', () => {
    it('should return empty array when there is no violation', () => {
      expect(columnsViolatingUniqueConstraint(
        { name: 'adam' },
        allData,
        ['id', 'name']
      )).toStrictEqual([]);
    });

    it('should return empty array when there is no unique columns', () => {
      expect(columnsViolatingUniqueConstraint(
        { name: 'adam' },
        allData,
        []
      )).toStrictEqual([]);
    });

    it('should be able to violating column names', () => {
      expect(columnsViolatingUniqueConstraint(
        { id: 1, name: 'bruce' },
        allData,
        ['id', 'name']
      )).toStrictEqual(['id', 'name']);
    });
  });
});