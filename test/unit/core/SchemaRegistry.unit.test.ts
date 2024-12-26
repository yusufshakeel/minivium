import { SchemaRegistry } from '../../../src/core/SchemaRegistry';

describe('Schema Registry', () => {
  const schema = new SchemaRegistry({
    collections: [{
      name: 'users',
      columns: [
        { name: 'username', isRequired: true },
        { name: 'password', isRequired: true },
        { name: 'phoneNumber' }
      ]
    }]
  });

  it('Should be able to set and get the schema', async () => {
    expect(schema.getSchema()).toStrictEqual({
      collections: [{
        name: 'users',
        columns: [
          { name: 'username', isRequired: true },
          { name: 'password', isRequired: true },
          { name: 'phoneNumber' }
        ]
      }]
    });
  });

  describe('getCollections', () => {
    it('Should be able to get collections', () => {
      expect(schema.getCollections()).toStrictEqual([{
        name: 'users',
        columns: [
          { name: 'username', isRequired: true },
          { name: 'password', isRequired: true },
          { name: 'phoneNumber' }
        ]
      }]);
    });
  });

  describe('getCollectionNames', () => {
    it('Should be able to get collection names', () => {
      expect(schema.getCollectionNames()).toStrictEqual(['users']);
    });
  });

  describe('getCollection', () => {
    it('Should be able to get collection by name', () => {
      expect(schema.getCollection('users')).toStrictEqual({
        name: 'users',
        columns: [
          { name: 'username', isRequired: true },
          { name: 'password', isRequired: true },
          { name: 'phoneNumber' }
        ]
      });
    });

    it('Should return undefined if collection does not exists', () => {
      expect(schema.getCollection('unknown')).toBeUndefined();
    });
  });

  describe('getColumns', () => {
    it('should be able to get columns of a collection', () => {
      expect(schema.getColumns('users')).toStrictEqual([
        { isRequired: true, name: 'username' },
        { isRequired: true, name: 'password' },
        { name: 'phoneNumber' }
      ]);
    });

    it('should throw error if collection does not exists', () => {
      expect(() => schema.getColumns('unknown'))
        .toThrow('Collection unknown does not exist');
    });
  });

  describe('getColumnNames', () => {
    it('Should be able to get column names', () => {
      expect(schema.getColumnNames('users'))
        .toStrictEqual(['username', 'password', 'phoneNumber']);
    });
  });

  describe('getRequiredColumn', () => {
    it('Should be able to get required column', () => {
      expect(schema.getRequiredColumn('users')).toStrictEqual([
        { name: 'username', isRequired: true },
        { name: 'password', isRequired: true }
      ]);
    });
  });

  describe('getRequiredColumnNames', () => {
    it('Should be able to get required column names', () => {
      expect(schema.getRequiredColumnNames('users'))
        .toStrictEqual(['username', 'password']);
    });
  });
});