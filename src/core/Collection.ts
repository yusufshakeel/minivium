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
      this.file.createFileIfNotExistsSync(collection.name);
    });
  }

  async createCollectionsIfNotExists(): Promise<void[]> {
    const promises = this.collections.map(
      collection => this.file.createFileIfNotExists(collection.name)
    );
    return Promise.all(promises);
  }

  dropCollectionSync(collectionName: string) {
    this.file.deleteFileSync(collectionName);
  }

  async dropCollection(collectionName: string): Promise<void> {
    return this.file.deleteFile(collectionName);
  }

  dropAllCollectionsSync() {
    this.collections.forEach(collection => {
      this.file.deleteFileSync(collection.name);
    });
  }

  async dropAllCollections(): Promise<void[]> {
    const promises = this.collections.map(
      collection => this.file.deleteFile(collection.name)
    );
    return Promise.all(promises);
  }
}