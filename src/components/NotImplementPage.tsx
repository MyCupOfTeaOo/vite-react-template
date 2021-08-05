import React, { useCallback, useMemo } from 'react';
import { Result, Button } from 'antd';
import { useHistory } from 'react-router-dom';

export default function () {
  const history = useHistory();
  const push = useCallback(() => {
    history.push('/');
  }, []);
  const goback = useCallback(() => {
    history.goBack();
  }, []);
  const back = useMemo(
    () => (
      <>
        <Button type="primary" onClick={push}>
          回到首页
        </Button>
        <Button type="primary" onClick={goback}>
          返回上一页
        </Button>
      </>
    ),
    [],
  );
  return (
    <Result
      status="warning"
      title="501"
      subTitle="该页面正在开发中"
      extra={back}
    />
  );
}
