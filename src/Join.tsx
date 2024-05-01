import * as bs58 from 'bs58';
import { Scanner } from '@yudiel/react-qr-scanner';
import Ctx from './Ctx';
import { ChangeEvent } from 'react';

export default function Join() {
  const ctx = Ctx.use();

  return (
    <div>
      <h1>Join</h1>
      <p>Scan your friend's QR code:</p>
      <Scanner
        onResult={(text, _result) => {
          if (isKey(text)) {
            ctx.join(text);
          }
        }}
        onError={error => console.log(error?.message)}
        components={{
          audio: false,
        }}
      />
      <p>
        Or paste the code here:
        <input
          type='text'
          style={{ width: '100%' }}
          onInput={(ev: ChangeEvent<HTMLInputElement>) => {
            if (isKey(ev.target.value)) {
              ctx.join(ev.target.value);
            }
          }}
        />
      </p>
    </div>
  );
}

function isKey(text: string) {
  try {
    return bs58.decode(text).length === 32;
  } catch {
    return false;
  }
}
