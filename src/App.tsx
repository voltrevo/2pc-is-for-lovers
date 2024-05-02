import Choose from './Choose';
import Ctx from './Ctx';
import Home from './Home';
import Host from './Host';
import Join from './Join';
import never from './never';

function App() {
  const ctx = Ctx.use();
  const page = ctx.page.use();

  let content;

  if (page === 'Home') {
    content = <Home />;
  } else if (page === 'Host') {
    content = <Host />;
  } else if (page === 'Join') {
    content = <Join />;
  } else if (page === 'Connecting') {
    content = <h1>Connecting...</h1>;
  } else if (page === 'Choose') {
    content = <Choose />;
  } else {
    never(page);
  }

  return <>
    <div style={{ flexGrow: 1 }} />
    {content}
    <div style={{ flexGrow: 1 }}></div>
  </>;
}

export default App;
