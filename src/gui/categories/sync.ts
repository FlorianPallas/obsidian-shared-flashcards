import { Notice, Setting } from 'obsidian';
import FlashcardsPlugin from 'src';
import { SettingsLoader } from 'src/config/loaders/SettingsLoader';
import AnkiBridge from 'src/sync/ankiConnect/bridge';
import {
  PermissionRequest,
  VersionRequest,
} from 'src/sync/ankiConnect/requests';
import { Text, Fold } from '../components';

export class SyncCategory {
  private foldNone?: Fold;
  private foldAnkiConnect?: Fold;

  public constructor(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    this.create(containerEl, plugin);
  }

  create(containerEl: HTMLElement, plugin: FlashcardsPlugin) {
    new Text(containerEl, 'h3').setText('Sync');

    new Setting(containerEl)
      .setName('Provider')
      .setDesc(
        'The flashcard provider used for synching. If no provider is selected, no cards will be synced.'
      )
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            none: 'None',
            ankiConnect: 'Anki Connect',
          })
          .setValue(plugin.settings.syncProvider)
          .onChange((value) => {
            if (value !== 'none' && value !== 'ankiConnect') return;
            plugin.settings.syncProvider = value;
            plugin.save();
            this.foldNone?.setExpanded(value === 'none');
            this.foldAnkiConnect?.setExpanded(value === 'ankiConnect');
          });
      });

    // SYNC - NONE
    this.foldNone = new Fold(containerEl).setExpanded(
      plugin.settings.syncProvider === 'none'
    );

    new Text(this.foldNone.foldEl, 'p')
      .setText('Sync is disabled. Please select a provider to enable it.')
      .setAlign('center');

    // SYNC - ANKI CONNECT
    this.foldAnkiConnect = new Fold(containerEl).setExpanded(
      plugin.settings.syncProvider === 'ankiConnect'
    );

    new Text(this.foldAnkiConnect.foldEl, 'p')
      .setText('Anki Connect')
      .setAlign('center');

    new Setting(this.foldAnkiConnect.foldEl)
      .setName('Hostname')
      .addText((text) => {
        text
          .setValue(plugin.settings.ankiConnect.host)
          .setPlaceholder(SettingsLoader.defaults.ankiConnect.host)
          .onChange((value) => {
            plugin.settings.ankiConnect.host = value;
            plugin.save();
          });
      });

    new Setting(this.foldAnkiConnect.foldEl).setName('Port').addText((text) => {
      text
        .setValue(plugin.settings.ankiConnect.port)
        .setPlaceholder(SettingsLoader.defaults.ankiConnect.port)
        .onChange((value) => {
          plugin.settings.ankiConnect.port = value;
          plugin.save();
        });
    });

    new Setting(this.foldAnkiConnect.foldEl)
      .setName('Connection')
      .setDesc(
        'Please test the connection before use. Anki Connect also requires the user to grant access once before the service can be used.'
      )
      .addButton((button) => {
        button.setButtonText('Test').onClick(async () => {
          let version: number;
          try {
            version = await new AnkiBridge(plugin).send(new VersionRequest());
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
          const { permission } = await new AnkiBridge(plugin).send(
            new PermissionRequest()
          );
          if (permission !== 'granted') {
            new Notice('Permission denied');
            return;
          }
          new Notice('Permission granted');
        });
      });
  }
}
