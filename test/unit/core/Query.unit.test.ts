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
  });
});