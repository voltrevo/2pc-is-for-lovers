import CommutableCipher from './CommutableCipher';
import p from './p';

export default class CipherMessage {
  constructor(public value: bigint) {
    if (value < 1n || value >= p) {
      throw new Error('Value out of range');
    }
  }

  static decodeString(s: string) {
    let value = 0n;

    for (const b of new TextEncoder().encode(s)) {
      value <<= 8n;
      value += BigInt(b);
    }

    return new CipherMessage(value);
  }

  encodeString() {
    const bytes: number[] = [];

    let { value } = this;

    while (value > 0n) {
      bytes.push(Number(value & 0xffn));
      value >>= 8n;
    }

    return new TextDecoder().decode(Uint8Array.from(bytes.reverse()));
  }

  encrypt(c: CommutableCipher): CipherMessage {
    return c.encrypt(this);
  }

  decrypt(c: CommutableCipher): CipherMessage {
    return c.decrypt(this);
  }
}
