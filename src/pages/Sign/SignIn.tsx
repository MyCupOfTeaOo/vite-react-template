import React, { useCallback, useEffect, useRef, useState } from 'react';
import logo from '@/assets/logo.png';
import classNames from 'classnames';
import {
  useForm,
  useStore,
  useValue,
  login as loginLayout,
  Label,
} from 'teaness';
import wxLogo from '@/assets/wx_logo.png';
import loginCover from '@/assets/login-cover.png';
import { getGuestUid, login } from '@/service/user';
import { setToken } from '@/utils/authority';
import { Link, useHistory } from 'react-router-dom';
import { useQuery } from '@/hooks/useQuery';
import { Alert, Button, Col, Input, Row, Spin } from 'antd';
import Icon, { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ReactComponent as KeyBoard } from '@/assets/keyboard.svg';
import { join } from '@/utils/utils';
import { apiPrefix, sysId } from '#/projectConfig';
import styles from './SignIn.module.scss';

const items: {
  logo: React.ReactNode;
  title: string;
  component: React.ComponentType;
}[] = [
  {
    logo: <img src={wxLogo} alt="" />,
    title: '使用微信登录',
    component: () => {
      return <div>暂未实现</div>;
    },
  },
];

interface SignForm {
  username: string;
  password: string;
  captcha: string;
}

export interface PasswordLoginProps {}

export const PasswordLogin: React.FC<PasswordLoginProps> = () => {
  const history = useHistory();
  const query = useQuery();
  const [logining, setlogining] = useState(false);
  const count = useRef(30);
  const [uid, setuid] = useState<string>('');
  const [loading, setloading] = useState(false);
  const [errText, setErrText] = useState<string | undefined>(undefined);
  const store = useStore<SignForm>({
    username: {
      rules: [
        {
          required: true,
          message: '请输入用户名!',
        },
      ],
      parse(value?: React.ChangeEvent<HTMLInputElement>) {
        return value?.target.value.trim();
      },
    },
    password: {
      rules: [
        {
          required: true,
          message: '请输入密码!',
        },
      ],
      parse(value?: React.ChangeEvent<HTMLInputElement>) {
        return value?.target.value.trim();
      },
    },
    captcha: {
      rules: [
        {
          required: true,
          message: '验证码必填!',
        },
        {
          len: 4,
          message: '验证码为4位!',
        },
      ],
    },
  });
  const { Form, Item } = useForm(store);
  const onGetCaptcha = () => {
    setloading(true);
    getGuestUid()
      .then((res) => {
        if (res.isSuccess) {
          setuid(res.data);
        }
      })
      .catch((err) => {
        if (err) console.error(err);
      })
      .finally(() => {
        setloading(false);
      });
  };

  const submit = useCallback(
    (e) => {
      e.preventDefault();
      store.submit(({ values, errs }) => {
        if (errs) return;
        setlogining(true);

        login({
          ...(values as SignForm),
          guestUid: uid,
          sysId,
        }).then((res) => {
          if (res.isSuccess) {
            setToken(res.data.jwt);
            setlogining(false);
            history.replace(
              query.redirect ? decodeURIComponent(query.redirect) : '/',
            );
          } else {
            setErrText(res.msg);
            onGetCaptcha();
            setlogining(false);
          }
        });
      });
    },
    [uid],
  );

  useEffect(() => {
    onGetCaptcha();
    const interval = setInterval(() => {
      if (count.current > 0) {
        count.current += 1;
      } else {
        count.current = 30;
        onGetCaptcha();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={styles.passwordLogin}>
      {errText && !logining && (
        <Alert
          style={{ margin: '0 auto', maxWidth: 368 }}
          message={errText}
          type="error"
          showIcon
          closable
        />
      )}
      <div className={styles.form}>
        <Form layout={loginLayout}>
          <Item id="username">
            <Input placeholder="账户" prefix={<UserOutlined />} />
          </Item>
          <Item id="password">
            <Input.Password placeholder="密码" prefix={<LockOutlined />} />
          </Item>
          <Item id="captcha">
            {(params) => (
              <Row gutter={8}>
                <Col span={16}>
                  <Input
                    {...params}
                    prefix={
                      <Icon component={KeyBoard} className={styles.keyBoard} />
                    }
                  />
                </Col>
                <Col span={8} className={styles.captcha}>
                  <Spin spinning={loading}>
                    <Button
                      block
                      onClick={onGetCaptcha}
                      className={styles.captchaButton}
                    >
                      {uid ? (
                        <img
                          src={join(apiPrefix, `/user/auth/refresh/${uid}`)}
                          alt="验证码"
                        />
                      ) : (
                        '验证码'
                      )}
                    </Button>
                  </Spin>
                </Col>
              </Row>
            )}
          </Item>
          <Label>
            <Button
              loading={logining}
              type="primary"
              htmlType="submit"
              onClick={submit}
              block
            >
              登录
            </Button>
          </Label>
        </Form>
      </div>
    </div>
  );
};

export interface SignInProps {}

const SignIn: React.FC<SignInProps> = () => {
  const select = useValue<number | undefined>();
  const Com =
    select.value !== undefined ? items[select.value].component : PasswordLogin;
  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <div className={styles.title}>
          <img className={styles.logo} src={logo} alt="" />
          <span className={styles.h}>
            <strong>模版</strong>项目
          </span>
        </div>
        <div className={styles.leftContent}>
          <img className={styles.loginCover} src={loginCover} alt="" />
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.rightAction}>
          还没有账户，准备 <Link to="signUp">注册账户</Link> 或{' '}
          <Link to="forget">忘记密码</Link>
        </div>
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
              <div className={styles.itemLogo}>{item.logo}</div>
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
