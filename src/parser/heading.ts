export interface Heading {
  text: string;
  level: number;
  index: number;
}

const headingRegex = /^ {0,3}(?<level>#{1,6}) (?<text>.*?) *$/gm;

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
