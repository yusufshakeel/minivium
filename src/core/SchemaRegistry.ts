import { CollectionType, Column, Schema } from '../types/schema';

export class SchemaRegistry {
  private readonly schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  getSchema(): Schema {
    return this.schema;
  }

  getCollections(): CollectionType[] {
    return this.schema.collections;
  }

  getCollection(collectionName: string): CollectionType | undefined {
    return this.schema.collections.find(c => c.name === collectionName);
  }

  getCollectionNames(): string[] {
    return this.schema.collections.map(c => c.name);
  }

  getColumns(collectionName: string): Column[] {
    const collection = this.getCollection(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }
    return collection.columns;
  }

  getColumnNames(collectionName: string): string[] {
    return this.getColumns(collectionName).map(c => c.name);
  }

  getRequiredColumns(collectionName: string): Column[] {
    return this.getColumns(collectionName)
      .filter(c => !!c.isRequired);
  }

  getRequiredColumnNames(collectionName: string): string[] {
    return this.getRequiredColumns(collectionName)
      .map(c => c.name);
  }

  getUniqueColumns(collectionName: string): Column[] {
    return this.getColumns(collectionName)
      .filter(c => !!c.isUnique);
  }

  getUniqueColumnNames(collectionName: string): string[] {
    return this.getUniqueColumns(collectionName)
      .map(c => c.name);
  }
}