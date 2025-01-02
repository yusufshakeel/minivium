import { SchemaRegistry } from '../../../src/core/SchemaRegistry';
import { File } from '../../../src/core/File';
import { Query } from '../../../src/core/Query';
import { Op } from '../../../src/core/Operators';
import * as Id from '../../../src/utils/id';
import { Order } from '../../../src/types/query';

jest.mock('../../../src/core/File');
jest.mock('../../../src/utils/id');

describe('Query', () => {
  let schemaRegistry: SchemaRegistry;
  let mockFileInstance: jest.Mocked<File>;
  let query: Query;

  const readSyncData =
    '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
    '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
    '{"id":"193fce9ea27","username":"jane","password":"123456"}]';

  const readData =
    '[{"id":"193fce9d5cb","username":"yusuf","password":"123456"},' +
    '{"id":"193fce9df12","username":"john","password":"123456","phoneNumber":"123"},' +
    '{"id":"193fce9ea27","username":"jane","password":"123456"}]';

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

    mockFileInstance = new File('/test-dir') as jest.Mocked<File>;
    query = new Query(schemaRegistry, mockFileInstance);

    mockFileInstance.readSync.mockReturnValue(readSyncData);
    mockFileInstance.read.mockResolvedValue(readData);

    jest.spyOn(Id, 'genId').mockReturnValue('193fce9d5cb-06461496');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('insert', () => {
    it('should throw error if collection does not exist', () => {
      expect(() => query.insert('unknown', { username: 'yusuf', password: '123456' }))
        .toThrow(new Error("Collection 'unknown' does not exist"));
    });

    it('should throw error if trying to insert for an unknown column', () => {
      expect(() => query.insert('users', { username: 'yusuf', unknownField: 'haha' }))
        .toThrow(new Error("Column 'unknownField' does not exists for 'users' collection."));
    });

    it('should throw error when value is missing for required fields', () => {
      expect(() => query.insert('users', { username: 'yusuf', phoneNumber: '123' }))
        .toThrow(new Error('Provide value for the required fields: password'));

      expect(() => query.insert('users', { phoneNumber: '123' }))
        .toThrow(new Error('Provide value for the required fields: username, password'));
    });

    it('should be able to insert new data with new id', () => {
      mockFileInstance.readSync.mockReturnValue('[]');
      const result = query.insert('users', { username: 'yusuf', password: '123456' });

      expect(mockFileInstance.readSync).toHaveBeenCalledWith('users');
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([{ id: '193fce9d5cb-06461496', username: 'yusuf', password: '123456' }])
      );
      expect(result).toBe('193fce9d5cb-06461496');
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

      mockFileInstance = new File('/test-dir') as jest.Mocked<File>;
      query = new Query(schemaRegistry, mockFileInstance);

      mockFileInstance.readSync.mockReturnValue('[]');
      const result = query.insert(
        'users',
        { id: 1, username: 'yusuf', password: '123456' }
      );

      expect(mockFileInstance.readSync).toHaveBeenCalledWith('users');
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([{ id: 1, username: 'yusuf', password: '123456' }])
      );
      expect(result).toBe(1);

      d.mockRestore();
    });

    it('should throw error if unique constraint is violated', () => {
      expect(() => query.insert('users', { username: 'jane', password: '123456' }))
        .toThrow(new Error('Unique constraint violated for columns: username'));
    });
  });

  describe('insertAsync', () => {
    it('should throw error if collection does not exist', async () => {
      await expect(async () => {
        await query.insertAsync('unknown', { username: 'yusuf', password: '123456' });
      }).rejects.toThrow(new Error("Collection 'unknown' does not exist"));
    });

    it('should throw error if trying to insert for an unknown column', async () => {
      await expect(async () => {
        await query.insertAsync('users', { username: 'yusuf', unknownField: 'haha' });
      }).rejects.toThrow(
        new Error("Column 'unknownField' does not exists for 'users' collection.")
      );
    });

    it('should throw error when value is missing for required fields', async () => {
      await expect(async () => {
        await query.insertAsync('users', { username: 'yusuf', phoneNumber: '123' });
      }).rejects.toThrow(new Error('Provide value for the required fields: password'));

      await expect(async () => {
        await query.insertAsync('users', { phoneNumber: '123' });
      }).rejects.toThrow(
        new Error('Provide value for the required fields: username, password')
      );
    });

    it('should be able to insert new data with new id', async () => {
      mockFileInstance.read.mockResolvedValue('[]');
      const result = await query.insertAsync(
        'users',
        { username: 'yusuf', password: '123456' }
      );

      expect(mockFileInstance.read).toHaveBeenCalledWith('users');
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id: '193fce9d5cb-06461496', username: 'yusuf', password: '123456' }
        ])
      );
      expect(result).toBe('193fce9d5cb-06461496');
    });

    it('should be able to insert new data with provided id', async () => {
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

      mockFileInstance = new File('/test-dir') as jest.Mocked<File>;
      query = new Query(schemaRegistry, mockFileInstance);

      mockFileInstance.read.mockResolvedValue('[]');
      const result = await query.insertAsync(
        'users',
        { id: 1, username: 'yusuf', password: '123456' }
      );

      expect(mockFileInstance.read).toHaveBeenCalledWith('users');
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([{ id: 1, username: 'yusuf', password: '123456' }])
      );
      expect(result).toBe(1);

      d.mockRestore();
    });

    it('should throw error if unique constraint is violated', async () => {
      await expect(async () => {
        await query.insertAsync('users', { username: 'jane', password: '123456' });
      }).rejects.toThrow(new Error('Unique constraint violated for columns: username'));
    });
  });

  describe('update', () => {
    it('should return 0 if zero rows were updated', () => {
      const result = query.update(
        'users',
        { phoneNumber: '123' },
        { where: { id: 1 } }
      );
      expect(result).toBe(0);
      expect(mockFileInstance.writeSync).not.toHaveBeenCalled();
    });

    it('should return 1 if one row update', () => {
      const result = query.update(
        'users',
        { phoneNumber: '1234' },
        { where: { phoneNumber: '123' } }
      );
      expect(result).toBe(1);
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' },
          { id:'193fce9df12', username:'john', password:'123456', phoneNumber:'1234' },
          { id:'193fce9ea27', username:'jane', password:'123456' }
        ])
      );
    });

    it('should update all the rows if no filter is supplied', () => {
      const result = query.update(
        'users',
        { phoneNumber: '1234' }
      );
      expect(result).toBe(3);
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456', phoneNumber:'1234' },
          { id:'193fce9df12', username:'john', password:'123456', phoneNumber:'1234' },
          { id:'193fce9ea27', username:'jane', password:'123456', phoneNumber:'1234' }
        ])
      );
    });

    it('should throw error if unique constraint is violated', () => {
      expect(() => {
        query.update(
          'users',
          { username: 'john', password: '123456' },
          { where: { id: '193fce9ea27' } }
        );
      }).toThrow(new Error('Unique constraint violated for columns: username'));
    });
  });

  describe('updateAsync', () => {
    it('should return 0 if zero rows were updated', async () => {
      const result = await query.updateAsync(
        'users',
        { phoneNumber: '123' },
        { where: { id: 1 } }
      );
      expect(result).toBe(0);
      expect(mockFileInstance.write).not.toHaveBeenCalled();
    });

    it('should return 1 if one row update', async () => {
      const result = await query.updateAsync(
        'users',
        { phoneNumber: '1234' },
        { where: { phoneNumber: '123' } }
      );
      expect(result).toBe(1);
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' },
          { id:'193fce9df12', username:'john', password:'123456', phoneNumber:'1234' },
          { id:'193fce9ea27', username:'jane', password:'123456' }
        ])
      );
    });

    it('should update all the rows if no filter is supplied', async () => {
      const result = await query.updateAsync(
        'users',
        { phoneNumber: '1234' }
      );
      expect(result).toBe(3);
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456', phoneNumber:'1234' },
          { id:'193fce9df12', username:'john', password:'123456', phoneNumber:'1234' },
          { id:'193fce9ea27', username:'jane', password:'123456', phoneNumber:'1234' }
        ])
      );
    });

    it('should throw error if unique constraint is violated', async () => {
      await expect(async () => {
        await query.updateAsync(
          'users',
          { username: 'john', password: '123456' },
          { where: { id: '193fce9ea27' } }
        );
      }).rejects.toThrow(new Error('Unique constraint violated for columns: username'));
    });
  });

  describe('delete', () => {
    it('should return 0 if zero rows were deleted', () => {
      const result = query.delete(
        'users',
        { where: { id: 1 } }
      );
      expect(result).toBe(0);
      expect(mockFileInstance.writeSync).not.toHaveBeenCalled();
    });

    it('should return 1 if one row was deleted', () => {
      const result = query.delete(
        'users',
        { where: { phoneNumber: '123' } }
      );
      expect(result).toBe(1);
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' },
          { id:'193fce9ea27', username:'jane', password:'123456' }
        ])
      );
    });

    it('should return N if N row were deleted', () => {
      const result = query.delete(
        'users',
        { where: { id: { [Op.in]: ['193fce9df12', '193fce9ea27'] } } }
      );
      expect(result).toBe(2);
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' }
        ])
      );
    });

    it('should be able to delete everything if no filter is supplied', () => {
      const result = query.delete(
        'users'
      );
      expect(result).toBe(3);
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([])
      );
    });
  });

  describe('deleteAsync', () => {
    it('should return 0 if zero rows were deleted', async () => {
      const result = await query.deleteAsync(
        'users',
        { where: { id: 1 } }
      );
      expect(result).toBe(0);
      expect(mockFileInstance.write).not.toHaveBeenCalled();
    });

    it('should return 1 if one row was deleted', async () => {
      const result = await query.deleteAsync(
        'users',
        { where: { phoneNumber: '123' } }
      );
      expect(result).toBe(1);
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' },
          { id:'193fce9ea27', username:'jane', password:'123456' }
        ])
      );
    });

    it('should return N if N row were deleted', async () => {
      const result = await query.deleteAsync(
        'users',
        { where: { id: { [Op.in]: ['193fce9df12', '193fce9ea27'] } } }
      );
      expect(result).toBe(2);
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id:'193fce9d5cb', username:'yusuf', password:'123456' }
        ])
      );
    });

    it('should be able to delete everything if no filter is supplied', async () => {
      const result = await query.deleteAsync(
        'users'
      );
      expect(result).toBe(3);
      expect(mockFileInstance.write).toHaveBeenCalledWith(
        'users',
        JSON.stringify([])
      );
    });
  });

  describe('select', () => {
    it('should be able to select all the rows', () => {
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
      const result = query.select(
        'users',
        { where: { phoneNumber: '123' } }
      );
      expect(result).toStrictEqual([
        { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' }
      ]);
    });

    it('should return empty array if no match is found', () => {
      const result = query.select(
        'users',
        { where: { id: '1' } }
      );
      expect(result).toStrictEqual([]);
    });

    describe('limit', () => {
      it('should return first N rows as per limit', () => {
        const result = query.select(
          'users',
          { limit: 1 }
        );
        expect(result).toStrictEqual([
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' }
        ]);
      });

      it('should return empty array when limit 0', () => {
        const result = query.select(
          'users',
          { limit: 0 }
        );
        expect(result).toStrictEqual([]);
      });

      it('should throw error when limit is negative', () => {
        expect(() => query.select('users', { limit: -1 }))
          .toThrow(new Error('Limit must not be negative'));
      });
    });

    describe('offset', () => {
      it('should return all rows after X offset', () => {
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
        expect(() => query.select('users', { offset: -1 }))
          .toThrow(new Error('Offset must not be negative'));
      });
    });

    describe('limit and offset', () => {
      it('should return N rows as per limit after X offset', () => {
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
        })
          .toThrow(new Error('Invalid column names passed in attributes: col1, col2'));
      });

      it('should return specified columns as per the passed attributes', () => {
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

    describe('orderBy', () => {
      it('should be able to sort in ascending order', () => {
        const result = query.select(
          'users',
          { orderBy: [{ attribute: 'username' }] }
        );
        expect(result).toStrictEqual([
          { id: '193fce9ea27', username: 'jane', password: '123456' },
          { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' },
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' }
        ]);
      });

      it('should be able to sort by alias names', () => {
        const result = query.select(
          'users',
          {
            attributes: ['id', ['username', 'name']],
            orderBy: [{ attribute: 'name', order: Order.ASC }]
          }
        );
        expect(result).toStrictEqual([
          { id: '193fce9ea27', name: 'jane' },
          { id: '193fce9df12', name: 'john' },
          { id: '193fce9d5cb', name: 'yusuf' }
        ]);
      });
    });
  });

  describe('selectAsync', () => {
    it('should be able to select all the rows', async () => {
      const result = await query.selectAsync(
        'users'
      );
      expect(result).toStrictEqual([
        { id: '193fce9d5cb', username: 'yusuf', password: '123456' },
        { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' },
        { id: '193fce9ea27', username: 'jane', password: '123456' }
      ]);
    });

    it('should be able to select rows by filter', async () => {
      const result = await query.selectAsync(
        'users',
        { where: { phoneNumber: '123' } }
      );
      expect(result).toStrictEqual([
        { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' }
      ]);
    });

    it('should return empty array if no match is found', async () => {
      const result = await query.selectAsync(
        'users',
        { where: { id: '1' } }
      );
      expect(result).toStrictEqual([]);
    });

    describe('limit', () => {
      it('should return first N rows as per limit', async () => {
        const result = await query.selectAsync(
          'users',
          { limit: 1 }
        );
        expect(result).toStrictEqual([
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' }
        ]);
      });

      it('should return empty array when limit 0', async () => {
        const result = await query.selectAsync(
          'users',
          { limit: 0 }
        );
        expect(result).toStrictEqual([]);
      });

      it('should throw error when limit is negative', async () => {
        await expect(async () => {
          return await query.selectAsync('users', { limit: -1 });
        }).rejects.toThrow(new Error('Limit must not be negative'));
      });
    });

    describe('offset', () => {
      it('should return all rows after X offset', async () => {
        const result = await query.selectAsync(
          'users',
          { offset: 1 }
        );
        expect(result).toStrictEqual([
          { id:'193fce9df12',username:'john',password:'123456',phoneNumber:'123' },
          { id:'193fce9ea27',username:'jane',password:'123456' }
        ]);
      });

      it('should throw error when offset is negative', async () => {
        await expect(async () => {
          await query.selectAsync('users', { offset: -1 });
        }).rejects.toThrow(new Error('Offset must not be negative'));
      });
    });

    describe('limit and offset', () => {
      it('should return N rows as per limit after X offset', async () => {
        const result = await query.selectAsync(
          'users',
          { limit: 1, offset: 1 }
        );
        expect(result).toStrictEqual([
          { id:'193fce9df12',username:'john',password:'123456',phoneNumber:'123' }
        ]);
      });
    });

    describe('attributes', () => {
      it('should throw error when unknown column names passed in attributes', async () => {
        await expect(async () => {
          await query.selectAsync('users', { attributes: ['col1', ['col2', 'alias']] });
        }).rejects.toThrow(new Error('Invalid column names passed in attributes: col1, col2'));
      });

      it('should return specified columns as per the passed attributes', async () => {
        const result = await query.selectAsync(
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

    describe('orderBy', () => {
      it('should be able to sort in ascending order', async () => {
        const result = await query.selectAsync(
          'users',
          { orderBy: [{ attribute: 'username' }] }
        );
        expect(result).toStrictEqual([
          { id: '193fce9ea27', username: 'jane', password: '123456' },
          { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' },
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' }
        ]);
      });

      it('should be able to sort by alias names', async () => {
        const result = await query.selectAsync(
          'users',
          {
            attributes: ['id', ['username', 'name']],
            orderBy: [{ attribute: 'name', order: Order.ASC }]
          }
        );
        expect(result).toStrictEqual([
          { id: '193fce9ea27', name: 'jane' },
          { id: '193fce9df12', name: 'john' },
          { id: '193fce9d5cb', name: 'yusuf' }
        ]);
      });
    });
  });

  describe('schemaless', () => {
    beforeEach(() => {
      schemaRegistry = new SchemaRegistry({
        collections: [{
          name: 'users',
          columns: []
        }]
      });

      mockFileInstance = new File('/test-dir') as jest.Mocked<File>;
      query = new Query(schemaRegistry, mockFileInstance);

      mockFileInstance.readSync.mockReturnValue(readSyncData);
    });

    it('should be able to insert new row', () => {
      const result = query.insert(
        'users',
        { username: 'jim', password: '123456', email: 'jim@example.com' }
      );

      expect(mockFileInstance.readSync).toHaveBeenCalledWith('users');
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' },
          { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' },
          { id: '193fce9ea27', username: 'jane', password: '123456' },
          { id: '193fce9d5cb-06461496', username: 'jim', password: '123456', email: 'jim@example.com' }
        ])
      );
      expect(result).toBe('193fce9d5cb-06461496');
    });

    it('should be able to update existing row', () => {
      const result = query.update(
        'users',
        { address: 'Some address line' },
        { where: { username: 'jane' } }
      );
      expect(result).toBe(1);
      expect(mockFileInstance.writeSync).toHaveBeenCalledWith(
        'users',
        JSON.stringify([
          { id: '193fce9d5cb', username: 'yusuf', password: '123456' },
          { id: '193fce9df12', username: 'john', password: '123456', phoneNumber: '123' },
          { id: '193fce9ea27', username: 'jane', password: '123456', address: 'Some address line' }
        ])
      );
    });
  });
});