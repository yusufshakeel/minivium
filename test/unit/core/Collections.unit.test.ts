import { Collection } from '../../../src/core/Collection';
import { File } from '../../../src/core/File';
import { CollectionType } from '../../../src/types/schema';

describe('Collection', () => {
  const collections: CollectionType[] = [
    { name: 'collection1', columns: [{ name: 'username', isRequired: true }] },
    { name: 'collection2', columns: [{ name: 'username', isRequired: true }] }
  ];

  const createFileIfNotExistsSync = jest.fn();
  const deleteFileSync = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createCollectionsIfNotExistsSync', () => {
    it('should be able to create the collections', () => {
      const file = { createFileIfNotExistsSync };
      new Collection(file as unknown as File, collections)
        .createCollectionsIfNotExistsSync();

      expect(createFileIfNotExistsSync).toHaveBeenCalledWith('collection1');
      expect(createFileIfNotExistsSync).toHaveBeenCalledWith('collection2');
    });

    it('should throw error when it is unable to create collections', () => {
      const file = {
        createFileIfNotExistsSync: jest.fn(() => {
          throw new Error('Some error');
        })
      };

      expect(() => {
        new Collection(file as unknown as File, collections)
          .createCollectionsIfNotExistsSync();
      }).toThrow('Some error');
    });
  });

  describe('dropCollectionSync', () => {
    it('should be able to drop the collections', () => {
      const file = { deleteFileSync };
      new Collection(file as unknown as File, collections).dropCollectionSync('collection1');
      expect(deleteFileSync).toHaveBeenCalledWith('collection1');
    });

    it('should throw error when it is unable to drop collections', () => {
      const file = {
        deleteFileSync: jest.fn(() => {
          throw new Error('Some error');
        })
      };
      expect(() => {
        new Collection(file as unknown as File, collections).dropCollectionSync('collection1');
      }).toThrow('Some error');
    });
  });

  describe('dropAllCollectionsSync', () => {
    it('should be able to drop all collections', () => {
      const file = { deleteFileSync };
      new Collection(file as unknown as File, collections).dropAllCollectionsSync();
      expect(deleteFileSync).toHaveBeenCalledWith('collection1');
      expect(deleteFileSync).toHaveBeenCalledWith('collection2');
    });

    it('should throw error when it is unable to drop all collections', () => {
      const file = {
        deleteFileSync: jest.fn(() => {
          throw new Error('Some error');
        })
      };
      expect(() => {
        new Collection(file as unknown as File, collections).dropAllCollectionsSync();
      }).toThrow('Some error');
    });
  });
});