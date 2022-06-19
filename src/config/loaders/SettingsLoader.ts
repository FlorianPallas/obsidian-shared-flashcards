import log from 'loglevel';
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

    // Other
    logLevel: 'warn',
  };

  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async load(): Promise<Settings> {
    const settings: Settings = defaultsDeep(
      await this.plugin.loadData(),
      SettingsLoader.defaults
    );
    log.setLevel(settings.logLevel);
    return settings;
  }

  async save(settings: Partial<Settings>): Promise<void> {
    await this.plugin.saveData(defaultsDeep(settings, SettingsLoader.defaults));
  }
}
