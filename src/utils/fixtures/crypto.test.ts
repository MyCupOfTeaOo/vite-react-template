import 'jest';
import { aes } from '#/projectConfig';
import { decode, encode, keymap } from '../crypto';

keymap.aes = 'D12436256587E7F6DC22330BA5AABA16';

const source = {
  moblie: 18666666666,
  idCard: '32128888888888123888',
  members: [
    {
      name: 'hello',
      moblie: 18666666666,
      idCard: '32128888888888123888',
    },
  ],
};

const target = {
  moblie: '9ca2163bc62285db6fe3677072e733f7',
  idCard: '9b154029774a7006d845d975212042e8e825f415c837d5dde4f6f7a692d8771b',
  members: [
    {
      name: 'hello',
      moblie: '9ca2163bc62285db6fe3677072e733f7',
      idCard:
        '9b154029774a7006d845d975212042e8e825f415c837d5dde4f6f7a692d8771b',
    },
  ],
};

const targetSchema = {
  moblie: /\w+/,
  idCard: /\w+/,
  members: [
    {
      name: 'hello',
      moblie: /\w+/,
      idCard: /\w+/,
    },
  ],
};

describe('crypto', () => {
  it('encode', () => {
    const encodeObj = encode(source, [
      'moblie',
      'idCard',
      'members[0].moblie',
      'members[0].idCard',
      'members[1].moblie',
      'members[1].idCard',
    ]);
    expect(encodeObj).toMatchObject(targetSchema);
    const encodeOne = encode(source.moblie);
    expect(encodeOne).toMatch(targetSchema.moblie);
    const encodeArray = encode(source.members, [
      '[0].moblie',
      '[0].idCard',
      '[1].moblie',
      '[1].idCard',
    ]);
    expect(encodeArray).toMatchObject(target.members);
  });

  it('decode', () => {
    const decodeObj = decode(target, [
      { key: 'moblie', transform: parseInt },
      'idCard',
      { key: 'members[0].moblie', transform: parseInt },
      'members[0].idCard',
      'members[1].moblie',
      'members[1].idCard',
    ]);
    expect(decodeObj).toEqual(source);
    const decodeOne = parseInt(decode(target.moblie), 10);
    expect(decodeOne).toBe(source.moblie);
    const decodeArray = decode(target.members, [
      { key: '[0].moblie', transform: parseInt },
      '0.idCard',
      '[1].moblie',
      '1.idCard',
    ]);
    expect(decodeArray).toEqual(source.members);
  });
  it('decode error', () => {
    keymap.aes = aes;
    const list = [
      '92a064ee7b2b526161d73e226600b858',
      '4b69c67d71247414b3e948a68598fec6',
      'ABk/B24v+BEo7960ccaB7+N+J/GRHsYjL2pr2SQlpOtWArnyThH3GVo4NZbbMwvSL0gC2rlIO/r9+LA5IEDctA==',
      '1bd657bc409e78f6880b3af46fac35fb',
      'd7ff36a28e0a0896537db54616e38a23',
      '30cb9fce4fcf5bf8b0b9dfb30722925a',
      '970fa7b165f879e86ba58929426c1051',
      '5d2ccb2e0a216a5039aad80e610d443a',
      'd2f48bbd01f480a7a42273ab32f623a5',
      'ffa02cd9653f0a061a7bebf7e174749a',
      'b5687bcfb7acca0003fa77e3efc0327e',
      '56737fe11995a735ccf8824836977854',
      'ad9a4d89e4b23ad4a0977e5dfc6197f9',
      'f7f0721950a059196518023961b11ed2',
      'ab50a67579f2c3fd9f76e82370dc5046',
      'fd5751c2c82f2d3af0bb2670fa15e959',
      'a15c9f342ce83a4da02cca6212b58aa4',
      '50129a9e7cbd70cd01dadb0dc84fec19',
      '97d1c1b47f1fe28c34f9131b368cc14f',
      '9e4e7d59b2530300b15e0bfefe1a0a78',
    ];
    list.forEach((item) => {
      decode(item);
    });
  });
});
