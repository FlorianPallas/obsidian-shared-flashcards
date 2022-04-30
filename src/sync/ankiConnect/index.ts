import { SyncService } from '../service';
import FlashcardsPlugin from 'src';
import AnkiBridge from './bridge';
import { Note } from './types';
import { Notice } from 'obsidian';
import { Article, Card } from '../../wiki';
import { arrayBufferToBase64, stringToBase64 } from 'src/util';

export class AnkiConnectSyncService implements SyncService {
  private plugin: FlashcardsPlugin;
  private bridge: AnkiBridge;

  constructor(plugin: FlashcardsPlugin) {
    this.plugin = plugin;
    this.bridge = new AnkiBridge(plugin);
  }

  public async push(articles: Article[]) {
    const existingDecks = await this.bridge.getDecks();
    const decksToCreate: string[] = [];

    const cardsToCreate: [Card, Note][] = [];
    const cardsToUpdate: [Card, Note][] = [];

    const mediaToUpdate: [src: string, filePath: string][] = [];

    for (const article of articles) {
      for (const card of article.cards) {
        const [note, media] = this.convertCard(card);
        mediaToUpdate.push(...media);

        // Determine deck status
        if (!existingDecks.contains(note.deckName)) {
          decksToCreate.push(note.deckName);
        }

        // Determine note status
        if (!note.id) {
          cardsToCreate.push([card, note]);
          continue;
        }
        cardsToUpdate.push([card, note]);
      }
    }

    for (const deck of decksToCreate) {
      await this.bridge.createDeck(deck);
    }

    const noteIds = await this.bridge.addNotes(
      cardsToCreate.map(([card, note]) => note)
    );

    for (let i = 0; i < noteIds.length; i++) {
      const noteId = noteIds[i];
      if (noteId) {
        this.plugin.labelMap.set(cardsToCreate[i][0].label, noteId);
      }
    }

    for (const [card, note] of cardsToUpdate) {
      await this.bridge.updateNote(note);
    }

    for (const [src, filePath] of mediaToUpdate) {
      const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(
        filePath
      );
      const data = arrayBufferToBase64(arrayBuffer);
      await this.bridge.storeMediaFile(src, data);
    }

    const cardTotal = cardsToCreate.length + cardsToUpdate.length;
    const cardActual = noteIds.length + cardsToUpdate.length;

    new Notice(`Pushed ${cardActual}/${cardTotal} cards`);
  }

  private convertCard(
    card: Card
  ): [note: Note, media: [src: string, filePath: string][]] {
    const id = this.plugin.labelMap.get(card.label);

    const rootDeck = this.plugin.settings.rootDeck;
    let deck = rootDeck;
    if (this.plugin.settings.useFolderDecks) {
      const deckPath = rootDeck + '/' + card.article.file.parent.path;
      deck = deckPath.replace(/\//g, '::');
    }

    const media: [string, string][] = [];

    const back = card.back
      .replace(
        /!\[(.*)\]\((.*\.(?:png|jpg|jpeg|gif|bmp|svg|tiff))(?: "(.*)")?\)/gi,
        (_match, alt: string, filePath: string, title?: string) => {
          const src = stringToBase64(filePath);
          media.push([src, filePath]);
          return `<img src="${src}" alt="${alt}" title="${title ?? ''}">`;
        }
      )
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        (_match, text: string, href: string) => `<a href="${href}">${text}</a>`
      )
      .replace(/\$\$(.*?)\$\$/gs, (_match, body: string) => `\\[${body}\\]`)
      .replace(/\$(.*?)\$/g, (_match, body: string) => `\\(${body}\\)`)
      .replace(/\n/g, '<br>');

    const note: Note = {
      id,
      deckName: deck,
      modelName: 'Basic',
      fields: {
        Front: card.front,
        Back: back,
      },
      tags: [],
      options: {
        allowDuplicate: false,
        duplicateScope: 'deck',
        duplicateScopeOptions: {
          deckName: 'Default',
          checkChildren: false,
          checkAllModels: false,
        },
      },
    };

    return [note, media];
  }
}
