import React from 'react';
import styles from './Signlayout.module.scss';

export interface SignlayoutProps {}

const Signlayout: React.FC<SignlayoutProps> = (props) => {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>{props.children}</div>
    </div>
  );
};

export default Signlayout;
