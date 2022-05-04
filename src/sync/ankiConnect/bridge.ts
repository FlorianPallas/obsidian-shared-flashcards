import FlashcardsPlugin from 'src';
import { TupleResponse, AnkiResponse, MultiRequest, Request } from './requests';

export default class AnkiBridge {
  private plugin: FlashcardsPlugin;

  constructor(plugin: FlashcardsPlugin) {
    this.plugin = plugin;
  }

  async send<T, R>(request: Request<T, R>): Promise<R> {
    const { host, port } = this.plugin.settings.ankiConnect;
    const res = await fetch(`http://${host}:${port}/`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'advanced-flashcards',
      },
    });

    if (!res.ok) {
      throw new Error();
    }

    const { result, error }: AnkiResponse<R> = await res.json();

    if (error) {
      throw new Error(error);
    }

    return request.verify(result);
  }

  async sendMulti<T extends [...Request<any, any>[]]>(requests: [...T]) {
    if (requests.length < 1) return [];
    const result = await this.send(new MultiRequest(requests));
    return result.map((r, i) => requests[i].verify(r)) as TupleResponse<T>;
  }
}
