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
    this.collections.forEach(collection => {
      const { name: collectionName } = collection;
      this.fileSync.createFileIfNotExistsSync(collectionName);
    });
  }

  dropCollectionSync(collectionName: string) {
    this.fileSync.deleteFileSync(collectionName);
  }

  dropAllCollectionSync() {
    this.collections.forEach(collection => {
      const { name: collectionName } = collection;
      this.fileSync.deleteFileSync(collectionName);
    });
  }
}