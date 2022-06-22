import { Card, parseCards } from './card';
import { Heading, parseHeadings } from './heading';

export interface Article {
  headings: Heading[];
  cards: Card[];
}

export const parseArticle = (content: string): Article => {
  const headings = parseHeadings(content);
  const cards = parseCards(content);

  return {
    cards,
    headings,
  };
};
