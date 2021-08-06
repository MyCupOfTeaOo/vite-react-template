import request, { ReqResponse, CancellablePromise } from '@/utils/request';
import Axios from 'axios';
import { Dict } from './interface';

export function getCurrentDict(
  server: string,
  dictType: string,
  code?: string | number,
  queryAll?: boolean,
) {
  const source = Axios.CancelToken.source();
  const req = request.get(`/${server}/dicts/${dictType}`, {
    params: { queryAll, code },
    cancelToken: source.token,
  }) as CancellablePromise<ReqResponse<Dict>>;
  req.cancel = source.cancel;
  return req;
}

export function getChildDict(
  server: string,
  dictType: string,
  code?: string | number,
  queryAll?: boolean,
) {
  const source = Axios.CancelToken.source();
  const req = request.get(`/${server}/dicts/${dictType}/children`, {
    params: { queryAll, code },
    cancelToken: source.token,
  }) as CancellablePromise<ReqResponse<Dict[]>>;
  req.cancel = source.cancel;
  return req;
}

export function getDictTypes(server: string) {
  const source = Axios.CancelToken.source();
  const req = request.get(`/${server}/dictTypes`, {
    cancelToken: source.token,
  }) as CancellablePromise<ReqResponse<Dict[]>>;
  req.cancel = source.cancel;
  return req;
}

export interface DictMeta {
  levelCodeLen?: string;
  levelNum?: string | number;
  value: string;
  label: string;
}

export function getDictMeta(server: string, dictType: string) {
  const source = Axios.CancelToken.source();
  const req = request.get(`/${server}/dictTypes/${dictType}`, {
    cancelToken: source.token,
  }) as CancellablePromise<ReqResponse<DictMeta[]>>;
  req.cancel = source.cancel;
  return req;
}

/**
 * 废弃,请使用 components 内的 DictSelect
 * @deprecated
 */
export const loadDict = (dictType: string, server: string) => {
  return () => {
    const req = getChildDict(server, dictType);
    const reqNext = req.then((resp) => {
      if (resp.isSuccess) {
        return (
          resp.data?.map((item) => ({
            label: item.label,
            value: item.value,
          })) || []
        );
      } else {
        return Promise.reject(resp);
      }
    }) as any as CancellablePromise<
      {
        label: string;
        value: any;
      }[]
    >;
    reqNext.cancel = req.cancel;
    return reqNext;
  };
};
