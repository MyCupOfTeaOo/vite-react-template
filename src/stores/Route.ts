import { makeAutoObservable } from 'mobx';
import { MenuId2Route } from '@/models/Menu';
import routes, {
  loginRoutes as afterLoginRoutes,
  menuRoutes,
  RouteInterface,
} from '#/routes';
import { RootStore } from '.';

export function getUrlMap(
  urlMap: { [key: string]: RouteInterface } = {},
  subRoutes?: RouteInterface[],
) {
  subRoutes?.forEach((route) => {
    if (route.redirect) {
      return;
    }
    // eslint-disable-next-line
    if (route.path) urlMap[route.path] = route;
    getUrlMap(urlMap, route.routes);
  });
  return urlMap;
}

export default class Route {
  rootStore: RootStore;

  menuRoutes: RouteInterface[] = menuRoutes;

  menu2Route: MenuId2Route = {};

  urlMap: { [key: string]: RouteInterface } = Object.assign(
    getUrlMap({}, routes),
    getUrlMap({}, afterLoginRoutes),
  );

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setMenuRoutes(newMenuRoutes: RouteInterface[]) {
    this.menuRoutes = [...menuRoutes, ...newMenuRoutes];
    this.urlMap = Object.assign(this.urlMap, getUrlMap({}, newMenuRoutes));
  }

  setMenu2Route(menu2Route: MenuId2Route) {
    this.menu2Route = menu2Route;
  }

  clear() {
    this.menuRoutes = menuRoutes;
    this.urlMap = Object.assign(
      getUrlMap({}, routes),
      getUrlMap({}, afterLoginRoutes),
    );
    this.menu2Route = {};
  }
}
