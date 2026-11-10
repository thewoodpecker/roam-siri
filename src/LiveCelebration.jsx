import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseMap from './ShowcaseMap';
import lyricsFile from './liveCelebrationLyrics.json';
import './LiveCelebration.css';

// Sing-along ported from wonder/roam/client/rewards/celebration/LyricsBar.tsx
// and helpers/lyrics.ts: a Roam mark hops the current line, sung words turn
// flame, and the next line waits underneath. Times are the built-in
// happy-birthday lyrics (roam/audio/rewards/happy-birthday-roam-1min.lyrics.json).

const LINES = lyricsFile.lines;
const LEAD_MS = 1500;
const HOLD_MS = 1500;
const PREVIEW_GAP_MS = 3000;
const FLAME = '#F3B33D';

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

const smoothStep = (value) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

function frameAt(posMs) {
  const i = WINDOWS.findIndex((w) => posMs >= w.from && posMs < w.until);
  if (i < 0) return { line: undefined, next: undefined, reached: 0, from: 0, to: 0, t: 1 };
  const line = LINES[i];
  const following = LINES[i + 1];
  const next = following && following.words[0].startMs - WINDOWS[i].end <= PREVIEW_GAP_MS ? i + 1 : undefined;
  const reached = line.words.filter((word) => word.startMs <= posMs).length;
  if (reached === 0) return { line: i, next, reached, from: -1, to: -1, t: 1 };
  const from = reached - 1;
  const word = line.words[from];
  const upcoming = line.words[from + 1];
  if (!word || !upcoming) return { line: i, next, reached, from, to: from, t: 1 };
  const interval = upcoming.startMs - word.startMs;
  const hop = Math.min(interval, Math.max(450, Math.min(700, interval * 0.75)));
  if (hop > 0 && posMs > upcoming.startMs - hop) {
    return {
      line: i,
      next,
      reached,
      from,
      to: from + 1,
      t: smoothStep((posMs - (upcoming.startMs - hop)) / hop),
    };
  }
  return { line: i, next, reached, from, to: from, t: 1 };
}

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

