import { ValidateErrorEntity } from 'rc-field-form/es/interface';

import { mutate, cache } from 'swr';
import { bucket, endpoint } from '#/projectConfig';

export enum ChineseNum {
  零,
  一,
  二,
  三,
  四,
  五,
  六,
  七,
  八,
  九,
  十,
  百 = 100,
  千 = 1000,
  万 = 10000,
  亿 = 100000000,
}

export enum ENWord {
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
}

export function getChineseNum(number: number): string {
  const abcNum = Math.abs(number);
  if (abcNum < 11) {
    return ChineseNum[number];
  }
  if (abcNum < 100) {
    const nextNumber = Math.floor(abcNum / 10);
    const remainder = abcNum % 10;
    return `${nextNumber === 1 ? '' : getChineseNum(nextNumber)}十${
      remainder ? getChineseNum(remainder) : ''
    }`;
  }
  if (abcNum < 1000) {
    const remainder = abcNum % 100;
    return `${getChineseNum(Math.floor(abcNum / 100))}百${
      remainder ? getChineseNum(remainder) : ''
    }`;
  }
  if (abcNum < 10000) {
    const remainder = abcNum % 1000;
    return `${getChineseNum(Math.floor(abcNum / 1000))}千${
      remainder ? getChineseNum(remainder) : ''
    }`;
  }
  if (abcNum >= 10000 && abcNum < 100000000) {
    const remainder = abcNum % 10000;
    return `${getChineseNum(Math.floor(abcNum / 10000))}万${
      remainder ? getChineseNum(remainder) : ''
    }`;
  }
  const remainder = abcNum % 100000000;
  return `${getChineseNum(Math.floor(abcNum / 100000000))}亿${
    remainder ? getChineseNum(remainder) : ''
  }`;
}

/**
 * 跳转到表单字段处,如果可以focus则自动focus
 * @param fieldKey 字典id
 * @param options scrollIntoView的配置透传
 * @returns 是否跳转成功
 */
export const scrollToField = (
  fieldKey: string,
  options: boolean | ScrollIntoViewOptions = {
    block: 'center',
  },
) => {
  try {
    let inputNode = document.querySelector(
      `#${fieldKey?.replace(/\.|\[|\]/g, '-')}`,
    );
    if (inputNode) {
      (inputNode as Element & { focus?: () => {} }).focus?.();
      inputNode.scrollIntoView(options);
      return true;
    }
    inputNode = document.getElementById(`${fieldKey}`);
    if (inputNode) {
      (inputNode as Element & { focus?: () => {} }).focus?.();
      inputNode.scrollIntoView(options);
      return true;
    }
    let labelNode = document.querySelector(`label[for="${fieldKey}"]`);
    if (labelNode) {
      labelNode.scrollIntoView(options);
      return true;
    }
    labelNode = document.querySelector(
      `label[for="${fieldKey?.replace(/\.|\[|\]/g, '-')}"]`,
    );
    if (labelNode) {
      labelNode.scrollIntoView(options);
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
};

/**
 * 根据表单错误信息跳转字段位置
 * @param errs 表单校验错误信息
 * @returns 是否跳转成功,没有错误算成功
 */
export function scrollByFormErrors(errs?: ValidateErrorEntity<any>) {
  if (errs?.errorFields.length) {
    const fieldKey = errs.errorFields[0]?.name.join('_');
    return scrollToField(fieldKey);
  }
  return true;
}

/**
 * 删除富文本tag
 * @param content 富文本
 */
export function remoteTag(content: string) {
  return content.replace(/<(\/){0,1}.+?>/g, '');
}

export const mutatePartoaKey = (partialKey: string) => {
  cache
    .keys()
    .filter((key) => {
      return key.includes(partialKey);
    })
    .forEach((key) => mutate(key));
};

/**
 * 拼接地址
 * @param path 地址
 */
export function join(...path: (string | undefined)[]) {
  return path.slice(1).reduce((allPath: string, curPath) => {
    if (!curPath) return allPath;
    if (allPath.charAt(allPath.length - 1) === '/') {
      if (curPath.charAt(0) === '/') {
        return allPath + curPath.slice(1);
      }
      return allPath + curPath;
    }
    if (curPath.charAt(0) === '/') {
      return allPath + curPath;
    }
    return `${allPath}/${curPath}`;
  }, path[0] || '');
}

export function getPreviewUrl(uid?: string, placeholder?: string): string;

export function getPreviewUrl(uid: string, placeholder: null): string | null;
export function getPreviewUrl(uid: undefined, placeholder: null): null;

/**
 * 获取图片原始链接地址
 * @param uid 文件id
 * @param placeholder 图片站位
 */
export function getPreviewUrl(
  uid?: string,
  placeholder: string | null = '/cover.png',
) {
  if (uid?.startsWith('http')) {
    return uid;
  }
  return uid ? `https://${bucket}.${endpoint}/${uid}` : placeholder;
}

export const isInboundLink = /\S*:\/\/\S*/i;

export function getRedirectUrl(current_url?: string) {
  const path = '/sign/signIn';
  const redirect =
    current_url ?? window.location.pathname + window.location.search;
  return `${path}${
    redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''
  }`;
}
