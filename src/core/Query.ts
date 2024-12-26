import { SchemaRegistry } from './SchemaRegistry';
import { FileSync } from './File';
import { genId } from './id';

export class Query {
  private readonly schemaRegistry: SchemaRegistry;
  private readonly fileSync: FileSync;

  constructor(schemaRegistry: SchemaRegistry, fileSync: FileSync) {
    this.schemaRegistry = schemaRegistry;
    this.fileSync = fileSync;
  }

  private readCollectionContent(collectionName: string) {
    return JSON.parse(this.fileSync.readSync(collectionName));
  }

  private writeCollectionContent(collectionName: string, content: object) {
    this.fileSync.writeSync(collectionName, JSON.stringify(content));
  }

  private collectionExists(collectionName: string) {
    if(!this.schemaRegistry.getCollection(collectionName)) {
      throw new Error(`Collection '${collectionName}' does not exist`);
    }
  }

  private getDataForColumns(collectionName: string, data: object) {
    const columnNames = this.schemaRegistry.getColumnNames(collectionName);
    return Object.entries(data)
      .reduce((acc, curr) => {
        const [key, value] = curr as [string, unknown];
        if (columnNames.includes(key)) {
          return { ...acc, [key]: value };
        } else {
          throw new Error(
            `Column '${key}' does not exists for '${collectionName}' collection.`
          );
        }
      }, {} as Record<string, unknown>);
  }

  insert(collectionName: string, data: object): string {
    this.collectionExists(collectionName);

    const dataForColumns =
      this.getDataForColumns(collectionName, data);

    const dataToInsert = { id: genId(), ...dataForColumns };

    const requiredColumns = this.schemaRegistry
      .getColumns(collectionName)
      .filter(c => !!c.isRequired).map(c => c.name);

    if (requiredColumns) {
      const columnsToInsert: string[] = Object.keys(dataToInsert);
      const missingRequiredColumns =
        requiredColumns.filter(c => !columnsToInsert.includes(c));

      if (missingRequiredColumns.length) {
        throw new Error(
          `Provide value for the mandatory fields: ${missingRequiredColumns.join(', ')}`
        );
      }
    }

    const currentData = this.readCollectionContent(collectionName);
    this.writeCollectionContent(collectionName, [ ...currentData, dataToInsert ]);

    return dataToInsert.id;
  }
}