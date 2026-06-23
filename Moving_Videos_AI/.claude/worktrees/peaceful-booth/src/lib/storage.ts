import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = process.env.STORAGE_LOCAL_DIR || "./tmp/revela";

export interface ProjectStorage {
  ensureProject(projectId: string): Promise<string>;
  saveOriginal(projectId: string, filename: string, buffer: Buffer): Promise<string>;
  saveProcessed(projectId: string, filename: string, buffer: Buffer): Promise<string>;
  saveVideo(projectId: string, filename: string, buffer: Buffer): Promise<string>;
  saveThumbnail(projectId: string, filename: string, buffer: Buffer): Promise<string>;
  getPath(projectId: string, ...segments: string[]): string;
  getOriginals(projectId: string): Promise<string[]>;
}

class LocalStorage implements ProjectStorage {
  private base = path.resolve(STORAGE_DIR);

  async ensureProject(projectId: string): Promise<string> {
    const dir = path.join(this.base, projectId);
    await fs.mkdir(path.join(dir, "originals"), { recursive: true });
    await fs.mkdir(path.join(dir, "processed"), { recursive: true });
    await fs.mkdir(path.join(dir, "output"), { recursive: true });
    return dir;
  }

  async saveOriginal(projectId: string, filename: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.base, projectId, "originals", filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async saveProcessed(projectId: string, filename: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.base, projectId, "processed", filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async saveVideo(projectId: string, filename: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.base, projectId, "output", filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  async saveThumbnail(projectId: string, filename: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.base, projectId, "output", filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  getPath(projectId: string, ...segments: string[]): string {
    return path.join(this.base, projectId, ...segments);
  }

  async getOriginals(projectId: string): Promise<string[]> {
    const dir = path.join(this.base, projectId, "originals");
    try {
      const files = await fs.readdir(dir);
      return files.map((f) => path.join(dir, f));
    } catch {
      return [];
    }
  }
}

export const storage = new LocalStorage();
