import Ctx from './Ctx';
import Home from './Home';
import Host from './Host';
import Todo from './Todo';
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
    return <Todo>Join page</Todo>;
  }

  never(page);
}

export default App;
