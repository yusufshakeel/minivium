import { CollectionType } from '../types/schema';
import { FileSync } from './File';

export class Collection {
  createCollectionsSync(dataDir: string, collections: CollectionType[]) {
    try {
      collections.forEach(collection => {
        const { name: collectionName } = collection;
        new FileSync(dataDir, collectionName).createSync('[]');
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}