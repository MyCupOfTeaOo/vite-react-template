import { makeAutoObservable } from 'mobx';
import routes, {
  loginRoutes as afterLoginRoutes,
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

  menuRoutes: RouteInterface[] = [];

  urlMap: { [key: string]: RouteInterface } = Object.assign(
    getUrlMap({}, routes),
    getUrlMap({}, afterLoginRoutes),
  );

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setMenuRoutes(menuRoutes: RouteInterface[]) {
    this.menuRoutes = menuRoutes;
    this.urlMap = Object.assign(this.urlMap, getUrlMap({}, menuRoutes));
  }

  clearMenuRoutes() {
    this.menuRoutes = [];
    this.urlMap = Object.assign(
      getUrlMap({}, routes),
      getUrlMap({}, afterLoginRoutes),
    );
  }
}
