import { Scanner } from '@yudiel/react-qr-scanner';
import Ctx from './Ctx';
import { ChangeEvent } from 'react';
import isKey from './isKey';

export default function Join() {
  const ctx = Ctx.use();

  const tryJoin = (text: string) => {
    let key;

    if (text.startsWith('https://')) {
      const url = new URL(text);
      key = url.hash.slice(1);
    } else {
      key = text;
    }

    if (isKey(key)) {
      ctx.join(key);
    }
  };

  return (
    <div>
      <h1>Join</h1>
      <p>Scan your friend's QR code:</p>
      <Scanner
        onResult={(text, _result) => tryJoin(text)}
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
            tryJoin(ev.target.value);
          }}
        />
      </p>
    </div>
  );
}
