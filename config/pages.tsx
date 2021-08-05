import { ComponentType } from 'react';
import { RouteInterface } from './routes';

export interface PageInterface {
  title?: string;
  menuId: string;
  hidden?: boolean;
  hiddenSubMenu?: boolean;
  component?: ComponentType<any>;
  Routes?: ComponentType<any>;
  exact?: boolean;
  icon?: React.ReactNode;
  routes?: RouteInterface[];
  params?: { [key: string]: any };
}

const pages: PageInterface[] = [];

export default pages;
