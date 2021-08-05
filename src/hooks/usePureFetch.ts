import { ReqResponse } from '@/utils/request';
import { useMemo } from 'react';

type GetResponseDataType<T extends Promise<ReqResponse<any>>> =
  T extends Promise<ReqResponse<infer R>> ? R : any;

export function transPureFetch<
  R extends Promise<ReqResponse<any>>,
  P extends any[],
>(
  fetchMethod: (...args: P) => R,
  ignoreKey?: boolean,
): (...args: P) => Promise<GetResponseDataType<R>> {
  return (...args: P) => {
    const [, ...rest] = args;
    const newArgs = ignoreKey ? rest : args;
    return fetchMethod(...(newArgs as any)).then((res) => {
      if (res.isSuccess) {
        return res.data;
      } else if (res.isCancel) {
        return Promise.reject(new Error(res.msg || '操作取消'));
      } else {
        return Promise.reject(new Error(res.msg));
      }
    });
  };
}

function usePureFetch<R extends Promise<ReqResponse<any>>, P extends any[]>(
  fetchMethod: (...args: P) => R,
  ignoreKey?: boolean,
): (...args: P) => Promise<GetResponseDataType<R>> {
  const request = useMemo(() => {
    return transPureFetch(fetchMethod, ignoreKey);
  }, [fetchMethod, ignoreKey]);
  return request;
}

export default usePureFetch;
