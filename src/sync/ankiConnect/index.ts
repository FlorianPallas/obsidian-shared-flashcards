import { SyncService } from '../service';
import FlashcardsPlugin from 'src';
import AnkiBridge from './bridge';
import { Note } from './types';
import { Notice } from 'obsidian';
import { Article, Card } from '../../wiki';
import { arrayBufferToBase64, stringToBase64 } from 'src/util';
import {
  AddNotesRequest,
  CreateDeckRequest,
  StoreMediaRequest,
  UpdateNoteRequest,
  NotesInfoRequest,
  DeleteNotesRequest,
  ChangeDeckRequest,
} from './requests';

interface CardRecord {
  card: Card;
  ankiNote: Note;
  ankiMedia: [src: string, filePath: string][];
  ankiCards?: number[];
}

export class AnkiConnectSyncService implements SyncService {
  private plugin: FlashcardsPlugin;
  private bridge: AnkiBridge;

  constructor(plugin: FlashcardsPlugin) {
    this.plugin = plugin;
    this.bridge = new AnkiBridge(plugin);
  }

  public async push(articles: Article[]) {
    new Notice('Pushing...');

    console.time('getCards');
    const [cardsToCreate, cardsToUpdate, cardsToDelete] = await this.getCards(
      articles
    );
    console.log('creating', cardsToCreate.length);
    console.log('updating', cardsToUpdate.length);
    console.log('deleting', cardsToDelete.length);
    console.timeEnd('getCards');

    console.time('create-decks');
    const decksToCreate: string[] = [];
    for (const { ankiNote } of cardsToCreate) {
      if (decksToCreate.contains(ankiNote.deckName)) continue;
      decksToCreate.push(ankiNote.deckName);
    }
    await this.bridge.sendMulti(
      decksToCreate.map((deckName) => new CreateDeckRequest(deckName))
    );
    console.timeEnd('create-decks');

    console.time('create');
    const newNoteIds = await this.bridge.send(
      new AddNotesRequest(cardsToCreate.map(({ ankiNote }) => ankiNote))
    );
    for (let i = 0; i < newNoteIds.length; i++) {
      const noteId = newNoteIds[i];
      if (!noteId) {
        console.log('failed to create card', cardsToCreate[i]);
        continue;
      }
      this.plugin.labelMap.set(cardsToCreate[i].card.label, noteId);
    }
    console.timeEnd('create');

    console.time('update');
    await this.bridge.sendMulti(
      cardsToUpdate.map(({ ankiNote }) => new UpdateNoteRequest(ankiNote))
    );
    await this.bridge.sendMulti(
      cardsToUpdate.map(
        ({ ankiNote }) =>
          new ChangeDeckRequest([ankiNote.id || -1], ankiNote.deckName)
      )
    );
    console.timeEnd('update');

    console.time('update-media');
    const mediaRequests = await Promise.all(
      cardsToUpdate.flatMap(({ ankiMedia }) =>
        ankiMedia.map(async ([src, filePath]) => {
          const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(
            filePath
          );
          const data = arrayBufferToBase64(arrayBuffer);
          return new StoreMediaRequest(src, data);
        })
      )
    );
    await this.bridge.sendMulti(mediaRequests);
    console.timeEnd('update-media');

    console.time('delete');
    await this.bridge.send(
      new DeleteNotesRequest(cardsToDelete.map(([, id]) => id))
    );
    for (const [label] of cardsToDelete) {
      this.plugin.labelMap.delete(label);
    }
    console.timeEnd('delete');

    new Notice(
      [
        'Done!',
        `Scanned\t${articles.length} file(s)`,
        `Created\t${cardsToCreate.length} card(s)`,
        `Updated\t${cardsToUpdate.length} card(s)`,
        `Deleted\t${cardsToDelete.length} card(s)`,
      ].join('\n')
    );
  }

  private async getCards(
    articles: Article[]
  ): Promise<[CardRecord[], CardRecord[], [string, number][]]> {
    const existingCards: CardRecord[] = [];

    const cardsToCreate: CardRecord[] = [];
    const cardsToUpdate: CardRecord[] = [];
    const cardsToDelete: [string, number][] = [];

    for (const article of articles) {
      for (const card of article.cards) {
        const record = this.getRecord(card);
        const { ankiNote } = record;

        if (!ankiNote.id) {
          cardsToCreate.push(record);
          continue;
        }
        existingCards.push(record);
      }
    }

    const cardInfos = await this.bridge.send(
      new NotesInfoRequest(
        existingCards.map(({ ankiNote }) => ankiNote.id || -1)
      )
    );

    for (let i = 0; i < existingCards.length; i++) {
      const record = existingCards[i];
      const info = cardInfos[i];
      if (!info) {
        cardsToCreate.push(record);
        continue;
      }

      if (
        info.fields.Front.value !== record.ankiNote.fields.Front ||
        info.fields.Back.value !== record.ankiNote.fields.Back
      ) {
        cardsToUpdate.push(record);
      }
    }

    const knownLabels = Array.from(this.plugin.labelMap.entries());
    for (const [label, noteId] of knownLabels) {
      if (
        existingCards.findIndex(({ ankiNote }) => ankiNote.id === noteId) === -1
      ) {
        cardsToDelete.push([label, noteId]);
      }
    }

    return [cardsToCreate, cardsToUpdate, cardsToDelete];
  }

  private getRecord(card: Card): CardRecord {
    const id = this.plugin.labelMap.get(card.label);

    const rootDeck = this.plugin.settings.rootDeck;
    let deckName = rootDeck;
    if (this.plugin.settings.useFolderDecks) {
      const deckPath =
        rootDeck +
        (rootDeck.trim().length > 0 ? '/' : '') +
        card.article.file.parent.path;
      deckName = deckPath.replace(/\//g, '::');
    }
    if (deckName === '::') {
      deckName = 'Default';
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
      deckName,
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

    return { card, ankiNote: note, ankiMedia: media };
  }
}
