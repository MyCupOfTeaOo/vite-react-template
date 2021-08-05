import Header from '@/components/Header/Header';
import { Layout } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { Suspense } from 'react';
import logo from '@/assets/logo.png';
import Menu from '@/components/Menu';
import MyBreadcrumb from '@/components/Header/MyBreadcrumb';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import store from '@/stores';
import LazyLoad from '@/components/LazyLoad';
import styles from './BasicLayout.module.scss';
import { projectName } from '#/projectConfig';

const { Sider, Content } = Layout;

export interface BasicLayoutProps {}

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  // @TODO 加载菜单
  return (
    <Layout className={styles.normal}>
      <Header logo={logo} title={projectName} />
      <Layout id="layout">
        <Sider
          className={styles.sider}
          collapsedWidth={48}
          trigger={null}
          collapsed={store.menu.collapsed}
          theme="light"
          onCollapse={() => {
            store.menu.setCollapsed(!store.menu.collapsed);
          }}
        >
          <div
            title="收缩菜单"
            className={styles.trigger}
            onClick={() => {
              store.menu.setCollapsed(!store.menu.collapsed);
            }}
          >
            {!store.menu.collapsed ? (
              <MenuFoldOutlined />
            ) : (
              <MenuUnfoldOutlined />
            )}
          </div>
          <Menu
            routes={store.route.menuRoutes}
            collapsed={store.menu.collapsed}
          />
        </Sider>
        <Layout>
          <MyBreadcrumb routes={store.route.menuRoutes} />
          <Content className={styles.content}>
            <Suspense fallback={<LazyLoad />}>{props.children}</Suspense>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default observer(BasicLayout);
