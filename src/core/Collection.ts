import { CollectionType } from '../types/schema';
import { FileSync } from './File';

export class Collection {
  createCollectionsSync(dataDir: string, collections: CollectionType[]) {
    try {
      collections.forEach(collection => {
        const { name: collectionName } = collection;
        new FileSync(dataDir).createSync(collectionName, '[]');
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  dropCollectionSync(dataDir: string, collectionName: string) {
    try {
      new FileSync(dataDir).deleteFileSync(collectionName);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}