import React, { useMemo } from 'react';
import { Button, Badge, Input } from 'antd';
import {
  Select,
  useForm,
  DataGrid,
  useStore,
  Col,
  horizontal,
  FoldCard,
} from 'teaness';
import { FormConfigs } from 'teaness/es/Form/typings';
import { ColumnDefs } from 'teaness/es/DataGrid/typings';
import { enabledSelect } from '@/constant';
import { loadDict, searchCommonDict } from '@/service/dict';
import useSearch from '@/hooks/useSearch';

export interface CommonDictProps {}

type FormType = Partial<{
  dictType: string;
  code: string;
  value: string;
  enabled: boolean;
}>;

const LIST_KEY = 'searchCommonDict';

const CommonDict: React.FC<CommonDictProps> = () => {
  const { gridProps, setQuery, query } = useSearch<FormType>(
    LIST_KEY,
    searchCommonDict,
    {
      page: 1,
      len: 20,
    },
    {
      revalidateOnFocus: true,
    },
  );
  const formConfigs = useMemo<FormConfigs<FormType>>(
    () => ({
      dictType: {
        defaultValue: 'dicType',
      },
      code: {
        defaultValue: query?.queryData?.code,
      },
      value: {
        defaultValue: query?.queryData?.value,
      },
      enabled: {
        defaultValue: query?.queryData?.enabled,
      },
    }),

    [],
  );

  const store = useStore<FormType>(formConfigs);
  const { Form, Item } = useForm(store);
  const columnDefs = useMemo<ColumnDefs>(() => {
    return [
      {
        headerName: '编码',
        field: 'code',
      },
      {
        headerName: '名称',
        field: 'value',
      },
      {
        headerName: '启用状态',
        field: 'enabled',

        cellRendererFramework: ({ value }: { value: any }) => {
          return value === true ? (
            <Badge status="success" text="启用" />
          ) : (
            <Badge status="error" text="停用" />
          );
        },
      },
      {
        headerName: '描述',
        field: 'desc',
      },
      {
        headerName: '子集',
        field: 'items',
        cellRendererFramework: ({ value }: { value: any }) => {
          return JSON.stringify(value).substring(
            JSON.stringify(value).indexOf('[') + 1,
            JSON.stringify(value).indexOf(']'),
          );
        },
      },
    ];
  }, []);
  return (
    <div className="search-layout">
      <FoldCard title="筛选">
        <Form layout={horizontal}>
          <Item text="类型" required id="dictType">
            <Select
              defaultValue="dicType"
              requestMethod={loadDict('dicType')}
            />
          </Item>
          <Item id="code" text="编码">
            <Input />
          </Item>
          <Item id="value" text="名称">
            <Input />
          </Item>
          <Item id="enabled" text="启用状态">
            <Select options={enabledSelect} />
          </Item>
          <Col span={24}>
            <div className="search-btns">
              <Button
                type="primary"
                htmlType="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setQuery({
                    page: 1,
                    queryData: store.getValues(),
                  });
                }}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  store.setAllValues({ dictType: 'dicType' });
                  setQuery({
                    page: 1,
                    queryData: store.getValues(),
                  });
                }}
              >
                重置
              </Button>
            </div>
          </Col>
        </Form>
      </FoldCard>
      <DataGrid columnDefs={columnDefs} {...gridProps} />
    </div>
  );
};

export default CommonDict;
