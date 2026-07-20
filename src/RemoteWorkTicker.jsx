import { Fragment, useEffect, useRef } from 'react';
import './RemoteWorkTicker.css';

// Remote-work news items. `url` is optional — items with a source open it in a
// new tab; the rest render as plain text.
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
// Hover eases playback down to this fraction (~16 px/s) instead of stopping,
// so items stay readable and clickable while the strip keeps moving.
const HOVER_RATE = 16 / NORMAL_SPEED;
// Per-frame lerp used while the playback rate settles toward its target.
const RATE_LERP = 0.12;

function ItemStrip({ hidden }) {
  return (
    <div className="rw-ticker-strip" aria-hidden={hidden || undefined}>
      {ITEMS.map((item, i) => {
        const Tag = item.url ? 'a' : 'span';
        return (
          <Fragment key={i}>
            <Tag
              className="rw-ticker-item"
              {...(item.url && { href: item.url, target: '_blank', rel: 'noopener noreferrer' })}
            >
              <span className="rw-ticker-label">{item.type}</span>
              <span className="rw-ticker-text">{item.text}</span>
            </Tag>
            <span className="rw-ticker-sep" aria-hidden="true">·</span>
          </Fragment>
        );
      })}
    </div>
  );
}

// The scroll runs as a compositor-driven transform animation, so it stays
// smooth even when the main thread is busy. Hover adjusts `playbackRate`,
// which changes speed with no position jump.
export default function RemoteWorkTicker() {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const rateRef = useRef(1);
  const targetRateRef = useRef(1);
  const easeRafRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alive = true;

    // (Re)build the animation. The track holds two identical strips, so
    // translating by one strip's width lands exactly on the second copy and the
    // loop wraps seamlessly. Rebuilds (font load, resize) carry the progress
    // fraction over so the position never jumps.
    const build = () => {
      const width = track.firstElementChild.scrollWidth;
      if (!alive || width <= 0) return;

      const duration = (width / NORMAL_SPEED) * 1000;
      let progress = 0;
      const prev = animRef.current;
      if (prev) {
        const prevDuration = prev.effect.getTiming().duration;
        progress = ((prev.currentTime ?? 0) % prevDuration) / prevDuration;
        prev.cancel();
      }

      const anim = track.animate(
        [{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${-width}px,0,0)` }],
        { duration, iterations: Infinity, easing: 'linear' },
      );
      anim.currentTime = progress * duration;
      anim.playbackRate = rateRef.current;
      if (reduced) anim.pause();
      animRef.current = anim;
    };

    build();
    document.fonts?.ready.then(build);

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      alive = false;
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(easeRafRef.current);
      animRef.current?.cancel();
    };
  }, []);

  // Ease playbackRate toward `target`; the rAF loop only runs while settling.
  const easeRate = (target) => {
    targetRateRef.current = target;
    if (easeRafRef.current) return;
    const step = () => {
      const diff = targetRateRef.current - rateRef.current;
      rateRef.current = Math.abs(diff) < 0.005 ? targetRateRef.current : rateRef.current + diff * RATE_LERP;
      if (animRef.current) animRef.current.playbackRate = rateRef.current;
      easeRafRef.current = rateRef.current === targetRateRef.current ? 0 : requestAnimationFrame(step);
    };
    easeRafRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="rw-ticker" role="complementary" aria-label="Remote Work News ticker">
      <a className="rw-ticker-brand" href="#/rwn" aria-label="Remote Work News by Roam">
        <img className="rw-ticker-logo" src="/rwn-logo.svg" alt="Remote Work News" width="91" height="13" />
      </a>
      <div
        className="rw-ticker-viewport"
        onMouseEnter={() => easeRate(HOVER_RATE)}
        onMouseLeave={() => easeRate(1)}
      >
        <div className="rw-ticker-track" ref={trackRef}>
          <ItemStrip />
          <ItemStrip hidden />
        </div>
      </div>
    </div>
  );
}
