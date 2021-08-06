import React from 'react';
import DictSelect, { useDict } from '@/components/Dict';
import { useValue } from 'teaness';

export interface NormalProps {}

const Normal: React.FC<NormalProps> = () => {
  const config = useDict('res', 'adminArea');
  const value = useValue<string>();
  return (
    <DictSelect value={value.value} onChange={value.setValue} {...config} />
  );
};

export default Normal;
