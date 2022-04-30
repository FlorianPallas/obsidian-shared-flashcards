import { Wiki } from './wiki';

export const stringToBase64 = (input: string) => window.btoa(input);
export const base64ToString = (input: string) => window.atob(input);

export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return stringToBase64(binary);
};

export const LABEL_LENGTH = 10;

export const generateLabel = () => {
  let label = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < LABEL_LENGTH; i++) {
    label += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return label;
};

export const createLabel = (labelMap: Map<string, number>) => {
  let label: string;

  do {
    label = generateLabel();
  } while (labelMap.has(label));

  return label;
};

export const resolveWikiLinks = (content: string, wiki: Wiki) => {
  return content
    .replace(/!\[\[(.*?)\]\]/g, (_match, src) => {
      return `![](${wiki.getPath(src)})`;
    })
    .replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (_match, name, displayName) => {
      const href = `obsidian://open?vault=${encodeURIComponent(
        wiki.vault.getName()
      )}&file=${encodeURIComponent(wiki.getPath(name))}`;
      const text = displayName ? displayName : name;
      return `[${text}](${href})`;
    });
};
