import { SchemaRegistry } from './SchemaRegistry';
import { FileSync } from './File';
import { genId } from '../utils/id';
import { QueryOption, SelectQueryAttribute, SelectQueryOption } from '../types/query';
import { filter } from '../helpers/filter';
import { columnsViolatingUniqueConstraint } from '../helpers/unique';
import { selectAttributes } from '../helpers/select';

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
    const result = this.bulkInsert(collectionName, [data]);
    return result[0];
  }

  bulkInsert(collectionName: string, data: object[]): string[] {
    this.collectionExists(collectionName);

    const dataToInsert = data
      .map(d => this.getDataForColumns(collectionName, d))
      .map(d => ({ id: genId(), ...d }));

    const requiredColumnNames = this.schemaRegistry.getRequiredColumnNames(collectionName);

    if (requiredColumnNames.length) {
      dataToInsert.forEach(d => {
        const columnsToInsert: string[] = Object.keys(d);
        const missingRequiredColumns =
          requiredColumnNames.filter(c => !columnsToInsert.includes(c));

        if (missingRequiredColumns.length) {
          throw new Error(
            `Provide value for the required fields: ${missingRequiredColumns.join(', ')}`
          );
        }
      });
    }

    const currentCollectionData = this.readCollectionContent(collectionName);

    const uniqueColumnNames = this.schemaRegistry.getUniqueColumnNames(collectionName);

    const dataToWrite = [ ...currentCollectionData, ...dataToInsert ];

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

    return dataToInsert.map(d => d.id);
  }

  private validateAttributes(collectionName: string, attributes: SelectQueryAttribute[]) {
    if (attributes.length) {
      const columnNames = this.schemaRegistry.getColumnNames(collectionName);
      const columnsNamesToSelect = attributes.map(v => {
        if (Array.isArray(v)) {
          return v[0];
        }
        return v;
      });
      const isAllValidColumnNames = columnsNamesToSelect.filter(v => {
        return !columnNames.includes(v);
      });
      if(isAllValidColumnNames.length) {
        throw new Error(`Invalid column names passed in attributes: ${isAllValidColumnNames.join(', ')}`);
      }
    }
  }

  private validateLimitAndOffset(limit: number | undefined, offset: number | undefined) {
    if (limit! < 0) {
      throw new Error('Limit must not be negative');
    }
    if (offset! < 0) {
      throw new Error('Offset must not be negative');
    }
  }

  select(collectionName: string, option?: SelectQueryOption): any[] {
    this.collectionExists(collectionName);

    const { limit, offset, attributes } = option || {};

    this.validateLimitAndOffset(limit, offset);

    if(limit === 0) {
      return [];
    }

    if (attributes) {
      this.validateAttributes(collectionName, attributes);
    }

    let selectedRows = filter(this.readCollectionContent(collectionName), option?.where);

    if (limit !== undefined && offset !== undefined) {
      selectedRows = selectedRows.slice(offset, offset + limit);
    } else if (offset !== undefined) {
      selectedRows = selectedRows.slice(offset);
    } else if (limit !== undefined) {
      selectedRows = selectedRows.slice(0, limit);
    }

    if (attributes?.length) {
      return selectAttributes(attributes, selectedRows);
    }

    return selectedRows;
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