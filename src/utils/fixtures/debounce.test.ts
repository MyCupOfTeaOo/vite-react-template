import 'jest';
import { debounce } from '../debounce';

describe('debounce', () => {
  it('async normal', async () => {
    function fetchUser(id: string) {
      return new Promise<{ id: string; name: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            name: 'foo',
          });
        }, 2000);
      });
    }
    const debounceFetchUser = debounce(fetchUser, 500);
    const res = await debounceFetchUser('1');
    expect(res).toEqual({
      id: '1',
      name: 'foo',
    });
  });
  it('async multi', async () => {
    let count = 0;
    function fetchUser(id: string) {
      count += 1;
      return new Promise<{ id: string; name: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            name: 'foo',
          });
        }, 2000);
      });
    }
    const debounceFetchUser = debounce(fetchUser, 500);
    const req1 = debounceFetchUser('1');
    const req2 = debounceFetchUser('2');
    const req3 = debounceFetchUser('3');
    const res1 = await req1;
    const res2 = await req2;
    const res3 = await req3;
    expect(res1).toBeUndefined();
    expect(res2).toBeUndefined();
    expect(res3).toEqual({
      id: '3',
      name: 'foo',
    });
    expect(count).toBe(1);
  });
  it('async cancel', async () => {
    let count = 0;
    function fetchUser(id: string) {
      count += 1;
      return new Promise<{ id: string; name: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            name: 'foo',
          });
        }, 2000);
      });
    }
    const debounceFetchUser = debounce(fetchUser, 500);
    const req1 = debounceFetchUser('1');
    const req2 = debounceFetchUser('2');
    const req3 = debounceFetchUser('3');
    const res1 = await req1;
    const res2 = await req2;
    req3.cancel();
    const res3 = await req3;
    expect(res1).toBeUndefined();
    expect(res2).toBeUndefined();
    expect(res3).toBeUndefined();
    expect(count).toBe(0);
  });
  it('async flush', async () => {
    let count = 0;
    function fetchUser(id: string) {
      count += 1;
      return new Promise<{ id: string; name: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            name: 'foo',
          });
        }, 100);
      });
    }
    const debounceFetchUser = debounce(fetchUser, 500);
    const req1 = debounceFetchUser('1');
    const req2 = debounceFetchUser('2');
    const req3 = debounceFetchUser('3');
    req3.flush();
    let prevTime = new Date();
    const res3 = await req3;
    let nextTime = new Date();
    expect(nextTime.getTime() - prevTime.getTime() < 500).toBe(true);
    const res1 = await req1;
    const res2 = await req2;

    expect(res1).toBeUndefined();
    expect(res2).toBeUndefined();
    expect(res3).toEqual({
      id: '3',
      name: 'foo',
    });
    expect(count).toBe(1);
    prevTime = new Date();
    await debounceFetchUser('3');
    nextTime = new Date();
    expect(nextTime.getTime() - prevTime.getTime() > 500).toBe(true);
    expect(nextTime.getTime() - prevTime.getTime() < 700).toBe(true);
  });
});
