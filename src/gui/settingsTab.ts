import { App, PluginSettingTab } from 'obsidian';
import FlashcardsPlugin from 'src';
import {
  GeneralCategory,
  CollaborationCategory,
  SyncCategory,
  DangerCategory,
} from './categories';

export class SettingsTab extends PluginSettingTab {
  private plugin: FlashcardsPlugin;

  constructor(app: App, plugin: FlashcardsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();
    new GeneralCategory(this.containerEl, this.plugin);
    new CollaborationCategory(this.containerEl, this.plugin);
    new SyncCategory(this.containerEl, this.plugin);
    new DangerCategory(this.containerEl, this.plugin);
  }
}
