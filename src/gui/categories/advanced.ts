import log, { LogLevelDesc } from 'loglevel';
import { Notice, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';

const levels = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  silent: 'silent',
};

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

    new Setting(containerEl)
      .setName('Log Level')
      .setDesc('Defines which log messages are printed and which get ignored.')
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            trace: 'trace',
            debug: 'debug',
            info: 'info',
            warn: 'warn',
            error: 'error',
            silent: 'silent',
          })
          .setValue(plugin.settings.logLevel)
          .onChange((value) => {
            plugin.settings.logLevel = value as any;
            plugin.save();
            log.setLevel(value as LogLevelDesc, false);
          })
      );
  }
}
