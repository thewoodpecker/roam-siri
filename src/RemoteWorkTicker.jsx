import { useEffect, useRef } from 'react';
import './RemoteWorkTicker.css';

// Remote-work news items for the LED ticker. `url` is optional — items with a
// source open it in a new tab; the rest render as non-clickable text.
const NYT_SMALL_BIZ =
  'https://www.nytimes.com/2026/07/17/business/economy/american-small-business-boom.html';

const ITEMS = [
  { type: 'REPORT', text: 'Remote work drives record productivity gains in Q1' },
  { type: 'DATA', text: 'Work from home hits record highs — 39% of full-time workers now remote' },
  { type: 'TRENDING', text: 'American small business boom fueled by a new generation of remote founders', url: NYT_SMALL_BIZ },
  { type: 'REPORT', text: 'Labor productivity index climbs to 120 as output outpaces hours worked' },
  { type: 'DATA', text: 'Share of remote full-time workers up from 22% in 2019 to 34% in 2025' },
  { type: 'TRENDING', text: 'Distributed teams flock to virtual offices as fully-remote adoption surges' },
  { type: 'MARKETS', text: 'U.S. small business formation reaches highest level on record', url: NYT_SMALL_BIZ },
];

// Scroll speeds in px/sec. Hovering eases toward the slower target rather than
// stopping, so items stay readable/clickable while the strip keeps moving.
const NORMAL_SPEED = 70;
const HOVER_SPEED = 16;
const LERP_FACTOR = 0.08;

function TickerItem({ item }) {
  const inner = (
    <>
      <span className="rw-ticker-label">{item.type}</span>
      <span className="rw-ticker-text">{item.text}</span>
    </>
  );
  if (item.url) {
    return (
      <a className="rw-ticker-item rw-ticker-item-link" href={item.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <span className="rw-ticker-item">{inner}</span>;
}

function ItemStrip({ ariaHidden }) {
  return (
    <div className="rw-ticker-strip" aria-hidden={ariaHidden || undefined}>
      {ITEMS.map((item, i) => (
        <span key={i} className="rw-ticker-cell">
          <TickerItem item={item} />
          <span className="rw-ticker-sep" aria-hidden="true">·</span>
        </span>
      ))}
    </div>
  );
}

export default function RemoteWorkTicker() {
  const stripRef = useRef(null);
  const trackRef = useRef(null);

  // rAF scroll state — a JS loop (rather than a CSS animation) so hovering can
  // ease the speed down smoothly instead of jumping or stopping.
  const offsetRef = useRef(0);
  const halfRef = useRef(0);
  const speedRef = useRef(NORMAL_SPEED);
  const targetSpeedRef = useRef(NORMAL_SPEED);

  useEffect(() => {
    // Wrap width = one strip's width; shifting by it lands on the identical
    // second copy, so the scroll loops seamlessly.
    const measure = () => {
      const strip = stripRef.current;
      if (strip && strip.scrollWidth > 0) halfRef.current = strip.scrollWidth;
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener('resize', measure);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      speedRef.current = 0;
      targetSpeedRef.current = 0;
    }

    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      speedRef.current += (targetSpeedRef.current - speedRef.current) * LERP_FACTOR;
      offsetRef.current += speedRef.current * dt;
      const half = halfRef.current;
      if (half > 0 && offsetRef.current >= half) offsetRef.current -= half;

      const track = trackRef.current;
      if (track) track.style.transform = `translateX(${-offsetRef.current}px)`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="rw-ticker" role="complementary" aria-label="Remote Work News ticker">
      <a
        className="rw-ticker-brand"
        href="#/"
        aria-label="Remote Work News by Roam"
      >
        <img className="rw-ticker-logo" src="/rwn-logo.svg" alt="Remote Work News" width="102" height="24" />
      </a>
      <div
        className="rw-ticker-viewport"
        onMouseEnter={() => { targetSpeedRef.current = HOVER_SPEED; }}
        onMouseLeave={() => { targetSpeedRef.current = NORMAL_SPEED; }}
      >
        <div className="rw-ticker-track" ref={trackRef}>
          <ItemStrip ariaHidden={false} />
          <ItemStrip ariaHidden />
        </div>
        {/* Off-screen probe used only to measure a single strip's width. */}
        <div className="rw-ticker-measure" ref={stripRef} aria-hidden="true">
          <ItemStrip ariaHidden />
        </div>
      </div>
    </div>
  );
}
