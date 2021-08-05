import React from 'react';
import classnames from 'classnames';
import { Helmet } from 'react-helmet-async';
import { codeMessage } from '@/utils/request';
import styles from './ErrorPage.module.scss';

export interface ErrorPageProps {
  statusCode: number;
  className?: string;
  title?: string;
  reload?(): void;
}

const ErrorPage: React.FC<ErrorPageProps> = (props) => {
  const { statusCode, className } = props;
  const title = props.title || codeMessage[statusCode] || '发生意外的错误';

  return (
    <div className={classnames(styles.error, className)}>
      <Helmet>
        <title>{`${statusCode}: ${title}`}</title>
      </Helmet>

      <div>
        {statusCode ? <h1 className={styles.h1}>{statusCode}</h1> : null}
        <div className={styles.desc}>
          <h2 className={styles.h2}>{title}.</h2>
        </div>
      </div>
      {statusCode === 500 && (
        <a
          className={styles.reload}
          onClick={() => {
            if (props.reload) {
              props.reload();
            } else {
              window.location.reload();
            }
          }}
        >
          重新加载
        </a>
      )}
    </div>
  );
};

export default ErrorPage;
