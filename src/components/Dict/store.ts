import { observable, flow, makeObservable } from 'mobx';
import { ReqResponse } from '@/utils/request';
import { getCurrentDict, DictMeta, getDictMeta } from './service';
import { CascaderCache, NodeMeta, NodeType, Dict } from './interface';

export class Store {
  constructor() {
    makeObservable(this);
  }

  @observable
  cascaderCache: CascaderCache = {};

  @observable
  metaCache: Record<string, NodeMeta> = {};

  setMetaCache = flow(function* (
    this: Store,
    server: string,
    dictType: string,
  ): any {
    if (!this.metaCache[dictType]) {
      this.metaCache[dictType] = {
        state: 'ready',
      };
    }
    const curMeta = this.metaCache[dictType];
    switch (curMeta.state) {
      case 'loading':
      case 'notFound':
      case 'success':
        break;
      case 'error':
      case 'ready':
      default:
        // 加载元信息
        // 失败重复请求三次
        for (let i = 0; i < 3; i += 1) {
          curMeta.state = 'loading';
          const res: ReqResponse<DictMeta> = yield getDictMeta(
            server,
            dictType,
          );
          if (res.isSuccess) {
            if (res.data) {
              Object.assign(curMeta, {
                state: 'success',
                label: res.data.label,
                levelNum: Number(res.data.levelNum),
                splitLens: res.data.levelCodeLen
                  ?.split('-')
                  .map((item) => parseInt(item, 10)) || [0xffffff],
              } as NodeMeta);
            } else {
              curMeta.state = 'notFound';
            }
          } else {
            console.error(res.msg);
          }
        }
    }
  });

  setCacheByDictTypeAndDictCode = flow(function* (
    this: Store,
    server: string,
    dictType: string,
    codes: string[],
    searchFather?: boolean,
  ): any {
    if (!this.cascaderCache[dictType]) {
      this.cascaderCache[dictType] = {
        state: 'ready',
        children: {},
      };
    }
    const typeNode = this.cascaderCache[dictType];

    let node: NodeType = typeNode;
    let index = 1;
    for (const code of codes) {
      if (!node.children[code]) {
        node.children[code] = {
          state: 'ready',
          children: {},
          father: node,
        };
      }
      const curNode = node.children[code];
      switch (curNode.state) {
        case 'loading':
        case 'notFound':
        case 'success':
          break;
        case 'error':
        case 'ready':
        default:
          // 加载当前节点 || 需要加载父节点
          if (index === codes.length || searchFather) {
            // 加载当前节点
            // 失败重复请求三次
            for (let i = 0; i < 3; i += 1) {
              curNode.state = 'loading';
              const resp: ReqResponse<Dict> = yield getCurrentDict(
                server,
                dictType,
                codes.slice(0, index).join(''),
              );
              if (resp.isSuccess) {
                if (!resp.data) {
                  curNode.state = 'notFound';
                } else {
                  curNode.state = 'success';
                  curNode.label = resp.data.label;
                }
                // 中断循环
                break;
              } else {
                console.error(resp.msg);
              }
            }
            // 加载失败
            if (curNode.state === 'loading') {
              curNode.state = 'error';
            }
          }

          break;
      }
      node = node.children[code];
      index += 1;
    }
  });
}
const store = new Store();
export { store };
