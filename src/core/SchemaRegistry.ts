import { Schema } from '../types/schema';

export class SchemaRegistry {
  private readonly schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  getSchema(): Schema {
    return this.schema;
  }

  getCollectionNames(): string[] {
    return this.schema.collections.map(c => c.name);
  }
}