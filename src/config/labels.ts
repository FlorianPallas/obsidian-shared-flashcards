import { defaultsDeep } from 'lodash';
import log from 'loglevel';
import { Vault } from 'obsidian';
import { mapFromRecord, recordFromMap, ensureDir, exists } from '../util';

export interface Labels {
  $version: number;
  labels: Record<string, number>;
}

const defaults: Labels = {
  $version: 0,
  labels: {},
};

const applyDefaults = (data: Partial<Labels>): Labels =>
  defaultsDeep(data, defaults);

export const parseLabels = (data: any): Map<string, number> => {
  // do not convert unrecognized files to prevent accidental overwrites of important data
  if (data.$version === undefined) {
    log.debug('Parsed label data', data);
    throw new Error('Incompatible or corrupt label file detected');
  }

  // convert label data incrementally, arriving at a valid up to date labels object
  const labels: any = data;

  return mapFromRecord(applyDefaults(labels).labels);
};

export const stringifyLabels = (labels: Map<string, number>): string => {
  const json = applyDefaults({ labels: recordFromMap(labels) });
  return JSON.stringify(json, null, 2);
};

export const readLabels = async (vault: Vault, path: string) => {
  let data = defaults;
  if (await exists(vault, path)) {
    data = JSON.parse(await vault.adapter.read(path));
  }
  return parseLabels(data);
};

export const writeLabels = async (
  vault: Vault,
  path: string,
  labels: Map<string, number>
) => {
  await ensureDir(vault, path);
  await vault.adapter.write(path, stringifyLabels(labels));
};
