import mockjs from 'mockjs';
import dayjs from 'dayjs';
import { apiPrefix } from '../../../config/projectConfig';
import { Dict } from './interface';

function genDicts(levelCodeLen: string, curLevel = 1): Dict[] {
  const level = levelCodeLen.split('-').length;
  const curValueLenght = levelCodeLen.split('-')[curLevel - 1].length;
  return [...Array(3)].map(() => ({
    label: mockjs.Random.cname(),
    value: mockjs.Random.word(curValueLenght, curValueLenght),
    isLeaf: levelCodeLen.split('-').length <= curLevel,
    description: mockjs.Random.cparagraph(),
    levelCodeLen,
    children:
      level > curLevel ? genDicts(levelCodeLen, curLevel + 1) : undefined,
  }));
}

const dicts = [...Array(10)].map(() => ({
  label: mockjs.Random.cword(),
  value: mockjs.Random.word(),
  children: genDicts('4-4-4-4'),
}));

dicts.push({
  label: '区划',
  value: 'adminArea',
  children: [
    {
      label: '江苏省',
      value: '32',
      levelCodeLen: '2-2-2-2',
      isLeaf: false,
      children: [
        {
          label: '南京市',
          value: '01',
          levelCodeLen: '2-2-2-2',
          isLeaf: false,
          children: [
            {
              label: '秦淮区',
              value: '01',
              levelCodeLen: '2-2-2-2',
              isLeaf: false,
              children: [
                {
                  label: '夫子庙街道',
                  value: '01',
                  levelCodeLen: '2-2-2-2',
                  isLeaf: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: '安徽省',
      value: '33',
      levelCodeLen: '2-2-2-2',
      isLeaf: true,
    },
  ],
});

function splitCode(code: string, splitLenCode: string) {
  return splitLenCode
    .split('-')
    .reduce<[number, number][]>((arr, curLen, i) => {
      if (!i) {
        arr.push([0, Number(curLen)]);
      } else {
        const lastIndex = arr[i - 1][1];
        arr.push([lastIndex, lastIndex + Number(curLen)]);
      }
      return arr;
    }, [])
    .map((item) => code.slice(...item))
    .filter((item) => item);
}

function getTargetDicts(theDicts: Dict[], code?: string) {
  if (!code) {
    return {
      children: theDicts,
    };
  }
  const codes = splitCode(code, theDicts[0].levelCodeLen as string);
  function search(codeList: string[], dictList: Dict[]): Dict | undefined {
    const target = dictList.find((dict) => {
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
  timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
});

const delay = 200;

export default {
  [`GET /${apiPrefix}/:server/dicts/:dictType`]: (req: any, res: any) => {
    const { code, queryAll } = req.query;
    const { dictType } = req.params;
    const target = getTargetDicts(
      dicts.find((item) => item.value === dictType)?.children || [],
      code,
    );
    const filterTarget = target
      ? {
          ...target,
          children: queryAll === 'true' ? target.children : undefined,
        }
      : undefined;
    setTimeout(() => res.send(returnUtil(filterTarget)), delay);
  },
  [`GET /${apiPrefix}/:server/dicts/:dictType/children`]: (
    req: any,
    res: any,
  ) => {
    const { code, queryAll } = req.query;
    const { dictType } = req.params;
    const target = getTargetDicts(
      dicts.find((item) => item.value === dictType)?.children || [],
      code,
    );
    const filterTarget = target?.children?.map((item) => {
      return {
        ...item,
        children: queryAll === 'true' ? item.children : undefined,
      };
    });
    setTimeout(() => res.send(returnUtil(filterTarget)), delay);
  },
  [`GET /${apiPrefix}/:server/dictTypes`]: (req: any, res: any) => {
    setTimeout(
      () =>
        res.send(
          returnUtil(
            dicts.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          ),
        ),
      delay,
    );
  },
};
