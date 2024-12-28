import { SchemaRegistry } from '../../../src/core/SchemaRegistry';
import { FileSync } from '../../../src/core/File';
import { Query } from '../../../src/core/Query';
import { Op } from '../../../src/core/Operators';

jest.mock('../../../src/core/File');

describe('Query', () => {
  let schemaRegistry: SchemaRegistry;
  let mockFileSyncInstance: jest.Mocked<FileSync>;
  let query: Query;

  beforeEach(() => {
    schemaRegistry = new SchemaRegistry({
      collections: [{
        name: 'users',
        columns: [
          { name: 'id', isUnique: true },
          { name: 'username', isRequired: true, isUnique: true },
          { name: 'password', isRequired: true },
          { name: 'phoneNumber' }
        ]
      }]
    });

    mockFileSyncInstance = new FileSync('/test-dir') as jest.Mocked<FileSync>;
    query = new Query(schemaRegistry, mockFileSyncInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('insert', () => {
    it('should throw error if collection does not exist', () => {
      expect(() => query.insert('unknown', { username: 'yusuf', password: '123456' }))
        .toThrow("Collection 'unknown' does not exist");
    });

    it('should throw error if trying to insert for an unknown column', () => {
      expect(() => query.insert('users', { username: 'yusuf', unknownField: 'haha' }))
        .toThrow("Column 'unknownField' does not exists for 'users' collection.");
    });

    it('should throw error when value is missing for required fields', () => {
      expect(() => query.insert('users', { username: 'yusuf', phoneNumber: '123' }))
        .toThrow('Provide value for the required fields: password');

      expect(() => query.insert('users', { phoneNumber: '123' }))
        .toThrow('Provide value for the required fields: username, password');
    });

    it('should be able to insert new data with new id', () => {
      const d = jest.spyOn(Date, 'now');
      d.mockReturnValue(1735115003339);

      mockFileSyncInstance.readSync.mockReturnValue('[]');
      const result = query.insert('users', { username: 'yusuf', password: '123456' });

      expect(mockFileSyncInstance.readSync).toHaveBeenCalledWith('users');
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([{ id: '193fce9d5cb', username: 'yusuf', password: '123456' }])
      );
      expect(result).toBe('193fce9d5cb');

      d.mockRestore();
    });

    it('should be able to insert new data with provided id', () => {
      const d = jest.spyOn(Date, 'now');
      d.mockReturnValue(1735115003339);

      schemaRegistry = new SchemaRegistry({
        collections: [{
          name: 'users',
          columns: [
            { name: 'id', isRequired: true },
            { name: 'username', isRequired: true },
            { name: 'password', isRequired: true },
            { name: 'phoneNumber' }
          ]
        }]
      });

      mockFileSyncInstance = new FileSync('/test-dir') as jest.Mocked<FileSync>;
      query = new Query(schemaRegistry, mockFileSyncInstance);

      mockFileSyncInstance.readSync.mockReturnValue('[]');
      const result = query.insert(
        'users',
        { id: 1, username: 'yusuf', password: '123456' }
      );

      expect(mockFileSyncInstance.readSync).toHaveBeenCalledWith('users');
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([{ id: 1, username: 'yusuf', password: '123456' }])
      );
      expect(result).toBe(1);

      d.mockRestore();
    });

    it('should throw error if unique constraint is violated', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      expect(() => query.insert('users', { username: 'jane', password: '123456' }))
        .toThrow('Unique constraint violated for columns: username');
    });
  });

  describe('update', () => {
    it('should return 0 if zero rows were updated', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"}]'
      );
      const result = query.update(
        'users',
        { phoneNumber: '123' },
        { where: { id: 1 } }
      );
      expect(result).toBe(0);
      expect(mockFileSyncInstance.writeSync).not.toHaveBeenCalled();
    });

    it('should return 1 if one row update', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.update(
        'users',
        { phoneNumber: '1234' },
        { where: { phoneNumber: '123' } }
      );
      expect(result).toBe(1);
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' },
          { id:'193fce9df12', username:'john', password:'123456', phoneNumber:'1234' },
          { id:'193fce9ea27', username:'jane', password:'123456' }
        ])
      );
    });

    it('should update all the rows if no filter is supplied', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.update(
        'users',
        { phoneNumber: '1234' }
      );
      expect(result).toBe(3);
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456', phoneNumber:'1234' },
          { id:'193fce9df12', username:'john', password:'123456', phoneNumber:'1234' },
          { id:'193fce9ea27', username:'jane', password:'123456', phoneNumber:'1234' }
        ])
      );
    });

    it('should throw error if unique constraint is violated', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      expect(() => {
        query.update(
          'users',
          { username: 'john', password: '123456' },
          { where: { id: '193fce9ea27' } }
        );
      }).toThrow('Unique constraint violated for columns: username');
    });
  });

  describe('delete', () => {
    it('should return 0 if zero rows were deleted', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"}]'
      );
      const result = query.delete(
        'users',
        { where: { id: 1 } }
      );
      expect(result).toBe(0);
      expect(mockFileSyncInstance.writeSync).not.toHaveBeenCalled();
    });

    it('should return 1 if one row was deleted', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.delete(
        'users',
        { where: { phoneNumber: '123' } }
      );
      expect(result).toBe(1);
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' },
          { id:'193fce9ea27', username:'jane', password:'123456' }
        ])
      );
    });

    it('should return N if N row were deleted', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.delete(
        'users',
        { where: { id: { [Op.in]: ['193fce9df12', '193fce9ea27'] } } }
      );
      expect(result).toBe(2);
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' }
        ])
      );
    });

    it('should be able to delete everything if no filter is supplied', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.delete(
        'users'
      );
      expect(result).toBe(3);
      expect(mockFileSyncInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([])
      );
    });
  });

  describe('select', () => {
    it('should be able to select all the rows', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.select(
        'users'
      );
      expect(result).toStrictEqual([
        { id: '193fce9d5cb', username: 'yusuf', password: '123456' },
        { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' },
        { id: '193fce9ea27', username: 'jane', password: '123456' }
      ]);
    });

    it('should be able to select rows by filter', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.select(
        'users',
        { where: { phoneNumber: '123' } }
      );
      expect(result).toStrictEqual([
        { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' }
      ]);
    });

    it('should return empty array if no match is found', () => {
      mockFileSyncInstance.readSync.mockReturnValue(
        '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
        '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
        '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
      );
      const result = query.select(
        'users',
        { where: { id: '1' } }
      );
      expect(result).toStrictEqual([]);
    });

    describe('limit', () => {
      it('should return first N rows as per limit', () => {
        mockFileSyncInstance.readSync.mockReturnValue(
          '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
          '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
          '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
        );
        const result = query.select(
          'users',
          { limit: 1 }
        );
        expect(result).toStrictEqual([
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' }
        ]);
      });

      it('should return empty array when limit 0', () => {
        mockFileSyncInstance.readSync.mockReturnValue(
          '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
          '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
          '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
        );
        const result = query.select(
          'users',
          { limit: 0 }
        );
        expect(result).toStrictEqual([]);
      });

      it('should throw error when limit is negative', () => {
        expect(() => query.select('users', { limit: -1 })).toThrow('Limit must not be negative');
      });
    });

    describe('offset', () => {
      it('should return all rows after X offset', () => {
        mockFileSyncInstance.readSync.mockReturnValue(
          '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
          '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
          '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
        );
        const result = query.select(
          'users',
          { offset: 1 }
        );
        expect(result).toStrictEqual([
          { id:'193fce9df12',username:'john',password:'123456',phoneNumber:'123' },
          { id:'193fce9ea27',username:'jane',password:'123456' }
        ]);
      });

      it('should throw error when offset is negative', () => {
        expect(() => query.select('users', { offset: -1 })).toThrow('Offset must not be negative');
      });
    });

    describe('limit and offset', () => {
      it('should return N rows as per limit after X offset', () => {
        mockFileSyncInstance.readSync.mockReturnValue(
          '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
          '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
          '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
        );
        const result = query.select(
          'users',
          { limit: 1, offset: 1 }
        );
        expect(result).toStrictEqual([
          { id:'193fce9df12',username:'john',password:'123456',phoneNumber:'123' }
        ]);
      });
    });

    describe('attributes', () => {
      it('should throw error when unknown column names passed in attributes', () => {
        expect(() => {
          query.select('users', { attributes: ['col1', ['col2', 'alias']] });
        }).toThrow('Invalid column names passed in attributes: col1, col2');
      });

      it('should return specified columns as per the passed attributes', () => {
        mockFileSyncInstance.readSync.mockReturnValue(
          '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
          '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
          '{"id":"193fce9ea27","username":"jane","password":"123456"}]'
        );
        const result = query.select(
          'users',
          { attributes: ['id', 'username', ['phoneNumber', 'contact']] }
        );
        expect(result).toStrictEqual([
          { id: '193fce9d5cb', username: 'yusuf', contact: undefined },
          { id: '193fce9df12', username: 'john', contact: '123' },
          { id: '193fce9ea27', username: 'jane', contact: undefined }
        ]);
      });
    });
  });
});