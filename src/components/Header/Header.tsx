import React from 'react';
import { Dropdown, Layout, Menu, notification } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { clearToken } from '@/utils/authority';
import Avatar from 'antd/lib/avatar/avatar';
import classNames from 'classnames';
import avatar from '@/assets/avatar.png';
import { observer } from 'mobx-react-lite';
import store from '@/stores';
import { getRedirectUrl } from '@/utils/utils';
import { logout } from '@/service/user';
import styles from './Header.module.scss';

interface HeaderProps {
  getNode?: () => HTMLElement;
  title: string;
  logo?: string;
}

const Header: React.FC<HeaderProps> = ({ logo, title }) => {
  const onLogout = async () => {
    logout();
    clearToken();
    store.user.clearUser();
    window.location.replace(getRedirectUrl('/'));
  };

  const menu = (
    <Menu className={styles.dropmenu}>
      <Menu.Item
        icon={<UserOutlined />}
        onClick={() => {
          notification.info({
            message: store.user.user?.realName,
            description: (
              <pre>
                {`账户：${store.user.user?.userAccount}
角色：${store.user.user?.roleValue}
最后登陆ip: ${store.user.user?.lastIp}
最后登陆系统: ${store.user.user?.lastOs}`}
              </pre>
            ),
          });
        }}
      >
        用户信息
      </Menu.Item>
      <Menu.Item danger icon={<LogoutOutlined />} onClick={onLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header className={styles.header}>
      <Link to="/">
        <div className={styles.logo}>
          {logo && <img src={logo} alt="logo" />}
          <h1>{title}</h1>
        </div>
      </Link>

      <a className={styles.rightMenu}>
        <Dropdown
          overlay={menu}
          overlayStyle={{
            minWidth: 152,
          }}
        >
          <span className={styles.account}>
            <Avatar src={avatar} className={styles.avatar} size={24} />
            <span className={classNames(styles.name, 'ellipsis')}>
              {store.user.user?.realName}
            </span>
          </span>
        </Dropdown>
      </a>
    </Layout.Header>
  );
};

export default observer(Header);
