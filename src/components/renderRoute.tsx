import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { RouteInterface } from '#/routes';
import Title from './Title';
import ErrorPage from './ErrorPage';
import Boundary from './Boundary';
import { AuthContext } from './Authority/context';

const renderRoute = (route: RouteInterface) => {
  const Com = route.component || React.Fragment;
  if (route.redirect) {
    return (
      <Route key={route.path} path={route.path} exact={route.exact}>
        <Redirect to={route.redirect} />
      </Route>
    );
  }
  const renderCom = (
    <Boundary>
      <AuthContext.Provider
        value={{
          menuId: route.menuId,
        }}
      >
        <Com {...route.params}>
          <Title />
          {route.routes ? (
            <Switch>
              {route.routes.map((subRoute) => {
                return renderRoute(subRoute);
              })}
              <Route path={route.path} exact>
                <Redirect to={route.routes[0].path} />
              </Route>
              <Route>
                <ErrorPage statusCode={404} />
              </Route>
            </Switch>
          ) : undefined}
        </Com>
      </AuthContext.Provider>
    </Boundary>
  );
  return (
    <Route
      key={route.path}
      component={() =>
        route.Routes
          ? route.Routes?.reduce((child, RouteCom) => {
              return <RouteCom>{child}</RouteCom>;
            }, renderCom)
          : renderCom
      }
      exact={route.exact ?? !route.routes}
      path={route.path}
    />
  );
};

export default renderRoute;
