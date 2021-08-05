import { ProxyOptions } from 'vite';
import { apiPrefix } from './projectConfig';

const proxy: Record<string, string | ProxyOptions> = {
  [apiPrefix]: {
    target: 'http://web.jsbiimpl.qgbest',
    changeOrigin: true,
  },
};
export default proxy;
