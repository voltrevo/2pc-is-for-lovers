import randomBigint from './randomBigInt';

export default function findModularInversePair(n: bigint) {
  while (true) {
    const k = randomBigint(n);

    let { x, gcd } = extEuclid(k, n);

    if (gcd !== 1n) {
      continue;
    }

    if (x < 0n) {
      x += n;
    }

    return { k, kInv: x };
  }
}

function extEuclid(a: bigint, b: bigint) {
  if (b === 0n) {
    return { x: 1n, y: 0n, gcd: a };
  }

  let ax = 1n;
  let ay = 0n;

  let bx = 0n;
  let by = 1n;

  while (true) {
    {
      const mul = a / b;
      a -= mul * b;
      ax -= mul * bx;
      ay -= mul * by;

      if (a === 0n) {
        return { x: bx, y: by, gcd: b };
      }
    }

    {
      const mul = b / a;
      b -= mul * a;
      bx -= mul * ax;
      by -= mul * ay;

      if (b === 0n) {
        return { x: ax, y: ay, gcd: a };
      }
    }
  }
}
