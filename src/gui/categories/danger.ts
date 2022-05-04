import { Notice, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';
import { Text } from '../components';

export class DangerCategory {
  public constructor(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    this.create(containerEl, plugin);
  }

  private create(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    new Text(containerEl, 'h3').setText('Danger Zone').setWarning();
    new Text(containerEl, 'p').setText(
      "Be careful! These settings control how the plugin saves and resolves your cards. If you don't know what you are doing STOP! You could permanently lose access to your cards!"
    );

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
