import { toInteger } from 'lodash';
import { Notice, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';
import { createLabel } from 'src/util';
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

    new Setting(containerEl)
      .setName('Convert ids to labels')
      .setDesc(
        'Check all files for cards and convert ids to labels, adding them to the label map.'
      )
      .addButton((button) => {
        button.setButtonText('Convert').onClick(async () => {
          const files = await plugin.app.vault.getMarkdownFiles();
          let totalCount = 0;
          let successCount = 0;

          for (const file of files) {
            const fileLabelMap = new Map<string, number>();
            let offset = 0;
            let content = await plugin.app.vault.read(file);

            const matches = content.matchAll(
              /( {0,3}[#]*)((?:[^\n]\n?)+?)(#card(?:-reverse)?)((?: *#[\w-]+)*) *?\n+((?:[^\n]\n?)*?(?=\^\d{13}|$))\^(\d{13})/gimu
            );

            for (const match of matches) {
              totalCount++;
              const matchedId = match[6];

              if (match.index === undefined) throw new Error('no index');
              const endIndex = match.index + offset + match[0].length;

              const id = content.substring(endIndex - 13, endIndex);
              if (id !== matchedId) {
                console.log(match, endIndex, id, matchedId);
                throw new Error('id mismatch');
              }

              const label = createLabel(plugin.labelMap);
              content =
                content.substring(0, endIndex - 13) +
                'c-' +
                label +
                content.substring(endIndex);

              offset--;

              const idInt = toInteger(id);
              console.log(idInt, '->', label);
              fileLabelMap.set(label, idInt);
              successCount++;
            }

            // Update file and write label changes
            await plugin.app.vault.adapter.write(file.path, content);
            for (const [label, id] of fileLabelMap.entries()) {
              plugin.labelMap.set(label, id);
            }
          }

          plugin.save();
          new Notice(`Converted ${successCount}/${totalCount} cards`);
        });
        button.setWarning();
      });
  }
}
