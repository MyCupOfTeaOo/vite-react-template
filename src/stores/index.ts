import Menu from './Menu';
import Route from './Route';
import User from './User';

export class RootStore {
  user: User;

  menu: Menu;

  route: Route;

  constructor() {
    this.user = new User(this);
    this.menu = new Menu(this);
    this.route = new Route(this);
  }
}

const rootStore = new RootStore();

export default rootStore;
