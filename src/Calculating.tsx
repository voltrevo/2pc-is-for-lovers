import Ctx from './Ctx';
import ProgressBar from './ProgressBar';

export default function Calculating() {
  const ctx = Ctx.use();
  const mpcProgress = ctx.mpcProgress.use();

  return <div>
    <ProgressBar progress={mpcProgress} />
  </div>;
}
