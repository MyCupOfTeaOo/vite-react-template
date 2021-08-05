import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  Modal,
  Card,
  Spin,
  Tree,
  InputNumber,
  message,
} from 'antd';
import { useStore, useForm, vertical } from 'teaness';
import {
  update,
  add,
  get,
  findDictsByType,
  newDict,
  findByFatherCodeAndDictTypeAndCode,
  switchCommonDict,
} from '@/service/dict';
import { EventDataNode } from 'rc-tree/es/interface';
import styles from './index.module.scss';

export interface DictCascadeProps {}

interface FormType {
  code: string;
  value: string;
  desc: string;
  enabled: boolean;
  levelNum: number;
  fatherCode: string;
  levelCodeLen: string;
}

export interface DictFormProps {
  id: string | undefined;
  treeData: any;
  node: any;
  addDictType: boolean;
  onLoadData: (node: any) => void;
  setDictVisible: (arg0: boolean) => void;
  setAddDictType: (arg0: boolean) => void;
  setId: (id: string | undefined) => void;
  setNode: (node: any) => void;
  checkCodeLen: boolean;
}

const DictForm: React.FC<DictFormProps> = (props) => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<Partial<FormType>>({});
  const {
    id,
    node,
    onLoadData,
    setAddDictType,
    setId,
    addDictType,
    treeData,
    setNode,
    setDictVisible,
    checkCodeLen,
  } = props;
  const { dictType, code, levelNum, fatherCode, enabled } = node;
  let targetNode: any;
  function searchRoot(theNodes: any[], children: any): any {
    for (const n of theNodes) {
      if (n.id === children.id) {
        return targetNode;
      } else if (n.children) {
        targetNode = n;
        const target = searchRoot(n.children, children);
        if (target) return target;
      }
    }
  }

  function checkLength(
    levelNumLen: number | undefined,
    levelCodeLen: string | undefined,
  ) {
    if (levelCodeLen && levelNumLen) {
      const arr = levelCodeLen.split('-');
      if (arr.length !== levelNumLen) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  useEffect(() => {
    setLoading(true);
    if (!id) {
      newDict(code, dictType, fatherCode)
        .then((resp) => {
          if (resp.isSuccess) {
            setInfo(resp.data);
          } else {
            Modal.error({ title: resp.msg });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      get(dictType, code, fatherCode)
        .then((resp) => {
          if (resp.isSuccess) setInfo(resp.data);
          else Modal.error({ title: resp.msg });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const formStore = useStore<FormType>(
    {
      code: {
        defaultValue: info.code,
        rules: [
          {
            required: true,
            message: '字典编码必填',
          },
        ],
      },
      value: {
        defaultValue: info.value,
        rules: [
          {
            required: true,
            message: '字典名称必填',
          },
        ],
      },
      desc: {
        defaultValue: info.desc,
      },
      enabled: {
        defaultValue: info.enabled,
      },
      levelNum: {
        defaultValue: levelNum || info.levelNum,
      },
      fatherCode: {
        defaultValue: info.fatherCode,
      },
      levelCodeLen: {
        defaultValue: info.levelCodeLen,
      },
    },
    [info],
  );
  const { Form, Item } = useForm(formStore);

  useEffect(() => {
    formStore.reset();
  }, [info]);

  return (
    <Spin spinning={loading}>
      <Card title="字典详情" style={{ width: '100%', height: '100%' }}>
        <Form layout={vertical}>
          <Item id="code" required text="字典编码">
            <Input disabled={!!id} placeholder="请填写字典编码" />
          </Item>
          <Item id="value" required text="字典名称">
            <Input disabled={!!id} placeholder="请填写字典名称" />
          </Item>
          <Item text="字典描述" id="desc">
            <Input placeholder="请填写字典描述" />
          </Item>
          <Item required text="字典级别" id="levelNum">
            <InputNumber
              disabled={code !== 'dicType'}
              placeholder="请输入字典级别"
            />
          </Item>
          {node.dictType === 'dicType' && checkCodeLen ? (
            <Item text="字典编码长度" id="levelCodeLen">
              <Input disabled={!!id} placeholder="多级字典请用'-'隔开" />
            </Item>
          ) : null}
          <div className="search-btns" style={{ margin: '0 auto' }}>
            <Button
              type="primary"
              onClick={() => {
                formStore.submit(async ({ values, errs }) => {
                  if (!errs) {
                    if (!checkLength(values.levelNum, values.levelCodeLen)) {
                      Modal.error({
                        title: '字典级别与字典编码长度不符!',
                      });
                    } else {
                      let resp;
                      if (id) {
                        resp = await update({
                          ...info,
                          ...values,
                          dictType,
                        });
                      } else {
                        resp = await add({
                          ...info,
                          ...values,
                          dictType: dictType === 'dicType' ? code : dictType,
                        });
                      }
                      if (resp.isSuccess) {
                        Modal.success({ title: resp.msg });
                        if (dictType === 'dicType') {
                          setAddDictType(!addDictType);
                          setNode({ ...resp.data, levelNum });
                        } else {
                          setNode({ ...resp.data, dictType, levelNum });
                        }
                        node.isLeaf = false;
                        onLoadData(node);
                        setId(node.id);
                      } else {
                        Modal.error({ title: resp.msg });
                      }
                    }
                  }
                });
              }}
            >
              保存
            </Button>
            {id && enabled ? (
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: '是否注销该字典',
                    onOk: () => {
                      return switchCommonDict(
                        dictType,
                        code,
                        levelNum,
                        fatherCode,
                      )
                        .then((resp) => {
                          if (resp.isSuccess) message.success(resp.msg);
                          else message.error(resp.msg);
                        })
                        .finally(() => {
                          setDictVisible(false);
                          if (node.pos && node.pos.split('-').length <= 2) {
                            if (addDictType) {
                              setAddDictType(false);
                            } else {
                              setAddDictType(true);
                            }
                          } else {
                            const prevNode = searchRoot(treeData, props.node);
                            onLoadData(prevNode);
                          }
                        });
                    },
                  });
                }}
              >
                注销
              </Button>
            ) : null}
          </div>
        </Form>
      </Card>
    </Spin>
  );
};

const DictCascade: React.FC<DictCascadeProps> = () => {
  const [search, setSearch] = useState<string>();
  const [treeData, setTreeData] = useState<any[]>();
  const [visible, changeVisible] = useState(false);
  const [nodes, setNode] = useState<EventDataNode>();
  const [dictVisible, setDictVisible] = useState<boolean>(false);
  const [id, setId] = useState<string>();
  const [addDictType, setAddDictType] = useState<boolean>(false);
  const [checkCodeLen, setCheckCodeLen] = useState<boolean>(true);
  useEffect(() => {
    findDictsByType().then((resp) => {
      if (resp.isSuccess) {
        setTreeData(resp.data);
      } else Modal.error({ title: resp.msg });
    });
  }, [addDictType]);
  function searchNode(theNodes: any[], node: any): any {
    for (const n of theNodes) {
      if (
        n.code === node.code &&
        n.dictType === node.dictType &&
        n.key === node.key
      ) {
        return n;
      } else if (n.children) {
        const target = searchNode(n.children, node);
        if (target) return target;
      }
    }
  }
  const onLoadData = useCallback((node: EventDataNode) => {
    return new Promise<void>((resolve) => {
      const { pos } = node;
      if (
        (node as any).code === 'dicType' ||
        (pos && pos.split('-').length < 3)
      ) {
        findDictsByType((node as any).code).then((resp) => {
          if (resp.isSuccess) {
            // eslint-disable-next-line no-param-reassign
            node.children = resp.data;
            setTreeData((prev) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const target = searchNode(prev!, node);
              if (target) {
                target.children = resp.data;
              }
              return prev ? [...prev] : [];
            });
          }
        });
      } else {
        findByFatherCodeAndDictTypeAndCode(
          (node as any).fatherCode,
          (node as any).dictType,
          (node as any).code,
        ).then((resp) => {
          if (resp.isSuccess) {
            // eslint-disable-next-line no-param-reassign
            node.children = resp.data;
            setTreeData((prev) => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const target = searchNode(prev!, node);
              if (target) {
                target.children = resp.data;
              }
              return prev ? [...prev] : [];
            });
          }
        });
      }
      resolve();
    });
  }, []);

  const filterTree = search
    ? treeData?.filter((item: FormType & { title?: string }) => {
        return (
          item.code?.toLowerCase().includes(search) ||
          item.desc?.toLowerCase().includes(search) ||
          item.title?.toLowerCase().includes(search) ||
          item.value?.toLowerCase().includes(search)
        );
      })
    : treeData;

  return (
    <div className={styles.normal}>
      <div className={styles.side}>
        <Input
          className={styles.search}
          placeholder="Search"
          allowClear
          onChange={(e) => {
            setSearch(e.target.value.toLowerCase());
          }}
        />
        <Tree
          className={styles.tree}
          treeData={filterTree}
          onSelect={(e1: any, info) => {
            setNode(info.node);
            setDictVisible(true);
            setId(e1);
          }}
          loadData={onLoadData}
          onRightClick={(e: any) => {
            if (
              e.node.pos.split('-').length === 2 &&
              e.node.code === 'dicType'
            ) {
              setCheckCodeLen(true);
            } else {
              setCheckCodeLen(false);
            }
            setId(undefined);
            if (
              e.node.pos.split('-').length > 2 &&
              e.node.dictType === 'dicType'
            ) {
              Modal.error({
                title: `该字典为1级字典,不可再增加子集`,
              });
            } else if (e.node.pos.split('-').length > e.node.levelNum + 1) {
              Modal.error({
                title: `该字典为${e.node.levelNum}级字典,不可再增加子集`,
              });
            } else {
              setNode(e.node.props.data);
              changeVisible(true);
            }
          }}
          showLine
          key="cascadeType"
        />
      </div>

      <div className={styles.content}>
        {dictVisible && (
          <DictForm
            addDictType={addDictType}
            setAddDictType={setAddDictType}
            setId={setId}
            setNode={setNode}
            node={nodes}
            onLoadData={onLoadData}
            treeData={treeData}
            id={id}
            checkCodeLen={checkCodeLen}
            setDictVisible={setDictVisible}
          />
        )}
      </div>
      <Modal
        title="新增字典"
        visible={visible}
        footer={
          <Button type="primary" onClick={() => changeVisible(false)}>
            取消
          </Button>
        }
        onOk={() => {
          setDictVisible(true);
        }}
        onCancel={() => {
          changeVisible(true);
        }}
        destroyOnClose
        closable={false}
      >
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setDictVisible(true);
            changeVisible(!visible);
          }}
        >
          增加子集
        </Button>
      </Modal>
    </div>
  );
};

export default DictCascade;
