import { ItemView, WorkspaceLeaf } from 'obsidian';
import FlashcardsPlugin from 'src';
import View from './sidebar.svelte';

export default class GitView extends ItemView {
  private view?: View;
  private plugin: FlashcardsPlugin;

  getViewType(): string {
    return 'flashcards-overview';
  }

  getDisplayText(): string {
    return 'Flashcards';
  }

  constructor(leaf: WorkspaceLeaf, plugin: FlashcardsPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  onClose(): Promise<void> {
    this.view?.$destroy();
    return super.onClose();
  }

  onOpen(): Promise<void> {
    this.view = new View({
      target: this.contentEl,
      props: {
        plugin: this.plugin,
      },
    });

    return super.onOpen();
  }
}
