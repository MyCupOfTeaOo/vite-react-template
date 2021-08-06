/**
 * 数据加密与解密
 * @Author: zwd
 * @Date: 2020-04-17 11:35:21
 * @Last Modified by: zwd
 * @Last Modified time: 2021-08-06 10:44:58
 * @Description: 使用请看测试用例 ./fixtures/crypto.test.ts
 */

import crypto from 'crypto-js';
import lodash from 'lodash-es';
import { aes } from '#/projectConfig';

export enum Mode {
  AES = 'aes',
}

const keymap: { [key in Mode]: string } = {
  aes,
};

export { keymap };

export type Key =
  | string
  | {
      key: string;
      transform(value: string): any;
    };

export interface Option {
  /**
   * 加密解密方式 默认 aes
   */
  mode?: Mode;
}

/**
 * 解密
 * @param obj 需要解密的源数据对象
 * @param keys 需要解密的key
 * @param option 可选配置
 */
export function decode<T extends { [key: string]: any } | any[] | string>(
  obj: T,
  keys: Key[] = [],
  option: Option = {},
): T {
  const { mode = 'aes' } = option;
  const secret = crypto.enc.Utf8.parse(keymap[mode]);

  if (lodash.isObject(obj)) {
    const copyObj = lodash.cloneDeep(obj);

    try {
      keys.forEach((key) => {
        const realKey = lodash.isObject(key) ? key.key : key;
        const target = lodash.get(copyObj, realKey);
        if (target) {
          lodash.set(
            copyObj,
            realKey,
            lodash.isObject(key)
              ? key.transform(
                  crypto.AES.decrypt(
                    crypto.enc.Hex.parse(target).toString(crypto.enc.Base64),
                    secret,
                    {
                      mode: crypto.mode.ECB,
                      padding: crypto.pad.Pkcs7,
                    },
                  ).toString(crypto.enc.Utf8),
                )
              : crypto.AES.decrypt(
                  crypto.enc.Hex.parse(target).toString(crypto.enc.Base64),
                  secret,
                  {
                    mode: crypto.mode.ECB,
                    padding: crypto.pad.Pkcs7,
                  },
                ).toString(crypto.enc.Utf8),
          );
        }
      });
    } catch (error) {
      console.error(error);
    }
    return copyObj;
  } else {
    try {
      return crypto.AES.decrypt(
        crypto.enc.Hex.parse(obj as string).toString(crypto.enc.Base64),
        secret,
        {
          mode: crypto.mode.ECB,
          padding: crypto.pad.Pkcs7,
        },
      ).toString(crypto.enc.Utf8) as T;
    } catch (error) {
      console.error(error);
      return obj;
    }
  }
}

/**
 * 加密
 * @param obj 需要加密的源数据对象
 * @param keys 需要加密的key
 * @param option 可选配置
 */
export function encode<
  T extends { [key: string]: any } | any[] | string | number,
>(
  obj: T,
  keys: string[] = [],
  option: Option = {},
): T extends number ? string : T {
  const { mode = 'aes' } = option;
  const secret = crypto.enc.Utf8.parse(keymap[mode]);

  if (lodash.isObject(obj)) {
    const copyObj = lodash.cloneDeep(obj);

    keys.forEach((key) => {
      const target = lodash.get(copyObj, key);

      if (target) {
        lodash.set(
          copyObj,
          key,
          crypto.AES.encrypt(`${target}`, secret, {
            mode: crypto.mode.ECB,
            padding: crypto.pad.Pkcs7,
          }).ciphertext.toString(),
        );
      }
    });
    return copyObj as T extends number ? string : T;
  } else {
    return crypto.AES.encrypt(`${obj}`, secret, {
      mode: crypto.mode.ECB,
      padding: crypto.pad.Pkcs7,
    }).ciphertext.toString() as T extends number ? string : T;
  }
}
