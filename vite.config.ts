import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { dirname } from 'path';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import ConditionalCompile from 'vite-plugin-conditional-compiler';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import commonjs from '@rollup/plugin-commonjs';
import externalGlobals from 'rollup-plugin-external-globals';
import autoprefixer from 'autoprefixer';
import compressionPlugins from 'vite-plugin-compression';
import pxToVw from 'postcss-px-to-viewport';
import pxToRem from 'postcss-pxtorem';
export default ({ command, mode }) => {
  console.log('环境变量 =>', command, mode);
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'));
  const _filename = fileURLToPath(import.meta.url);
  const _dirName = dirname(_filename);
  const entryFile = path.join(_dirName, '/index.html');
  // 打包后引入全局变量 针对排除打包的三方依赖
  const globals = externalGlobals({
    vue: 'Vue',
    axios: 'axios',
    '@vueuse/core': 'VueUse',
  });
  const externalGlobalsInfo = mode === 'production' ? [globals] : [];
  const compressions = compressionPlugins({
    verbose: true,
    disable: false,
    deleteOriginFile: false,
    threshold: 10240,
    algorithm: 'gzip',
    ext: '.gz',
  });
  const compressionsInfo = mode === 'production' ? [compressions] : [];
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
      AutoImport({
        imports: ['vue'],
        resolvers: [ElementPlusResolver()],
      }),
      commonjs({
        include: '/node_modules/',
      }),
    ],
    css: {
      // 自动引入css前缀
      postcss: {
        plugins: [
          autoprefixer(),
          // 全局vw响应式适配
          // pxToVw({
          //   viewportWidth: 1920, // 设计稿的视口宽度
          //   propList: ['*'],
          //   viewportUnit: 'vw', // 希望使用的视口单位
          //   fontViewportUnit: 'vw', // 字体使用的视口单位
          //   // 下面配置表示类名中含有'keep-px'都不会被转换
          //   selectorBlackList: ['keep-px-vw'],
          //   mediaQuery: false, // 媒体查询里的单位是否需要转换单位
          //   replace: true, //  是否直接更换属性值，而不添加备用属性
          // }),
          // // 全局rem响应式适配
          // pxToRem({
          //   rootValue: 16, // rem 相对于 px 转换的基准值
          //   propList: ['*'], // 需要转换的 CSS 属性，* 表示全部
          //   unitPrecision: 5, // 转换后的小数位数
          //   // 下面配置表示类名中含有'keep-px'都不会被转换
          //   selectorBlackList: ['keep-px-rem'],
          //   mediaQuery: false, // 媒体查询里的单位是否需要转换单位
          //   replace: true, //  是否直接更换属性值，而不添加备用属性
          //   minPixelValue: 0,
          // }),
        ],
      },
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
      cssCodeSplit: true,
      emptyOutDir: true,
      rollupOptions: {
        external: ['vue', 'axios'],
        input: entryFile,
        plugins: [resolve(), terser, externalGlobalsInfo, compressionsInfo],
        output: {
          name: 'liu-bundle',
          format: 'es',
          manualChunks: {
            'element-plus': ['element-plus'],
          },
          // 对打包后的文件 自定义目录、路径
          assetFileNames: (assetInfo) => {
            let assetFile = 'static/[ext]/[name].[ext]';
            const fileNames = assetInfo.names;
            for (const element of fileNames) {
              if (element.endsWith('.css')) {
                assetFile = `lj-css/[name].[ext]`;
                break;
              }
            }
            return assetFile;
          },
          chunkFileNames: (chunkInfo) => {
            return 'lj-common-js/[name].js';
          },
          entryFileNames: (chunkInfo) => {
            return 'lj-default-js/[name].js';
          },
        },
      },
    },
  });
};
