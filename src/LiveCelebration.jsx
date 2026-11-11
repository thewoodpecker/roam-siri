import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseMap from './ShowcaseMap';
import lyricsFile from './liveCelebrationLyrics.json';
import { lyricsFrame } from './celebrationLyrics.mjs';
import './LiveCelebration.css';

// Sing-along from wonder/roam/client/rewards/celebration/LyricsBar.tsx
// and helpers/lyrics.ts. The pose (hop, bounce, stretch, lean, line
// handoff) comes from celebrationLyrics.mjs. Times are the built-in
// happy-birthday lyrics (roam/audio/rewards/happy-birthday-roam-1min.lyrics.json).

const LINES = lyricsFile.lines;
const LEAD_MS = 1500;
const HOLD_MS = 1500;
const TRANSITION_MS = 600;
const EXIT_MS = 180;

const WINDOWS = LINES.map((line, i) => {
  const start = line.words[0].startMs;
  const end = line.words[line.words.length - 1].endMs;
  return { start, end };
}).map((window, i, all) => {
  const next = all[i + 1];
  const until = next
    ? Math.min(window.end + HOLD_MS, Math.max(window.end, next.start - LEAD_MS))
    : window.end + HOLD_MS;
  return { ...window, until };
});
WINDOWS.forEach((window, i) => {
  window.from = Math.max(window.start - LEAD_MS, WINDOWS[i - 1]?.until ?? -Infinity);
});

const DURATION = WINDOWS[WINDOWS.length - 1].until + 600;

function clock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function RoamMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M9.5 11.5C7.567 11.5 6 9.933 6 8C6 6.067 7.567 4.5 9.5 4.5C11.433 4.5 13 6.067 13 8C13 9.933 11.433 11.5 9.5 11.5ZM9.5 12.5C11.9853 12.5 14 10.4853 14 8C14 5.51472 11.9853 3.5 9.5 3.5C7.01472 3.5 5 5.51472 5 8C5 10.4853 7.01472 12.5 9.5 12.5Z" fill="currentColor" />
      <path d="M8 13.1C5.18335 13.1 2.9 10.8167 2.9 8C2.9 5.18335 5.18335 2.9 8 2.9C10.8167 2.9 13.1 5.18335 13.1 8C13.1 10.8167 10.8167 13.1 8 13.1ZM8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" fill="currentColor" />
      <path d="M11.334 5.01838C11.2243 5.00624 11.1129 5 11 5C9.34315 5 8 6.34315 8 8C8 9.65685 9.34315 11 11 11C11.1129 11 11.2243 10.9938 11.334 10.9816C12.3336 10.3654 13 9.26053 13 8C13 6.73947 12.3336 5.63458 11.334 5.01838ZM13 8C13 9.10457 12.1046 10 11 10C9.89543 10 9 9.10457 9 8C9 6.89543 9.89543 6 11 6C12.1046 6 13 6.89543 13 8Z" fill="currentColor" />
    </svg>
  );
}

const MIN_FONT_SCALE = 0.85;

