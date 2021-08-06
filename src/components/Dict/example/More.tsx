import React, { useEffect } from 'react';
import DictSelect, { useDict } from '@/components/Dict';
import { useValue } from 'teaness';
import { Space } from 'antd';

export interface MoreProps {}

const More: React.FC<MoreProps> = () => {
  const config = useDict('res', 'adminArea', {
    loadOnDemand: true,
  });
  const value = useValue<string>();
  const hasDepthConfig = useDict('res', 'adminArea', {
    loadOnDemand: true,
    maxDepth: 1,
  });
  const hasDepthValue = useValue<string>();
  const hasDefaultValueConfig = useDict('res', 'adminArea', {
    loadOnDemand: true,
  });
  const defaultValue = useValue<string>('320101');
  const hasRootConfig = useDict('res', 'adminArea', {
    loadOnDemand: true,
    rootCode: '32',
  });
  const hasRootValue = useValue<string>();
  const hasLinkConfig = useDict('res', 'adminArea', {
    loadOnDemand: true,
    rootCode: value.value,
  });
  const hasLinkValue = useValue<string>();
  useEffect(() => {
    hasLinkValue.setValue(undefined);
  }, [value.value]);
  return (
    <Space direction="vertical">
      <Space>
        <span>按需加载</span>
        <DictSelect
          style={{
            width: 400,
          }}
          value={value.value}
          onChange={value.setValue}
          {...config}
        />
      </Space>
      <Space>
        <span>仅加载一级</span>
        <DictSelect
          style={{
            width: 400,
          }}
          value={hasDepthValue.value}
          onChange={hasDepthValue.setValue}
          {...hasDepthConfig}
        />
      </Space>
      <Space>
        <span>有初始值且按需加载</span>
        <DictSelect
          style={{
            width: 400,
          }}
          value={defaultValue.value}
          onChange={defaultValue.setValue}
          {...hasDefaultValueConfig}
        />
      </Space>
      <Space>
        <span>指定根节点加载</span>
        <DictSelect
          style={{
            width: 400,
          }}
          value={hasRootValue.value}
          onChange={hasRootValue.setValue}
          {...hasRootConfig}
        />
      </Space>
      <Space>
        <span>联动加载</span>
        <DictSelect
          style={{
            width: 400,
          }}
          changeOnSelect
          value={value.value}
          onChange={value.setValue}
          {...config}
        />
        <DictSelect
          style={{
            width: 400,
          }}
          value={hasLinkValue.value}
          onChange={hasLinkValue.setValue}
          {...hasLinkConfig}
        />
      </Space>
    </Space>
  );
};

export default More;
