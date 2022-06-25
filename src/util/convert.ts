import { createHash } from 'crypto';

export const mapFromRecord = <V>(records: Record<string, V>): Map<string, V> =>
  new Map(Object.entries(records));

export const recordFromMap = <V>(map: Map<string, V>): Record<string, V> => {
  const record: Record<string, V> = {};
  map.forEach((value, key) => {
    record[key] = value;
  });
  return record;
};

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
