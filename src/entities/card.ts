/**
 * Represents a flashcard with a front and back value.
 * It is identifiable by it's unique label value.
 */
export interface Card {
  /** unique 10 digit alphanumeric */
  label: string;

  /** content shown on the front */
  front: string;
  /** content shown on the back */
  back: string;

  /** position in content where the card was found */
  index: number;
}

/**
 * Matches all multi-line strings of following structure, capturing the heading
 * text, card label, and card content.
 *
 * - start of line
 * - up to 3 spaces
 * - heading (1 to 6 hash marks)
 * - space
 * - <front> single-line string
 * - space
 * - card indicator (#card)
 * - space
 * - <back> multi-line body
 * - line break
 * - <label> card label (10 digit alphanumeric)
 * - end of line
 */
const cardRegex =
  /^ {0,3}#{1,6} (?<front>[^\n]+?) #card *$\n*(?<back>(?:[^\n]*\n)*?)\n*\^c-(?<label>[a-zA-Z0-9]{10})$/gm;

/**
 * Parses a multi-line content string into an array of cards contained.
 *
 * @param content multi-line string to parse
 * @returns array of valid cards found in the input
 */
export const parseCards = (content: string): Card[] => {
  const cards: Card[] = [];

  for (const match of content.matchAll(cardRegex)) {
    const groups = match.groups ?? {};
    if (match.index === undefined)
      throw new Error('No match index was returned while parsing cards');

    cards.push({
      label: groups.label,
      front: groups.front,
      back: groups.back.trim(),
      index: match.index,
    });
  }

  return cards;
};
