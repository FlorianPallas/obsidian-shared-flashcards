import { defaultsDeep } from 'lodash';
import { Plugin } from 'obsidian';
import { LabelMap } from 'src/config/labelMap';
import { dirname } from 'path';

const defaultLabelMap: LabelMap = {
  entries: [],
};

export class LabelMapLoader {
  private plugin: Plugin;

  public constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  public async load(path: string): Promise<Map<string, number>> {
    await this.ensureConfig(path, defaultLabelMap);
    const json = await this.plugin.app.vault.adapter.read(path);
    const data = JSON.parse(json);
    const labelMap: LabelMap = defaultsDeep(data, defaultLabelMap);
    return new Map(labelMap.entries);
  }

  public async save(path: string, map: Map<string, number>): Promise<void> {
    const labelMap: LabelMap = defaultsDeep(
      { entries: Array.from(map.entries()) },
      defaultLabelMap
    );
    await this.ensureConfig(path, labelMap);
    await this.plugin.app.vault.adapter.write(path, JSON.stringify(labelMap));
  }

  private async ensureConfig(path: string, labelMap: LabelMap) {
    if (!(await this.exists(path))) {
      if (!(await this.exists(dirname(path)))) {
        await this.plugin.app.vault.createFolder(dirname(path));
      }
      await this.plugin.app.vault.create(path, JSON.stringify(labelMap));
    }
  }

  private async exists(path: string) {
    return this.plugin.app.vault.adapter.exists(path);
  }
}
