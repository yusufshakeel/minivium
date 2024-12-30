import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';

export class FileSync {
  private readonly dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  private getFilePath(collectionName: string) {
    return path.join(this.dataDir, collectionName);
  }

  private checkExistsSync(collectionName: string) {
    if (!existsSync(this.getFilePath(collectionName))) {
      throw new Error(`File '${collectionName}' does not exist`);
    }
  }

  createSync(collectionName: string, content: string): void {
    writeFileSync(this.getFilePath(collectionName), content, 'utf8');
  }

  readSync(collectionName: string): string {
    this.checkExistsSync(collectionName);
    return readFileSync(this.getFilePath(collectionName), 'utf8');
  }

  writeSync(collectionName: string, content: string): void {
    this.checkExistsSync(collectionName);
    writeFileSync(this.getFilePath(collectionName), content, 'utf8');
  }

  createFileIfNotExistsSync(collectionName: string): void {
    if(!existsSync(this.getFilePath(collectionName))) {
      writeFileSync(this.getFilePath(collectionName), '[]', 'utf8');
    }
  }

  deleteFileSync(collectionName: string): void {
    this.checkExistsSync(collectionName);
    unlinkSync(this.getFilePath(collectionName));
  }
}