function LyricRow({
  line,
  index,
  role,
  reached,
  still,
  animate: shouldAnimate,
  duration,
  placements,
  clock,
  onHeight,
}) {
  const rowRef = useRef(null);
  const textRef = useRef(null);
  const ballRef = useRef(null);
  const geometry = useRef([]);
  const previous = useRef(undefined);
  const animRef = useRef(undefined);

  const place = useCallback((ball) => {
    const el = ballRef.current;
    if (!el) return;
    const at = (k, end = k) => {
      const w = geometry.current[Math.max(0, k)];
      const last = geometry.current[Math.max(0, end)];
      return (
        w &&
        last && {
          x: k < 0 ? w.left - w.height / 2 : w.y === last.y ? (w.left + last.right) / 2 : last.x,
          y: k < 0 ? w.y : last.y,
          height: w.height,
        }
      );
    };
    const a = ball && at(ball.from, ball.fromEnd);
    const b = ball && at(ball.to, ball.toEnd);
    if (!ball || !a || !b) {
      el.style.opacity = '0';
      return;
    }
    el.style.opacity = '1';
    const x = a.x + (b.x - a.x) * ball.t;
    const y = a.y + (b.y - a.y) * ball.t;
    const distanceScale = ball.from === ball.to
      ? 1
      : Math.max(ball.minDistanceScale ?? 0, Math.min(1, Math.abs(b.x - a.x) / (2 * a.height)));
    const lift = (ball.liftRem ?? 0) * distanceScale + (ball.holdRem ?? 0);
    const stretch = ball.stretch ?? 0;
    const lean = (ball.leanDeg ?? 0) * Math.sign(b.x - a.x);
    el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 100% - 0.125rem - ${lift}rem)) rotate(${lean}deg) scale(${1 / (1 + stretch)}, ${1 + stretch})`;
  }, []);

  const measure = useCallback(() => {
    const el = textRef.current;
    const row = rowRef.current;
    if (!el || !row) return undefined;
    el.style.fontSize = '';
    el.style.whiteSpace = 'nowrap';
    const baseSize = Number.parseFloat(getComputedStyle(el).fontSize);
    const words = Array.from(el.querySelectorAll('[data-word]'));
    const first = words[0];
    const last = words[words.length - 1];
    const naturalWidth = first && last ? last.offsetLeft + last.offsetWidth - first.offsetLeft : 0;
    const availableWidth = Math.max(0, row.clientWidth - 2);
    let scale = naturalWidth > availableWidth ? Math.max(MIN_FONT_SCALE, availableWidth / naturalWidth) : 1;
    el.style.fontSize = `${baseSize * scale}px`;
    el.style.whiteSpace = role === 'preview' ? 'nowrap' : 'normal';
    while (
      role !== 'preview' &&
      first &&
      scale > MIN_FONT_SCALE &&
      words.some((word) => word.offsetTop !== first.offsetTop)
    ) {
      scale = Math.max(MIN_FONT_SCALE, scale - 0.01);
      el.style.fontSize = `${baseSize * scale}px`;
    }
    geometry.current = words.map((word) => ({
      x: word.offsetLeft + word.offsetWidth / 2,
      y: word.offsetTop,
      left: word.offsetLeft,
      right: word.offsetLeft + word.offsetWidth,
      height: word.offsetHeight,
    }));
    if (role === 'active') onHeight(el.offsetHeight);
    place(!still && clock.current.line === index ? clock.current.ball : undefined);
    return { role, fontSize: baseSize * scale };
  }, [role, onHeight, place, still, clock, index]);

  useLayoutEffect(() => {
    placements.set(index, place);
    return () => {
      placements.delete(index);
    };
  }, [placements, index, place]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const observer = new ResizeObserver(() => {
      previous.current = measure();
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    const before = previous.current;
    const after = measure();
    const row = rowRef.current;
    if (!after || !row) return undefined;
    previous.current = after;
    const running = animRef.current;
    const interrupted = running?.playState === 'running' ? getComputedStyle(row) : undefined;
    const fromTransform = interrupted?.transform ?? 'none';
    const fromOpacity = interrupted?.opacity ?? '1';
    running?.cancel();
    row.style.transform = 'none';
    row.style.opacity = role === 'outgoing' ? '0' : '1';
    if (still || !shouldAnimate || before?.role === role) return undefined;
    let logoFade;
    const bind = (anim) => {
      animRef.current = anim;
      anim.onfinish = () => {
        if (animRef.current !== anim) return;
        if (row.isConnected && row.offsetParent !== null) {
          try {
            anim.commitStyles();
          } catch {
            // The row can finish detached. The fill already shows the end pose.
          }
        }
        anim.cancel();
      };
    };
    if (role === 'outgoing') {
      bind(row.animate(
        [
          { opacity: fromOpacity, transform: fromTransform },
          { opacity: 0, transform: 'translateY(-0.75rem)' },
        ],
        { duration, easing: 'ease-out', fill: 'both' },
      ));
    } else {
      const promoted = before?.role === 'preview' && role === 'active';
      const scale = promoted ? before.fontSize / after.fontSize : 1;
      if (promoted) {
        logoFade = ballRef.current?.querySelector('svg')?.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          {
            delay: duration < 300 ? 70 : EXIT_MS,
            duration: 90,
            easing: 'ease-out',
            fill: 'backwards',
          },
        );
      }
      bind(row.animate(
        [
          {
            opacity: promoted ? (duration <= 300 ? 1 : 0.65) : 0,
            transform: promoted ? `translateY(1.375rem) scale(${scale})` : 'translateY(0.375rem)',
          },
          { opacity: 1, transform: 'none' },
        ],
        { duration, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'both' },
      ));
    }
    return () => logoFade?.cancel();
  }, [line, role, still, shouldAnimate, duration, measure]);

  useEffect(() => {
    const fonts = document.fonts;
    if (!fonts) return undefined;
    const refresh = () => {
      previous.current = measure();
    };
    fonts.addEventListener('loadingdone', refresh);
    return () => fonts.removeEventListener('loadingdone', refresh);
  }, [measure]);

  useEffect(() => () => animRef.current?.cancel(), []);

  return (
    <div ref={rowRef} className="win-lyric-row" data-line={index} data-role={role}>
      <div className="win-lyric-text" ref={textRef} data-preview={role === 'preview' ? 'true' : undefined}>
        <div className="win-lyric-ball" ref={ballRef} aria-hidden="true">
          <RoamMark />
        </div>
        {line.words.map((word, k) => (
          <React.Fragment key={`${word.startMs}:${word.text}`}>
            {k > 0 && ' '}
            <span data-word="" data-sung={k < reached ? 'true' : 'false'}>
              {word.text}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function KaraokeLyrics({ posRef }) {
  const [still, setStill] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const [shown, setShown] = useState({
    reached: 0,
    changedAt: 0,
    leadMs: 0,
    animate: false,
  });
  const [activeHeight, setActiveHeight] = useState(0);
  const [placements] = useState(() => new Map());
  const clockRef = useRef(lyricsFrame(lyricsFile, -Infinity));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setStill(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastTick;
    let lastPosition;
    const tick = () => {
      const now = Date.now();
      const posMs = posRef.current;
      const f = lyricsFrame(lyricsFile, posMs);
      clockRef.current = f;
      const continuous = lastTick !== undefined
        && lastPosition !== undefined
        && now >= lastTick
        && now - lastTick < 250
        && posMs >= lastPosition
        && Math.abs(posMs - lastPosition - (now - lastTick)) < 250;
      lastPosition = posMs;
      lastTick = now;
      setShown((prev) => {
        if (prev.line !== f.line || prev.next !== f.next) {
          const animate = !still
            && continuous
            && (f.line === undefined || prev.line === undefined || f.line === prev.next);
          return {
            line: f.line,
            next: f.next,
            outgoing: animate ? prev.line : undefined,
            reached: f.reached,
            changedAt: now,
            leadMs: f.line === undefined
              ? 0
              : Math.max(0, (lyricsFile.lines[f.line]?.words[0]?.startMs ?? posMs) - posMs),
            animate,
          };
        }
        const outgoing = !still && now - prev.changedAt < EXIT_MS ? prev.outgoing : undefined;
        if (prev.reached === f.reached && prev.outgoing === outgoing) return prev;
        return { ...prev, reached: f.reached, outgoing };
      });
      for (const [index, place] of placements) {
        place(!still && index === f.line ? f.ball : undefined);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [still, placements, posRef]);

  const rows = [];
  if (shown.outgoing !== undefined && shown.outgoing !== shown.line) {
    rows.push({ index: shown.outgoing, role: 'outgoing' });
  }
  if (shown.line !== undefined) rows.push({ index: shown.line, role: 'active' });
  if (shown.next !== undefined) rows.push({ index: shown.next, role: 'preview' });
  const visible = rows.length > 0;

  return (
    <div
      className={`win-lyrics${visible ? ' is-on' : ''}${still ? ' is-still' : ''}`}
      aria-hidden="true"
      data-testid="celebration-lyrics"
    >
      <div className="win-lyric-rows" style={{ height: `calc(${activeHeight}px + 1.375rem)` }}>
        {rows.map(({ index, role }) => {
          const line = lyricsFile.lines[index];
          if (!line) return null;
          return (
            <LyricRow
              key={index}
              line={line}
              index={index}
              role={role}
              reached={role === 'active' ? shown.reached : role === 'outgoing' ? line.words.length : 0}
              still={still}
              animate={shown.animate}
              duration={
                role === 'active'
                  ? Math.max(240, Math.min(TRANSITION_MS, shown.leadMs))
                  : role === 'outgoing'
                    ? shown.line !== undefined && shown.leadMs < 300
                      ? 70
                      : EXIT_MS
                    : TRANSITION_MS
              }
              placements={placements}
              clock={clockRef}
              onHeight={setActiveHeight}
            />
          );
        })}
      </div>
    </div>
  );
}

const PERSON = {
  name: 'Camila Torres',
  video: '/videos/Female/camila_torres.mp4',
  poster: '/videos/Female/camila_torres.png',
};

// Repeated clicks inside 3 seconds raise the bar level and float an avatar
// + emoji ghost. Audio is wonder's celebration catalog
// (roam/client/rewards/celebration/celebrationRoamojis.ts): one variant per
// click, at catalog gain × the default Roamoji volume (0.8).
// 🎁 uses cha-ching1, the only file wonder bound to that emoji (later
// removed from the live bar). ✨ has no reaction sound in wonder.
const ROAMOJI_VOLUME = 0.8;
const BIRTHDAY_ROAMOJIS = [
  {
    emoji: '🎂',
    label: 'Birthday cake',
    files: ['/win/live/fire1.mp3', '/win/live/fire2.mp3', '/win/live/fire3.mp3', '/win/live/fire4.mp3', '/win/live/fire5.mp3'],
    gain: 0.5,
  },
  { emoji: '🎈', label: 'Balloon', files: ['/win/live/balloon1.mp3'], gain: 0.0625 },
  {
    emoji: '🎉',
    label: 'Party popper',
    files: ['/win/live/popper1.mp3', '/win/live/popper2.mp3', '/win/live/popper3.mp3'],
    gain: 0.2,
  },
  { emoji: '🎁', label: 'Gift', files: ['/win/live/cha-ching1.mp3'], gain: 0.15 },
  { emoji: '✨', label: 'Sparkles', files: [], gain: 0 },
];
// Wonder's sing-along, the same file the lyric times were built from.
const BIRTHDAY_SONG = '/win/live/happy-birthday-roam-1min.mp3';
// Office-map headshots. Joe Woodward is the viewer, so his face never rides a reaction.
const ROAMOJI_FACES = [
  '/headshots/derek-cicerone.jpg',
  '/headshots/john-moffa.jpg',
  '/headshots/jon-brod.jpg',
  '/headshots/keegan-lanzillotta.jpg',
  '/headshots/grace-sutherland.jpg',
  '/headshots/michael-walrath.jpg',
  '/headshots/rob-figueiredo.jpg',
  '/headshots/chelsea-turbin.jpg',
  '/headshots/lexi-bohonnon.jpg',
  '/headshots/will-hou.jpg',
  '/headshots/howard-lerman.jpg',
  '/headshots/jeff-grossman.jpg',
  '/headshots/peter-lerman.jpg',
  '/headshots/sean-macisaac.jpg',
  '/headshots/arnav-bansal.jpg',
  '/headshots/aaron-wadhwa.jpg',
  '/headshots/thomas-grapperon.jpg',
  '/headshots/tom-dixon.jpg',
  '/headshots/john-huffsmith.jpg',
  '/headshots/mattias-leino.jpg',
  '/headshots/klas-leino.jpg',
  '/headshots/john-beutner.jpg',
  '/headshots/michael-miller.jpg',
  '/headshots/garima-kewlani.jpg',
  '/headshots/ava-lee.jpg',
];

function pickRoamojiFace(previous) {
  const pool = previous ? ROAMOJI_FACES.filter((src) => src !== previous) : ROAMOJI_FACES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function soundLevelClass(level) {
  if (level >= 4) return 'roamoji-bars-l4';
  if (level >= 3) return 'roamoji-bars-l3';
  if (level >= 2) return 'roamoji-bars-l2';
  if (level >= 1) return 'roamoji-bars-l1';
  return '';
}

function soundShakeClass(level) {
  if (level >= 4) return 'roamoji-sound-shake-red';
  if (level >= 3) return 'roamoji-sound-shake';
  return '';
}

function LiveCard() {
  const posRef = useRef(0);
  const cardRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const [ghosts, setGhosts] = useState([]);
  const [soundLevels, setSoundLevels] = useState({});
  const ghostIdRef = useRef(0);
  const soundClickCounts = useRef({});
  const soundTimers = useRef({});
  const activeAudios = useRef({});
  const variantCursor = useRef({});
  const ghostTimers = useRef([]);
  const lastFaceRef = useRef('');
  const songRef = useRef(null);
  const [songMuted, setSongMuted] = useState(true);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let lastSecond = -1;
    const tick = (now) => {
      const pos = (now - start) % DURATION;
      posRef.current = pos;
      const audio = songRef.current;
      if (audio) {
        const length = Number.isFinite(audio.duration) ? audio.duration : 0;
        const target = length > 0 ? Math.min(pos / 1000, Math.max(0, length - 0.05)) : 0;
        if (length > 0 && !audio.seeking && Math.abs(audio.currentTime - target) > 0.3) {
          try { audio.currentTime = target; } catch { /* element not ready */ }
        }
        if (audio.paused) audio.play().catch(() => {});
      }
      const second = Math.floor(pos / 250);
      if (second !== lastSecond) {
        lastSecond = second;
        setElapsed(pos);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => () => {
    Object.values(soundTimers.current).forEach((timer) => clearTimeout(timer));
    ghostTimers.current.forEach((timer) => clearTimeout(timer));
    Object.values(activeAudios.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    songRef.current?.pause();
  }, []);

  const spawnGhostFromButton = useCallback((emoji, buttonEl) => {
    const root = cardRef.current;
    if (!root || !buttonEl) return;
    const btnRect = buttonEl.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const scaleX = root.offsetWidth ? rootRect.width / root.offsetWidth : 1;
    const scaleY = root.offsetHeight ? rootRect.height / root.offsetHeight : 1;
    const left = (btnRect.left - rootRect.left) / scaleX + btnRect.width / scaleX / 2 - 22;
    const top = (btnRect.top - rootRect.top) / scaleY - 10;
    const id = ghostIdRef.current++;
    const avatar = pickRoamojiFace(lastFaceRef.current);
    lastFaceRef.current = avatar;
    setGhosts((prev) => [...prev, { id, left, top, emoji, avatar }]);
    const timer = setTimeout(() => setGhosts((prev) => prev.filter((ghost) => ghost.id !== id)), 3000);
    ghostTimers.current.push(timer);
  }, []);

  const playRoamoji = useCallback((soundItem, buttonEl) => {
    const key = soundItem.emoji;
    if (!soundClickCounts.current[key]) soundClickCounts.current[key] = 0;
    soundClickCounts.current[key] += 1;
    const clicks = soundClickCounts.current[key];
    const level = clicks <= 3 ? 0 : clicks <= 8 ? 1 : clicks <= 15 ? 2 : 3;
    setSoundLevels((prev) => ({ ...prev, [key]: level }));
    const files = soundItem.files;
    if (files.length > 0) {
      if (activeAudios.current[key]) {
        activeAudios.current[key].pause();
        activeAudios.current[key] = null;
      }
      const index = variantCursor.current[key] || 0;
      variantCursor.current[key] = (index + 1) % files.length;
      const audio = new Audio(files[index]);
      audio.volume = Math.min(1, ROAMOJI_VOLUME * soundItem.gain);
      audio.play().catch(() => {});
      activeAudios.current[key] = audio;
    }
    clearTimeout(soundTimers.current[key]);
    soundTimers.current[key] = setTimeout(() => {
      soundClickCounts.current[key] = 0;
      setSoundLevels((prev) => ({ ...prev, [key]: 0 }));
      activeAudios.current[key] = null;
    }, 3000);
    spawnGhostFromButton(soundItem.emoji, buttonEl);
  }, [spawnGhostFromButton]);

  const toggleSong = useCallback(() => {
    const audio = songRef.current;
    if (!audio) return;
    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setSongMuted(nextMuted);
    if (audio.paused) audio.play().catch(() => {});
  }, []);

  return (
    <aside ref={cardRef} className="win-live" aria-label={`Live celebration for ${PERSON.name}`}>
      <div className="win-live-head">
        <span className="win-live-close" aria-hidden="true">
          <img src="/win/live/dismiss.svg" alt="" width="14" height="14" />
        </span>
        <div className="win-live-who">
          <p>{PERSON.name}</p>
        </div>
        <span className="win-live-close win-live-close-spacer" aria-hidden="true" />
      </div>
      <div className="win-live-stage">
        <video
          src={PERSON.video}
          poster={PERSON.poster}
          autoPlay
          muted
          loop
          playsInline
        />
        <audio ref={songRef} src={BIRTHDAY_SONG} muted preload="auto" />
        <KaraokeLyrics posRef={posRef} />
        <button
          type="button"
          className="unbutton win-live-mute"
          aria-label={songMuted ? 'Unmute' : 'Mute'}
          aria-pressed={!songMuted}
          onClick={toggleSong}
        >
          {songMuted ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3L4.5 5.5H2V10.5H4.5L8 13V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M11 6L14 9M14 6L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3L4.5 5.5H2V10.5H4.5L8 13V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M11 5.5C11.6 6.2 12 7.05 12 8C12 8.95 11.6 9.8 11 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      <div className="win-live-scrub">
        <span>{clock(elapsed)}</span>
        <div className="win-live-track" aria-hidden="true">
          <span style={{ width: `${(elapsed / DURATION) * 100}%` }} />
        </div>
        <span>{clock(DURATION)}</span>
      </div>
      <div className="win-live-amps" role="group" aria-label="Celebration roamojis">
        {BIRTHDAY_ROAMOJIS.map((item) => {
          const level = soundLevels[item.emoji] || 0;
          return (
            <button
              key={item.emoji}
              type="button"
              className={`unbutton win-live-amp ${soundShakeClass(level)}`}
              aria-label={item.label}
              onClick={(event) => playRoamoji(item, event.currentTarget)}
            >
              <span className={`roamoji-sound-bars ${soundLevelClass(level)}`} aria-hidden="true">
                {Array.from({ length: 16 }, (_, index) => (
                  <span key={index} className="roamoji-sound-bar" />
                ))}
              </span>
              <span className="win-live-emoji">{item.emoji}</span>
            </button>
          );
        })}
      </div>
      {ghosts.map((ghost) => (
        <div key={ghost.id} className="theater-win-ghost" style={{ left: ghost.left, top: ghost.top }}>
          <img src={ghost.avatar} alt="" className="theater-win-ghost-avatar" />
          <div className="theater-win-ghost-emoji">{ghost.emoji}</div>
        </div>
      ))}
    </aside>
  );
}

export function LiveCelebrationVisual() {
  const wrapRef = useRef(null);
  const [host, setHost] = useState(null);
  const [pageTheme, setPageTheme] = useState(() => (
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'dark' : 'dark'
  ));

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const obs = new MutationObserver(() => {
      setPageTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const find = () => {
      const el = wrapRef.current?.querySelector('.miniRoamOS .sc-window');
      if (el) setHost(el);
      else raf = requestAnimationFrame(find);
    };
    find();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className="fp-map-preview">
      <ShowcaseMap embedded initialFloor="R&D" theme={pageTheme} birthdayEnabled={false} />
      {host && ReactDOM.createPortal(
        <>
          <div className="win-live-overlay" aria-hidden="true" />
          <LiveCard />
        </>,
        host,
      )}
    </div>
  );
}
