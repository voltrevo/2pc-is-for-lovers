export default function randomBigint(limit: bigint) {
  const bits = countBits(limit);

  while (true) {
    let rand = 0n;
    let randBits = 0;
    const buf = new Uint32Array(1);

    while (bits - randBits > 32) {
      rand <<= 32n;
      crypto.getRandomValues(buf);
      rand += BigInt(buf[0]);
      randBits += 32;
    }

    rand <<= BigInt(bits - randBits);
    crypto.getRandomValues(buf);
    rand += BigInt(buf[0]) & ((1n << BigInt(bits - randBits)) - 1n);

    if (rand < limit) {
      return rand;
    }
  }
}

function countBits(n: bigint) {
  let bits = 0;

  while (n > 0n) {
    n >>= 1n;
    bits++;
  }

  return bits;
}
