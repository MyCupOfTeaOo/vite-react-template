import React, { useEffect } from 'react';
import process from 'nprogress';
import 'nprogress/nprogress.css'; // styles of nprogress

export interface LazyLoadProps {}

const LazyLoad: React.FC<LazyLoadProps> = () => {
  useEffect(() => {
    process.start();
    return () => {
      process.done();
    };
  }, []);
  return <></>;
};

export default LazyLoad;
