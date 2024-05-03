export default function modularPowBySq(
  base: bigint,
  exponent: bigint,
  modulus: bigint,
) {
  let result = 1n;

  while (exponent > 0n) {
    if (exponent & 1n) {
      result *= base;
      result %= modulus;
    }

    base *= base;
    base %= modulus;
    exponent >>= 1n;
  }

  return result;
}
