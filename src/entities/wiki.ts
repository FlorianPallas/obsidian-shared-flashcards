import { TFile, Vault } from 'obsidian';
import { Article, parseArticle } from './article';

export interface Wiki {
  articles: Article[];
  index: Record<string, string[]>;
  vault: Vault;
}

export const parseWiki = async (vault: Vault) => {
  const files = vault.getFiles();

  const index = createIndex(files);

  const articles = await Promise.all(
    files
      .filter((file) => file.extension === 'md')
      .map(async (file) => parseArticle(file.basename, await vault.read(file)))
  );

  return { articles, index, vault };
};

export const createIndex = (files: TFile[]): Record<string, string[]> => {
  const index = {} as Record<string, string[]>;
  for (const file of files) {
    const name = file.extension === '.md' ? file.basename : file.name;
    if (!index[name]) {
      index[name] = [];
    }
    index[name].push(file.path);
  }
  return index;
};
