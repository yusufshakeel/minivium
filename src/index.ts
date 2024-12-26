import { SchemaRegistry } from './core/SchemaRegistry';
import { Collection } from './core/Collection';
import { Op } from './core/Operators';
import { Query } from './core/Query';
import { Config } from './types/config';
import { FileSync } from './core/File';
import { MiniviumType } from './types/minivium';

function minivium(config: Config): MiniviumType {
  const fileSync = new FileSync(config.dataDir);
  const collections = new Collection(fileSync, config.schemaRegistry.getCollections());
  const query = new Query(config.schemaRegistry, fileSync);

  const init = () => collections.createCollectionsSync();

  const dropCollection =
    (collectionName: string) => collections.dropCollectionSync(collectionName);

  const dropAllCollections = () => collections.dropAllCollectionSync();

  return { init, query, dropCollection, dropAllCollections };
}

export { minivium, SchemaRegistry, Op };