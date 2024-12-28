import { users } from '../../testdata/users';
import { selectAttributes } from '../../../src/helpers/select';

describe('select', () => {
  describe('selectAttributes', () => {
    it('should return specified columns', () => {
      expect(selectAttributes(['id', 'name', 'isOnline'], users)).toStrictEqual([
        { id: 1, name: 'john', isOnline: false },
        { id: 2, name: 'jane', isOnline: true },
        { id: 3, name: 'tom', isOnline: false },
        { id: 4, name: 'jerry', isOnline: true },
        { id: 5, name: 'bruce', isOnline: true }
      ]);
    });

    it('should return specified columns with custom names', () => {
      expect(selectAttributes(['id', ['name', 'username'], 'isOnline'], users)).toStrictEqual([
        { id: 1, username: 'john', isOnline: false },
        { id: 2, username: 'jane', isOnline: true },
        { id: 3, username: 'tom', isOnline: false },
        { id: 4, username: 'jerry', isOnline: true },
        { id: 5, username: 'bruce', isOnline: true }
      ]);
    });

    it('should return undefined value for unknown column', () => {
      expect(selectAttributes(['id', 'username', 'isOnline'], users)).toStrictEqual([
        { id: 1, username: undefined, isOnline: false },
        { id: 2, username: undefined, isOnline: true },
        { id: 3, username: undefined, isOnline: false },
        { id: 4, username: undefined, isOnline: true },
        { id: 5, username: undefined, isOnline: true }
      ]);
    });
  });
});