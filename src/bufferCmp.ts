export default function bufferCmp(a: Uint8Array, b: Uint8Array) {
  const minLen = Math.min(a.length, b.length);

  for (let i = 0; i < minLen; i++) {
    if (a[i] < b[i]) {
      return -1;
    }

    if (a[i] > b[i]) {
      return 1;
    }
  }

  if (a.length === b.length) {
    return 0;
  }

  return a.length < b.length ? -1 : 1;
}
