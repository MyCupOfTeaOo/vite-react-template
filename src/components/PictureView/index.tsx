import { Image } from 'antd';
import classNames from 'classnames';
import { ImageProps } from 'rc-image';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from './index.module.scss';

export default function PictureView(params: ImageProps) {
  const div = document.createElement('div');
  let isCancel = false;
  document.body.appendChild(div);
  function onCancel() {
    render({
      ...params,
      className: classNames(params.className, styles.images),
      onPreviewClose: onCancel,
      preview: { visible: false },
    });
    isCancel = true;
    return new Promise((resolve) =>
      setTimeout(() => {
        destory();
        resolve(undefined);
      }, 200),
    );
  }
  function destory() {
    if (isCancel) {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    } else {
      onCancel();
    }
  }
  function render(props: ImageProps) {
    ReactDOM.render(<Image {...props} />, div);
  }
  render({
    ...params,
    className: classNames(params.className, styles.images),
    onPreviewClose: onCancel,
    preview: { visible: true },
  });
  return {
    render,
    onCancel,
    destory,
  };
}
