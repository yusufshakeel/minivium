import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { readFile, unlink, writeFile, access } from 'fs/promises';
import path from 'path';

export class File {
  private readonly dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  private getFilePath(collectionName: string) {
    return path.join(this.dataDir, collectionName);
  }

  private async checkIfFileExists(
    filePath: string,
    collectionName: string,
    shouldThrow: boolean = false
  ): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch (err: any) {
      if(shouldThrow) {
        throw new Error(
          `File '${collectionName}' does not exists or is not accessible. Error: ${err.message}`
        );
      }
      return false;
    }
  }

  private checkIfFileExistsSync(
    filePath: string,
    collectionName: string,
    shouldThrow: boolean = false
  ): boolean {
    if (existsSync(filePath)) {
      return true;
    } else {
      if (shouldThrow) {
        throw new Error(`File '${collectionName}' does not exists`);
      }
      return false;
    }
  }

  createSync(collectionName: string, content: string): void {
    writeFileSync(this.getFilePath(collectionName), content, 'utf8');
  }

  async create(collectionName: string, content: string): Promise<void> {
    return writeFile(this.getFilePath(collectionName), content, 'utf8');
  }

  readSync(collectionName: string): string {
    const filePath = this.getFilePath(collectionName);
    this.checkIfFileExistsSync(filePath, collectionName, true);
    return readFileSync(filePath, 'utf8');
  }

  async read(collectionName: string): Promise<string> {
    const filePath = this.getFilePath(collectionName);
    await this.checkIfFileExists(filePath, collectionName, true);
    return readFile(filePath, 'utf8');
  }

  writeSync(collectionName: string, content: string): void {
    const filePath = this.getFilePath(collectionName);
    this.checkIfFileExistsSync(filePath, collectionName, true);
    writeFileSync(filePath, content, 'utf8');
  }

  async write(collectionName: string, content: string): Promise<void> {
    const filePath = this.getFilePath(collectionName);
    await this.checkIfFileExists(filePath, collectionName, true);
    return writeFile(filePath, content, 'utf8');
  }

  createFileIfNotExistsSync(collectionName: string): void {
    const filePath = this.getFilePath(collectionName);
    const fileExists = this.checkIfFileExistsSync(filePath, collectionName);
    if(!fileExists) {
      writeFileSync(filePath, '[]', 'utf8');
    }
  }

  async createFileIfNotExists(collectionName: string): Promise<void> {
    const filePath = this.getFilePath(collectionName);
    const fileExists = await this.checkIfFileExists(filePath, collectionName);
    if(!fileExists) {
      return writeFile(filePath, '[]', 'utf8');
    }
  }

  deleteFileSync(collectionName: string): void {
    const filePath = this.getFilePath(collectionName);
    this.checkIfFileExistsSync(filePath, collectionName, true);
    unlinkSync(filePath);
  }

  async deleteFile(collectionName: string): Promise<void> {
    const filePath = this.getFilePath(collectionName);
    await this.checkIfFileExists(filePath, collectionName, true);
    return unlink(filePath);
  }
}