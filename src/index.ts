import log from 'loglevel';
import { Plugin } from 'obsidian';
import { SettingsTab } from './gui/settingsTab';
import { Settings, SettingsLoader, LabelMapLoader } from './config';
import { SyncService, NoneSyncService, AnkiConnectSyncService } from './sync';
import { createLabel } from './util';
import { parseWiki } from './entities/wiki';
import { transformWikiLinks as transformWikiLinks } from './transform/wikilinks';

export default class FlashcardsPlugin extends Plugin {
  settingsLoader = new SettingsLoader(this);
  labelMapLoader = new LabelMapLoader(this);

  settings!: Settings;
  labelMap!: Map<string, number>;
  syncService!: SyncService;

  async onload() {
    this.settings = await this.settingsLoader.load();
    this.labelMap = await this.labelMapLoader.load(this.settings.labelMapPath);
    this.onUpdate();

    this.addCommand({
      id: 'push',
      name: 'Push flashcard changes',
      callback: () => this.onPush(),
    });

    this.addCommand({
      id: 'create-label',
      name: 'Create flashcard label',
      editorCallback: (editor) => {
        editor.replaceSelection(
          editor.getSelection() + '^c-' + createLabel(this.labelMap)
        );
      },
    });

    this.addSettingTab(new SettingsTab(this.app, this));
  }

  onUpdate() {
    switch (this.settings.syncProvider) {
      case 'ankiConnect': {
        this.syncService = new AnkiConnectSyncService(this);
        break;
      }
      case 'none':
      default: {
        this.syncService = new NoneSyncService();
        break;
      }
    }
  }

  async onunload() {
    await this.save(false);
  }

  async onPush() {
    const wiki = await parseWiki(this.app.vault);
    log.debug(wiki);

    for (const article of wiki.articles) {
      for (const card of article.cards) {
        transformWikiLinks(wiki, card);
      }
    }

    /*
    await this.syncService.push(wiki.articles);
    await this.save();
    */
  }

  async save(shouldUpdate = true) {
    await this.labelMapLoader.save(this.settings.labelMapPath, this.labelMap);
    await this.settingsLoader.save(this.settings);
    if (shouldUpdate) this.onUpdate();
  }
}
