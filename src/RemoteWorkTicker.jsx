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

// Scroll speed in px/sec at full playback rate.
const NORMAL_SPEED = 70;
// Hovering eases the playback rate down to this fraction of full speed (rather
// than stopping) so items stay readable/clickable while the strip keeps moving.
const HOVER_RATE = 16 / NORMAL_SPEED;
// Per-frame easing applied only while the rate is settling toward its target.
const RATE_LERP = 0.12;

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
  // Web Animations API refs. Running the scroll as a compositor-driven
  // transform animation (rather than a per-frame JS rAF loop) keeps it perfectly
  // smooth even when the main thread is busy. Hover eases `playbackRate`, which
  // changes speed with no position jump.
  const animRef = useRef(null);
  const rateRef = useRef(1);
  const targetRateRef = useRef(1);
  const easeRafRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // (Re)build the compositor animation. Wrap width = one strip's width;
    // translating by it lands on the identical second copy, so the loop is
    // seamless. On rebuild (font load / resize) we carry the current progress
    // over so the position never jumps.
    const build = () => {
      const half = strip ? strip.scrollWidth : 0;
      if (half <= 0) return;

      const duration = (half / NORMAL_SPEED) * 1000; // ms for one strip at rate 1
      let progress = 0;
      const prev = animRef.current;
      if (prev) {
        const oldDur = prev.effect?.getTiming?.().duration || duration;
        progress = ((prev.currentTime || 0) % oldDur) / oldDur;
        prev.cancel();
      }

      const anim = track.animate(
        [
          { transform: 'translate3d(0,0,0)' },
          { transform: `translate3d(${-half}px,0,0)` },
        ],
        { duration, iterations: Infinity, easing: 'linear' },
      );
      anim.currentTime = progress * duration;
      anim.playbackRate = rateRef.current;
      if (reduced) anim.pause();
      animRef.current = anim;
    };

    build();
    if (document.fonts?.ready) document.fonts.ready.then(build);

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(easeRafRef.current);
      animRef.current?.cancel();
    };
  }, []);

  // Ease the playback rate toward its target (only runs while settling).
  const easeRate = (target) => {
    targetRateRef.current = target;
    if (easeRafRef.current) return;
    const step = () => {
      const diff = targetRateRef.current - rateRef.current;
      rateRef.current += diff * RATE_LERP;
      if (Math.abs(diff) < 0.005) rateRef.current = targetRateRef.current;
      if (animRef.current) animRef.current.playbackRate = rateRef.current;
      if (rateRef.current !== targetRateRef.current) {
        easeRafRef.current = requestAnimationFrame(step);
      } else {
        easeRafRef.current = 0;
      }
    };
    easeRafRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="rw-ticker" role="complementary" aria-label="Remote Work News ticker">
      <a
        className="rw-ticker-brand"
        href="#/"
        aria-label="Remote Work News by Roam"
      >
        <img className="rw-ticker-logo" src="/rwn-logo.svg" alt="Remote Work News" width="91" height="13" />
      </a>
      <div
        className="rw-ticker-viewport"
        onMouseEnter={() => easeRate(HOVER_RATE)}
        onMouseLeave={() => easeRate(1)}
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
