import { SchemaRegistry } from '../../../src/core/SchemaRegistry';

describe('Schema Registry', () => {
  it('Should be able to set and get the schema', async () => {
    const schema = new SchemaRegistry({
      collections: [{
        name: 'users',
        columns: [ { name: 'username', isRequired: true }]
      }]
    }).getSchema();

    expect(schema).toStrictEqual({
      collections: [{
        name: 'users',
        columns: [ { name: 'username', isRequired: true }]
      }]
    });
  });

  it('Should be able to get collection names', () => {
    const schema = new SchemaRegistry({
      collections: [{
        name: 'users',
        columns: [ { name: 'username', isRequired: true }]
      }]
    });

    expect(schema.getCollectionNames()).toStrictEqual(['users']);
  });
});