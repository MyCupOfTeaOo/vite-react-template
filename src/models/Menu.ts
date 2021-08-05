import { dynamicImportBlock, isInboundLink, safeParse } from '@/utils/utils';
import React from 'react';
import NotImplementPage from '@/components/NotImplementPage';
import { PageInterface } from '#/pages';
import { RouteInterface } from '#/routes';

export interface Menu {
  // icon 后台可能会返回 'null' 字符串
  menuIcon?: string;
  menuId: string;
  menuName: string;
  menuUrl: string;
  params?: string;
  isMenu?: boolean;
  menus?: Menu[];
}

export interface MenuId2Route {
  [key: string]: RouteInterface;
}

export const isComponentUrl =
  /^component:(?<com>\S+)\((?<arg>.*)\)path=(?<path>.+)/;
export function parseUrl(
  path: string,
  component?: React.ComponentType,
  rootPath = '',
): { path: string; component: any; isComponent: boolean } {
  let url = path;
  let com = component;
  let isComponent = false;
  // 支持compoent url
  const result = isComponentUrl.exec(path);

  if (result && result.groups) {
    isComponent = true;
    const { arg } = result.groups;
    com = dynamicImportBlock((result.groups as { com: string }).com, arg);

    url = rootPath + result.groups.path;
  } else if (isInboundLink.test(path)) {
    url = path;
  } else {
    url = rootPath + path;
  }
  return {
    path: url.trim(),
    component: com,
    isComponent,
  };
}

export function genRoutes(
  menus: Menu[],
  menuConfig: PageInterface[],
  rootPath = '',
  hiddenMenu = false,
): [RouteInterface[], MenuId2Route] {
  const menuId2Route: MenuId2Route = {};
  const routes: RouteInterface[] = menus.map((menu) => {
    const target = menuConfig.find((config) => menu.menuId === config.menuId);
    const { path, component, isComponent } = parseUrl(
      menu.menuUrl.slice(1),
      target ? target.component : undefined,
      `${rootPath}/`,
    );
    const params = safeParse(menu.params);
    const route: RouteInterface = {
      path,
      menuId: menu.menuId,
    };
    menuId2Route[menu.menuId] = route;
    if (component || target) {
      const subRoutes: RouteInterface[] = [];
      if (target && Array.isArray(target.routes)) {
        subRoutes.push(...target.routes);
      }
      if (Array.isArray(menu.menus)) {
        const val = genRoutes(menu.menus, menuConfig, path, hiddenMenu);
        subRoutes.push(...val[0]);
        Object.assign(menuId2Route, val[1]);
      }
      Object.assign(route, {
        title: menu.menuName || target?.title,
        path,
        hidden:
          !(
            menu.isMenu === undefined ||
            menu.isMenu === null ||
            menu.isMenu === true
          ) ||
          hiddenMenu ||
          target?.hidden,
        component,
        exact: target?.exact ?? !isComponent,
        // icon: menu.menuIcon,
        routes: subRoutes.length ? subRoutes : undefined,
        params,
      } as RouteInterface);
    } else {
      const subRoutes: RouteInterface[] = [];
      if (Array.isArray(menu.menus)) {
        const val = genRoutes(menu.menus, menuConfig, path);
        subRoutes.push(...val[0]);
        Object.assign(menuId2Route, val[1]);
        if (subRoutes.length > 0) {
          Object.assign(route, {
            title: menu.menuName,
            path,
            hidden:
              !(
                menu.isMenu === undefined ||
                menu.isMenu === null ||
                menu.isMenu === true
              ) || hiddenMenu,
            component,
            // icon: menu.menuIcon,
            routes: subRoutes.length ? subRoutes : undefined,
            params,
          } as RouteInterface);
        } else {
          Object.assign(route, {
            title: menu.menuName,
            path,
            hidden:
              !(
                menu.isMenu === undefined ||
                menu.isMenu === null ||
                menu.isMenu === true
              ) || hiddenMenu,
            component: NotImplementPage,
            exact: true,
            // icon: menu.menuIcon,
            routes: subRoutes.length ? subRoutes : undefined,
            params,
          } as RouteInterface);
        }
      }
    }
    return route;
  });
  return [routes, menuId2Route];
}
