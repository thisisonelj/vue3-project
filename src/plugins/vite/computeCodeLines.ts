/**
 * 自定义统计文件类型数量、代码行数
 */
import { extname } from 'path';
import pc from 'picocolors';
import type { Plugin } from 'vite';

const { green, blue, cyan } = pc;

export function vitePluginSummary(): Plugin {
  // Map存储文件后缀名与之对应的文件名称集合Set
  const extnameMap = new Map<string, Set<string>>();

  // 统计代码行数
  let totalCodeLine = 0;

  return {
    name: 'vite-plugin-summary',
    buildStart() {
      extnameMap.clear();
      totalCodeLine = 0;
    },

    load(importee: string) {
      if (/node_modules|\x00/.test(importee)) return null;

      /**
       * 文件名称中可能有请求参数，例如：/root/src/index.vue?type=script&setup=true
       * 去除文件名称中的参数得到：/root/src/index.vue
       * */
      const importeeRemoveQuery = importee.replace(/\?.*/g, '');
      // const importeeRemoveQuery = importee
      /**
       * 经过extname处理过的文件后缀名可能会有请求参数，例如：.vue?type=script&xxxx
       * 将  .vue?type=script&xxxx => .vue
       */
      const currentExtname = extname(importeeRemoveQuery).replace(/\?.*/g, '');

      extnameMap.set(
        currentExtname,
        extnameMap.has(currentExtname) ? extnameMap.get(currentExtname)!.add(importeeRemoveQuery) : new Set<string>().add(importeeRemoveQuery)
      );

      return null;
    },

    transform(code: string, id: string) {
      const cachedExtArr = [...extnameMap.values()].reduce((pre: any[], cur) => {
        pre.push(...cur);
        return pre;
      }, []);

      if (cachedExtArr.includes(id)) {
        totalCodeLine += (code.split('\n') || []).length;
      }

      return code;
    },

    closeBundle() {
      for (const [key, extSet] of extnameMap.entries()) {
        console.log(`${green(key)}'s num is ${blue(extSet.size)}`);
      }
      console.log(`the total code line is ${cyan(totalCodeLine)}`);
    },

    // transform 必须要设置pre
    enforce: 'pre',
  };
}
