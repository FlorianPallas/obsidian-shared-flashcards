import AnkiBridge from './bridge';
import { Note } from './types';

export interface AnkiRequest<T = { [key: string]: any }> {
  action: string;
  params?: T;
}
export type AnkiResponse<T = any> = { result: T | null; error: string | null };

export class Request<T, R> implements AnkiRequest<T> {
  version: number;
  action: string;
  params?: T;

  constructor(action: string, params?: T) {
    this.version = 6;
    this.action = action;
    this.params = params;
  }

  verify(result: AnkiResponse<R>['result']): R {
    if (!result) throw new Error('no result');
    return result;
  }

  send(bridge: AnkiBridge): Promise<R | undefined> {
    return bridge.send(this);
  }
}

export class VoidRequest<T> extends Request<T, void> {
  verify(): void {
    return;
  }
}

export class PermissionRequest extends Request<
  undefined,
  { permission: 'granted' | 'denied'; requireApiKey?: boolean; version: 6 }
> {
  /**
   * Requests permission to use the API exposed by this plugin.
   *
   * @returns Returns whether the user granted permission or not.
   */
  constructor() {
    super('requestPermission');
  }
}

export class VersionRequest extends Request<undefined, number> {
  /**
   * Gets the version of the API exposed by this plugin.
   *
   * @returns The API version in use.
   */
  constructor() {
    super('version');
  }
}

export type Response<T> = T extends Request<any, infer U> ? U : T;

export type TupleAnkiResponse<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail
]
  ? [AnkiResponse<Response<Head>>, ...TupleAnkiResponse<Tail>]
  : [];

export type TupleResponse<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail
]
  ? [Response<Head>, ...TupleResponse<Tail>]
  : [];

export class MultiRequest<T extends [...any[]]> extends Request<
  { actions: [...T] },
  TupleAnkiResponse<T>
> {
  /**
   * Performs multiple actions in one request, returning an array with the response of each action (in the given order).
   *
   * @param requests An array of requests to perform.
   * @returns An array of responses, in the same order as the requests.
   */
  constructor(requests: [...T]) {
    super('multi', { actions: requests });
  }
}

interface X {
  cards: number[];
  fields: { [name: string]: { value: string; order: number } };
  modelName: string;
  noteId: number;
  tags: string[];
}

export class NotesInfoRequest extends Request<
  { notes: number[] },
  (X | undefined)[]
> {
  /**
   * Returns a list of objects containing for each note ID the note fields, tags, note type and the cards belonging to the note.
   *
   * @param noteIds The note IDs to get information for.
   */
  constructor(noteIds: number[]) {
    super('notesInfo', { notes: noteIds });
  }

  verify(result: (X | undefined)[] | null): (X | undefined)[] {
    return result?.map((r) => (!r || !r.fields ? undefined : r)) ?? [];
  }
}

export class ChangeDeckRequest extends VoidRequest<{
  cards: number[];
  deck: string;
}> {
  /**
   * Moves cards with the given IDs to a different deck, creating the deck if it doesn’t exist yet.
   *
   * @param cardIds The IDs of the cards to move.
   * @param deckName The name of the deck to move the cards to.
   */
  constructor(cardIds: number[], deckName: string) {
    super('changeDeck', { cards: cardIds, deck: deckName });
  }
}

export class GetDecksRequest extends Request<undefined, string[]> {
  /**
   * Gets the complete list of deck names for the current user.
   *
   * @returns A list of all deck names.
   */
  constructor() {
    super('deckNames');
  }
}

export class CreateDeckRequest extends Request<{ deck: string }, number> {
  /**
   * Create a new empty deck. Will not overwrite a deck that exists with the same name.
   *
   * @param deckName The name of the deck to create.
   * @returns The id of the newly created deck.
   */
  constructor(deckName: string) {
    super('createDeck', { deck: deckName });
  }
}

export class AddNotesRequest extends Request<
  { notes: Note[] },
  (number | null)[]
> {
  /**
   * Creates multiple notes using the given deck and model, with the provided field values and tags.
   *
   * @param notes The notes to create.
   * @returns An array of the IDs of the newly created notes.
   */
  constructor(notes: Note[]) {
    super('addNotes', { notes });
  }
}

export class UpdateNoteRequest extends VoidRequest<{ note: Note }> {
  /**
   * Modifies the fields of an existing note.
   *
   * @param note The note to update.
   */
  constructor(note: Note) {
    super('updateNoteFields', { note });
  }
}

export class StoreMediaRequest extends Request<
  { filename: string; data: string },
  string
> {
  /**
   * Stores a file with the specified base64-encoded contents inside the media folder.
   *
   * @param filename The name of the file to store.
   * @param data The base64-encoded contents of the file.
   * @returns The path to the stored file.
   */
  constructor(filename: string, data: string) {
    super('storeMediaFile', { filename, data });
  }
}

export class DeleteNotesRequest extends VoidRequest<{ notes: number[] }> {
  /**
   * Deletes notes with the given ids. If a note has several cards associated with it, all associated cards will be deleted.
   *
   * @param notes The IDs of the notes to delete.
   */
  constructor(notes: number[]) {
    super('deleteNotes', { notes });
  }
}
