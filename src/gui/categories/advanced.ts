import { Notice, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';

export class DangerCategory {
  public constructor(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    this.create(containerEl, plugin);
  }

  private create(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    new Setting(containerEl).setName('Advanced').setHeading();

    new Setting(containerEl)
      .setName('Clear label mappings')
      .setDesc(
        'Forget which Anki cards are mapped to which labels. Useful if you want to create new cards instead. (You could loose your learning progress with the existing cards!)'
      )
      .addButton((button) => {
        button.setButtonText('Clear').onClick(() => {
          plugin.labelMap.clear();
          plugin.save();
          new Notice('Label mappings cleared');
        });
        button.setWarning();
      });
  }
}
