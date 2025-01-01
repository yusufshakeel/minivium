import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';
import { File } from '../../../src/core/File';

describe('File', () => {
  const dataDir = '/test-dir';
  const collectionName = 'test-collection.json';
  const filePath = `${dataDir}/${collectionName}`;

  let pathJoin: any;
  let existsSync: any;
  let access: any;

  let writeFileSync: any;
  let readFileSync: any;
  let unlinkSync: any;

  let writeFile: any;
  let readFile: any;
  let unlink: any;

  let file: any;

  beforeAll(() => {
    pathJoin = jest.spyOn(path, 'join');
    existsSync = jest.spyOn(fs, 'existsSync');
    access = jest.spyOn(fsPromise, 'access');

    writeFileSync = jest.spyOn(fs, 'writeFileSync');
    readFileSync = jest.spyOn(fs, 'readFileSync');
    unlinkSync = jest.spyOn(fs, 'unlinkSync');

    writeFile = jest.spyOn(fsPromise, 'writeFile');
    readFile = jest.spyOn(fsPromise, 'readFile');
    unlink = jest.spyOn(fsPromise, 'unlink');

    pathJoin.mockReturnValue(filePath);
    file = new File(dataDir);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createSync', () => {
    it('should create a file with the given content', () => {
      const content = '{"key":"value"}';
      writeFileSync.mockReturnValue();

      file.createSync(collectionName, content);

      expect(writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
    });
  });

  describe('create', () => {
    it('should create a file with the given content', async () => {
      const content = '{"key":"value"}';
      writeFile.mockResolvedValue();

      await file.create(collectionName, content);

      expect(writeFile).toHaveBeenCalledWith(filePath, content, 'utf8');
    });
  });

  describe('createFileIfNotExistsSync', () => {
    it('should be able to create collection', () => {
      existsSync.mockReturnValue(false);
      file.createFileIfNotExistsSync(collectionName);
      expect(writeFileSync).toHaveBeenCalledWith(filePath, '[]', 'utf8');
    });

    it('should do nothing if file already exists', () => {
      existsSync.mockReturnValue(true);
      file.createFileIfNotExistsSync(collectionName);
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('createFileIfNotExists', () => {
    it('should be able to create collection', async () => {
      access.mockRejectedValue(new Error('Not found'));
      await file.createFileIfNotExists(collectionName);
      expect(writeFile).toHaveBeenCalledWith(filePath, '[]', 'utf8');
    });

    it('should do nothing if file already exists', async () => {
      access.mockResolvedValue();
      await file.createFileIfNotExists(collectionName);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('readSync', () => {
    it('should read content from an existing file', () => {
      const content = '{"key":"value"}';
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(content);

      const result = file.readSync(collectionName);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
      expect(result).toBe(content);
    });

    it('should throw an error if the file does not exist', () => {
      existsSync.mockReturnValue(false);

      expect(() => file.readSync(collectionName))
        .toThrow(`File '${collectionName}' does not exist`);
      expect(existsSync).toHaveBeenCalledWith(filePath);
    });
  });

  describe('read', () => {
    it('should read content from an existing file', async () => {
      const content = '{"key":"value"}';
      access.mockResolvedValue();
      readFile.mockResolvedValue(content);

      const result = await file.read(collectionName);

      expect(access).toHaveBeenCalledWith(filePath);
      expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
      expect(result).toBe(content);
    });

    it('should throw an error if the file does not exist', async () => {
      access.mockRejectedValue(new Error('Not found'));

      await expect(() => file.read(collectionName))
        .rejects.toThrow(new Error(`File '${collectionName}' does not exists`));
      expect(access).toHaveBeenCalledWith(filePath);
    });
  });

  describe('writeSync', () => {
    it('should write content to an existing file', () => {
      const content = '{"key":"updated-value"}';
      existsSync.mockReturnValue(true);
      writeFileSync.mockReturnValue();

      file.writeSync(collectionName, content);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
    });

    it('should throw an error if the file does not exist', () => {
      const content = '{"key":"updated-value"}';
      existsSync.mockReturnValue(false);

      expect(() => file.writeSync(collectionName, content))
        .toThrow(`File '${collectionName}' does not exist`);
      expect(existsSync).toHaveBeenCalledWith(filePath);
    });
  });

  describe('write', () => {
    it('should write content to an existing file', async () => {
      const content = '{"key":"updated-value"}';
      access.mockResolvedValue();
      writeFile.mockResolvedValue(content);

      await file.write(collectionName, content);

      expect(access).toHaveBeenCalledWith(filePath);
      expect(writeFile).toHaveBeenCalledWith(filePath, content, 'utf8');
    });

    it('should throw an error if the file does not exist', async () => {
      const content = '{"key":"updated-value"}';
      access.mockRejectedValue(new Error('Not found'));

      await expect(() => file.write(collectionName, content))
        .rejects.toThrow(new Error(`File '${collectionName}' does not exists`));
      expect(access).toHaveBeenCalledWith(filePath);
    });
  });

  describe('deleteFileSync', () => {
    it('should be able to delete file', () => {
      existsSync.mockReturnValue(true);
      unlinkSync.mockReturnValue();
      file.deleteFileSync(collectionName);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(unlinkSync).toHaveBeenCalledWith(filePath);
    });

    it('should throw error if file does not exists', () => {
      existsSync.mockReturnValue(false);
      unlinkSync.mockReturnValue();

      expect(() => file.deleteFileSync(collectionName))
        .toThrow(`File '${collectionName}' does not exist`);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should be able to delete file', async () => {
      access.mockResolvedValue();
      unlink.mockResolvedValue();

      await file.deleteFile(collectionName);

      expect(access).toHaveBeenCalledWith(filePath);
      expect(unlink).toHaveBeenCalledWith(filePath);
    });

    it('should throw error if file does not exists', async () => {
      access.mockRejectedValue(new Error('Not found'));
      unlink.mockResolvedValue();

      await expect(() => file.deleteFile(collectionName))
        .rejects.toThrow(new Error(`File '${collectionName}' does not exists`));

      expect(access).toHaveBeenCalledWith(filePath);
      expect(unlink).not.toHaveBeenCalled();
    });
  });
});