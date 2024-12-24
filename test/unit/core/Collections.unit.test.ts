import fs from 'fs';
import { Collection } from '../../../src/core/Collection';

describe('Collection.createCollections', () => {
  let collection: Collection;
  // eslint-disable-next-line
  let existsSync: any;
  // eslint-disable-next-line
  let writeFileSync: any;

  beforeAll(() => {
    existsSync = jest.spyOn(fs, 'existsSync');
    writeFileSync = jest.spyOn(fs, 'writeFileSync');
  });

  beforeEach(() => {
    collection = new Collection();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create new collections when they do not exist', () => {
    const dataDir = '/test-dir';
    const collectionNames = ['collection1', 'collection2'];

    existsSync.mockImplementation(() => false);
    writeFileSync.mockImplementation(() => {});

    collection.createCollections(dataDir, collectionNames);

    expect(existsSync).toHaveBeenCalledWith(`${dataDir}/collection1`);
    expect(existsSync).toHaveBeenCalledWith(`${dataDir}/collection2`);

    expect(writeFileSync).toHaveBeenCalledWith(`${dataDir}/collection1`, '{}', 'utf8');
    expect(writeFileSync).toHaveBeenCalledWith(`${dataDir}/collection2`, '{}', 'utf8');
  });

  it('should not create collections that already exist', () => {
    const dataDir = '/test-dir';
    const collectionNames = ['collection1', 'collection2'];

    existsSync.mockImplementation((path: string) => path.includes('collection1'));

    collection.createCollections(dataDir, collectionNames);

    expect(existsSync).toHaveBeenCalledWith(`${dataDir}/collection1`);
    expect(existsSync).toHaveBeenCalledWith(`${dataDir}/collection2`);

    expect(writeFileSync).toHaveBeenCalledWith(`${dataDir}/collection2`, '{}', 'utf8');
  });

  it('should log and throw an error if an exception occurs', () => {
    const dataDir = '/test-dir';
    const collectionNames = ['collection1'];

    const error = new Error('Test error');
    existsSync.mockImplementation(() => false);
    writeFileSync.mockImplementation(() => {
      console.log('writeFileSync called');
      throw error;
    });

    const consoleErrorSpy =
      jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => collection.createCollections(dataDir, collectionNames)).toThrow(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    consoleErrorSpy.mockRestore();
  });
});
