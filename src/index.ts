import { SchemaRegistry } from './core/SchemaRegistry';
import { Collection } from './core/Collection';
import { Op } from './core/Operators';
import { Query } from './core/Query';
import { Config } from './types/config';
import { FileSync } from './core/File';
import { MiniviumType } from './types/minivium';

function minivium(config: Config): MiniviumType {
  const init = () => {
    new Collection().createCollectionsSync(
      config.dataDir,
      config.schemaRegistry.getCollections()
    );
  };

  const fileSync = new FileSync(config.dataDir);
  const query = new Query(config.schemaRegistry, fileSync);

  return { init, query };
}

export { minivium, SchemaRegistry, Op };