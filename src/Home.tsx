import './Home.css';
import Ctx from './Ctx';

export default function Home() {
  const ctx = Ctx.use();

  return (
    <>
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
        <li>Host a session.</li>
        <li>Get your friend to join.</li>
        <li>Choose love or friendship.</li>
        <li>
          If you both choose love, you'll both find out. Otherwise, you'll both
          see friendship.
        </li>
      </ol>
      <h2>They <i>Really</i> Won't Know?</h2>
      <p>
        Yes. Really.
      </p>
      <p>
        This is an&nbsp;
        <a href='https://github.com/voltrevo/2pc-is-for-lovers'>open source</a>
        &nbsp;app.
      </p>
      <p>
        If you choose love but the result is
        friendship, <i>only you</i> will know. Even if your friend knows
        advanced cryptography.
      </p>
      <p>
        This is the <a href='https://www.youtube.com/watch?v=PzcDqegGoKI'>
          magic
        </a> of 2PC.
      </p>
      <p>
        All communication is end-to-end encrypted. The server/internet will not
        know either.
      </p>
      <div className='main buttons'>
        <button onClick={() => ctx.page.set('Host')}>
          Host
        </button>
        <button onClick={() => ctx.page.set('Join')}>
          Join
        </button>
      </div>
    </>
  );
}
