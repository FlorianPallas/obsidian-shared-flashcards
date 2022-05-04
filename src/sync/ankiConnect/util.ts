import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { stringToBase64 } from 'src/util';

export const processMarkdown = async (
  content: string,
  media: [string, string][]
) => {
  let markdown = content
    .replace(
      /!\[(.*)\]\((.*\.(?:png|jpg|jpeg|gif|bmp|svg|tiff))(?: "(.*)")?\)/gi,
      (_match, alt: string, filePath: string, title?: string) => {
        const src = stringToBase64(filePath);
        media.push([src, filePath]);
        return `![${alt}](${src} "${title ?? ''}")`;
      }
    )
    .replace(/\$\$(.*?)\$\$/gs, (_match, body: string) => `\\\\[${body}\\\\]`)
    .replace(/\$(.*?)\$/g, (_match, body: string) => `\\\\(${body}\\\\)`);

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
};
