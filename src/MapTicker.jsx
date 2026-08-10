import { useCallback, useEffect, useRef, useState } from 'react';
import './MapTicker.css';

/**
 * Decorative Company News ticker — mirrors wonder's TickerBar look/feel
 * (mono caps, green category + white copy, marquee scroll, settings affordance)
 * without the live messaging / settings modal.
 *
 * Click any entry to play per-character-rise (animate-text), then a small
 * spark burst at the trailing edge. Drag horizontally inside the bar to pan
 * through messages; clicks under a ~5px move still rise / open birthday gift.
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

const DRAG_THRESHOLD_PX = 5;
const MOMENTUM_FRICTION = 0.92;
const MOMENTUM_MIN_VX = 0.05; // px / ms

const MESSAGES = [
  { id: 'bday-klas', category: 'birthday', text: 'HAPPY BIRTHDAY KLAS!' },
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

function CharUnits({ text, baseIndex }) {
  return Array.from(text).map((ch, i) => (
    <span
      key={`${baseIndex + i}-${ch}`}
      className="map-ticker-char"
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
        d="m3.75 7c0-1.24264 1.00736-2.25 2.25-2.25s2.25 1.00736 2.25 2.25-1.00736 2.25-2.25 2.25-2.25-1.00736-2.25-2.25zm2.25-3.75c-2.07107 0-3.75 1.67893-3.75 3.75s1.67893 3.75 3.75 3.75c1.81422 0 3.32753-1.28832 3.67499-3h10.57501c.4142 0 .75-.33579.75-.75s-.3358-.75-.75-.75h-10.57501c-.34746-1.71168-1.86077-3-3.67499-3zm14.25 13.75c0 1.2426-1.0074 2.25-2.25 2.25s-2.25-1.0074-2.25-2.25 1.0074-2.25-2.25 2.25-2.25 2.25 1.0074 2.25 2.25zm-2.25 3.75c2.0711 0 3.75-1.6789 3.75-3.75s-1.6789-3.75-3.75-3.75c-1.8142 0-3.3275 1.2883-3.675 3h-10.575c-.41421 0-.75.3358-.75.75s.33579.75.75.75h10.575c.3475 1.7117 1.8608 3 3.675 3z"
      />
    </svg>
  );
}

/** Subtle ambient sparkles around the birthday category label. */
const BIRTHDAY_LABEL_SPARKS = [
  { x: '6%', y: '18%', s: 2, delay: '0s', dur: '2.8s' },
  { x: '18%', y: '78%', s: 1.5, delay: '0.4s', dur: '3.2s' },
  { x: '32%', y: '12%', s: 2, delay: '1.0s', dur: '2.6s' },
  { x: '45%', y: '88%', s: 1.5, delay: '0.7s', dur: '3.4s' },
  { x: '58%', y: '22%', s: 2, delay: '1.5s', dur: '2.9s' },
  { x: '70%', y: '72%', s: 1.5, delay: '0.2s', dur: '3.1s' },
  { x: '82%', y: '40%', s: 2, delay: '1.9s', dur: '2.7s' },
  { x: '94%', y: '65%', s: 1.5, delay: '1.2s', dur: '3.5s' },
  { x: '38%', y: '48%', s: 1.5, delay: '2.2s', dur: '3.0s' },
  { x: '25%', y: '35%', s: 2, delay: '2.6s', dur: '2.5s' },
];

