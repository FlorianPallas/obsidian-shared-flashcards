/**
 * Represents a heading in the content. The indentation level can be used
 * to create a hierarchical outline of the article. Each heading also keeps
 * track of the location it was found.
 */
export interface Heading {
  /** the text content of the heading */
  text: string;
  /** the level of indentation */
  level: number;
  /** position in content where the heading was found */
  index: number;
}

/**
 * Matches all valid markdown headings, capturing the indentation level as well
 * as their text content.
 *
 * - start of line
 * - up to 3 spaces
 * - <level> heading (1 to 6 hash marks)
 * - space
 * - <text> single-line string
 * - any amount of spaces
 * - any tags and content after
 * - end of line
 */
const headingRegex = /^ {0,3}(?<level>#{1,6}) (?<text>.*?) *(?:#.*)?$/gm;

/**
 * Parses a multi-line content string into an array of headings contained.
 *
 * @param content multi-line string to parse
 * @returns array of headings found in the input
 */
export const parseHeadings = (content: string): Heading[] => {
  const headings: Heading[] = [];

  for (const match of content.matchAll(headingRegex)) {
    const groups = match.groups ?? {};
    if (match.index === undefined)
      throw new Error('No match index was returned while parsing headings');

    headings.push({
      text: groups.text,
      level: groups.level.length,
      index: match.index,
    });
  }

  return headings;
};
