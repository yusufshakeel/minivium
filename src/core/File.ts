import fs from 'fs';
import path from 'path';

export class FileSync {
  private readonly collectionName: string;
  private readonly filePath: string;

  constructor(dataDir: string, collectionName: string) {
    this.collectionName = collectionName;
    this.filePath = path.join(dataDir, collectionName);
  }

  private checkExistsSync() {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File ${this.collectionName} does not exist`);
    }
  }

  createSync(content: string): void {
    fs.writeFileSync(this.filePath, content, 'utf8');
  }

  readSync(): string {
    this.checkExistsSync();
    return fs.readFileSync(this.filePath, 'utf8');
  }

  writeSync(content: string): void {
    this.checkExistsSync();
    fs.writeFileSync(this.filePath, content, 'utf8');
  }
}