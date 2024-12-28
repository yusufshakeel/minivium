import { SchemaRegistry } from './SchemaRegistry';
import { FileSync } from './File';
import { genId } from '../utils/id';
import { QueryOption, SelectQueryOption } from '../types/query';
import { filter } from '../helpers/filter';
import { columnsViolatingUniqueConstraint } from '../helpers/unique';

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

    const dataForColumns = this.getDataForColumns(collectionName, data);

    const dataToInsert = { id: genId(), ...dataForColumns };

    const requiredColumnNames = this.schemaRegistry.getRequiredColumnNames(collectionName);

    if (requiredColumnNames.length) {
      const columnsToInsert: string[] = Object.keys(dataToInsert);
      const missingRequiredColumns =
        requiredColumnNames.filter(c => !columnsToInsert.includes(c));

      if (missingRequiredColumns.length) {
        throw new Error(
          `Provide value for the required fields: ${missingRequiredColumns.join(', ')}`
        );
      }
    }

    const currentCollectionData = this.readCollectionContent(collectionName);

    const uniqueColumnNames = this.schemaRegistry.getUniqueColumnNames(collectionName);

    const dataToWrite = [ ...currentCollectionData, dataToInsert ];

    if (uniqueColumnNames.length) {
      const violatingColumns = columnsViolatingUniqueConstraint(
        dataToWrite,
        uniqueColumnNames
      );
      if (violatingColumns.length) {
        throw new Error(`Unique constraint violated for columns: ${violatingColumns.join(', ')}`);
      }
    }

    this.writeCollectionContent(collectionName, dataToWrite);

    return dataToInsert.id;
  }

  select(collectionName: string, option?: SelectQueryOption): any[] {
    this.collectionExists(collectionName);
    const rowAfterWhereClauseFilter =
      filter(this.readCollectionContent(collectionName), option?.where);

    if (option?.limit) {
      return rowAfterWhereClauseFilter.slice(0, option.limit);
    }

    return rowAfterWhereClauseFilter;
  }

  update(collectionName: string, data: object, option?: QueryOption): number {
    this.collectionExists(collectionName);

    const dataForColumns = this.getDataForColumns(collectionName, data);

    const currentCollectionData = this.readCollectionContent(collectionName);

    let updatedRowCount = 0;
    const dataToUpdate = currentCollectionData.reduce(
      (acc: any, curr: any) => {
        if(filter([curr], option?.where).length) {
          updatedRowCount++;
          return [...acc, { ...curr, ...dataForColumns }];
        }
        return [...acc, curr];
      }, []);

    if(updatedRowCount === 0) {
      return updatedRowCount;
    }

    const uniqueColumnNames = this.schemaRegistry.getUniqueColumnNames(collectionName);

    if (uniqueColumnNames.length) {
      const violatingColumns = columnsViolatingUniqueConstraint(
        dataToUpdate,
        uniqueColumnNames
      );
      if (violatingColumns.length) {
        throw new Error(`Unique constraint violated for columns: ${violatingColumns.join(', ')}`);
      }
    }

    this.writeCollectionContent(collectionName, dataToUpdate);

    return updatedRowCount;
  }

  delete(collectionName: string, option?: QueryOption): number {
    this.collectionExists(collectionName);

    const currentCollectionData = this.readCollectionContent(collectionName);

    let deletedRowCount = 0;
    const dataToKeep = currentCollectionData.reduce(
      (acc: any, curr: any) => {
        if(filter([curr], option?.where).length) {
          deletedRowCount++;
          return acc;
        }
        return [...acc, curr];
      }, []);

    if(deletedRowCount === 0) {
      return deletedRowCount;
    }

    this.writeCollectionContent(collectionName, dataToKeep);

    return deletedRowCount;
  }
}