import { Scanner } from '@yudiel/react-qr-scanner';
import Ctx from './Ctx';

export default function Join() {
  const ctx = Ctx.use();

  return (
    <div>
      <h1>Join</h1>
      <p>Scan your friend's QR code:</p>
      <Scanner
        onResult={(text, result) => console.log(text, result)}
        onError={error => console.log(error?.message)}
      />
      <p>
        Or paste the code here:
        <input
          type='text'
          style={{ width: '100%' }}
        />
      </p>
    </div>
  );
}
