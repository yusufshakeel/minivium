import fs from 'fs';
import path from 'path';
import { FileSync } from '../../../src/core/File';

describe('FileSync', () => {
  const dataDir = '/test-dir';
  const collectionName = 'test-collection.json';
  const filePath = `${dataDir}/${collectionName}`;

  let pathJoin: any;
  let existsSync: any;
  let writeFileSync: any;
  let readFileSync: any;
  let unlinkSync: any;
  let fileSync: any;

  beforeAll(() => {
    pathJoin = jest.spyOn(path, 'join');
    existsSync = jest.spyOn(fs, 'existsSync');
    writeFileSync = jest.spyOn(fs, 'writeFileSync');
    readFileSync = jest.spyOn(fs, 'readFileSync');
    unlinkSync = jest.spyOn(fs, 'unlinkSync');
  });

  beforeEach(() => {
    pathJoin.mockReturnValue(filePath);
    fileSync = new FileSync(dataDir);
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

      fileSync.createSync(collectionName, content);

      expect(writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
    });
  });

  describe('readSync', () => {
    it('should read content from an existing file', () => {
      const content = '{"key":"value"}';
      existsSync.mockReturnValue(true);
      readFileSync.mockReturnValue(content);

      const result = fileSync.readSync(collectionName);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
      expect(result).toBe(content);
    });

    it('should throw an error if the file does not exist', () => {
      existsSync.mockReturnValue(false);

      expect(() => fileSync.readSync(collectionName))
        .toThrow(`File '${collectionName}' does not exist`);
      expect(existsSync).toHaveBeenCalledWith(filePath);
    });
  });

  describe('writeSync', () => {
    it('should write content to an existing file', () => {
      const content = '{"key":"updated-value"}';
      existsSync.mockReturnValue(true);
      writeFileSync.mockReturnValue();

      fileSync.writeSync(collectionName, content);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(writeFileSync).toHaveBeenCalledWith(filePath, content, 'utf8');
    });

    it('should throw an error if the file does not exist', () => {
      const content = '{"key":"updated-value"}';
      existsSync.mockReturnValue(false);

      expect(() => fileSync.writeSync(collectionName, content))
        .toThrow(`File '${collectionName}' does not exist`);
      expect(existsSync).toHaveBeenCalledWith(filePath);
    });
  });

  describe('deleteFileSync', () => {
    it('should be able to delete file', () => {
      existsSync.mockReturnValue(true);
      unlinkSync.mockReturnValue();
      fileSync.deleteFileSync(collectionName);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(unlinkSync).toHaveBeenCalledWith(filePath);
    });

    it('should throw error if file does not exists', () => {
      existsSync.mockReturnValue(false);
      unlinkSync.mockReturnValue();

      expect(() => fileSync.deleteFileSync(collectionName))
        .toThrow(`File '${collectionName}' does not exist`);

      expect(existsSync).toHaveBeenCalledWith(filePath);
      expect(unlinkSync).not.toHaveBeenCalled();
    });
  });
});