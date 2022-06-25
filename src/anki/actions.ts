import { Action, VoidAction, CallAction, AnkiResponse } from './types';

export const changeDeckAction = (
  cardIds: number[],
  deckName: string
): VoidAction<{ cards: number[]; deck: string }> => ({
  action: 'changeDeck',
  params: {
    cards: cardIds,
    deck: deckName,
  },
  parse: (result) => {
    if (result === null) throw new Error();
    return result;
  },
});

export const permissionAction = (): CallAction<{
  permission: 'granted' | 'denied';
  requireApiKey?: boolean;
  version: number;
}> => ({
  action: 'requestPermission',
  params: undefined,
  parse: (result) => {
    if (result === null) throw new Error();
    return result;
  },
});

export const versionAction = (): CallAction<number> => ({
  action: 'version',
  params: undefined,
  parse: (result) => {
    if (result === null) throw new Error();
    if (result !== 6) throw new Error('AnkiConnect version 6 is required');
    return result;
  },
});

export type ActionResponse<T> = T extends Action<any, infer U> ? U : T;
export type TupleAnkiResponse<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail
]
  ? [AnkiResponse<ActionResponse<Head>>, ...TupleAnkiResponse<Tail>]
  : [];
export type TupleResponse<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail
]
  ? [ActionResponse<Head>, ...TupleResponse<Tail>]
  : [];

export const multiAction = <T extends [...any[]]>(
  actions: [...T]
): Action<{ actions: [...T] }, TupleAnkiResponse<T>> => ({
  action: 'multi',
  params: { actions },
  parse: (result) => {
    if (result === null) throw new Error();
    return result;
  },
});
