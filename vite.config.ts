import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname } from 'path';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import ConditionalCompile from 'vite-plugin-conditional-compiler';
export default ({ command, mode }) => {
  console.log('环境变量 =>', command, mode);
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'));
  console.log(env);
  console.log(process.env);
  const _filename = fileURLToPath(import.meta.url);
  const _dirName = dirname(_filename);
  const entryFile = path.join(_dirName, '/src/main.ts');
  return defineConfig({
    envDir: path.resolve(_dirName, 'env'), // 自定义env目录
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(_dirName, 'src/assets/svg')],
        // 指定symbolId格式
        symbolId: 'icon-[name]',
      }),
      ConditionalCompile(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          //  全局变量
          additionalData: '@use "@/assets/global-variables.scss" as *;',
        },
      },
    },
    define: {
      __VITE_APP_PROXY__: true || false,
      'process.env': {},
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
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_debugger: true,
        },
      },
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
