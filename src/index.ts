import log from 'loglevel';
import { Notice, Plugin } from 'obsidian';
import {
  Settings,
  readSettings,
  writeSettings,
  readLabels,
  writeLabels,
} from './config';
import { FlashcardsTab, FlashcardsView } from './gui';

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

    this.addSettingTab(new FlashcardsTab(this.app, this));
    this.registerView('flashcards', (leaf) => {
      this.view = new FlashcardsView(leaf, this);
      return this.view;
    });

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

  onScan() {}
  onPush() {}
}
