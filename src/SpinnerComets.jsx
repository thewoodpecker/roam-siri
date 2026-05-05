import { memo, useEffect, useId, useRef, useState } from 'react';
import './SpinnerComets.css';

const FADE_MS = 240;

// Ring set, ordered back-to-front (smallest paints first → largest on top).
// `c` = circle center x (cy is always 12), `r` = ring radius, `d` = head-dot
// radius, `o` = depth opacity (front planet brightest, back dimmest).
const PLANETS = [
  { c: 18, r: 3, d: 0.6,  o: 0.3 },
  { c: 15, r: 6, d: 0.85, o: 0.6 },
  { c: 12, r: 9, d: 1.1,  o: 1.0 },
];

function SpinnerCometsImpl({ size = 40, visible = true, className = '' }) {
  // Per-instance id keeps SVG <defs> (gradient + masks) collision-free
  // when multiple spinners coexist on the page.
  const uid = useId();
  const fadeId = `sc-fade-${uid}`;
  const maskMidId = `sc-mask-mid-${uid}`;
  const maskInnerId = `sc-mask-inner-${uid}`;

  const [mounted, setMounted] = useState(visible);
  const [shown, setShown] = useState(false);
  // Single handle holds either an RAF id or a timeout id — whichever the
  // current effect set. The cleanup uses the matching cancel call.
  const handleRef = useRef(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Double RAF so the browser commits a paint at opacity 0 before
      // we flip data-state="visible". A single RAF + state update can
      // collapse into one paint, suppressing the transition.
      handleRef.current = requestAnimationFrame(() => {
        handleRef.current = requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(handleRef.current);
    }
    setShown(false);
    handleRef.current = setTimeout(() => setMounted(false), FADE_MS + 40);
    return () => clearTimeout(handleRef.current);
  }, [visible]);

  if (!mounted) return null;

  return (
    <svg
      className={className ? `spinner-comets-svg ${className}` : 'spinner-comets-svg'}
      data-state={shown ? 'visible' : 'hidden'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fadeId} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* Mask the smaller rings out where the larger ring's stroke
            already paints, so semi-transparent ghosts don't compound at
            the right tangent. Stroke width 1.7 (≈1.5 + AA fudge) ensures
            the cut covers the full anti-aliased stroke edge. */}
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
        {PLANETS.map(({ c, r }, i) => (
          <circle
            key={r}
            cx={c}
            cy="12"
            r={r}
            strokeWidth="1.5"
            mask={i === 0 ? `url(#${maskInnerId})` : i === 1 ? `url(#${maskMidId})` : undefined}
          />
        ))}
      </g>

      {PLANETS.map(({ c, r, d, o }, i) => (
        <g
          key={r}
          className={`spinner-comets-orbit spinner-comets-orbit-${i}`}
          style={{ transformOrigin: `${c}px 12px`, opacity: o }}
        >
          <path
            d={`M 21 12 A ${r} ${r} 0 0 0 ${c} ${12 - r}`}
            stroke={`url(#${fadeId})`}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="21" cy="12" r={d} />
        </g>
      ))}
    </svg>
  );
}

export const SpinnerComets = memo(SpinnerCometsImpl);
export default SpinnerComets;
