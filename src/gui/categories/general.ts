import { Notice, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';
import { SettingsLoader } from 'src/config/loaders/SettingsLoader';

export class GeneralCategory {
  public constructor(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    this.create(containerEl, plugin);
  }

  private create(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    new Setting(containerEl).setName('General').setHeading();

    new Setting(containerEl)
      .setName('Root deck')
      .setDesc('The deck your cards will be synced to.')
      .addText((text) => {
        text
          .setValue(plugin.settings.rootDeck)
          .setPlaceholder(SettingsLoader.defaults.rootDeck)
          .onChange((value) => {
            plugin.settings.rootDeck = value;
            plugin.save();
          });
      });

    new Setting(containerEl)
      .setName('Folder based decks')
      .setDesc('Generate decks based on your folder structure.')
      .addToggle((toggle) =>
        toggle.setValue(plugin.settings.useFolderDecks).onChange((value) => {
          plugin.settings.useFolderDecks = value;
          plugin.save();
        })
      );
  }
}
