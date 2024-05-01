import Choose from './Choose';
import Ctx from './Ctx';
import Home from './Home';
import Host from './Host';
import Join from './Join';
import never from './never';

function App() {
  const ctx = Ctx.use();
  const page = ctx.page.use();

  if (page === 'Home') {
    return <Home />;
  }

  if (page === 'Host') {
    return <Host />;
  }

  if (page === 'Join') {
    return <Join />;
  }

  if (page === 'Choose') {
    return <Choose />;
  }

  never(page);
}

export default App;
