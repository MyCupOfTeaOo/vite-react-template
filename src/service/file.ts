import Axios, { CancelToken } from 'axios';
import request, { ReqResponse } from '@/utils/request';
import { UploadFile } from 'antd/lib/upload/interface';
import { getToken } from '@/utils/authority';
import { apiPrefix } from '#/projectConfig';

export function getFileInfoByUri(uri: string, cancelToken?: CancelToken) {
  return request.post<
    ReqResponse<{
      uri: string;
      originalFileName: string;
      fileSize: number;
      fileType: string;
    }>
  >(
    `/file/getFileInfoByUri`,
    {},
    {
      params: { uri },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      cancelToken,
    },
  );
}

export function uploadFile(
  file: File | UploadFile,
  onUploadProgress?: (percent: number, progressEvent?: any) => void,
) {
  const source = Axios.CancelToken.source();
  const formData = new FormData();
  formData.append('file', ((file as UploadFile).originFileObj || file) as File);
  const r = request
    .post<
      ReqResponse<{
        uri: string;
        originalFileName: string;
        fileSize: number;
        fileType: string;
      }>
    >('/file/uploadFile', formData, {
      cancelToken: source.token,
      headers: { 'content-type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress
        ? (progressEvent: any) => {
            onUploadProgress(
              Math.floor((progressEvent.loaded * 100) / progressEvent.total),
              progressEvent,
            );
          }
        : undefined,
    })
    .then((res) => {
      if (res.isSuccess) {
        return {
          uid: res.data.uri,
          name: res.data.originalFileName,
          url: `/${apiPrefix}/file/downloadFileByUri?uri=${
            res.data.uri
          }&token=${getToken()}`,
          size: res.data.fileSize,
          type: res.data.fileType,
        };
      } else {
        return Promise.reject(res);
      }
    }) as Promise<{
    uid: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }> & {
    cancel: () => void;
  };
  r.cancel = source.cancel;
  return r;
}

export const getFileInfo = (uri: string) => {
  const { token, cancel } = Axios.CancelToken.source();
  const r = getFileInfoByUri(uri, token).then((res) => {
    if (res.isSuccess && res.data) {
      return {
        name: res.data.originalFileName,
        url: `/${apiPrefix}/file/downloadFileByUri?uri=${
          res.data.uri
        }&token=${getToken()}`,
        size: res.data.fileSize,
        type: res.data.fileType,
      };
    } else {
      return Promise.reject(res);
    }
  }) as Promise<{
    name: string;
    url: string;
    size: number;
    type: string;
  }> & {
    cancel: () => void;
  };
  r.cancel = cancel;
  return r;
};
