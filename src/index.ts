import { Plugin } from 'obsidian';
import { SettingsTab } from './gui/settingsTab';
import { Settings, SettingsLoader, LabelMapLoader } from './config';
import { SyncService, NoneSyncService, AnkiConnectSyncService } from './sync';
import { Wiki } from './wiki';
import { createLabel } from './util';

export default class FlashcardsPlugin extends Plugin {
  settingsLoader = new SettingsLoader(this);
  labelMapLoader = new LabelMapLoader(this);
  wiki: Wiki = new Wiki(this.app.vault);

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
      editorCallback: async (editor, view) => {
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
    await this.wiki.parse();
    await this.syncService.push(this.wiki.articles);
    await this.save();
  }

  async save(shouldUpdate = true) {
    await this.labelMapLoader.save(this.settings.labelMapPath, this.labelMap);
    await this.settingsLoader.save(this.settings);
    if (shouldUpdate) this.onUpdate();
  }
}
