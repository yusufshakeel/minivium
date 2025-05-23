import { SchemaRegistry } from './SchemaRegistry';
import { File } from './File';
import { genId } from '../utils/id';
import { QueryOption, SelectQueryAttribute, SelectQueryOption } from '../types/query';
import { filter } from '../helpers/filter';
import { columnsViolatingUniqueConstraint } from '../helpers/unique';
import { selectAttributes } from '../helpers/select';
import { orderBy } from '../helpers/order';

export class Query {
  private readonly schemaRegistry: SchemaRegistry;
  private readonly file: File;

  constructor(schemaRegistry: SchemaRegistry, file: File) {
    this.schemaRegistry = schemaRegistry;
    this.file = file;
  }

  private readCollectionContentSync(collectionName: string) {
    return JSON.parse(this.file.readSync(collectionName));
  }

  private async readCollectionContent(collectionName: string) {
    const content = await this.file.read(collectionName);
    return JSON.parse(content);
  }

  private writeCollectionContentSync(collectionName: string, content: object) {
    this.file.writeSync(collectionName, JSON.stringify(content));
  }

  private async writeCollectionContent(collectionName: string, content: object) {
    await this.file.write(collectionName, JSON.stringify(content));
  }

  private collectionExists(collectionName: string) {
    if (!this.schemaRegistry.getCollection(collectionName)) {
      throw new Error(`Collection '${collectionName}' does not exist`);
    }
  }

