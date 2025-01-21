import './ProgressBar.css';

export default function ProgressBar({ progress }: { progress: number }) {
  if (progress < 1) {
    // Never show > 98% until we're done to ensure not-quite-done is always visible.
    progress *= 0.98;
  }

  return (
    <div className='progress-bar'>
      <div style={{ width: `${progress * 100}%` }}></div>
    </div>
  );
}
