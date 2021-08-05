import React, { Suspense, useEffect, useMemo, useState } from 'react';

import { notification, Spin } from 'antd';

import store from '@/stores';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { clearToken, getToken, setToken } from '@/utils/authority';
import { getCurUser } from '@/service/user';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { getRedirectUrl } from '@/utils/utils';
import LazyLoad from '@/components/LazyLoad';
import ErrorPage from '@/components/ErrorPage';
import { useQuery } from '@/hooks/useQuery';
import { stringify } from 'qs';
import { omit } from 'lodash-es';
import renderRoute from '@/components/renderRoute';
import useSWR from 'swr';
import { getMenuData } from '@/service/permission';
import usePureFetch from '@/hooks/usePureFetch';
import { genRoutes } from '@/models/Menu';
import styles from './styles.module.scss';
import { loginRoutes } from '#/routes';
import pages from '#/pages';

export interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => {
  const history = useHistory();
  const query = useQuery();
  const token = query.token || getToken();
  const [loading, setLoading] = useState(!!token);
  const { data: menuData } = useSWR(
    token ? 'getMenuData' : null,
    usePureFetch(getMenuData, true),
  );
  useEffect(() => {
    if (menuData) {
      const [routes, menu2Route] = genRoutes(menuData, pages);
      store.route.setMenuRoutes(routes);
      store.route.setMenu2Route(menu2Route);
      return () => {
        store.route.clear();
      };
    }
  }, [menuData]);
  const newRoutes = useMemo(() => {
    return [
      {
        ...loginRoutes[0],
        routes: toJS(store.route.menuRoutes),
      },
      ...loginRoutes.slice(1),
    ];
  }, [store.route.menuRoutes]);
  const child = useMemo(() => {
    return newRoutes.map((item) => {
      return renderRoute(item);
    });
  }, [newRoutes]);
  useEffect(() => {
    const historyToken = getToken();
    if (historyToken) {
      getCurUser()
        .then((res) => {
          if (res.isSuccess && res.data) {
            store.user.setUser(res.data);
            return;
          }
          notification.error({
            message: '登录已过期',
          });
          clearToken();
          history.replace(getRedirectUrl());
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      history.replace(getRedirectUrl());
    }
  }, []);
  if (query.token) {
    setToken(query.token);
    return (
      <Redirect
        to={{
          pathname: history.location.pathname,
          search: stringify(omit(query, 'token')),
        }}
      />
    );
  }
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px 0',
        }}
      >
        <Spin delay={200} tip="登录中..." />
      </div>
    );
  }
  if (token && !menuData) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px 0',
        }}
      >
        <Spin delay={200} tip="加载菜单中..." />
      </div>
    );
  }
  return (
    <div className={styles.layout}>
      <Suspense fallback={<LazyLoad />}>
        <Switch>
          {child}
          <Route>
            <ErrorPage statusCode={404} />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
};

export default observer(Layout);
