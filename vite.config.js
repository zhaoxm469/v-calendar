import { createVuePlugin } from 'vite-plugin-vue2';
import ViteCommonjs from 'vite-plugin-commonjs';
import path from 'path';

/** @type {import('vite').UserConfig} */
export default {
  define: {
    process: {
      env: {
        MY_BUILD_MODE: 'production',
      },
    },
  },
  root: './',
  server: {
    host: '0.0.0.0',
    fs: {
      allow: ['..'],
    },
    port: '5003',
    proxy: {
      '/libs/mock': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: path =>
          path.replace(/\/libs\/mock/, '/helloris-front/src/libs/mock'),
      },
      '/libs': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: path => path.replace(/\/libs/, '/helloris-front/src/libs'),
      },
      '/api': {
        target: 'https://qa-helloris-api.helloweilai.cn',
        // target: 'https://api.haloweilai.com',
        changeOrigin: true,
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
  plugins: [ViteCommonjs(), createVuePlugin()],
  resolve: {
    extensions: ['.vue', '.js'],
    alias: {
      '@': path.resolve('src'),
    },
  },
};