  private getDataForColumns(collectionName: string, data: object) {
    const columnNames = this.schemaRegistry.getColumnNames(collectionName);
    if (columnNames.length) {
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
    return data;
  }

  insert(collectionName: string, data: object): string {
    const result = this.bulkInsert(collectionName, [data]);
    return result[0];
  }

  async insertAsync(collectionName: string, data: object): Promise<string> {
    const result = await this.bulkInsertAsync(collectionName, [data]);
    return result[0];
  }

  private baseBulkInsert(collectionName: string, allRows: any[], data: object[]) {
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

    const uniqueColumnNames = this.schemaRegistry.getUniqueColumnNames(collectionName);

    const dataToWrite = [ ...allRows, ...dataToInsert ];

    if (uniqueColumnNames.length) {
      const violatingColumns = columnsViolatingUniqueConstraint(
        dataToWrite,
        uniqueColumnNames
      );
      if (violatingColumns.length) {
        throw new Error(`Unique constraint violated for columns: ${violatingColumns.join(', ')}`);
      }
    }

    return { dataToWrite, dataToInsert };
  }

  bulkInsert(collectionName: string, data: object[]): string[] {
    const currentCollectionData = this.readCollectionContentSync(collectionName);

    const { dataToWrite, dataToInsert } =
      this.baseBulkInsert(collectionName, currentCollectionData, data);

    this.writeCollectionContentSync(collectionName, dataToWrite);

    return dataToInsert.map(d => d.id);
  }

  async bulkInsertAsync(collectionName: string, data: object[]): Promise<string[]> {
    const currentCollectionData = await this.readCollectionContent(collectionName);

    const { dataToWrite, dataToInsert } =
      this.baseBulkInsert(collectionName, currentCollectionData, data);

    await this.writeCollectionContent(collectionName, dataToWrite);

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
      if (isAllValidColumnNames.length) {
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

  /**
   * The order of execution is similar to a SQL queries.
   *
   * FROM - The collection to choose the base data from
   *
   * WHERE - Filter the base data
   *
   * SELECT - Returns the final data
   *
   * ORDER BY - Sorts the final data
   *
   * LIMIT and/or OFFSET - Return only the required number of rows.
   *
   * @param collectionName {string}
   * @param allRows {any[]}
   * @param option {SelectQueryOption}
   * @private
   */
  private baseSelect(collectionName: string, allRows: any[], option?: SelectQueryOption) {
    this.collectionExists(collectionName);

    const { limit, offset, attributes } = option || {};

    this.validateLimitAndOffset(limit, offset);

    if (limit === 0) {
      return [];
    }

    if (attributes) {
      this.validateAttributes(collectionName, attributes);
    }

    // FROM allRows - The collection to choose the base data from
    // WHERE option?.where - Filter the base data
    // SELECT - Returns the final data
    let selectedRows = filter(allRows, option?.where);

    // this part will select the specific columns of the collection
    // and will assign aliases if instructed
    if (attributes?.length) {
      selectedRows = selectAttributes(attributes, selectedRows);
    }

    // this will SORT the final data
    if (option?.orderBy?.length) {
      selectedRows = orderBy(selectedRows, option.orderBy);
    }

    // this is the LIMIT and/or OFFSET part to return the required number of rows
    if (limit !== undefined && offset !== undefined) {
      selectedRows = selectedRows.slice(offset, offset + limit);
    } else if (offset !== undefined) {
      selectedRows = selectedRows.slice(offset);
    } else if (limit !== undefined) {
      selectedRows = selectedRows.slice(0, limit);
    }

    return selectedRows;
  }

  select(collectionName: string, option?: SelectQueryOption): any[] {
    const currentCollectionData = this.readCollectionContentSync(collectionName);
    return this.baseSelect(collectionName, currentCollectionData, option);
  }

  async selectAsync(collectionName: string, option?: SelectQueryOption): Promise<any[]> {
    const currentCollectionData = await this.readCollectionContent(collectionName);
    return this.baseSelect(collectionName, currentCollectionData, option);
  }

  private baseUpdate(
    collectionName: string,
    allRows: any[],
    data: object,
    option?: QueryOption
  ) {
    this.collectionExists(collectionName);

    const dataForColumns =
      this.getDataForColumns(collectionName, data);

    let updatedRowCount = 0;
    const dataToUpdate = allRows.reduce(
      (acc: any, curr: any) => {
        if (filter([curr], option?.where).length) {
          updatedRowCount++;
          return [...acc, { ...curr, ...dataForColumns }];
        }
        return [...acc, curr];
      }, []);

    if (updatedRowCount === 0) {
      return { updatedRowCount, dataToUpdate };
    }

    const uniqueColumnNames =
      this.schemaRegistry.getUniqueColumnNames(collectionName);

    if (uniqueColumnNames.length) {
      const violatingColumns = columnsViolatingUniqueConstraint(
        dataToUpdate,
        uniqueColumnNames
      );
      if (violatingColumns.length) {
        throw new Error(
          `Unique constraint violated for columns: ${violatingColumns.join(', ')}`
        );
      }
    }

    return { updatedRowCount, dataToUpdate };
  }

  update(collectionName: string, data: object, option?: QueryOption): number {
    const currentCollectionData = this.readCollectionContentSync(collectionName);

    const { updatedRowCount, dataToUpdate } =
      this.baseUpdate(collectionName, currentCollectionData, data, option);

    if (updatedRowCount === 0) {
      return updatedRowCount;
    }

    this.writeCollectionContentSync(collectionName, dataToUpdate);

    return updatedRowCount;
  }

  async updateAsync(collectionName: string, data: object, option?: QueryOption): Promise<number> {
    const currentCollectionData = await this.readCollectionContent(collectionName);

    const { updatedRowCount, dataToUpdate } =
      this.baseUpdate(collectionName, currentCollectionData, data, option);

    if (updatedRowCount === 0) {
      return updatedRowCount;
    }

    await this.writeCollectionContent(collectionName, dataToUpdate);

    return updatedRowCount;
  }

  private baseDelete(collectionName: string, allRows: any[], option?: QueryOption) {
    this.collectionExists(collectionName);

    let deletedRowCount = 0;
    const dataToKeep = allRows.reduce(
      (acc: any, curr: any) => {
        if (filter([curr], option?.where).length) {
          deletedRowCount++;
          return acc;
        }
        return [...acc, curr];
      }, []);

    return { deletedRowCount, dataToKeep };
  }

  delete(collectionName: string, option?: QueryOption): number {
    const currentCollectionData = this.readCollectionContentSync(collectionName);

    const { deletedRowCount, dataToKeep } =
      this.baseDelete(collectionName, currentCollectionData, option);

    if (deletedRowCount === 0) {
      return deletedRowCount;
    }

    this.writeCollectionContentSync(collectionName, dataToKeep);

    return deletedRowCount;
  }

  async deleteAsync(collectionName: string, option?: QueryOption): Promise<number> {
    const currentCollectionData = await this.readCollectionContent(collectionName);

    const { deletedRowCount, dataToKeep } =
      this.baseDelete(collectionName, currentCollectionData, option);

    if (deletedRowCount === 0) {
      return deletedRowCount;
    }

    await this.writeCollectionContent(collectionName, dataToKeep);

    return deletedRowCount;
  }
}