import { DashboardOutlined } from '@material-ui/icons';
import React from 'react';
import { ComponentType } from 'react';

export interface RouteInterface {
  title?: string;
  path: string;
  menuId?: string;
  hidden?: boolean;
  component?: ComponentType<any>;
  Routes?: ComponentType<any>[];
  exact?: boolean;
  icon?: React.ReactNode;
  routes?: RouteInterface[];
  params?: { [key: string]: any };
  redirect?: string;
}

export const menuRoutes: RouteInterface[] = [
  {
    title: '首页',
    hidden: false,
    path: '/',
    component: React.lazy(() => import('@/pages')),
    icon: <DashboardOutlined />,
  },
];

export const loginRoutes: RouteInterface[] = [
  {
    path: '/',
    component: React.lazy(() => import('@/layouts/BasicLayout')),
    routes: menuRoutes,
  },
];

const routes: RouteInterface[] = [
  {
    path: '/sign',
    component: React.lazy(() => import('@/layouts/Signlayout')),
    exact: false,
    routes: [
      {
        title: '登录',
        path: '/sign/signin',
        component: React.lazy(() => import('@/pages/Sign/SignIn')),
      },
    ],
  },
  {
    path: '/',
    component: React.lazy(() => import('@/layouts')),
    exact: false,
  },
];

export default routes;
