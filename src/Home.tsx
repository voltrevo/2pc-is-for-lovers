import './Home.css';
import Ctx from './Ctx';
import isKey from './isKey';

export default function Home() {
  const ctx = Ctx.use();
  const hasUrlKey = isKey(window.location.hash.slice(1));

  return (
    <div>
      <div className='title'>2PC IS FOR</div>
      <div className='title lovers'>LOVERS</div>
      <div className='title heart'>❤️</div>
      <p>
        Did you ever fall in love with your best friend? Hope they feel the
        same, but afraid to lose the friendship?
      </p>
      <p>
        This app uses advanced cryptography to solve the problem! 🤓
      </p>
      <h2>How it Works</h2>
      <ol>
        <li>
          <a href='#' onClick={() => {
            ctx.page.set('Share');
          }}>
            Share
          </a>
          &nbsp;this app with your friend.
        </li>
        <li>Host a session.</li>
        <li>Get your friend to join.</li>
        <li>Choose love or friendship.</li>
        <li>
          If you both choose love, you'll both find out. Otherwise, you'll both
          see friendship.
        </li>
      </ol>
      <h2>Disclaimer</h2>
      <p>
        It's currently possible for a malicious friend to choose friendship and
        find out whether you chose love. However, they risk exposing themselves
        as malicious by doing so. This will be fixed in a future update.
      </p>
      <h2>About</h2>
      <ul>
        <li>
          <a href='https://github.com/voltrevo/2pc-is-for-lovers'>
            Open source
          </a>.
        </li>
        <li>
          <a href='https://www.youtube.com/watch?v=PzcDqegGoKI'>
            More about 2PC
          </a>.
        </li>
        <li>
          All communication is end-to-end encrypted.
        </li>
      </ul>
      <div className='main buttons'>
        <button disabled={hasUrlKey} onClick={() => ctx.page.set('Host')}>
          Host
        </button>
        <button onClick={() => {
          const urlKey = window.location.hash.slice(1);

          if (isKey(urlKey)) {
            ctx.page.set('AutoJoin');
          } else {
            ctx.page.set('Join');
          }
        }}>
          Join
        </button>
      </div>
    </div>
  );
}
