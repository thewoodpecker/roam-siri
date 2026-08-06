import { useCallback, useEffect, useRef, useState } from 'react';
import './MapTicker.css';

/**
 * Decorative Company News ticker — mirrors wonder's TickerBar look/feel
 * (mono caps, green category + white copy, marquee scroll, settings affordance)
 * without the live messaging / settings modal.
 *
 * Click any entry to play per-character-rise (animate-text), then a small
 * spark burst at the trailing edge.
 */

const SCROLL_PX_PER_SECOND = 18;
const MIN_SCROLL_DURATION_MS = 18_000;

/** per-character-rise — portable enter / exit. */
const ENTER_DURATION_MS = 700;
const ENTER_STAGGER_MS = 24;
const EXIT_DURATION_MS = 420;
const EXIT_STAGGER_MS = 14;
const SWAP_GAP_MS = 60;

/** Small gift-style spark burst at the trailing edge as enter finishes. */
const SPARK_COUNT = 6;
const SPARK_DURATION_MS = 720;
/** Fire this many ms before enter settles. */
const SPARK_LEAD_MS = 380;

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

function charCountFor(message) {
  return Array.from(message.category.toUpperCase()).length + Array.from(message.text).length;
}

function phaseTotalMs(phase, count) {
  if (phase === 'exit') {
    return EXIT_DURATION_MS + Math.max(0, count - 1) * EXIT_STAGGER_MS;
  }
  return ENTER_DURATION_MS + Math.max(0, count - 1) * ENTER_STAGGER_MS;
}

function CharUnits({ text, baseIndex, birthday }) {
  return Array.from(text).map((ch, i) => (
    <span
      key={`${baseIndex + i}-${ch}`}
      className={`map-ticker-char${birthday ? ' map-ticker-char-birthday' : ''}`}
      style={{ '--i': baseIndex + i }}
    >
      {ch}
    </span>
  ));
}

function buildSparks() {
  return Array.from({ length: SPARK_COUNT }, (_, i) => {
    // Full radial burst — gift-style firework.
    const angle = (360 / SPARK_COUNT) * i + (i % 3) * 7;
    const dist = 12 + (i % 5) * 5;
    const size = 3 + (i % 3);
    const delay = (i % 5) * 18;
    return { angle, dist, size, delay, i };
  });
}

function EntrySparks({ burstKey }) {
  const sparks = buildSparks();
  return (
    <span className="map-ticker-sparks" key={burstKey} aria-hidden="true">
      {sparks.map((s) => (
        <span
          key={s.i}
          className="map-ticker-spark"
          style={{
            '--a': `${s.angle}deg`,
            '--d': `${s.dist}px`,
            '--s': `${s.size}px`,
            '--delay': `${s.delay}ms`,
          }}
        />
      ))}
    </span>
  );
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

function TickerEntry({ message, phase, sparkling, sparkKey, onRise }) {
  const isBirthday = message.category === 'birthday';
  const category = message.category.toUpperCase();
  const text = message.text;
  const phaseClass = phase === 'exit' ? ' is-exiting' : phase === 'enter' ? ' is-entering' : '';

  return (
    <button
      type="button"
      className={`map-ticker-entry${phaseClass}${sparkling ? ' is-sparking' : ''}`}
      data-ticker-id={message.id}
      onClick={(e) => {
        e.stopPropagation();
        onRise?.(message);
      }}
    >
      <span className={`map-ticker-cat${isBirthday ? ' map-ticker-cat-birthday' : ''}`}>
        <CharUnits text={category} baseIndex={0} birthday={isBirthday} />
      </span>
      <span className="map-ticker-text">
        <CharUnits text={text} baseIndex={category.length} />
      </span>
      {sparkling ? <EntrySparks burstKey={sparkKey} /> : null}
    </button>
  );
}

function ItemStrip({ messages, stripRef, anim, sparkBurst, onRise }) {
  return (
    <div className="map-ticker-strip" ref={stripRef}>
      {messages.map((m) => (
        <TickerEntry
          key={m.id}
          message={m}
          phase={anim?.id === m.id ? anim.phase : null}
          sparkling={sparkBurst?.id === m.id}
          sparkKey={sparkBurst?.key}
          onRise={onRise}
        />
      ))}
    </div>
  );
}

export default function MapTicker({ messages = MESSAGES }) {
  const [anim, setAnim] = useState(null);
  const [sparkBurst, setSparkBurst] = useState(null);
  const [copies, setCopies] = useState(2);
  const [viewportEl, setViewportEl] = useState(null);
  const [trackEl, setTrackEl] = useState(null);
  const [stripEl, setStripEl] = useState(null);
  const animationRef = useRef(null);
  const builtDistanceRef = useRef(0);
  const riseTimersRef = useRef([]);

  const clearRiseTimers = useCallback(() => {
    riseTimersRef.current.forEach(clearTimeout);
    riseTimersRef.current = [];
  }, []);

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

  useEffect(() => () => clearRiseTimers(), [clearRiseTimers]);

  const riseEntry = useCallback((message) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearRiseTimers();
    setSparkBurst(null);
    const count = charCountFor(message);
    const exitMs = phaseTotalMs('exit', count);
    const enterMs = phaseTotalMs('enter', count);
    const enterAt = exitMs + SWAP_GAP_MS;
    const sparkAt = enterAt + Math.max(0, enterMs - SPARK_LEAD_MS);

    setAnim(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnim({ id: message.id, phase: 'exit' });
        const enterTimer = setTimeout(() => {
          setAnim({ id: message.id, phase: 'enter' });
          const doneTimer = setTimeout(() => setAnim(null), enterMs);
          riseTimersRef.current.push(doneTimer);
        }, enterAt);
        const sparkTimer = setTimeout(() => {
          setSparkBurst({ id: message.id, key: Date.now() });
          const clearSpark = setTimeout(() => setSparkBurst(null), SPARK_DURATION_MS);
          riseTimersRef.current.push(clearSpark);
        }, sparkAt);
        riseTimersRef.current.push(enterTimer, sparkTimer);
      });
    });
  }, [clearRiseTimers]);

  return (
    <div className="map-ticker" role="complementary" aria-label="Company News">
      <div className="map-ticker-viewport" ref={setViewportEl}>
        <div className="map-ticker-track" ref={setTrackEl}>
          {Array.from({ length: copies }, (_, i) => (
            <ItemStrip
              key={i}
              messages={messages}
              stripRef={i === 0 ? setStripEl : undefined}
              anim={anim}
              sparkBurst={sparkBurst}
              onRise={riseEntry}
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
