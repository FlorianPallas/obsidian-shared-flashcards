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
