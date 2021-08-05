import { User as UserModel } from '@/models/User';
import { makeAutoObservable } from 'mobx';
import * as Sentry from '@sentry/browser';
import { RootStore } from '.';

export default class User {
  rootStore: RootStore;

  user?: UserModel = undefined;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setUser(user?: UserModel) {
    this.user = user;
    if (user) {
      Sentry.setUser(user);
    }
  }

  clearUser() {
    this.user = undefined;
  }
}
