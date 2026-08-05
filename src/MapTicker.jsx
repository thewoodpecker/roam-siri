import { useCallback, useEffect, useRef, useState } from 'react';
import './MapTicker.css';

/**
 * Decorative Company News ticker — mirrors wonder's TickerBar look/feel
 * (mono caps, green category + white copy, marquee scroll, settings affordance)
 * without the live messaging / settings modal.
 *
 * Click any entry to play a gentle pulse (scale + opacity, three times).
 */

const SCROLL_PX_PER_SECOND = 32;
const MIN_SCROLL_DURATION_MS = 18_000;

const MESSAGES = [
  { id: 'ats', category: 'ATS', text: '+9.1%, 5,818,620' },
  { id: 'meetings', category: 'JULY MEETINGS', text: '+5.7%, 1,234,302' },
  { id: 'goal', category: 'AUGUST GOAL', text: '1000 LEADS' },
  { id: 'hello', category: 'HELLO!', text: 'WELCOME TO ROAM VIRTUAL OFFICE' },
  { id: 'arr', category: 'JULY ARR', text: '+6.9%' },
  { id: 'arr-yoy', category: 'JULY ARR', text: '+100% YOY' },
  { id: 'logos', category: 'JULY LOGOS', text: '+27' },
];

function scrollDurationMs(distancePx) {
  return Math.max(MIN_SCROLL_DURATION_MS, (distancePx / SCROLL_PX_PER_SECOND) * 1000);
}

function SliderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="m3.75 7c0-1.24264 1.00736-2.25 2.25-2.25s2.25 1.00736 2.25 2.25-1.00736 2.25-2.25 2.25-2.25-1.00736-2.25-2.25zm2.25-3.75c-2.07107 0-3.75 1.67893-3.75 3.75s1.67893 3.75 3.75 3.75c1.81422 0 3.32753-1.28832 3.67499-3h10.57501c.4142 0 .75-.33579.75-.75s-.3358-.75-.75-.75h-10.57501c-.34746-1.71168-1.86077-3-3.67499-3zm14.25 13.75c0 1.2426-1.0074 2.25-2.25 2.25s-2.25-1.0074-2.25-2.25 1.0074-2.25 2.25-2.25 2.25 1.0074 2.25 2.25zm-2.25 3.75c2.0711 0 3.75-1.6789 3.75-3.75s-1.6789-3.75-3.75-3.75c-1.8142 0-3.3275 1.2883-3.675 3h-10.575c-.41421 0-.75.3358-.75.75s.33579.75.75.75h10.575c.3475 1.7117 1.8608 3 3.675 3z"
      />
    </svg>
  );
}

function TickerEntry({ message, pulsing, onPulse, onPulseEnd }) {
  const isBirthday = message.category === 'birthday';
  return (
    <button
      type="button"
      className={`map-ticker-entry${pulsing ? ' is-pulsing' : ''}`}
      data-ticker-id={message.id}
      onClick={(e) => {
        e.stopPropagation();
        onPulse?.(message.id);
      }}
      onAnimationEnd={
        pulsing
          ? (e) => {
              if (e.target !== e.currentTarget) return;
              onPulseEnd?.();
            }
          : undefined
      }
    >
      <span
        className={`map-ticker-cat${isBirthday ? ' map-ticker-cat-birthday' : ''}`}
      >
        {message.category.toUpperCase()}
      </span>
      <span className="map-ticker-text">{message.text}</span>
    </button>
  );
}

function ItemStrip({ messages, stripRef, hidden, pulsingId, onPulse, onPulseEnd }) {
  return (
    <div
      className="map-ticker-strip"
      ref={stripRef}
      aria-hidden={hidden || undefined}
      style={hidden ? { pointerEvents: 'none' } : undefined}
    >
      {messages.map((m) => (
        <TickerEntry
          key={m.id}
          message={m}
          pulsing={!hidden && m.id === pulsingId}
          onPulse={hidden ? undefined : onPulse}
          onPulseEnd={onPulseEnd}
        />
      ))}
    </div>
  );
}

export default function MapTicker({ messages = MESSAGES }) {
  const [pulsingId, setPulsingId] = useState(null);
  const [copies, setCopies] = useState(2);
  const [viewportEl, setViewportEl] = useState(null);
  const [trackEl, setTrackEl] = useState(null);
  const [stripEl, setStripEl] = useState(null);
  const animationRef = useRef(null);
  const builtDistanceRef = useRef(0);

  const rebuild = useCallback(() => {
    if (!viewportEl || !trackEl || !stripEl) return;
    const distance = stripEl.scrollWidth || stripEl.offsetWidth;
    if (distance === 0) return;

    const viewportWidth = viewportEl.clientWidth || viewportEl.getBoundingClientRect().width;
    setCopies(Math.max(2, Math.ceil(viewportWidth / distance) + 1));

    if (distance === builtDistanceRef.current && animationRef.current) return;
    builtDistanceRef.current = distance;

    const progress = animationRef.current?.effect?.getComputedTiming().progress ?? 0;
    animationRef.current?.cancel();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = scrollDurationMs(distance);
    const animation = trackEl.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` }],
      { duration, iterations: Infinity, easing: 'linear' },
    );
    animation.currentTime = progress * duration;
    if (reduced) animation.pause();
    animationRef.current = animation;
  }, [viewportEl, trackEl, stripEl]);

  useEffect(() => {
    if (!viewportEl || !trackEl || !stripEl) return undefined;
    rebuild();
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(rebuild)
      : null;
    ro?.observe(viewportEl);
    ro?.observe(stripEl);
    document.fonts?.ready.then(rebuild);
    return () => {
      ro?.disconnect();
      animationRef.current?.cancel();
      animationRef.current = null;
      builtDistanceRef.current = 0;
    };
  }, [viewportEl, trackEl, stripEl, rebuild, messages]);

  const pulseEntry = useCallback((id) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Re-trigger even if the same entry is clicked again.
    setPulsingId(null);
    requestAnimationFrame(() => setPulsingId(id));
  }, []);

  const clearPulse = useCallback(() => setPulsingId(null), []);

  return (
    <div className="map-ticker" role="complementary" aria-label="Company News">
      <div className="map-ticker-viewport" ref={setViewportEl}>
        <div className="map-ticker-track" ref={setTrackEl}>
          {Array.from({ length: copies }, (_, i) => (
            <ItemStrip
              key={i}
              messages={messages}
              stripRef={i === 0 ? setStripEl : undefined}
              hidden={i > 0}
              pulsingId={pulsingId}
              onPulse={pulseEntry}
              onPulseEnd={clearPulse}
            />
          ))}
        </div>
      </div>
      <div className="map-ticker-settings" aria-hidden="true">
        <span className="map-ticker-settings-btn">
          <SliderIcon />
        </span>
      </div>
    </div>
  );
}
