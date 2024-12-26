import { SchemaRegistry } from '../../../src/core/SchemaRegistry';
import { FileSync } from '../../../src/core/File';
import { Query } from '../../../src/core/Query';

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
          { name: 'username', isRequired: true },
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

    it('should throw error when value is missing for mandatory fields', () => {
      expect(() => query.insert('users', { username: 'yusuf', phoneNumber: '123' }))
        .toThrow('Provide value for the mandatory fields: password');

      expect(() => query.insert('users', { phoneNumber: '123' }))
        .toThrow('Provide value for the mandatory fields: username, password');
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
  });
});