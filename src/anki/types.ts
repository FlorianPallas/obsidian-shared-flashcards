export type NoteFields = { [name: string]: string };

export interface Note {
  id?: number;
  deckName: string;
  modelName: string;
  fields: NoteFields;
  tags: string[];
  options: {
    allowDuplicate: boolean;
    duplicateScope: string;
    duplicateScopeOptions: {
      deckName: string;
      checkChildren: boolean;
      checkAllModels: boolean;
    };
  };
  audio?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string[];
  }[];

  video?: {
    url: string;
    filename: string;
    skipHash: string;
    fields: string[];
  }[];
}

export interface AnkiRequest<T> {
  version: number;
  action: string;
  params: T;
}
export interface AnkiResponse<T> {
  result: T | null;
  error: string | null;
}

export interface Action<T, R> {
  action: string;
  params: T;
  parse: (result: AnkiResponse<R>['result']) => R;
}
export type VoidAction<T> = Action<T, void>;
export type CallAction<T> = Action<undefined, T>;
