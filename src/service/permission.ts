import { Menu } from '@/models/Menu';
import request, { ReqResponse } from '@/utils/request';
import Axios, { CancelToken } from 'axios';

export function getMenuData() {
  return request.get<ReqResponse<Menu[]>>(
    `/permission/api/SysRole2menu/getMenus`,
  );
}

export function getRoleTreeList(cancelToken?: CancelToken) {
  return request.post(
    `/permission/api/SysRole/getRoleTreeList`,
    {},
    {
      cancelToken,
    },
  );
}

export const loadRoleList = () => {
  const { token, cancel } = Axios.CancelToken.source();
  const r = getRoleTreeList(token).then((resp) => {
    if (resp.isSuccess) {
      if (Array.isArray(resp.data)) {
        return resp.data.map((item) => ({
          label: item.roleName,
          value: item.roleCode,
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

export function getOprs(menuId: string) {
  return request.post<ReqResponse<string[]>>(
    `/permission/api/SysRole2menu/getOprs`,
    {},
    {
      params: {
        menuId,
      },
    },
  );
}
