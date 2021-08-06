import React, { Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ErrorPage from '@/components/ErrorPage';
import { HelmetProvider } from 'react-helmet-async';
import LazyLoad from '@/components/LazyLoad';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { SWRConfig, SWRConfiguration } from 'swr';
import { Fetcher } from 'swr/dist/types';
import { ConfigProvider, Modal } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './index.scss';
import './styles/antd.less';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import commit from '@/.commit';
import defaultLocale from 'antd/es/locale/default';
import { BaseGrid, Upload } from 'teaness';
import Title from './components/Title';
import routes from '#/routes';
import renderRoute from './components/renderRoute';
import Boundary from './components/Boundary';
import { apiPrefix, DSN } from '#/projectConfig';
import { getFileInfo, uploadFile } from './service/file';
import { getPreviewUrl, join } from './utils/utils';
import PictureView from './components/PictureView';

if (zhCN.Modal) {
  zhCN.Modal.justOkText = '确定';
}

// fix show english
Object.assign(defaultLocale, zhCN);

if (DSN) {
  Sentry.init({
    dsn: DSN,
    integrations: [new Integrations.BrowserTracing()],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}

// eslint-disable-next-line
console.group('版本信息');
// eslint-disable-next-line
console.log(`版本hash: ${commit.hash}`);
// eslint-disable-next-line
console.log(`更新内容: ${commit.msg}`);
// eslint-disable-next-line
console.groupEnd();

dayjs.locale('zh-cn'); // 使用本地化语言
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('zh-cn', {
  relativeTime: {
    future: '%s内',
    past: '%s',
    s: '刚刚',
    m: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `1 分钟前`;
      }
      return `1 分钟`;
    },
    mm: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `${number} 分钟前`;
      }
      return `${number} 分钟`;
    },
    h: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `1 小时前`;
      }
      return `1 小时`;
    },
    hh: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `${number} 小时前`;
      }
      return `${number} 小时`;
    },
    d: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `1 天前`;
      }
      return `1 天`;
    },
    dd: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `${number} 天前`;
      }
      return `${number} 天`;
    },
    M: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `1 个月前`;
      }
      return `1 个月`;
    },
    MM: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `${number} 个月前`;
      }
      return `${number} 个月`;
    },
    y: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `1 年前`;
      }
      return `1 年`;
    },
    yy: (number: number, _: boolean, __: string, isFuture: boolean) => {
      if (!isFuture) {
        return `${number} 年前`;
      }
      return `${number} 年`;
    },
  },
});

Modal.defaultProps = {
  ...Modal.defaultProps,
  centered: true,
};

const swrConfig: SWRConfiguration<any, any, Fetcher<any>> = {
  revalidateOnFocus: false,
};

/** MIME
excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.ms-excel
application/vnd.ms-excel.sheet.macroEnabled.12
word
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
ppt
application/vnd.openxmlformats-officedocument.presentationml.presentation
application/vnd.ms-powerpoint
 */

BaseGrid.defaultProps = {
  ...BaseGrid.defaultProps,
  headerHeight: 32,
  rowHeight: 32,
  noRowsOverlayComponentFramework: () => <span>暂无数据</span>,
};

export const SUPPORT_PREVIEW_FILES = new Set([
  'xls',
  'xlsx',
  'xlsm',
  'ppt',
  'pptx',
  'doc',
  'docx',
]);

Upload.defaultProps = {
  ...Upload.defaultProps,

  onUpload: uploadFile,
  onPreview: (file) => {
    if (file.type && /image\/.*/.test(file.type)) {
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          PictureView({
            src: e.target?.result as string,
          });
        };
        reader.readAsDataURL(file.originFileObj);
      } else {
        PictureView({
          src: file.thumbUrl || file.url,
        });
      }
    } else if (file.originFileObj) {
      Modal.error({
        content: '暂未上传,上传后可查看',
      });
    } else if (file.type === 'application/pdf') {
      window.open(getPreviewUrl(file.uid));
    } else if (file.uid.indexOf('.xls') || file.uid.indexOf('.xlsx')) {
      window.open(file.thumbUrl || file.url);
    } else if (SUPPORT_PREVIEW_FILES.has(file.name.split('.').pop() || '')) {
      window.open(
        join(apiPrefix, `/file-online-preview/onlinePreview?url=${file.uid}`),
      );
    } else {
      window.open(file.thumbUrl || file.url);
    }
  },
  getFile: getFileInfo,
  onDownload: (file) => {
    window.open(file.thumbUrl || file.url);
  },
};

function App() {
  return (
    <Boundary>
      <Router>
        <ConfigProvider locale={zhCN}>
          <SWRConfig value={swrConfig}>
            <HelmetProvider>
              <Title />
              <Suspense fallback={<LazyLoad />}>
                <Switch>
                  {routes.map((item) => {
                    return renderRoute(item);
                  })}
                  <Route>
                    <ErrorPage statusCode={404} />
                  </Route>
                </Switch>
              </Suspense>
            </HelmetProvider>
          </SWRConfig>
        </ConfigProvider>
      </Router>
    </Boundary>
  );
}

export default App;
