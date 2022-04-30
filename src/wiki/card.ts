import { Article } from '.';

export interface Card {
  article: Article;
  label: string;
  front: string;
  back: string;
}
