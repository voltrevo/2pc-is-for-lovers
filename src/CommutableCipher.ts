import CipherMessage from './CipherMessage';
import findModularInversePair from './findModularInversePair';
import p from './p';

export default class CommutableCipher {
  private constructor(public k: bigint, public kInv: bigint) {}

  static random() {
    const { k, kInv } = findModularInversePair(p - 1n);

    return new CommutableCipher(k, kInv);
  }

  encrypt(m: CipherMessage): CipherMessage {
    return new CipherMessage(modularPowBySq(m.value, this.k, p));
  }

  decrypt(m: CipherMessage): CipherMessage {
    return new CipherMessage(modularPowBySq(m.value, this.kInv, p));
  }
}

function modularPowBySq(base: bigint, exponent: bigint, modulus: bigint) {
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
