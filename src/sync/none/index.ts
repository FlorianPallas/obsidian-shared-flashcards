import { SyncService } from '../service';
import { Article } from 'src/entities/article';
import { Notice } from 'obsidian';

export class NoneSyncService implements SyncService {
  public push(articles: Article[]): void | Promise<void> {
    new Notice(
      'Sync is disabled! Please choose a sync provider in the settings tab.'
    );
  }
}
