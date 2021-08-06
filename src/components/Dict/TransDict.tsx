/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import { Circle } from 'teaness';
import { observer } from 'mobx-react';
import { splitCode } from './utils';
import { NodeMeta, NodeType } from './interface';
import { store } from './store';

export function getTarget(
  code?: string,
  meta?: NodeMeta,
  node?: NodeType,
  joinFather?: boolean,
): {
  state: NodeType['state'];
  labels?: string[];
} {
  if (!code) {
    return {
      state: 'success',
      labels: [],
    };
  }
  if (!meta) {
    return {
      state: 'loading',
    };
  }
  if (!node) {
    return {
      state: 'loading',
    };
  }
  if (!meta.splitLens) {
    return {
      state: meta.state,
    };
  }
  let curNode: NodeType = node;
  // 后面赋值是为了方便类型推断
  let next: NodeType = curNode.children[code[0]];
  const strs: string[] = [];
  // 迭代 code 链,此处需要区分 joinFather 与 not join 的处理
  for (const i of splitCode(code, meta.splitLens)) {
    next = curNode.children[i];

    if (next && joinFather) {
      switch (next.state) {
        case 'notFound':
          return {
            state: 'notFound',
          };
        case 'success':
          strs.push(next.label || '');
          break;
        case 'error':
          return {
            state: 'error',
          };
        case 'ready':
        case 'loading':
        default:
          return {
            state: 'loading',
          };
      }
    } else if (!next) {
      return {
        state: 'loading',
      };
    }
    curNode = next;
  }
  // 走完循环说明节点齐全
  // 补全not Join 时的label
  if (!joinFather) {
    if (next.state !== 'success') {
      return {
        state: next.state,
      };
    }
    strs.push(next.label || '');
  }
  return {
    state: 'success',
    labels: strs,
  };
}

export interface TransDictProps {
  /**
   * 当前字典编码
   */
  code?: string;
  /**
   * 字典类型
   */
  type: string;
  /**
   * 服务名
   */
  server: string;
  /**
   * 覆盖加载状态显示
   */
  loading?: React.ReactNode;
  /**
   * 覆盖查找失败显示
   */
  notFound?: React.ReactNode;
  /**
   * 查找错误显示(请求失败)
   */
  errorFound?: React.ReactNode;
  /**
   * 需要翻译父节点
   */
  joinFather?: boolean;
  /**
   * joinFather开启生效,多级翻译需要加分割符则设置
   */
  separator?: string;
  /**
   * joinFather开启生效,指定展示某级
   */
  showIndex?: number;
  /**
   * joinFather开启生效,指定展示某几级
   */
  rootIndex?: number;
  /**
   * 是否有div包装
   */
  notDiv?: boolean;
}

/* -------------------------------------------------------------------------- */
/* 如何使用见下方
<TransDict codes={需要翻译的字典编码} server="服务名" type="字典类型"/>
*/
/* -------------------------------------------------------------------------- */

const TransDict: React.FC<TransDictProps> = (props) => {
  // const codes = props.
  useEffect(() => {
    store.setMetaCache(props.server, props.type);
  }, [props.type, props.server]);
  const meta = store.metaCache[props.type];
  const target = getTarget(
    props.code,
    meta,
    store.cascaderCache[props.type],
    props.joinFather,
  );
  useEffect(() => {
    if (props.code && props.type && meta?.splitLens) {
      store.setCacheByDictTypeAndDictCode(
        props.server,
        props.type,
        splitCode(props.code, meta.splitLens),
        props.joinFather,
      );
    }
  }, [props.code, props.type, props.joinFather, meta?.splitLens]);
  switch (target.state) {
    case 'loading':
      return <span>{props.loading || props.code}</span>;
    case 'error':
      return <span>{props.errorFound || props.code}</span>;
    case 'notFound':
      return <span>{props.notFound || props.code}</span>;
    default: {
      const element =
        target.labels && target.labels.length > 0
          ? props.showIndex
            ? target.labels?.[props.showIndex] ?? (props.notFound || props.code)
            : target.labels
                .splice(
                  props.rootIndex || 0,
                  target.labels.length - (props.rootIndex || 0),
                )
                .join(props.separator)
          : props.notFound || props.code;
      if (props.notDiv) return <>{element}</>;
      return <span>{element}</span>;
    }
  }
};
TransDict.defaultProps = {
  separator: '-',
  joinFather: false,
  loading: (
    <Circle
      style={{
        width: '1.5rem',
      }}
    />
  ),
};

export default observer(TransDict);
