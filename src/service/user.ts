import { User } from '@/models/User';
import request, { ReqResponse } from '@/utils/request';
import crypto from 'crypto-js';

export function getGuestUid() {
  return request.get<ReqResponse<string>>('/user/auth/getGuestUid');
}

export function getCurUser() {
  return request.get<ReqResponse<User>>('/user/auth/queryCurrentInfo');
}

export function login({
  captcha,
  guestUid,
  username,
  password,
  sysId,
}: {
  captcha: string;
  guestUid: string;
  username: string;
  password: string;
  sysId: string;
}) {
  return request.post<
    ReqResponse<{
      jwt: string;
      res: string;
      user: User;
    }>
  >(
    `/user/auth/newLogin`,
    { username, password: crypto.MD5(password).toString(), sysId },
    {
      headers: {
        verifyCode: captcha,
        guestUid,
      },
    },
  );
}

// 退出登录
export function logout() {
  return request.get('/user/auth/logout');
}
