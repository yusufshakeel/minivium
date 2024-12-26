import { Collection } from '../../../src/core/Collection';
import { FileSync } from '../../../src/core/File';
import { CollectionType } from '../../../src/types/schema';

jest.mock('../../../src/core/File');

describe('Collection', () => {
  // eslint-disable-next-line
  let collection: Collection;

  beforeEach(() => {
    collection = new Collection();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createCollectionsSync', () => {
    it('should create collections with the given names', () => {
      const dataDir = '/test-dir';
      const collections: CollectionType[] = [
        { name: 'collection1', columns: [{ name: 'username', isRequired: true }] },
        { name: 'collection2', columns: [{ name: 'username', isRequired: true }] }
      ];

      const FileSyncMock = FileSync as jest.MockedClass<typeof FileSync>;

      collection.createCollectionsSync(dataDir, collections);

      expect(FileSyncMock).toHaveBeenCalledTimes(2);
      expect(FileSyncMock).toHaveBeenCalledWith(dataDir);
      expect(FileSyncMock).toHaveBeenCalledWith(dataDir);
      expect(FileSyncMock.mock.instances[0].createSync)
        .toHaveBeenCalledWith('collection1','[]');
      expect(FileSyncMock.mock.instances[1].createSync)
        .toHaveBeenCalledWith('collection2','[]');
    });

    it('should log and throw an error if an exception occurs', () => {
      const dataDir = '/test-dir';
      const collections: CollectionType[] = [
        { name: 'collection1', columns: [{ name: 'username', isRequired: true }] }
      ];

      const FileSyncMock = FileSync as jest.MockedClass<typeof FileSync>;

      const error = new Error('Test error');
      FileSyncMock.mockImplementation(() => {
        throw error;
      });

      const consoleErrorSpy =
        jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        collection.createCollectionsSync(dataDir, collections);
      }).toThrow(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(error);

      consoleErrorSpy.mockRestore();
    });
  });
});