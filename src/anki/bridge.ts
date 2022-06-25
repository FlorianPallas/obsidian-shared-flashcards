import { getPlugin } from 'src';
import { multiAction, TupleResponse } from './actions';
import { Action, AnkiRequest, AnkiResponse } from './types';

export async function send<T, R>(action: Action<T, R>): Promise<R> {
  const { host, port } = getPlugin().settings.anki;
  const request = actionToRequest(action);
  const response = await fetch(`http://${host}:${port}/`, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'advanced-flashcards',
    },
  });

  if (!response.ok) {
    throw new Error(`AnkiConnect responded with error code ${response.status}`);
  }

  const { result, error }: AnkiResponse<R> = await response.json();
  if (error) {
    throw new Error(error);
  }

  return action.parse(result);
}

export async function sendMulti<T extends [...Action<any, any>[]]>(
  actions: [...T]
) {
  if (actions.length < 1) return [] as TupleResponse<T>;
  const result = await send(multiAction(actions));
  return result.map((action, i) =>
    actions[i].parse(action)
  ) as TupleResponse<T>;
}

const actionToRequest = <T, R>({
  action,
  params,
}: Action<T, R>): AnkiRequest<T> => ({
  version: 6,
  action,
  params,
});
