/**
 * 自定义vite插件   测试练习
 */
// my-vite-plugin.ts
import type { Plugin } from 'vite';
import { ResolvedConfig } from 'vite';
import { existsSync, mkdirSync, copyFile } from 'fs';
import path from 'path';

export default function myVitePlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'vite-lj-plugin',

    configResolved(resolvedConfig: ResolvedConfig) {
      console.log(resolvedConfig);
      // 存储最终解析的配置
      config = resolvedConfig;
    },

    // 构建开始
    buildStart() {
      console.log('构建开始...');
    },

    // 转换代码
    transform(code, id) {
      if (config.mode === 'development') {
        if (id.includes('test-lj.ts')) {
          const transformedContent = `let obj = { id: 'junjunjun',content: '测试lj转换转换',};console.log(obj);`;
          return transformedContent;
        }
      }
      return null;
    },
    async writeBundle() {
      //要在写入文件后修改文件
      //创建 newFile文件夹
      const pathRoot = process.cwd();
      const filePath = path.resolve(pathRoot, 'dist/lj-test-file');
      if (!existsSync(filePath)) {
        mkdirSync(filePath);
      }
      // 复制文件到 newFile 目录下
      try {
        const targetPath = path.resolve(filePath, 'index.html');
        copyFile(path.resolve(pathRoot, 'dist/index.html'), targetPath, (error) => {
          console.log(error);
        });
      } catch (error) {}
    },

    buildEnd() {
      console.log('构建结束...');
    },
  };
}
