export interface Settings {
  // General
  rootDeck: string;
  useFolderDecks: boolean;

  // Labels
  useLabels: boolean;
  labelMapPath: string;

  // Sync
  syncProvider: 'none' | 'ankiConnect';
  ankiConnect: {
    host: string;
    port: string;
  };
}
