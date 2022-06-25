import { Card, parseCards } from './card';
import { Heading, parseHeadings } from './heading';

export interface Article {
  name: string;
  headings: Heading[];
  cards: Card[];
}

export const parseArticle = (name: string, content: string): Article => {
  const headings = parseHeadings(content);
  const cards = parseCards(content);

  return {
    name,
    cards,
    headings,
  };
};
