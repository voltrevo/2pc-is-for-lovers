import CipherMessage from './CipherMessage';
import findModularInversePair from './findModularInversePair';
import modularPowBySq from './modularPowBySq';
import p, { isGenerator } from './p';

export default class CommutableCipher {
  private constructor(public k: bigint, public kInv: bigint) {}

  static random() {
    const { k, kInv } = findModularInversePair(p - 1n);

    return new CommutableCipher(k, kInv);
  }

  encrypt(m: CipherMessage): CipherMessage {
    if (!isGenerator(m.value)) {
      throw new Error('Invalid message: not a generator');
    }

    return new CipherMessage(modularPowBySq(m.value, this.k, p));
  }

  decrypt(m: CipherMessage): CipherMessage {
    if (!isGenerator(m.value)) {
      throw new Error('Invalid message: not a generator');
    }

    return new CipherMessage(modularPowBySq(m.value, this.kInv, p));
  }
}
