import { TFile } from 'obsidian';
import { resolveWikiLinks } from 'src/util';
import { Wiki, Card } from '.';

export interface Heading {
  text: string;
  indentation: number;
  position: number;
  children: Heading[];
}

export class Article {
  wiki: Wiki;
  file: TFile;
  headings: Heading[];
  cards: Card[];

  constructor(wiki: Wiki, file: TFile) {
    this.wiki = wiki;
    this.file = file;
    this.headings = [];
    this.cards = [];
  }

  async parse() {
    const content = await this.file.vault.cachedRead(this.file);

    this.headings = makeHeadings(content);
    this.parseCards(content);
  }

  parseCards(content: string) {
    for (const match of content.matchAll(
      /^(?<level>#{0,6}) (?<front>[^\n]+?) #card$\n*(?<back>(?:[^\n]*\n)*?)\n*\^c-(?<label>[a-zA-Z0-9]{10})$/gm
    )) {
      const groups = match.groups ?? {};
      if (match.index === undefined) {
        throw new Error('no card index');
      }

      const cardHeadings = findPath(
        this.headings,
        (h) => h.position === match.index
      );
      if (cardHeadings === undefined) throw new Error('no card headings');
      cardHeadings[cardHeadings.length - 1].text = groups.front;

      this.cards.push({
        article: this,
        label: groups.label,
        front: cardHeadings.map((h) => h.text).join(' » '),
        back: resolveWikiLinks(groups.back, this.wiki),
      });
    }
  }
}

const makeHeadings = (content: string): Heading[] => {
  const headings: Heading[] = [];
  for (const match of content.matchAll(
    /^ {0,3}(?<level>#{1,6}) (?<text>.*?) *$/gm
  )) {
    const groups = match.groups ?? {};
    if (match.index === undefined) throw new Error('no heading index');

    headings.push({
      text: groups.text,
      indentation: groups.level.length,
      position: match.index,
      children: [],
    });
  }

  return makeHeadingTree(headings);
};

const makeHeadingTree = (headings: Heading[]) => {
  const tree: Heading[] = [];

  let parent: Heading | undefined;
  let children: Heading[] = [];

  for (const heading of headings) {
    const parentLevel = parent?.indentation ?? 6;

    if (heading.indentation <= parentLevel) {
      if (parent) {
        parent.children = makeHeadingTree(children);
        children = [];
      }

      tree.push(heading);
      parent = heading;
    } else {
      children.push(heading);
    }
  }

  if (children.length > 0 && parent) {
    parent.children = makeHeadingTree(children);
  }

  return tree;
};

const findPath = <T extends { children: T[] }>(
  tree: T[],
  predicate: (node: T) => boolean,
  path: T[] = []
): T[] | undefined => {
  for (const node of tree) {
    path.push(node);
    if (predicate(node) || findPath(node.children, predicate, path)) {
      return path;
    }
    path.pop();
  }
};
