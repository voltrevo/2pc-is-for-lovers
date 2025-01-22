import CopyToClipboard from 'react-copy-to-clipboard';
import Ctx from './Ctx';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect } from 'react';

export default function Host() {
  const ctx = Ctx.use();
  const key = ctx.key.use();

  const rawUrl = `${window.location.origin}${window.location.pathname}`;

  const codeAndLink = rawUrl === 'https://voltrevo.github.io/2pc-is-for-lovers/'
    ? `https://bit.ly/2pcifl#${key.base58()}`
    : `${rawUrl}#${key.base58()}`;

  useEffect(() => {
    ctx.host();
  }, [ctx]);

  return (
    <div>
      <h1>Host</h1>
      <p>
        Get your friend to scan:
      </p>
      <center>
        <QRCodeCanvas
          style={{ width: '100%', height: 'auto' }}
          bgColor='transparent'
          value={codeAndLink}
        />
      </center>
      <p>
        Or <CopyToClipboard text={codeAndLink}>
          <button style={{ padding: '0.5rem' }}>copy</button>
        </CopyToClipboard> it and send.
      </p>
    </div>
  );
}
