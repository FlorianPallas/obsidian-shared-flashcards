import { defaultsDeep } from 'lodash';
import log from 'loglevel';
import FlashcardsPlugin from 'src';

export interface Settings {
  $version: number;
  labelsPath: string;

  rootDeck: string;
  useFolderDecks: boolean;

  // Advanced
  anki: {
    host: string;
    port: string;
  };
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
}

const defaults: Settings = {
  $version: 0,
  labelsPath: '.flashcards/default.json',

  rootDeck: 'Obsidian',
  useFolderDecks: true,

  anki: {
    host: 'localhost',
    port: '8765',
  },
  logLevel: 'warn',
};

const applyDefaults = (data: Partial<Settings>): Settings =>
  defaultsDeep(data, defaults);

export const parseSettings = (data: any): Settings => {
  // do not convert unrecognized files to prevent accidental overwrites of important data
  if (data.$version === undefined) {
    log.debug('Parsed settings data', data);
    throw new Error('Incompatible or corrupt settings file detected');
  }

  // convert settings data incrementally, arriving at a valid up to date settings object
  const settings: any = data;

  return applyDefaults(settings);
};

export const stringifySettings = (settings: Settings): string => {
  const json = applyDefaults(settings);
  return JSON.stringify(json, null, 2);
};

export const readSettings = async (plugin: FlashcardsPlugin) =>
  parseSettings(JSON.parse(await plugin.loadData()));

export const writeSettings = async (
  plugin: FlashcardsPlugin,
  settings: Settings
) => plugin.saveData(stringifySettings(settings));
