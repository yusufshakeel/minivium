import { SchemaRegistry } from './core/SchemaRegistry';
import { Collection } from './core/Collection';
import { Op } from './core/Operators';
import { Query } from './core/Query';
import { Config } from './types/config';
import { File } from './core/File';
import { MiniviumType } from './types/minivium';

function minivium(config: Config): MiniviumType {
  const file = new File(config.dataDir);
  const collections = new Collection(file, config.schemaRegistry.getCollections());
  const query = new Query(config.schemaRegistry, file);

  const init = () => collections.createCollectionsIfNotExistsSync();

  const initAsync = async () => {
    await collections.createCollectionsIfNotExists();
  };

  const dropCollection =
    (collectionName: string) => collections.dropCollectionSync(collectionName);

  const dropCollectionAsync =
    async (collectionName: string) => {
      await collections.dropCollection(collectionName);
    };

  const dropAllCollections = () => collections.dropAllCollectionsSync();

  const dropAllCollectionsAsync = async () => {
    await collections.dropAllCollections();
  };

  return {
    init, initAsync,
    query,
    dropCollection, dropCollectionAsync,
    dropAllCollections, dropAllCollectionsAsync
  };
}

export { minivium, SchemaRegistry, Op };