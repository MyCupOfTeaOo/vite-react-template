import request, { ReqResponse } from '@/utils/request';
import { EnableState } from '@/constant';
import Axios, { CancelToken } from 'axios';
import { Pagination, PaginationBody } from '@/models/Pagination';

export async function findAllByDictTypeEnable(
  dictType: string,
  cancelToken?: CancelToken,
  queryAll: boolean = false,
) {
  return request.post(
    '/dict/dictManage/findAllByDictTypeEnable',
    {},
    {
      params: {
        dictType,
        queryAll,
      },
      cancelToken,
    },
  );
}

export async function switchCommonDict(
  dictType: string,
  code: string,
  levelNum: number,
  fatherCode?: string,
) {
  return request.post(
    '/dict/dictManage/disable',
    {},
    {
      params: {
        dictType,
        code,
        levelNum,
        fatherCode,
      },
    },
  );
}

export async function findDictByCode(
  dictType: string,
  cancelToken?: CancelToken,
) {
  return request.post(
    '/dict/dictManage/findDictByCode',
    {},
    {
      params: {
        dictType,
      },
      cancelToken,
    },
  );
}

export async function findDictsByType(
  dictType?: string,
  cancelToken?: CancelToken,
) {
  return request.post<ReqResponse<any>>(
    '/dict/dictManage/findDictsByType',
    {},
    {
      params: { dictType },
      cancelToken,
    },
  );
}

export async function findByFatherCodeAndDictTypeAndCode(
  fatherCode: string,
  dictType: string,
  code: string,
  cancelToken?: CancelToken,
) {
  return request.post<ReqResponse<any>>(
    '/dict/dictManage/findByFatherCodeAndDictTypeAndCode',
    {},
    {
      params: { fatherCode, dictType, code },
      cancelToken,
    },
  );
}

export const loadDict = (dictType: string) => {
  return () => {
    const { token, cancel } = Axios.CancelToken.source();
    const r = findAllByDictTypeEnable(dictType, token).then((resp) => {
      if (resp.isSuccess) {
        if (Array.isArray(resp.data)) {
          return resp.data.map((item) => ({
            label: item.value,
            value: item.code,
          }));
        } else {
          return [];
        }
      } else {
        return Promise.reject(resp);
      }
    }) as Promise<{ label: string; value: any }[]> & {
      cancel: () => void;
    };
    r.cancel = cancel;
    return r;
  };
};

export async function add(data: any) {
  return request.post<ReqResponse<any>>('/dict/dictManage/add', data);
}

export async function update(data: any) {
  return request.post<ReqResponse<any>>('/dict/dictManage/update', data);
}

export async function newDict(
  code: string,
  dictType: string,
  fatherCode?: string,
) {
  return request.post<ReqResponse<any>>(
    '/dict/dictManage/new',
    {},
    {
      params: {
        code,
        dictType,
        fatherCode,
      },
    },
  );
}

export async function switchCascadeDict(id: string, enable: EnableState) {
  return request.post(
    '/config/dict/cascade/switch',
    {},
    {
      params: {
        id,
        enable,
      },
    },
  );
}

export async function get(dictType: string, code: string, fatherCode?: string) {
  return request.post<ReqResponse<any>>(
    '/dict/dictManage/get',
    {},
    {
      params: {
        dictType,
        code,
        fatherCode,
      },
    },
  );
}

export type CasDictOption = {
  label: string;
  value: string;
  children?: CasDictOption[];
};

export function reduceCascaderDict(
  data?: [
    {
      dictValue: string;
      dictCode: string;
      notLeaf: boolean;
      fatherCode?: string;
    },
  ],
  fatherCode?: string,
): CasDictOption[] {
  return (data || [])
    .filter((item) => {
      if (!fatherCode) {
        return !item.fatherCode;
      } else {
        return item.fatherCode === fatherCode;
      }
    })
    .map((item) => ({
      label: item.dictValue,
      value: item.dictCode,
      children: !item.notLeaf
        ? undefined
        : reduceCascaderDict(data, item.dictCode),
    }));
}

export function searchCommonDict(body: PaginationBody) {
  return request.post<ReqResponse<Pagination<any>>>(
    '/dict/dictManage/query/',
    body,
  );
}
