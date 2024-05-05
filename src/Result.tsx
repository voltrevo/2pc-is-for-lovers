import './Result.css';
import Ctx from './Ctx';

export default function Result() {
  const ctx = Ctx.use();
  const result = ctx.result.use();

  if (result === 'malicious') {
    return <center><h2>MALICIOUS</h2></center>;
  }

  return (
    <div className='result'>
      <center>{result}</center>
    </div>
  );
}
