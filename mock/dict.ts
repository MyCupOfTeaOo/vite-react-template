import mockjs from 'mockjs';
import moment from 'moment';
import { apiPrefix } from '../config/projectConfig';

function genDicts(level: number = 1) {
  return [...Array(3)].map(() => ({
    label: mockjs.Random.cname(),
    value: mockjs.Random.id(),
    isLeaf: level <= 1,
    description: mockjs.Random.cparagraph(),
    children: level > 1 ? genDicts(level - 1) : undefined,
  }));
}

const dicts = [...Array(10)].map(() => ({
  label: mockjs.Random.cword(2, 6),
  value: mockjs.Random.word(4, 8),
  children: genDicts(3),
}));

function getTargetDicts(theDicts: any[], code?: string) {
  if (!code) {
    return {
      children: theDicts,
    };
  }
  const codes = code.split('-');
  function search(codeList: string[], dictList: any[]) {
    const target = dictList.find(dict => {
      return dict.value === codeList[0];
    });
    if (!target) {
      return undefined;
    }

    if (codeList.length > 1) {
      return search(codeList.slice(1), target.children || []);
    }
    return target;
  }
  return search(codes, theDicts);
}

const returnUtil = (data?: any) => ({
  data,
  code: 200,
  msg: '请求成功啦',
  timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
});

const delay = 500;

export default {
  [`GET ${apiPrefix}/:server/dicts/:dictType`]: (req: any, res: any) => {
    const { code, queryAll } = req.query;
    const { dictType } = req.params;
    const target = getTargetDicts(
      dicts.find(item => item.value === dictType)?.children || [],
      code,
    );
    const filterTarget = target
      ? {
          ...target,
          children: queryAll ? target.children : undefined,
        }
      : undefined;
    setTimeout(() => res.send(returnUtil(filterTarget)), delay);
  },
  [`GET ${apiPrefix}/:server/dicts/:dictType/children`]: (
    req: any,
    res: any,
  ) => {
    const { code, queryAll } = req.query;
    const { dictType } = req.params;
    const target = getTargetDicts(
      dicts.find(item => item.value === dictType)?.children || [],
      code,
    );
    const filterTarget = target.children.map(item => ({
      ...item,
      children: queryAll ? item.children : undefined,
    }));
    setTimeout(() => res.send(returnUtil(filterTarget)), delay);
  },
  [`GET ${apiPrefix}/:server/dictTypes`]: (req: any, res: any) => {
    setTimeout(
      () =>
        res.send(
          returnUtil(
            dicts.map(item => ({
              label: item.label,
              value: item.value,
            })),
          ),
        ),
      delay,
    );
  },
};
