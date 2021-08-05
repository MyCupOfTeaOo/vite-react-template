import React, { ComponentType } from 'react';
import { RouteInterface } from './routes';

export interface PageInterface {
  title?: string;
  menuId: string;
  hidden?: boolean;
  component?: ComponentType<any>;
  Routes?: ComponentType<any>;
  exact?: boolean;
  icon?: React.ReactNode;
  routes?: RouteInterface[];
}

const pages: PageInterface[] = [
  {
    menuId: 'dictQuery',
    component: React.lazy(() => import('@/pages/DictCommon')),
  },
  {
    menuId: 'dictInfo',
    component: React.lazy(() => import('@/pages/DictCascade/index')),
  },
];

export default pages;
