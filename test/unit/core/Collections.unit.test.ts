import { Collection } from '../../../src/core/Collection';
import { FileSync } from '../../../src/core/File';
import { CollectionType } from '../../../src/types/schema';

describe('Collection', () => {
  const collections: CollectionType[] = [
    { name: 'collection1', columns: [{ name: 'username', isRequired: true }] },
    { name: 'collection2', columns: [{ name: 'username', isRequired: true }] }
  ];

  const createSync = jest.fn();
  const deleteFileSync = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createCollectionsSync', () => {
    it('should be able to create the collections', () => {
      const fileSync = { createSync };
      new Collection(fileSync as unknown as FileSync, collections).createCollectionsSync();
      expect(createSync).toHaveBeenCalledWith('collection1', '[]');
      expect(createSync).toHaveBeenCalledWith('collection2', '[]');
    });

    it('should throw error when it is unable to create collections', () => {
      const fileSync = {
        createSync: jest.fn(() => {
          throw new Error('Some error');
        })
      };
      expect(() => {
        new Collection(fileSync as unknown as FileSync, collections).createCollectionsSync();
      }).toThrow('Some error');
    });
  });

  describe('dropCollectionSync', () => {
    it('should be able to drop the collections', () => {
      const fileSync = { deleteFileSync };
      new Collection(fileSync as unknown as FileSync, collections).dropCollectionSync('collection1');
      expect(deleteFileSync).toHaveBeenCalledWith('collection1');
    });

    it('should throw error when it is unable to drop collections', () => {
      const fileSync = {
        deleteFileSync: jest.fn(() => {
          throw new Error('Some error');
        })
      };
      expect(() => {
        new Collection(fileSync as unknown as FileSync, collections).dropCollectionSync('collection1');
      }).toThrow('Some error');
    });
  });

  describe('dropAllCollectionSync', () => {
    it('should be able to drop all collections', () => {
      const fileSync = { deleteFileSync };
      new Collection(fileSync as unknown as FileSync, collections).dropAllCollectionSync();
      expect(deleteFileSync).toHaveBeenCalledWith('collection1');
      expect(deleteFileSync).toHaveBeenCalledWith('collection2');
    });

    it('should throw error when it is unable to drop all collections', () => {
      const fileSync = {
        deleteFileSync: jest.fn(() => {
          throw new Error('Some error');
        })
      };
      expect(() => {
        new Collection(fileSync as unknown as FileSync, collections).dropAllCollectionSync();
      }).toThrow('Some error');
    });
  });
});