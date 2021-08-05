import cache from '@/utils/cache';
import { debounce } from 'lodash-es';
import { makeAutoObservable } from 'mobx';
import { RootStore } from '.';

export default class Menu {
  rootStore: RootStore;

  collapsed: boolean = cache.getLocalCache('collapsed') ?? false;

  static triggerResizeEvent = debounce(() => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }, 100);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setCollapsed = (value: boolean) => {
    this.collapsed = value;
    cache.setLocalCache('collapsed', value);
    Menu.triggerResizeEvent();
  };
}
