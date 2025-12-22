/**
 * 自定义一个json转换js的插件
 */

import type { Plugin, ResolvedConfig } from 'vite';
import path from 'path';
import { writeFile } from 'fs/promises';
import { dataToEsm } from '@rollup/pluginutils';

const convertJsonToCjs = async (str: string) => {
  const destPath = path.resolve(__dirname, '..', 'test', 'temp.ts');
  await writeFile(destPath, str, 'utf-8');
  return `const array = [{"id":"one","name":"this is a one"},{"id":"two","name":"this is a two"}];const licence = "ASDASDDASDASADS";const footerLanguage = "ZH_CN";`;
};

export function viteJSONTOJS(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'vite-json-js-plugin',
    enforce: 'pre',
    configResolved(resolvedConfig: ResolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },

    async transform(code: string, id: string) {
      if (config.mode === 'development') {
        if (id.includes('test-lj.json')) {
          await convertJsonToCjs(`const object=${code}`);
        }
      }
    },
  };
}
