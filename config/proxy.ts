import { ProxyOptions } from 'vite';
import { apiPrefix } from './projectConfig';

const proxy: Record<string, string | ProxyOptions> = {
  [apiPrefix]: {
    target: 'http://localhost:5000',
    changeOrigin: true,
    rewrite: (path) => path.replace(apiPrefix, ''),
  },
};
export default proxy;
