import { Wiki } from './wiki';
import { createHash } from 'crypto';

export const stringToBase64 = (input: string) => window.btoa(input);
export const base64ToString = (input: string) => window.atob(input);

export const encodeBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return stringToBase64(binary);
};

export const hashBase64 = (buffer: ArrayBuffer) => {
  const hashSum = createHash('sha256');
  hashSum.update(new Uint8Array(buffer));
  return hashSum.digest('base64');
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
