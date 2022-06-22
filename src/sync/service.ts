import { Article } from 'src/entities/article';

export interface SyncService {
  push(articles: Article[]): void | Promise<void>;
}
