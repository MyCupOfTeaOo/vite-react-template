export function splitCode(code: string, splitLens: number[]): string[] {
  let lastIndex = 0;
  return splitLens
    .map((len) => {
      const item = code.slice(lastIndex, (lastIndex += len));
      return item;
    })
    .filter((item) => item);
}
