import z from 'zod';
import base64url from 'base64url';
import keccak256 from 'keccak256';
import bufferCmp from './bufferCmp.ts';

const ResponseBody = z.array(z.string());

export class TrustedHashRevealer {
  hashGroup: Uint8Array[] = [];

  constructor(public apiUrl: string, public input: Uint8Array) {
    this.add(keccak256(Buffer.from(input)));
  }

  add(hash: Uint8Array) {
    this.hashGroup.push(hash);
  }

  async resolve() {
    const sortedHashGroup = this.hashGroup.slice().sort(bufferCmp);

    const body = {
      hashGroup: sortedHashGroup.map(h => base64url.encode(Buffer.from(h))),
      input: base64url.encode(Buffer.from(this.input)),
    };

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const parseResult = ResponseBody.safeParse(await res.json());

    if (parseResult.error) {
      throw new Error(
        `invalid response: ${JSON.stringify(parseResult.error.format())}`,
      );
    }

    const result = new ResolvedPreimages(
      parseResult.data.map(s => base64url.toBuffer(s)),
    );

    return result;
  }
}

export class ResolvedPreimages {
  map = new Map<string, Uint8Array>();

  constructor(preimages: Uint8Array[]) {
    for (const preimage of preimages) {
      const hashString = base64url.encode(
        keccak256(Buffer.from(preimage)),
      );

      this.map.set(hashString, preimage);
    }
  }

  getPreimage(hash: Uint8Array) {
    const hashString = base64url.encode(Buffer.from(hash));

    const result = this.map.get(hashString);

    if (result === undefined) {
      throw new Error('Hash not found');
    }

    return result;
  }
}
