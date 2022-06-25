import { ItemView, WorkspaceLeaf } from 'obsidian';
import FlashcardsPlugin from 'src';
import View from './view.svelte';

export type Stage = 'none' | 'prepare' | 'parse' | 'categorize' | 'done';
export interface State {
  stage: Stage;
}

export class FlashcardsView extends ItemView {
  private view?: View;
  private plugin: FlashcardsPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: FlashcardsPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return 'flashcards';
  }

  getDisplayText(): string {
    return 'Flashcards';
  }

  onClose(): Promise<void> {
    this.view?.$destroy();
    return super.onClose();
  }

  onOpen(): Promise<void> {
    this.view = new View({
      target: this.contentEl,
      props: { plugin: this.plugin },
    });
    return super.onOpen();
  }

  setStage(stage: Stage): void {
    this.view?.$set({ stage });
  }
}