function LyricLine({ line, role, reached, still, ballRef, onMeasure }) {
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || role !== 'active') return undefined;
    const fit = () => {
      el.style.fontSize = '';
      el.style.whiteSpace = 'nowrap';
      const base = Number.parseFloat(getComputedStyle(el).fontSize);
      const words = [...el.querySelectorAll('[data-word]')];
      const first = words[0];
      const last = words[words.length - 1];
      const natural = first && last ? last.offsetLeft + last.offsetWidth - first.offsetLeft : 0;
      const available = Math.max(0, el.clientWidth - 2);
      const scale = natural > available ? Math.max(0.85, available / natural) : 1;
      el.style.fontSize = `${base * scale}px`;
      el.style.whiteSpace = '';
      onMeasure(el.offsetHeight, words.map((word) => ({
        x: word.offsetLeft + word.offsetWidth / 2,
        y: word.offsetTop,
        left: word.offsetLeft,
        height: word.offsetHeight,
      })));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [line, role, onMeasure]);

  return (
    <div className={`win-lyric-row${still ? ' is-still' : ''}`} data-role={role}>
      <div className="win-lyric-text" ref={textRef} data-preview={role === 'preview' ? 'true' : undefined}>
        {role === 'active' && (
          <div className="win-lyric-ball" ref={ballRef} aria-hidden="true">
            <RoamMark />
          </div>
        )}
        {line.words.map((word, index) => (
          <React.Fragment key={`${word.startMs}:${word.text}`}>
            {index > 0 && ' '}
            <span data-word="" data-sung={role === 'active' && index < reached ? 'true' : undefined}>
              {word.text}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function KaraokeLyrics({ posRef }) {
  const ballRef = useRef(null);
  const geometry = useRef([]);
  const frameRef = useRef(frameAt(-1));
  const [shown, setShown] = useState(() => frameAt(0));
  const [rowHeight, setRowHeight] = useState(16);
  const still = useRef(false);

  useEffect(() => {
    still.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const onMeasure = useRef(() => {});
  onMeasure.current = (height, nextGeometry) => {
    geometry.current = nextGeometry;
    setRowHeight((current) => (Math.abs(current - height) < 1 ? current : height));
  };

  useEffect(() => {
    let raf = 0;
    let lastKey = '';
    const place = () => {
      const el = ballRef.current;
      const frame = frameRef.current;
      const words = geometry.current;
      if (!el) return;
      const at = (index) => {
        const word = words[Math.max(0, index)];
        if (!word) return null;
        if (index < 0) return { x: word.left - word.height / 2, y: word.y };
        return word;
      };
      const a = at(frame.from);
      const b = at(frame.to);
      if (frame.line === undefined || !a || !b || still.current && frame.from !== frame.to) {
        el.style.opacity = frame.line === undefined || !a ? '0' : '1';
        if (a && still.current) {
          el.style.transform = `translate(calc(${a.x}px - 50%), calc(${a.y}px - 100% - 0.125rem))`;
        }
        return;
      }
      const t = frame.t;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const lift = frame.from === frame.to ? 0 : Math.sin(Math.PI * t) * 0.4;
      el.style.opacity = '1';
      el.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 100% - 0.125rem - ${lift}rem))`;
    };
    const tick = () => {
      const frame = frameAt(posRef.current);
      frameRef.current = frame;
      const key = `${frame.line ?? 'x'}:${frame.next ?? 'x'}:${frame.reached}`;
      if (key !== lastKey) {
        lastKey = key;
        setShown(frame);
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [posRef]);

  const rows = [];
  if (shown.line !== undefined) rows.push({ index: shown.line, role: 'active' });
  if (shown.next !== undefined) rows.push({ index: shown.next, role: 'preview' });
  const visible = rows.length > 0;

  return (
    <div className={`win-lyrics${visible ? ' is-on' : ''}${still.current ? ' is-still' : ''}`} aria-hidden="true">
      <div className="win-lyric-rows" style={{ height: visible ? rowHeight + (shown.next !== undefined ? 16 : 0) : 0 }}>
        {rows.map(({ index, role }) => (
          <LyricLine
            key={`${role}-${index}`}
            line={LINES[index]}
            role={role}
            reached={role === 'active' ? shown.reached : 0}
            still={still.current}
            ballRef={ballRef}
            onMeasure={(height, nextGeometry) => onMeasure.current(height, nextGeometry)}
          />
        ))}
      </div>
    </div>
  );
}

const PERSON = {
  name: 'Camila Torres',
  video: '/videos/Female/camila_torres.mp4',
  poster: '/videos/Female/camila_torres.png',
};

// Theater sound roamojis (TheaterWindow): repeated clicks inside 3 seconds
// raise the level, play that level's sound, and float an avatar + emoji
// ghost up from the button. These three are the birthday set.
const BIRTHDAY_ROAMOJIS = [
  { emoji: '🎂', label: 'Birthday cake', levels: ['/audio/fire.mp3'] },
  { emoji: '🎈', label: 'Balloon', levels: ['/win/live/balloon.mp3'] },
  { emoji: '🎉', label: 'Party popper', levels: ['/win/live/popper1.mp3', '/win/live/popper2.mp3', '/win/live/popper3.mp3'] },
];
const SENDER_AVATAR = '/headshots/joe-woodward.jpg';

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
  const ghostTimers = useRef([]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let lastSecond = -1;
    const tick = (now) => {
      const pos = (now - start) % DURATION;
      posRef.current = pos;
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
    setGhosts((prev) => [...prev, { id, left, top, emoji }]);
    const timer = setTimeout(() => setGhosts((prev) => prev.filter((ghost) => ghost.id !== id)), 3000);
    ghostTimers.current.push(timer);
  }, []);

  const playRoamoji = useCallback((soundItem, buttonEl) => {
    const key = soundItem.emoji;
    if (!soundClickCounts.current[key]) soundClickCounts.current[key] = 0;
    soundClickCounts.current[key] += 1;
    const clicks = soundClickCounts.current[key];
    const level = clicks <= 3 ? 0 : clicks <= 8 ? 1 : clicks <= 15 ? 2 : 3;
    const clampedLevel = Math.min(level, soundItem.levels.length - 1);
    setSoundLevels((prev) => ({ ...prev, [key]: level }));
    if (activeAudios.current[key]) {
      activeAudios.current[key].pause();
      activeAudios.current[key] = null;
    }
    const audio = new Audio(soundItem.levels[clampedLevel]);
    audio.volume = 0.3 + level * 0.15;
    audio.play().catch(() => {});
    activeAudios.current[key] = audio;
    clearTimeout(soundTimers.current[key]);
    soundTimers.current[key] = setTimeout(() => {
      soundClickCounts.current[key] = 0;
      setSoundLevels((prev) => ({ ...prev, [key]: 0 }));
      activeAudios.current[key] = null;
    }, 3000);
    spawnGhostFromButton(soundItem.emoji, buttonEl);
  }, [spawnGhostFromButton]);

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
        <KaraokeLyrics posRef={posRef} />
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
          <img src={SENDER_AVATAR} alt="" className="theater-win-ghost-avatar" />
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
      {host && ReactDOM.createPortal(<LiveCard />, host)}
    </div>
  );
}
