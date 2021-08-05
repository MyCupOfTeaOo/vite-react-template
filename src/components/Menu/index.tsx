import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as AMenu } from 'antd';
import { MenuProps as AntMenuProps } from 'antd/lib/menu/index';
import { isInboundLink } from '@/utils/utils';
import { getToken } from '@/utils/authority';
import './styles.scss';
import { RouteInterface } from '#/routes';

export interface MenuProps extends AntMenuProps {
  routes: RouteInterface[];
  collapsed?: boolean;
}

export const urlTemplateRegex = /\${.+?}/g;

export const urlTemplateInject = (url: string) => {
  const urlTemplateInjectObj: {
    [key: string]: any;
  } = {
    token: getToken(),
  };
  return url.replace(urlTemplateRegex, (substring) => {
    const target = substring.substring(2, substring.length - 1);
    return urlTemplateInjectObj[target] || substring;
  });
};

export const menuItem = (routes: RouteInterface[]) => {
  return routes
    .filter((route) => !route.hidden)
    .map((route) => {
      if (route.routes?.filter((item) => !item.hidden).length) {
        return (
          <AMenu.SubMenu icon={route.icon} key={route.path} title={route.title}>
            {menuItem(route.routes)}
          </AMenu.SubMenu>
        );
      }
      const path = route.path as string;
      const link = !isInboundLink.test(path) ? (
        <Link to={path}>{route.title}</Link>
      ) : (
        <a
          href={urlTemplateInject(path)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {route.title}
        </a>
      );

      return (
        <AMenu.Item icon={route.icon} key={route.path}>
          {link}
        </AMenu.Item>
      );
    });
};

export const getAllRootPath = (routes: RouteInterface[]): string[] => {
  const array = [];
  for (const route of routes) {
    if (route.path && Array.isArray(route.routes) && route.routes.length > 0) {
      array.push(route.path);
      for (const key of getAllRootPath(route.routes)) {
        array.push(key);
      }
    }
  }
  return array;
};

export function getPathAllRoot(path: string): string[] {
  const pathArray = path.split('/');
  return pathArray
    .map((item, index, array) => array.slice(0, index + 1).join('/'))
    .splice(1);
}

export function filterNotChildPath(
  paths: string[],
  routes: RouteInterface[],
): string[] {
  let node = routes;
  const nextPaths: string[] = [];
  for (const path of paths) {
    const nextNode = node.find(
      (route) =>
        route.path === path &&
        !route.hidden &&
        route.routes?.some((item) => !item.hidden),
    )?.routes;
    if (!nextNode) {
      if (!nextPaths.length) {
        // eslint-disable-next-line no-continue
        continue;
      }
      break;
    }
    node = nextNode;
    nextPaths.push(path);
  }
  return nextPaths;
}

export function getUrlMap(
  urlMap: { [key: string]: RouteInterface } = {},
  routes?: RouteInterface[],
) {
  routes?.forEach((route) => {
    // eslint-disable-next-line
    if (route.path && !route.hidden) urlMap[route.path] = route;
    getUrlMap(urlMap, route.routes);
  });
  return urlMap;
}

export function getSelectPath(
  urlMap: { [key: string]: RouteInterface } = {},
  path: string,
): string {
  if (urlMap[path]) {
    return path;
  } else {
    const newPaths = path.replace(/\/(?=.)/g, '//').split(/\/(?!\/)/g);
    if (newPaths.length < 2) return path;
    return getSelectPath(
      urlMap,
      newPaths.splice(0, newPaths.length - 1).join(''),
    );
  }
}

const Menu: React.FC<MenuProps> = ({ routes, collapsed, ...rest }) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [rootSubmenuKeys, setRootSubmenuKeys] = useState<string[]>([]);
  const [item, setItem] = useState<JSX.Element[]>([]);
  const urlMap = useMemo(() => {
    return getUrlMap({}, routes);
  }, [routes]);
  useEffect(() => {
    setRootSubmenuKeys(getAllRootPath(routes));
    setItem(menuItem(routes));
  }, [routes]);
  useEffect(() => {
    setOpenKeys(filterNotChildPath(getPathAllRoot(location.pathname), routes));
    setSelectedKeys([getSelectPath(urlMap, location.pathname)]);
  }, [location.pathname, routes]);

  const onOpenChange = useCallback(
    (keys: React.Key[]) => {
      if (collapsed) return;
      setOpenKeys((preOpenKeys) => {
        const theKeys = keys as string[];
        const latestOpenKey = theKeys.find(
          (key) => preOpenKeys.indexOf(key) === -1,
        ) as string;
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
          return theKeys;
        } else {
          return latestOpenKey
            ? theKeys
                .filter(
                  (key) =>
                    latestOpenKey.indexOf(key) !== -1 ||
                    key.indexOf(latestOpenKey) !== -1,
                )
                .filter((key) => key !== latestOpenKey)
                .concat([latestOpenKey])
            : [];
        }
      });
    },
    [rootSubmenuKeys, collapsed],
  );
  const onSelect = useCallback(({ selecteds }) => {
    setSelectedKeys(selecteds);
  }, []);
  const openKeysProps = useMemo(() => {
    const theProps: {
      openKeys?: string[];
    } = {};
    if (!collapsed) {
      theProps.openKeys = openKeys;
    }
    return theProps;
  }, [collapsed, openKeys]);
  return (
    <AMenu
      {...openKeysProps}
      mode="inline"
      selectedKeys={selectedKeys}
      onSelect={onSelect}
      onOpenChange={onOpenChange as any}
      {...rest}
    >
      {item}
    </AMenu>
  );
};

export default memo(Menu);
