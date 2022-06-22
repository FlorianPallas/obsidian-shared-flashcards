import { Card } from 'src/entities/card';
import { Wiki } from 'src/entities/wiki';

/**
 * Transforms the wiki contents to use proper markdown syntax for obsidian wiki links.
 * The link is converted by making use of the obsidian protocol that will open the program on click.
 *
 * Example:
 * ```markdown
 * [[resource]]
 * > becomes
 * [resource](obsidian://open?vault=/path/to/resource)
 * ```
 * @param wiki the associated wiki
 * @param card the card to transform
 */
export const transformWikiLinks = (wiki: Wiki, card: Card) => {
  /**
   * Resolves a given resource name to it's corresponding file path within the vault.
   * If there are multiple resources with the same name, the first one is returned.
   *
   * @param name the resource name to resolve
   * @returns the vault relative file path to the resource
   */
  const resolve = (name: string): string => {
    const paths = wiki.index[name];
    if (!paths || paths.length < 1) {
      return name;
    }
    return paths[0];
  };

  /**
   * Transforms the wiki links in the given content string from obsidian to markdown syntax.
   *
   * @param content the content to transform
   * @returns the content with markdown links instead of obsidian wiki links
   */
  const transform = (content: string): string =>
    content
      .replace(/!\[\[(.*?)(?:\|(.*?))?\]\]/g, (_match, src) => {
        return `![](${resolve(src)})`;
      })
      .replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (_match, name, displayName) => {
        const href = `obsidian://open?vault=${encodeURIComponent(
          wiki.vault.getName()
        )}&file=${encodeURIComponent(resolve(name))}`;
        const text = displayName ? displayName : name;
        return `[${text}](${href})`;
      });

  card.front = transform(card.front);
  card.back = transform(card.back);
};
