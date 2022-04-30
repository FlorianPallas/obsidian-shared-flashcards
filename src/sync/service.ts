import { Article } from 'src/wiki';

export interface SyncService {
  push(articles: Article[]): void | Promise<void>;
}
