import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Circle } from 'teaness';
import useSWR from 'swr';
import usePureFetch from '@/hooks/usePureFetch';
import { getOprs } from '@/service/permission';
import { AuthContext } from './context';

/* eslint-disable no-param-reassign */

interface AuthorityProps {
  menuId?: string;
  operate?: string;
  /**
   * 无权限时替换的组件
   */
  alert?: React.ReactNode;
  children?: React.ReactNode | ((hasAuth: boolean) => React.ReactNode);
}

interface UseAuthorityOptions {
  menuId?: string;
}

type AuthRes = 'access' | 'noAccess' | 'loading' | 'error';

export function useAuthority(
  operate?: string,
  options?: UseAuthorityOptions,
): AuthRes;

export function useAuthority(
  operate?: string[],
  options?: UseAuthorityOptions,
): {
  [key: string]: AuthRes;
};

/**
 * 使用的组件需要配合 observer
 * @param options
 */
export function useAuthority(
  operate?: string | string[],
  options?: UseAuthorityOptions,
) {
  const context = useContext(AuthContext);
  const menuId = options?.menuId || context.menuId;
  const { data: operates, error } = useSWR(
    menuId ? ['getOprs', menuId] : null,
    usePureFetch(getOprs, true),
  );

  if (!operate) return 'access';
  if (Array.isArray(operate)) {
    if (operates) {
      return operate.reduce<{
        [key: string]: AuthRes;
      }>((authMap, curOpr) => {
        const hasAuth = operates.findIndex((item) => item === curOpr) > -1;
        if (hasAuth) {
          // 有权限
          authMap[curOpr] = 'access';
        } else {
          // 无权限
          authMap[curOpr] = 'noAccess';
        }
        return authMap;
      }, {});
    } else if (!error) {
      return operate.reduce<{
        [key: string]: AuthRes;
      }>((authMap, curOpr) => {
        authMap[curOpr] = 'loading';
        return authMap;
      }, {});
    } else {
      return operate.reduce<{
        [key: string]: AuthRes;
      }>((authMap, curOpr) => {
        authMap[curOpr] = 'error';
        return authMap;
      }, {});
    }
  } else if (operates) {
    const hasAuth = operates.findIndex((item) => item === operate) > -1;

    if (hasAuth) {
      // 有权限
      return 'access';
    } else {
      // 无权限
      return 'noAccess';
    }
  } else if (!error) {
    return 'loading';
  } else {
    return 'error';
  }
}

const Authority: React.FC<AuthorityProps> = (props) => {
  const auth = useAuthority(props.operate, {
    menuId: props.menuId,
  });
  if (auth === 'access') return <>{props.children}</>;
  if (auth === 'loading')
    return (
      <Circle
        style={{
          width: '2rem',
        }}
      />
    );
  if (auth === 'error') return <></>;
  return <>{props.alert}</>;
};

export default observer(Authority);
