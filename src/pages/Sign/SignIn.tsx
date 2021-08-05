import React from 'react';
import logo from '@/assets/logo.png';
import classNames from 'classnames';
import { useValue } from 'teaness';
import styles from './SignIn.module.scss';

const items: {
  logo: string;
  title: string;
  component: React.ComponentType;
}[] = [
  {
    logo,
    title: '用户名密码登录',
    component: () => {
      return <div className={styles.token}>123</div>;
    },
  },
];

export interface SignInProps {}

const SignIn: React.FC<SignInProps> = () => {
  const select = useValue<number | undefined>();
  const Com =
    select.value !== undefined ? items[select.value].component : React.Fragment;
  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <div className={styles.title}>
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.h}>
            <strong>模版</strong>项目
          </span>
        </div>
        <div className={styles.leftContent}>1</div>
      </div>
      <div className={styles.right}>
        <div className={styles.loginTitle}>登录测评系统</div>
        <ul className={classNames(styles.list)}>
          {items.map((item, i) => (
            <li
              onClick={() => {
                if (i === select.value) {
                  select.setValue(undefined);
                  return;
                }
                select.setValue(i);
              }}
              className={classNames(styles.item, {
                [styles.select]: i === select.value,
                [styles.hidden]:
                  select.value !== undefined && i !== select.value,
              })}
              key={i}
            >
              <img className={styles.itemLogo} src={item.logo} alt="" />
              {item.title}
            </li>
          ))}
        </ul>
        <div className={styles.content}>
          <Com />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
