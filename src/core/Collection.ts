import fs from 'fs';

export class Collection {
  createCollections(dataDir: string, collectionNames: string[]) {
    try {
      collectionNames.forEach(collectionName => {
        const collectionFilePath = `${dataDir}/${collectionName}`;
        if(fs.existsSync(collectionFilePath)) {
          console.log(`Collection ${collectionName} already exists`);
        } else {
          console.log(`Creating ${collectionName} collection`);
          fs.writeFileSync(collectionFilePath, '{}', 'utf8');
        }
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}