function BirthdayLabelSparks() {
  return (
    <span className="map-ticker-birthday-sparks" aria-hidden="true">
      {BIRTHDAY_LABEL_SPARKS.map((s, i) => (
        <span
          key={i}
          className="map-ticker-birthday-spark"
          style={{
            left: s.x,
            top: s.y,
            width: s.s,
            height: s.s,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </span>
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
        {isBirthday ? (
          <span className="map-ticker-birthday-wrap">
            <span className="map-ticker-char map-ticker-birthday-label" style={{ '--i': 0 }}>
              {category}
            </span>
            {phase !== 'exit' && <BirthdayLabelSparks />}
          </span>
        ) : (
          <CharUnits text={category} baseIndex={0} />
        )}
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

function wrapAnimTime(timeMs, periodMs) {
  if (!periodMs) return 0;
  return ((timeMs % periodMs) + periodMs) % periodMs;
}

export default function MapTicker({ messages = MESSAGES, onBirthdayClick } = {}) {
  const [anim, setAnim] = useState(null);
  const [sparkBurst, setSparkBurst] = useState(null);
  const [copies, setCopies] = useState(2);
  const [viewportEl, setViewportEl] = useState(null);
  const [trackEl, setTrackEl] = useState(null);
  const [stripEl, setStripEl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const animationRef = useRef(null);
  const builtDistanceRef = useRef(0);
  const riseTimersRef = useRef([]);
  const dragRef = useRef(null);
  const suppressRiseRef = useRef(false);
  const momentumRafRef = useRef(0);
  const scrubbingRef = useRef(false);

  const clearRiseTimers = useCallback(() => {
    riseTimersRef.current.forEach(clearTimeout);
    riseTimersRef.current = [];
  }, []);

  const cancelMomentum = useCallback(() => {
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = 0;
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    scrubbingRef.current = false;
    const animation = animationRef.current;
    if (!animation) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && animation.playState === 'paused') animation.play();
  }, []);

  const scrubByPx = useCallback((deltaPx) => {
    const animation = animationRef.current;
    const distance = builtDistanceRef.current;
    if (!animation || !distance) return;
    const duration = scrollDurationMs(distance);
    // Drag left → advance marquee (more negative translate); right → rewind.
    const next = wrapAnimTime(animation.currentTime - (deltaPx / distance) * duration, duration);
    animation.currentTime = next;
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
    if (reduced || scrubbingRef.current) animation.pause();
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
      cancelMomentum();
      animationRef.current?.cancel();
      animationRef.current = null;
      builtDistanceRef.current = 0;
    };
  }, [viewportEl, trackEl, stripEl, rebuild, messages, cancelMomentum]);

  useEffect(() => () => clearRiseTimers(), [clearRiseTimers]);

  const riseEntry = useCallback((message) => {
    // Drag past threshold sets this so a drag-end click doesn't fire rise/gift.
    if (suppressRiseRef.current) {
      suppressRiseRef.current = false;
      return;
    }
    if (message.category === 'birthday') {
      onBirthdayClick?.(message);
    }
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
  }, [clearRiseTimers, onBirthdayClick]);

  const runMomentum = useCallback((vxPxPerMs) => {
    cancelMomentum();
    let vx = vxPxPerMs;
    let last = performance.now();

    const tick = (now) => {
      if (document.hidden) {
        momentumRafRef.current = 0;
        resumeAutoScroll();
        return;
      }
      const dt = Math.min(32, now - last);
      last = now;
      scrubByPx(vx * dt);
      vx *= MOMENTUM_FRICTION;
      if (Math.abs(vx) < MOMENTUM_MIN_VX) {
        momentumRafRef.current = 0;
        resumeAutoScroll();
        return;
      }
      momentumRafRef.current = requestAnimationFrame(tick);
    };
    momentumRafRef.current = requestAnimationFrame(tick);
  }, [cancelMomentum, resumeAutoScroll, scrubByPx]);

  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    const viewport = viewportEl;
    if (!viewport) return;

    // Don't capture yet — a plain click on an entry should still rise.
    e.stopPropagation();
    cancelMomentum();

    const drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      moved: false,
    };
    dragRef.current = drag;

    const onMove = (ev) => {
      if (ev.pointerId !== drag.pointerId) return;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

      const animation = animationRef.current;
      if (!animation) return;

      if (!drag.moved) {
        drag.moved = true;
        scrubbingRef.current = true;
        setDragging(true);
        suppressRiseRef.current = true;
        animation.pause();
        try { viewport.setPointerCapture(ev.pointerId); } catch { /* ignore */ }
        drag.lastX = ev.clientX;
        drag.lastT = performance.now();
      }

      const step = ev.clientX - drag.lastX;
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastT);
      // EMA of horizontal velocity for light momentum on release.
      drag.vx = drag.vx * 0.7 + (step / dt) * 0.3;
      drag.lastX = ev.clientX;
      drag.lastT = now;
      scrubByPx(step);
    };

    const onUp = (ev) => {
      if (ev.pointerId !== drag.pointerId) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (viewport.hasPointerCapture?.(drag.pointerId)) {
        try { viewport.releasePointerCapture(drag.pointerId); } catch { /* ignore */ }
      }
      if (drag.moved) {
        suppressRiseRef.current = true;
        window.setTimeout(() => { suppressRiseRef.current = false; }, 50);
        setDragging(false);
        if (Math.abs(drag.vx) >= MOMENTUM_MIN_VX) {
          runMomentum(drag.vx);
        } else {
          resumeAutoScroll();
        }
      } else {
        suppressRiseRef.current = false;
        setDragging(false);
        // Click interrupted momentum (or a no-op) — keep auto-marquee running.
        resumeAutoScroll();
      }
      dragRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }, [viewportEl, cancelMomentum, scrubByPx, runMomentum, resumeAutoScroll]);

  return (
    <>
      {/* Reserves the docked band so the map body stays 16:9. */}
      <div className="map-ticker-spacer" aria-hidden="true" />
      <div
        className={`map-ticker${dragging ? ' is-dragging' : ''}`}
        role="complementary"
        aria-label="Company News"
      >
        <div
          className="map-ticker-viewport"
          ref={setViewportEl}
          onPointerDown={onPointerDown}
        >
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
    </>
  );
}
