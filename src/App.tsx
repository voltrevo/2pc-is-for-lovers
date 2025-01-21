import Calculating from './Calculating';
import Choose from './Choose';
import Ctx from './Ctx';
import Error from './Error';
import Home from './Home';
import Host from './Host';
import Join from './Join';
import Result from './Result';
import Share from './Share';
import Waiting from './Waiting';
import never from './never';

function App() {
  const ctx = Ctx.use();
  const page = ctx.page.use();

  let content;

  if (page === 'Home') {
    content = <Home />;
  } else if (page === 'Share') {
    content = <Share />;
  } else if (page === 'Host') {
    content = <Host />;
  } else if (page === 'Join') {
    content = <Join />;
  } else if (page === 'Connecting') {
    content = <h1>Connecting...</h1>;
  } else if (page === 'Choose') {
    content = <Choose />;
  } else if (page === 'Waiting') {
    content = <Waiting />;
  } else if (page === 'Calculating') {
    content = <Calculating />;
  } else if (page === 'Result') {
    content = <Result />;
  } else if (page === 'Error') {
    content = <Error />;
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
