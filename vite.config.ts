import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import svgr from '@svgr/rollup';
import { injectHtml } from 'vite-plugin-html';
import { projectName } from './config/projectConfig';
import proxy from './config/proxy';
// 生成版本信息
import './config/commit';

// 可以走命令行代理
// GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:1080
import 'global-agent/bootstrap';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    injectHtml({
      injectData: {
        projectName,
      },
    }),
    svgr() as any,
    reactRefresh(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@/': '/src/',
      '#/': '/config/',
    },
  },
  server: {
    proxy,
  },
});
