/**
 * title: 选择即改变
 * desc: 继承antd Cascader的几乎所有的特性
 */
import React from 'react';
import DictSelect, { useDict } from '@/components/Dict';
import { useValue } from 'teaness';

export interface ChangeOnSelectProps {}

const ChangeOnSelect: React.FC<ChangeOnSelectProps> = () => {
  const config = useDict('res', 'adminArea');
  const value = useValue<string>();
  return (
    <DictSelect
      changeOnSelect
      value={value.value}
      onChange={value.setValue}
      {...config}
    />
  );
};

export default ChangeOnSelect;
