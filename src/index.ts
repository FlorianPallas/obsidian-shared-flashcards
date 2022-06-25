import log from 'loglevel';
import { Notice, Plugin } from 'obsidian';
import { send, versionAction } from './anki';
import {
  Settings,
  readSettings,
  writeSettings,
  readLabels,
  writeLabels,
} from './config';
import { parseWiki } from './entities/wiki';
import { FlashcardsTab, FlashcardsView } from './gui';

let plugin: FlashcardsPlugin;
export const getPlugin = (): FlashcardsPlugin => plugin;

export default class FlashcardsPlugin extends Plugin {
  isInitialized = false;

  settings!: Settings;
  labels!: Map<string, number>;
  view!: FlashcardsView;

  async initialize() {
    if (this.isInitialized) {
      log.warn('The plugin was already initialized');
      return;
    }
    log.debug('Initializing...');

    // Load settings and labels
    this.settings = await readSettings(this);
    log.debug('Loaded settings', this.settings);
    this.labels = await readLabels(this.app.vault, this.settings.labelsPath);
    log.debug('Loaded labels', this.labels);

    // Apply settings
    log.setLevel(this.settings.logLevel, false);

    this.isInitialized = true;
    plugin = this;
    log.debug('Initialized');
  }

  async onload() {
    // temporary adjust log level until settings are applied
    log.setLevel('trace', false);

    await this.initialize().catch((err) => {
      new Notice(err);
      log.error(err);
    });
    if (!this.isInitialized) return;

    // register ui components
    this.addSettingTab(new FlashcardsTab(this.app, this));
    this.registerView('flashcards', (leaf) => {
      this.view = new FlashcardsView(leaf, this);
      return this.view;
    });

    // DEV: show flashcards view on startup
    this.app.workspace.getLeavesOfType('flashcards').first()?.detach();
    await this.app.workspace
      .getRightLeaf(false)
      .setViewState({ type: 'flashcards' });
    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType('flashcards').first()!
    );
  }

  async onunload() {
    // do not persist settings or labels if the plugin was not successfully
    // initialized, as the settings or labels might not be parsed correctly
    // and therefore empty.
    if (!this.isInitialized) {
      log.warn('The plugin was not initialized. No data will be persisted.');
      return;
    }

    log.info('Saving settings and labels...');
    await writeSettings(this, this.settings);
    await writeLabels(this.app.vault, this.settings.labelsPath, this.labels);
  }

  async onScan() {
    // ping anki to check if it is running
    this.view.setStage('prepare');

    try {
      await send(versionAction());
    } catch (error) {
      this.view.setStage('done');
      return;
    }

    // parse all cards contained in the vault
    this.view.setStage('parse');

    const wiki = parseWiki(this.app.vault);

    // check which cards need to be added, moved, updated or removed
    this.view.setStage('categorize');
  }

  async onPush() {}
}
