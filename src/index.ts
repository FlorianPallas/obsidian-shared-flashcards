import log from 'loglevel';
import { Plugin } from 'obsidian';
import { SettingsTab } from './gui/settingsTab';
import { Settings, SettingsLoader, LabelMapLoader } from './config';
import { SyncService, NoneSyncService, AnkiConnectSyncService } from './sync';
import { createLabel } from './util';
import { parseWiki, Wiki } from './entities/wiki';
import { transformWikiLinks as transformWikiLinks } from './transform/wikilinks';
import View from './gui/sidebar';

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
      callback: () => this.onScan(),
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

    this.registerView('flashcards-overview', (leaf) => {
      return new View(leaf, this);
    });

    this.addCommand({
      id: 'test',
      name: 'Test',
      callback: () => {},
    });

    this.addCommand({
      id: 'open-overview',
      name: 'Flashcards overview',
      callback: async () => {
        if (
          this.app.workspace.getLeavesOfType('flashcards-overview').length === 0
        ) {
          await this.app.workspace.getRightLeaf(false).setViewState({
            type: 'flashcards-overview',
          });
        } else {
          this.app.workspace
            .getLeavesOfType('flashcards-overview')
            .first()!
            .detach();

          await this.app.workspace.getRightLeaf(false).setViewState({
            type: 'flashcards-overview',
          });
        }

        this.app.workspace.revealLeaf(
          this.app.workspace.getLeavesOfType('flashcards-overview').first()!
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

  async onScan() {
    log.debug('scanning...');

    dispatchEvent(
      new ProgressEvent('flashcards-progress', {
        loaded: 0,
        total: 5,
      })
    );

    const wiki = await parseWiki(this.app.vault);
    log.debug(wiki);

    dispatchEvent(
      new ProgressEvent('flashcards-progress', {
        loaded: 1,
        total: 5,
      })
    );

    for (const article of wiki.articles) {
      for (const card of article.cards) {
        transformWikiLinks(wiki, card);
      }
    }

    dispatchEvent(
      new CustomEvent<{ wiki: Wiki }>('flashcards-update', { detail: { wiki } })
    );

    dispatchEvent(
      new ProgressEvent('flashcards-progress', {
        loaded: 2,
        total: 5,
      })
    );

    setTimeout(() => {
      dispatchEvent(
        new ProgressEvent('flashcards-progress', {
          loaded: 3,
          total: 5,
        })
      );
    }, 500);

    setTimeout(() => {
      dispatchEvent(
        new ProgressEvent('flashcards-progress', {
          loaded: 4,
          total: 5,
        })
      );
    }, 750);

    setTimeout(() => {
      dispatchEvent(
        new ProgressEvent('flashcards-progress', {
          loaded: 5,
          total: 5,
        })
      );
    }, 1000);

    log.debug('scan complete');
  }

  async onPush() {
    log.debug('pushing...');

    /*
    await this.syncService.push(wiki.articles);
    await this.save();
    */

    log.debug('push complete');
  }

  async save(shouldUpdate = true) {
    await this.labelMapLoader.save(this.settings.labelMapPath, this.labelMap);
    await this.settingsLoader.save(this.settings);
    if (shouldUpdate) this.onUpdate();
  }
}
