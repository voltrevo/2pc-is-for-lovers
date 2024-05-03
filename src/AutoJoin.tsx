import Ctx from './Ctx';

export default function AutoJoin() {
  const ctx = Ctx.use();

  return (
    <div>
      <div className='title'>Caution</div>
      <p>
        You are joining using the link provided by your host instead of joining&nbsp;
        <a href='#' onClick={() => {
          window.location.hash = '';
          ctx.page.set('Join');
        }}>directly</a> from the app.
      </p>
      <p>
        The whole idea of this app is that the host doesn't get to see your
        private input. But since you've used their link, they might have sent
        you to a fake version of the app. Make sure you're using the genuine
        app.
      </p>
      <p>
        Of course, a truly malicious version of this app might not include this
        warning, so you can't trust what you're reading. This is more of a
        security PSA. Check the URL.
      </p>
      <div className='main buttons'>
        <button onClick={() => {
          const key = window.location.hash.slice(1);
          window.location.hash = '';
          ctx.join(key);
        }}>
          Proceed
        </button>
      </div>
    </div>
  );
}
