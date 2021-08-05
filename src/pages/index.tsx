import React from 'react';
import { projectName } from '#/projectConfig';
import styles from './index.module.scss';

export interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.mask} />
      <h1 className={styles.h1}>欢迎来到{projectName}</h1>
    </div>
  );
};

export default Index;
