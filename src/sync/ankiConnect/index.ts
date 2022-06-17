import { SyncService } from '../service';
import FlashcardsPlugin from 'src';
import AnkiBridge from './bridge';
import { Note } from './types';
import { Notice } from 'obsidian';
import { Article, Card } from '../../wiki';
import { encodeBase64, hashBase64 } from 'src/util';
import {
  AddNotesRequest,
  CreateDeckRequest,
  StoreMediaRequest,
  UpdateNoteRequest,
  NotesInfoRequest,
  DeleteNotesRequest,
  ChangeDeckRequest,
} from './requests';
import { processMarkdown } from './util';

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
    const [cardsToCreate, cardsToUpdate, cardsToDelete, cardsToIgnore] =
      await this.getCards(articles);
    console.log('creating', cardsToCreate.length);
    console.log('updating', cardsToUpdate.length);
    console.log('deleting', cardsToDelete.length);
    console.log('ignoring', cardsToIgnore.length);
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

    /*
    console.time('hash-media');
    for (const card of cardsToIgnore) {
      for (const [src, filePath] of card.ankiMedia) {
        const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(
          filePath
        );
        console.log(hashBase64(arrayBuffer));
      }
    }
    console.timeEnd('hash-media');
    */

    console.time('update-media');
    const mediaRequests = await Promise.all(
      cardsToUpdate.flatMap(({ ankiMedia }) =>
        ankiMedia.map(async ([src, filePath]) => {
          const arrayBuffer = await this.plugin.app.vault.adapter.readBinary(
            filePath
          );
          const data = encodeBase64(arrayBuffer);
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
        `Found\t\t${
          cardsToCreate.length +
          cardsToUpdate.length +
          cardsToDelete.length +
          cardsToIgnore.length
        } card(s)`,
        '\n',
        `Created\t${cardsToCreate.length} card(s)`,
        `Updated\t${cardsToUpdate.length} card(s)`,
        `Deleted\t${cardsToDelete.length} card(s)`,
        `Ignored\t${cardsToIgnore.length} card(s)`,
      ].join('\n')
    );
  }

  private async getCards(
    articles: Article[]
  ): Promise<[CardRecord[], CardRecord[], [string, number][], CardRecord[]]> {
    const existingCards: CardRecord[] = [];

    const cardsToCreate: CardRecord[] = [];
    const cardsToUpdate: CardRecord[] = [];
    const cardsToDelete: [string, number][] = [];
    const cardsToIgnore: CardRecord[] = [];

    for (const article of articles) {
      for (const card of article.cards) {
        const record = await this.getRecord(card);
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
        continue;
      }

      cardsToIgnore.push(record);
    }

    const knownLabels = Array.from(this.plugin.labelMap.entries());
    for (const [label, noteId] of knownLabels) {
      if (
        existingCards.findIndex(({ ankiNote }) => ankiNote.id === noteId) === -1
      ) {
        cardsToDelete.push([label, noteId]);
      }
    }

    return [cardsToCreate, cardsToUpdate, cardsToDelete, cardsToIgnore];
  }

  private async getRecord(card: Card): Promise<CardRecord> {
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

    const ankiMedia: [string, string][] = [];

    const ankiNote: Note = {
      id,
      deckName,
      modelName: 'Basic',
      fields: {
        Front: await processMarkdown(card.front, ankiMedia),
        Back: await processMarkdown(card.back, ankiMedia),
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

    return { card, ankiNote, ankiMedia };
  }
}
