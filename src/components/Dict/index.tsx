import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { Cascader, Modal } from 'antd';
import { useValue } from 'teaness';
import {
  CascaderProps,
  CascaderOptionType,
  CascaderValueType,
} from 'antd/lib/cascader';
import { getChildDict } from './service';
import { splitCode } from './utils';
import { Dict } from './interface';

export interface DictSelectProps
  extends Omit<CascaderProps, 'options' | 'value' | 'onChange'> {
  /**
   * 待选项
   */
  options?: CascaderOptionType[];
  value?: string;
  onChange?(value?: string, options?: CascaderOptionType[]): void;
  /**
   * @throws 不要使用,预留给useDict的接口
   */
  hookLoad?: (codes: CascaderValueType) => void;
}

export function dealWithDict(
  dict: Dict,
  curDepth = 1,
  maxDepth?: number,
): CascaderOptionType {
  const options: CascaderOptionType = {
    label: dict.label,
    value: dict.value,
    isLeaf: !maxDepth || maxDepth > curDepth ? dict.isLeaf : true,
    depth: curDepth,
    splitlens: dict.levelCodeLen
      ?.split('-')
      .map((len) => parseInt(len, 10)) || [0xffffff],
    children:
      !maxDepth || maxDepth > curDepth
        ? dict.children?.map((item) =>
            dealWithDict(item, curDepth + 1, maxDepth),
          )
        : undefined,
  };
  if (!options.children?.length) {
    options.children = undefined;
  }
  return options;
}

/**
 * 只支持受控模式
 */
const DictSelect: React.FC<DictSelectProps> = ({
  options,
  hookLoad,
  value,
  onChange,
  ...rest
}) => {
  const isChange = useValue(false);
  const splitlens = useValue<number[]>();
  const change = useCallback<Required<CascaderProps>['onChange']>(
    (v, option) => {
      isChange.value = true;
      onChange?.(v.join(''), option);
    },
    [onChange],
  );
  const splitValue = useMemo<string[] | undefined>(() => {
    if (value && splitlens.value) {
      return splitCode(value, splitlens.value);
    }
  }, [value, splitlens.value]);
  useEffect(() => {
    splitlens.value = options?.[0]?.splitlens;
    if (splitValue && !isChange.value && hookLoad) {
      hookLoad(splitValue);
    }
  }, [splitValue, options]);
  return (
    <Cascader
      options={options}
      value={splitValue}
      {...rest}
      onChange={change}
    />
  );
};

export default DictSelect;

export function getWaitLoadCodes(
  codes: CascaderValueType,
  options: CascaderOptionType[],
  i = 0,
): string[] {
  if (!codes[i]) return [];
  const target = options.find((option) => option.value === codes[i]);
  if (target) {
    return getWaitLoadCodes(codes, target.children || [], i + 1);
  }
  return [...Array(codes.length - i)].map((_, index) =>
    codes.slice(0, i + 1 + index).join('-'),
  );
}

export function getSelectedOptions(
  /**
   * 没有分割的
   */
  codes: string[],
  options?: CascaderOptionType[],
  i = 0,
  selectedOptions: CascaderOptionType[] = [],
): CascaderOptionType[] | undefined {
  const target = options?.find((option) => option.value === codes[i]);
  if (target) {
    selectedOptions.push(target);
    if (codes.length - 1 === i) {
      return selectedOptions;
    }
    return getSelectedOptions(codes, target.children, i + 1, selectedOptions);
  }
  if (codes.length - 1 === i) {
    return selectedOptions;
  }
}

/**
 *
 *示例如下
const Test: React.FC<any> = () => {
  const config = useDict('服务名', '字典类型');
  return (
    <div>
      <DictSelect {...config} />
    </div>
  );
};

需要按需加载则:
const Test: React.FC<any> = () => {
  const config = useDict('服务名', '字典类型', {loadOnDemand: true});
  return (
    <div>
      <DictSelect {...config} />
    </div>
  );
};

 * 该hook可以节约请求资源(当页面有多个相同的Dict时),所以不要担心资源重复加载问题
 * @param server 服务名
 * @param dictType 字典类型
 */
