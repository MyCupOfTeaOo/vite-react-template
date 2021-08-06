export function debounce<T extends (...args: any) => any>(
  func: T,
  wait?: number,
) {
  let ready: any;
  let resolveCall: any;
  let funcCall: any;
  let argsT: any;
  function cancel() {
    if (ready) clearTimeout(ready);
    if (resolveCall) resolveCall();
    ready = undefined;
    resolveCall = undefined;
    funcCall = undefined;
    argsT = undefined;
  }

  function flush() {
    if (ready) {
      clearTimeout(ready);
      if (resolveCall) {
        resolveCall(func(...argsT));
      }
    }
    ready = undefined;
    resolveCall = undefined;
    funcCall = undefined;
    argsT = undefined;
  }

  function wrapper(...args: Parameters<T>) {
    if (funcCall) {
      funcCall.cancel();
    }
    argsT = args;

    const p = new Promise<ReturnType<T> | undefined>((resolve) => {
      resolveCall = resolve;
      ready = setTimeout(() => {
        ready = undefined;
        resolveCall = undefined;
        funcCall = undefined;
        argsT = undefined;
        resolve(func(...(args as any)));
      }, wait);
    }) as Promise<ReturnType<T>> & { cancel: () => void; flush: () => void };
    funcCall = p;
    p.cancel = cancel;
    p.flush = flush;
    return p;
  }
  wrapper.cancel = cancel;
  wrapper.flush = flush;
  return wrapper;
}
