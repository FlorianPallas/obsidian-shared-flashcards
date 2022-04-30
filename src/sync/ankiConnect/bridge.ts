import FlashcardsPlugin from 'src';
import { Note } from './types';

interface AnkiRequest {
  action: string;
  params?: {
    [key: string]: any;
  };
}

interface AnkiResponse {
  result?: any;
  error?: string;
}

export default class AnkiBridge {
  public static VERSION = 6;

  private plugin: FlashcardsPlugin;

  constructor(plugin: FlashcardsPlugin) {
    this.plugin = plugin;
  }

  public send(request: AnkiRequest): Promise<AnkiResponse> {
    const { host, port } = this.plugin.settings.ankiConnect;
    return fetch(`http://${host}:${port}/`, {
      method: 'POST',
      body: JSON.stringify({ ...request, version: AnkiBridge.VERSION }),
    }).then((res) => res.json());
  }

  public async version(): Promise<number> {
    const response = await this.send({ action: 'version' });
    if (!response.result) {
      throw new Error(response.error);
    }
    return response.result as number;
  }

  public async requestPermission(): Promise<boolean> {
    const response = await this.send({ action: 'requestPermission' });
    if (!response.result) {
      throw new Error(response.error);
    }
    return (response.result.permission as string) === 'granted';
  }

  public async getDecks(): Promise<string[]> {
    const response = await this.send({ action: 'deckNames' });
    if (!response.result) {
      throw new Error(response.error);
    }
    return response.result as string[];
  }

  public async createDeck(deck: string) {
    const response = await this.send({
      action: 'createDeck',
      params: { deck },
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.result as number | null;
  }

  public async addNotes(notes: Note[]) {
    for (const note of notes) {
      if (note.id) {
        throw new Error('Can only create notes without an id');
      }
    }

    const response = await this.send({
      action: 'addNotes',
      params: { notes },
    });
    if (response.error || !response.result) {
      throw new Error(response.error);
    }
    return response.result as (number | null)[];
  }

  public async updateNote(note: Note): Promise<void> {
    if (!note.id) {
      throw new Error('Can only update notes with an id');
    }

    const response = await this.send({
      action: 'updateNoteFields',
      params: { note },
    });
    if (response.error) {
      throw new Error(response.error);
    }
  }

  public async storeMediaFile(filename: string, data: string): Promise<void> {
    const response = await this.send({
      action: 'storeMediaFile',
      params: {
        filename,
        data,
      },
    });
    if (response.error) {
      throw new Error(response.error);
    }
  }
}
