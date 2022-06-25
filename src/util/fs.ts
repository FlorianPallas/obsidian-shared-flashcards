import { dirname } from 'path';
import { Vault } from 'obsidian';

export const exists = (vault: Vault, path: string): Promise<boolean> => {
  return vault.adapter.exists(path);
};

export const ensureDir = async (vault: Vault, path: string) => {
  const dirPath = dirname(path);
  const dirExists = await exists(vault, dirPath);
  if (!dirExists) await vault.createFolder(dirPath);
};

export const ensureFile = async (vault: Vault, path: string, data: string) => {
  const fileExists = await exists(vault, path);
  if (!fileExists) {
    await ensureDir(vault, path);
    await vault.create(path, data);
  }
};
