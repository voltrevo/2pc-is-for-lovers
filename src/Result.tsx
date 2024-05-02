import './Result.css';
import Ctx from './Ctx';

export default function Result() {
  const ctx = Ctx.use();
  const result = ctx.result.use();

  return (
    <div className='result'>
      <center>{result}</center>
    </div>
  );
}
