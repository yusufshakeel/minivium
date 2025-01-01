import { CollectionType } from '../types/schema';
import { File } from './File';

export class Collection {
  private readonly file: File;
  private readonly collections: CollectionType[];

  constructor(file: File, collections: CollectionType[]) {
    this.file = file;
    this.collections = collections;
  }

  createCollectionsIfNotExistsSync() {
    this.collections.forEach(collection => {
      const { name: collectionName } = collection;
      this.file.createFileIfNotExistsSync(collectionName);
    });
  }

  dropCollectionSync(collectionName: string) {
    this.file.deleteFileSync(collectionName);
  }

  dropAllCollectionsSync() {
    this.collections.forEach(collection => {
      const { name: collectionName } = collection;
      this.file.deleteFileSync(collectionName);
    });
  }
}