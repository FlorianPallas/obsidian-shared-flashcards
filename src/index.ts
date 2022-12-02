import { Modal, Plugin } from 'obsidian';
import { ExampleModal } from './collaborate/modal';

export default class FlashcardsPlugin extends Plugin {
  modal!: Modal;

  onload() {
    this.modal = new ExampleModal(this.app);
    this.modal.open();
  }

  onunload() {
    this.modal.close();
  }
}