export function useDict(
  server?: string,
  dictType?: string,
  /**
   * {loadOnDemand} 按需加载 只能在第一次传入生效
   * 按需加载 虽然节省了服务端加载资源,但是会消耗浏览器的性能用来遍历,如果造成了卡顿,建议关掉
   * {rootCode} 根节点编码(可以直接从根节点查)
   * {maxDepth} 最大深度,可以指定查到某一级则不加载
   */
  options?: { loadOnDemand?: boolean; rootCode?: string; maxDepth?: number },
): DictSelectProps {
  const dictOptions = useValue<CascaderOptionType[]>([]);
  const cancelSet = useRef(new Set<() => void>());
  // 代加载的字典编码,含分隔符 -
  const waitLoads = useRef(new Set<string>());

  const loadData = useCallback(
    (selectedOptions: CascaderOptionType[] | undefined) => {
      if (!selectedOptions) return Promise.resolve(false);
      if (!server || !dictType) return Promise.resolve(false);
      const targetOption = selectedOptions[selectedOptions.length - 1];
      // 正在加载中
      if (targetOption.loading) {
        return Promise.resolve(true);
      }
      targetOption.loading = true;

      const req = getChildDict(
        server,
        dictType,
        `${options?.rootCode || ''}${selectedOptions
          .map((selectedOption) => selectedOption.value)
          .join('')}`,
        !options?.loadOnDemand,
      );
      cancelSet.current.add(req.cancel);
      return req.then((res) => {
        targetOption.loading = false;
        cancelSet.current.delete(req.cancel);
        if (res.isCancel) {
          return false;
        }
        if (res.isSuccess) {
          targetOption.children = res.data?.map((item) =>
            dealWithDict(item, targetOption.depth, options?.maxDepth),
          );
          dictOptions.value = [...dictOptions.value];
          return true;
        }
        Modal.error({
          title: '字典加载失败',
          content: res.msg,
        });
      });
    },
    [options?.maxDepth, server, dictType, options?.rootCode],
  );
  // code是带分隔符的
  const depthLoad = useCallback((code: string) => {
    // 需要把 rootCode 剔除掉
    const selectOptions = getSelectedOptions(
      code.split('-'),
      dictOptions.value,
    );
    if (selectOptions?.length) {
      if (selectOptions[selectOptions.length - 1].isLeaf) {
        waitLoads.current.delete(code);
        return;
      }
      if (selectOptions[selectOptions.length - 1].children) {
        waitLoads.current.delete(code);
        const arrayWaitLoad = Array.from(waitLoads.current);
        for (const load of arrayWaitLoad) {
          if (load.indexOf(code) === 0) {
            // targetOption.loading 会阻止重复加载
            depthLoad(load);
            break;
          }
        }
        return;
      }
      return loadData(selectOptions)?.then((res) => {
        if (res) {
          waitLoads.current.delete(code);
          // 加载所有下层需要加载的节点
          waitLoads.current.forEach((load) => {
            if (
              load.indexOf(code) === 0 &&
              load.split('-').length - 1 === code.split('-').length
            ) {
              depthLoad(load);
            }
          });
        } else {
          // 异常情况,删除后续需要加载节点
          for (const load of Array.from(waitLoads.current)) {
            if (load.indexOf(code) === 0) {
              waitLoads.current.delete(load);
            } else {
              break;
            }
          }
        }
      });
    }
    // 不需要此处删除waitLoads
  }, []);
  useEffect(() => {
    if (!server || !dictType) return;
    const req = getChildDict(
      server,
      dictType,
      options?.rootCode,
      !options?.loadOnDemand,
    );
    cancelSet.current.add(req.cancel);
    req.then((res) => {
      cancelSet.current.delete(req.cancel);
      if (res.isCancel) {
        return;
      }
      if (res.isSuccess) {
        dictOptions.value =
          res.data?.map((item) => dealWithDict(item, 1, options?.maxDepth)) ||
          [];
        if (waitLoads.current.size > 0) {
          // 触发下没生效的depthLoad
          const arrayWaitLoad = Array.from(waitLoads.current);
          let lastLoad = arrayWaitLoad[0];
          depthLoad(lastLoad);

          for (const waitLoad of arrayWaitLoad.slice(1)) {
            if (waitLoad.indexOf(arrayWaitLoad[0]) !== 0) {
              lastLoad = waitLoad;
              depthLoad(lastLoad);
            }
          }
        }
        return;
      }

      Modal.error({
        title: '字典加载失败',
        content: res.msg,
      });
    });
    return () => {
      cancelSet.current.forEach((cancel) => cancel());
    };
  }, [dictType, server, options?.rootCode, options?.maxDepth]);

  const hookLoad = useCallback(
    (value: CascaderValueType) => {
      if (!options?.loadOnDemand) {
        return;
      }

      // 找到当前节点有没有加载
      const needLoads: string[] = [];
      getWaitLoadCodes(value, dictOptions.value, 0).forEach((loadCode) => {
        if (!waitLoads.current.has(loadCode)) {
          needLoads.push(loadCode);
        }
      });
      if (needLoads.length) {
        const arrayWaitLoads = Array.from(waitLoads.current);
        needLoads.forEach((load) => {
          waitLoads.current.add(load);
        });
        if (
          !arrayWaitLoads.some((item) => {
            return needLoads[0].indexOf(item) === 0;
          })
        ) {
          depthLoad(needLoads[0]);
        }
      }
    },
    [options?.rootCode],
  );
  return {
    options: dictOptions.value,
    hookLoad,
    loadData,
  };
}
