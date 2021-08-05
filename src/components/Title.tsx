import React from 'react';
import { useLocation } from 'react-use';
import { Helmet } from 'react-helmet-async';
import stores from '@/stores';
import { observer } from 'mobx-react-lite';
import { projectName } from '#/projectConfig';

export interface TitleProps {}

const Title: React.FC<TitleProps> = () => {
  const location = useLocation();
  const target = stores.route.urlMap[location.pathname || '/'];
  return (
    <>
      <Helmet>
        <title>
          {target?.title ? `${target.title}-${projectName}` : projectName}
        </title>
      </Helmet>
    </>
  );
};

export default observer(Title);
