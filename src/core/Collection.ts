import { CollectionType } from '../types/schema';
import { FileSync } from './File';

export class Collection {
  private readonly fileSync: FileSync;
  private readonly collections: CollectionType[];

  constructor(fileSync: FileSync, collections: CollectionType[]) {
    this.fileSync = fileSync;
    this.collections = collections;
  }

  createCollectionsIfNotExistsSync() {
    try {
      this.collections.forEach(collection => {
        const { name: collectionName } = collection;
        this.fileSync.createFileIfNotExistsSync(collectionName);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  dropCollectionSync(collectionName: string) {
    try {
      this.fileSync.deleteFileSync(collectionName);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  dropAllCollectionSync() {
    try {
      this.collections.forEach(collection => {
        const { name: collectionName } = collection;
        this.fileSync.deleteFileSync(collectionName);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}