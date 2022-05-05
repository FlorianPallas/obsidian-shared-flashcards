import { defaultsDeep } from 'lodash';
import { Plugin } from 'obsidian';
import { Settings } from 'src/config/settings';

export class SettingsLoader {
  static readonly defaults: Settings = {
    // General
    rootDeck: 'Obsidian',
    useFolderDecks: true,

    // Labels
    useLabels: true,
    labelMapPath: '.flashcards/default.json',

    // Sync
    syncProvider: 'none',

    // Sync - Anki Connect
    ankiConnect: {
      host: 'localhost',
      port: '8765',
    },
  };

  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async load(): Promise<Settings> {
    const settings = await this.plugin.loadData();
    return defaultsDeep(settings, SettingsLoader.defaults);
  }

  async save(settings: Partial<Settings>): Promise<void> {
    await this.plugin.saveData(defaultsDeep(settings, SettingsLoader.defaults));
  }
}
