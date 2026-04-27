import React, { useEffect, useRef, useState } from 'react';
import './Magnify.css';

/**
 * Magnify — focus-feature callout. Wraps a child element (or icon) inside a
 * pin-shaped circular spotlight with concentric rings rippling outward, used
 * to draw attention to a specific element of a design.
 *
 * Usage:
 *   <Magnify>
 *     <SomeIcon />
 *   </Magnify>
 *
 *   // Connector line from the pin edge to the target element, ending in a
 *   // 6×6 dot. Offsets are relative to the pin's center, in px.
 *   <Magnify size={100} lineTo={{ x: 12, y: 180 }}>
 *     <img src="/icons/boot.svg" alt="" />
 *   </Magnify>
 *
 * Props:
 *   - size:    diameter of the central pin in px (default 80)
 *   - rings:   number of outer rings (default 3)
 *   - lineTo:  { x, y } offset from pin center to the target point. When set,
 *              draws a hairline from the pin's edge to that point and a small
 *              filled dot at the end.
 *   - className: positioning hook (e.g. absolute + offsets)
 *   - style:   inline style for positioning (e.g. { top, left })
 *
 * Entry animation:
 *   The component triggers a smooth entry animation the first time it scrolls
 *   into the viewport — the connector line draws from the target toward the
 *   pin, then the pin fades and scales in, then the rings start rippling.
 */
export default function Magnify({
  children,
  size = 80,
  rings = 3,
  lineTo,
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (entered) return;
    const el = rootRef.current;
    if (!el) return;
    let timer = 0;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Defer one tick so the browser commits the initial (un-entered)
        // styles before we flip the class — otherwise the transition has
        // nothing to animate from and the element snaps into place.
        timer = setTimeout(() => setEntered(true), 60);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [entered]);

  return (
    <div
      ref={rootRef}
      className={`fp-magnify ${entered ? 'fp-magnify-entered' : ''} ${className}`}
      style={{ '--magnify-size': `${size}px`, ...style }}
    >
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={i}
          className="fp-magnify-ring"
          style={{ '--n': i + 1 }}
          aria-hidden="true"
        />
      ))}
      <div className="fp-magnify-pin">
        <div className="fp-magnify-content">{children}</div>
      </div>
      {lineTo && <MagnifyConnector size={size} lineTo={lineTo} />}
    </div>
  );
}

function MagnifyConnector({ size, lineTo }) {
  const half = size / 2;
  // Snap to axis: keep the dominant component, zero the other so the line is
  // always strictly vertical or horizontal.
  const rawX = lineTo.x ?? 0;
  const rawY = lineTo.y ?? 0;
  const vertical = Math.abs(rawY) >= Math.abs(rawX);
  const x = vertical ? 0 : rawX;
  const y = vertical ? rawY : 0;
  // Start the line at the pin's edge so it doesn't overlap the circle.
  const startX = vertical ? 0 : Math.sign(x) * half;
  const startY = vertical ? Math.sign(y) * half : 0;
  // Length is used by CSS to set stroke-dasharray for the draw-in animation.
  const length = Math.abs(vertical ? y - startY : x - startX);
  return (
    <svg
      className="fp-magnify-line"
      width="1"
      height="1"
      overflow="visible"
      aria-hidden="true"
      style={{ '--magnify-line-length': `${length}px` }}
    >
      {/* Endpoints intentionally reversed (target → pin edge) so that
          stroke-dashoffset animates the line drawing FROM the target toward
          the pin. SVG attributes are used for the initial dash values so
          they contribute to computed style and the CSS transition has a
          definite "from" value. */}
      <line
        x1={x}
        y1={y}
        x2={startX}
        y2={startY}
        stroke="var(--magnify-line-color, var(--magnify-pin-border))"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length}
      />
      <circle
        cx={x}
        cy={y}
        r="3"
        fill="var(--magnify-line-color, var(--magnify-pin-border))"
      />
    </svg>
  );
}
