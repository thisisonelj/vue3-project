import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname } from 'path';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
export default ({ command, mode }) => {
  console.log('环境变量 =>', command, mode);
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'));
  console.log(env);
  const _filename = fileURLToPath(import.meta.url);
  const _dirName = dirname(_filename);
  const entryFile = path.join(_dirName, '/src/main.ts');
  console.log(_dirName);
  return defineConfig({
    envDir: './env', // 自定义env目录
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', 'vue'],
    },
    define: {
      __VITE_APP_PROXY__: true || false,
    },
    server: {
      host: '0.0.0.0',
      port: 5174,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:9000/api', //目标域名
          changeOrigin: true, //需要代理跨域
          rewrite: (path) => path.replace(/^\/api/, ''), //路径重写，把'/api'替换为''
        },
      },
    },
    build: {
      target: 'es2015',
      rollupOptions: {
        external: ['vue', 'vue-router', 'axios'],
        input: entryFile,
        plugins: [resolve()],
        output: {
          name: 'liu-bundle',
          format: 'es',
          globals: {
            vue: 'Vue',
            'vue-router': 'VueRouter',
            axios: 'axios',
          },
          plugins: [terser],
          manualChunks: {
            'element-plus': ['element-plus'],
          },
          assetFileNames: (assetInfo) => {
            return 'assets/[name]-[hash][extname]';
          },
          chunkFileNames: (chunkInfo) => {
            return '[name]-[hash].js';
          },
          entryFileNames: (chunkInfo) => {
            return '[name].js';
          },
        },
      },
    },
  });
};
