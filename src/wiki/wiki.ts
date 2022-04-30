import { TFile, Vault } from 'obsidian';
import { Article } from '.';

export class Wiki {
  vault: Vault;
  files: TFile[];
  index: { [name: string]: string[] };
  articles: Article[];

  constructor(vault: Vault) {
    this.vault = vault;
    this.files = [];
    this.articles = [];
    this.index = {};
  }

  async parse() {
    this.files = this.vault.getFiles();
    this.articles = this.files
      .filter((file) => file.extension === 'md')
      .map((f) => new Article(this, f));
    this.createIndex(this.files);
    await Promise.all(this.articles.map((a) => a.parse()));
  }

  private createIndex = (files: TFile[]) => {
    this.index = {};
    for (const file of files) {
      const name = file.extension === '.md' ? file.basename : file.name;
      if (!this.index[name]) {
        this.index[name] = [];
      }
      this.index[name].push(file.path);
    }
  };

  getPath(name: string): string {
    const matchingPaths = this.index[name];
    if (!matchingPaths || matchingPaths.length < 1) {
      return name;
    }
    return matchingPaths[0];
  }
}
