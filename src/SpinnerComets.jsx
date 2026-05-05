import { useEffect, useId, useState } from 'react';
import './SpinnerComets.css';

const FADE_MS = 240;

// Three quarter-arc comets orbiting a logo-shaped ghost ring set.
// Pass `visible={false}` (instead of conditionally unmounting) to get
// the exit fade — the component delays its own unmount through the
// transition. Conditional render (`{cond && <SpinnerComets/>}`) only
// gets the entry fade since React tears down the DOM immediately.
export function SpinnerComets({ size = 40, visible = true, className = '' }) {
  const reactId = useId();
  const [mounted, setMounted] = useState(visible);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Double RAF: the first commits a paint at opacity 0; the second
      // flips to opacity 1 so the browser actually sees the change and
      // runs the transition. Single RAF + state update can collapse into
      // one paint and the fade-in won't render.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), FADE_MS + 40);
    return () => clearTimeout(t);
  }, [visible]);

  if (!mounted) return null;

  const fadeId = `spinner-comets-fade-${reactId}`;
  const maskMidId = `spinner-comets-mask-mid-${reactId}`;
  const maskInnerId = `spinner-comets-mask-inner-${reactId}`;

  return (
    <svg
      className={`spinner-comets-svg ${className}`.trim()}
      data-state={shown ? 'visible' : 'hidden'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fadeId} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <mask id={maskMidId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="white" />
          <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="1.7" fill="none" />
        </mask>
        <mask id={maskInnerId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="white" />
          <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="1.7" fill="none" />
          <circle cx="15" cy="12" r="6" stroke="black" strokeWidth="1.7" fill="none" />
        </mask>
      </defs>
      <g className="spinner-comets-ghosts">
        <circle cx="18" cy="12" r="3" strokeWidth="1.5" mask={`url(#${maskInnerId})`} />
        <circle cx="15" cy="12" r="6" strokeWidth="1.5" mask={`url(#${maskMidId})`} />
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      </g>
      <g className="spinner-comets-inner spinner-comets" style={{ transformOrigin: '18px 12px' }}>
        <path d="M 21 12 A 3 3 0 0 0 18 9" stroke={`url(#${fadeId})`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="21" cy="12" r="0.6" />
      </g>
      <g className="spinner-comets-mid spinner-comets" style={{ transformOrigin: '15px 12px' }}>
        <path d="M 21 12 A 6 6 0 0 0 15 6" stroke={`url(#${fadeId})`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="21" cy="12" r="0.85" />
      </g>
      <g className="spinner-comets-outer spinner-comets" style={{ transformOrigin: '12px 12px' }}>
        <path d="M 21 12 A 9 9 0 0 0 12 3" stroke={`url(#${fadeId})`} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="21" cy="12" r="1.1" />
      </g>
    </svg>
  );
}

export default SpinnerComets;
