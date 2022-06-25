import log, { LogLevelDesc } from 'loglevel';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';
import { Settings, getDefaultSettings } from 'src/config/settings';
import AnkiBridge from 'src/sync/ankiConnect/bridge';
import {
  PermissionRequest,
  VersionRequest,
} from 'src/sync/ankiConnect/requests';

export class FlashcardsTab extends PluginSettingTab {
  private plugin: FlashcardsPlugin;
  private defaults: Settings;

  constructor(app: App, plugin: FlashcardsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.defaults = getDefaultSettings();
  }

  display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl).setName('General').setHeading();

    new Setting(this.containerEl)
      .setName('Root deck')
      .setDesc(
        "The deck your cards and decks will be created in. If you don't want your cards to be in a separate deck, leave this blank."
      )
      .addText((text) => {
        text
          .setValue(this.plugin.settings.rootDeck)
          .setPlaceholder(this.defaults.rootDeck)
          .onChange((value) => {
            this.plugin.settings.rootDeck = value;
          });
      });

    new Setting(this.containerEl)
      .setName('Folder based decks')
      .setDesc('Generate subdecks based on your folder structure.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useFolderDecks)
          .onChange((value) => {
            this.plugin.settings.useFolderDecks = value;
          })
      );

    new Setting(this.containerEl).setName('Anki').setHeading();

    new Setting(this.containerEl).setName('Hostname').addText((text) => {
      text
        .setValue(this.plugin.settings.anki.host)
        .setPlaceholder(this.defaults.anki.host)
        .onChange((value) => {
          this.plugin.settings.anki.host = value;
        });
    });

    new Setting(this.containerEl).setName('Port').addText((text) => {
      text
        .setValue(this.plugin.settings.anki.port)
        .setPlaceholder(this.defaults.anki.port)
        .onChange((value) => {
          this.plugin.settings.anki.port = value;
        });
    });

    new Setting(this.containerEl)
      .setName('Connection')
      .setDesc(
        'Please test the connection before use. Anki Connect also requires the user to grant access once before the service can be used.'
      )
      .addButton((button) => {
        button.setButtonText('Test').onClick(async () => {
          let version: number;
          try {
            version = await new AnkiBridge(this.plugin).send(
              new VersionRequest()
            );
          } catch (error) {
            new Notice('Could not connect to Anki Connect');
            return;
          }
          if (version !== 6) {
            new Notice('Anki Connect version is not compatible');
            return;
          }
          new Notice(`Success!`);
        });
      })
      .addButton((button) => {
        button.setButtonText('Grant Permission').onClick(async () => {
          const { permission } = await new AnkiBridge(this.plugin).send(
            new PermissionRequest()
          );
          if (permission !== 'granted') {
            new Notice('Permission denied');
            return;
          }
          new Notice('Permission granted');
        });
      });

    new Setting(this.containerEl).setName('Advanced').setHeading();

    let tempLabelsPath: string | undefined;
    new Setting(this.containerEl)
      .setName('Labels path')
      .setDesc(
        'The file to store your labels in. If multiple users are using this vault, make sure everyone has their own label file.'
      )
      .addText((text) => {
        text
          .setValue(this.plugin.settings.labelsPath)
          .setPlaceholder(this.defaults.labelsPath)
          .onChange((value) => {
            tempLabelsPath = value;
          });
      })
      .addButton((button) => {
        button.setButtonText('Load').onClick(() => {
          this.plugin.settings.labelsPath =
            tempLabelsPath ?? this.plugin.settings.labelsPath;
          new Notice('Changes will only take effect after restarting the app.');
        });
      });

    new Setting(this.containerEl)
      .setName('Clear labels')
      .setDesc(
        'Forget which Anki cards are mapped to which labels. Useful if you want to create new cards instead. (You could loose your learning progress with the existing cards!)'
      )
      .addButton((button) => {
        button.setButtonText('Clear').onClick(() => {
          this.plugin.labels.clear();
        });
        button.setWarning();
      });

    new Setting(this.containerEl)
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
          .setValue(this.plugin.settings.logLevel)
          .onChange((value) => {
            this.plugin.settings.logLevel = value as any;
            log.setLevel(value as LogLevelDesc, false);
          })
      );
  }
}
