import Ctx from './Ctx';

export default function Error() {
  const ctx = Ctx.use();
  const errorMsg = ctx.errorMsg.use();

  return <div>
    <h1>ERROR</h1>
    <center>{errorMsg}</center>
  </div>;
}
