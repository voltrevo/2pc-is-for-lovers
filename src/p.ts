import modularPowBySq from './modularPowBySq';

// p is prime and (p-1)/2 is also prime.
//
// If k divides p-1 then the k-th roots of unity exist and this adds another
// check for whether g is a generator of Z_p. Therefore we ensure (p-1)/2 is
// prime to minimize the values of k.
//
// If plaintext is a k-th root of unity then plaintext^x will also be a k-th
// root of unity, and an attacker is not allowed to know this. Therefore we
// require that plaintext is a generator.
//
const p = 2n ** 128n - 15449n;

export default p;

export function isGenerator(g: bigint) {
  if (g <= 1n || g >= p - 1n) {
    return false;
  }

  // These are the only factors of p-1 due to the choice of p described above.
  for (const factor of [2n, (p - 1n) / 2n]) {
    if (modularPowBySq(g, (p - 1n) / factor, p) === 1n) {
      return false;
    }
  }

  return true;
}
