import CopyToClipboard from 'react-copy-to-clipboard';
import Ctx from './Ctx';
import { QRCodeCanvas } from 'qrcode.react';

export default function Host() {
  const ctx = Ctx.use();
  const key = ctx.key.use();

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
          value={key.base58()}
        />
      </center>

      <p>
        Or <CopyToClipboard text={key.base58()}>
          <button style={{ padding: '0.5rem' }}>copy</button>
        </CopyToClipboard> it and send.
      </p>
    </div>
  );
}
