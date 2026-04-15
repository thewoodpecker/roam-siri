import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MeetingWindow.css';
import './TheaterWindow.css';

const ROAMOJIS = ['🤣', '🔥', '👏', '👍', '🍿', '🎉', '🚀', '😍', '💯'];

const SOUND_ROAMOJIS = [
  { emoji: '👏', label: 'Clap', levels: ['/audio/clap.mp3', '/audio/clap2.mp3', '/audio/clap3.mp3', '/audio/clap4.mp3'] },
  { emoji: '😂', label: 'Laugh', levels: ['/audio/laugh1.mp3', '/audio/laugh2.mp3', '/audio/laugh3.mp3', '/audio/laugh4.mp3'] },
  { emoji: '🥁', label: 'Drum', levels: ['/audio/drum.mp3'] },
  { emoji: '🔥', label: 'Fire', levels: ['/audio/fire.mp3'] },
];

function SoundButton({ emoji, level, onClick }) {
  const bars = 16;
  const levelClass = level <= 0 ? '' : level <= 1 ? 'roamoji-bars-l1' : level <= 2 ? 'roamoji-bars-l2' : 'roamoji-bars-l3';
  return (
    <button className={`roamoji-sound-btn ${level > 0 ? 'roamoji-sound-active' : ''}`} onClick={onClick}>
      <span className="roamoji-sound-emoji">{emoji}</span>
      <div className={`roamoji-sound-bars ${levelClass}`}>
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} className="roamoji-sound-bar" />
        ))}
      </div>
    </button>
  );
}

const WOMEN_KEYS = ['Grace', 'Chelsea', 'Lexi', 'Garima', 'Ava'];
const NO_VIDEO_KEYS = ['Tom'];

// Build a 4x5 grid of benches; each bench holds 5 slots with some empty.
// Pattern describes which slot indices in each bench are filled (0-4).
const BENCH_PATTERNS = [
  [0, 3, 4],
  [0, 2],
  [0, 1, 2, 4],
  [0, 4],
  [1, 2, 3],
  [1, 3],
  [2],
  [0, 1, 3, 4],
  [0, 2, 4],
  [0, 1, 3],
  [0, 3, 4],
  [2, 3, 4],
  [0, 4],
  [1, 2, 3],
  [0, 2, 4],
  [0, 2, 3],
  [0],
  [2, 3],
  [1, 3, 4],
  [0, 4],
  [1, 2],
];

const BENCH_ROWS = 3;

export default function TheaterWindow({ win, onDrag, speakers = [], audience = [], me, onOpenChat }) {
  const [closing, setClosing] = useState(false);
  const [roamojiOpen, setRoamojiOpen] = useState(true);
  const [roamojiClosing, setRoamojiClosing] = useState(false);
  const [ghosts, setGhosts] = useState([]);
  const ghostIdRef = useRef(0);
  const audienceRef = useRef(null);
  const rootRef = useRef(null);
  const [audienceCols, setAudienceCols] = useState(5);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      // available = width minus small horizontal padding; each bench = 144 + 8 gap
      const available = w - 16;
      const cols = Math.max(3, Math.min(7, Math.floor((available + 8) / 152)));
      setAudienceCols(cols);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [soundLevels, setSoundLevels] = useState({});
  const soundClickCounts = useRef({});
  const soundTimers = useRef({});
  const activeAudios = useRef({});

  useEffect(() => () => {
    Object.values(soundTimers.current).forEach(t => clearTimeout(t));
    Object.values(activeAudios.current).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
  }, []);

  // Flatten audience into bench slots — cols × 3 rows
  const benchCount = audienceCols * BENCH_ROWS;
  const benches = Array.from({ length: benchCount }, (_, benchIdx) => {
    const filledSlots = BENCH_PATTERNS[benchIdx % BENCH_PATTERNS.length];
    const slots = Array(5).fill(null);
    filledSlots.forEach((slotIdx, i) => {
      const personIdx = (benchIdx * 3 + i) % (audience.length || 1);
      slots[slotIdx] = audience[personIdx] || null;
    });
    return slots;
  });

  const allAudience = benches.flatMap((b, bi) => b.map((p, si) => p ? { person: p, benchIdx: bi, slotIdx: si } : null).filter(Boolean));
  const allAudienceRef = useRef(allAudience);
  allAudienceRef.current = allAudience;

  const spawnGhostFromAudience = useCallback((emoji) => {
    const pool = allAudienceRef.current;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const cols = audienceCols;
    const col = pick.benchIdx % cols;
    const row = Math.floor(pick.benchIdx / cols);
    const left = col * 152 + pick.slotIdx * 22 + 4;
    const top = row * 44 - 14;
    const id = ghostIdRef.current++;
    setGhosts(prev => [...prev, { id, left, top, avatar: pick.person.avatar, emoji }]);
    setTimeout(() => setGhosts(prev => prev.filter(g => g.id !== id)), 3000);
  }, [audienceCols]);

  const spawnGhostFromButton = useCallback((emoji, buttonEl) => {
    if (!buttonEl || !audienceRef.current) {
      spawnGhostFromAudience(emoji);
      return;
    }
    const btnRect = buttonEl.getBoundingClientRect();
    const audRect = audienceRef.current.getBoundingClientRect();
    const left = btnRect.left - audRect.left + btnRect.width / 2 - 22;
    const top = btnRect.top - audRect.top - 10;
    const avatar = me?.avatar || allAudienceRef.current[0]?.person?.avatar;
    const id = ghostIdRef.current++;
    setGhosts(prev => [...prev, { id, left, top, avatar, emoji }]);
    setTimeout(() => setGhosts(prev => prev.filter(g => g.id !== id)), 3000);
  }, [me, spawnGhostFromAudience]);

  const playSound = useCallback((soundItem, buttonEl) => {
    const key = soundItem.emoji;
    if (!soundClickCounts.current[key]) soundClickCounts.current[key] = 0;
    soundClickCounts.current[key]++;
    const clicks = soundClickCounts.current[key];
    const level = clicks <= 3 ? 0 : clicks <= 8 ? 1 : clicks <= 15 ? 2 : 3;
    const clampedLevel = Math.min(level, soundItem.levels.length - 1);
    setSoundLevels(prev => ({ ...prev, [key]: level }));
    if (activeAudios.current[key]) { activeAudios.current[key].pause(); activeAudios.current[key] = null; }
    const audio = new Audio(soundItem.levels[clampedLevel]);
    audio.volume = 0.3 + level * 0.15;
    audio.play().catch(() => {});
    activeAudios.current[key] = audio;
    clearTimeout(soundTimers.current[key]);
    soundTimers.current[key] = setTimeout(() => {
      soundClickCounts.current[key] = 0;
      setSoundLevels(prev => ({ ...prev, [key]: 0 }));
      activeAudios.current[key] = null;
    }, 3000);
    spawnGhostFromButton(soundItem.emoji, buttonEl);
  }, [spawnGhostFromButton]);

  // Auto-reactions from random audience members
  useEffect(() => {
    if (!allAudience.length) return;
    let timers = [];
    const schedule = () => {
      const delay = 800 + Math.random() * 2200;
      const t = setTimeout(() => {
        const burst = Math.random() < 0.5 ? 1 : 2 + Math.floor(Math.random() * 3);
        const emoji = Math.random() < 0.7 ? '👏' : ROAMOJIS[Math.floor(Math.random() * ROAMOJIS.length)];
        for (let b = 0; b < burst; b++) {
          const bt = setTimeout(() => spawnGhostFromAudience(emoji), b * 140);
          timers.push(bt);
        }
        schedule();
      }, delay);
      timers.push(t);
    };
    schedule();
    return () => timers.forEach(t => clearTimeout(t));
  }, [allAudience.length, spawnGhostFromAudience]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  // Stage speakers only — no padding from audience
  const stageTiles = speakers.slice(0, 3);
  const videoFor = (person) => {
    const name = person.fullName || person.name || '';
    if (NO_VIDEO_KEYS.some(k => name.includes(k))) return null;
    const isWoman = WOMEN_KEYS.some(w => name.includes(w));
    return isWoman ? '/meeting-room/woman-01.mp4' : '/meeting-room/man-01.mp4';
  };

  const pos = win.position || { x: 70, y: 220 };
  return (
    <div
      ref={rootRef}
      className={`theater-win meeting-win ${!win.isFocused ? 'theater-win-unfocused meeting-win-unfocused' : ''} ${closing ? 'theater-win-closing' : ''}`}
      style={{ left: pos.x, top: pos.y, zIndex: win.zIndex ?? 30, width: 780, height: 580 }}
      onMouseDown={() => win.focus()}
    >
      {/* Header */}
      <div className="meeting-win-header" onMouseDown={onDrag}>
        <div className="meeting-win-lights">
          <div className="meeting-win-light meeting-win-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="meeting-win-light meeting-win-light-min" />
          <div className="meeting-win-light meeting-win-light-max" />
        </div>
        <div className="meeting-win-header-center">
          <span className="meeting-win-title">Theater</span>
        </div>
      </div>

      {/* Body */}
      <div className="theater-win-body">
        {/* Stage — 3 video tiles */}
        <div className="theater-win-stage">
          {stageTiles.map((person, i) => {
            const videoSrc = videoFor(person);
            return (
              <div key={(person.name || 'x') + i} className="theater-win-tile">
                {videoSrc ? (
                  <video src={videoSrc} autoPlay loop muted playsInline />
                ) : (
                  <img src={person.avatar} alt="" className="theater-win-tile-avatar" />
                )}
                <div className="theater-win-tile-name">
                  <span>{person.fullName || person.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons — aligned to audience width */}
        <div className="theater-win-actions">
          <div className="theater-win-actions-inner" style={{ width: audienceCols * 144 + (audienceCols - 1) * 8 }}>
            <button className="theater-win-action-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.4341 14.748C11.5711 14.5082 11.4878 14.2028 11.2481 14.0658C8.71284 12.6171 8.5 9.99779 8.5 7.99996L8.50004 2.7071L11.1464 5.35352C11.3417 5.54879 11.6583 5.54879 11.8536 5.35353C12.0488 5.15827 12.0488 4.84169 11.8536 4.64643L8.35361 1.14645C8.25984 1.05268 8.13266 1 8.00005 0.999999C7.86744 0.999998 7.74027 1.05268 7.6465 1.14644L4.14645 4.64642C3.95119 4.84168 3.95118 5.15826 4.14644 5.35352C4.34171 5.54879 4.65829 5.54879 4.85355 5.35353L7.50004 2.70709L7.5 7.99996C7.5 10.0021 7.68716 13.1827 10.7519 14.934C10.9917 15.071 11.2971 14.9877 11.4341 14.748Z" fill="currentColor"/></svg>
              <span>To Backstage</span>
            </button>
            <button className="theater-win-action-btn">
              <span>Ask a Question</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2, opacity: 0.6 }}><path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* Audience */}
        <div className="theater-win-audience-wrap">
          <div className="theater-win-audience" ref={audienceRef} style={{ gridTemplateColumns: `repeat(${audienceCols}, 144px)` }}>
            {benches.map((slots, benchIdx) => {
              const hasMe = me && benchIdx === 0;
              return (
                <div key={benchIdx} className={`theater-win-bench ${hasMe ? 'theater-win-bench-me' : ''}`}>
                  {slots.map((person, slotIdx) => {
                    // Swap first slot of first bench with `me` so the "you" border card shows your avatar
                    const show = hasMe && slotIdx === 0 ? me : person;
                    return (
                      <div key={slotIdx} className={`theater-win-bench-slot ${!show ? 'theater-win-bench-empty' : ''}`}>
                        {show && <img src={show.avatar} alt="" />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Floating reaction pills */}
            {ghosts.map(g => (
              <div key={g.id} className="theater-win-ghost" style={{ left: g.left, top: g.top }}>
                <img src={g.avatar} alt="" className="theater-win-ghost-avatar" />
                <div className="theater-win-ghost-emoji">{g.emoji}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reactions bar — always mounted, animates via max-height */}
        <div className={`roamoji-bar theater-win-roamoji ${roamojiOpen ? '' : 'theater-win-roamoji-closed'}`}>
          {SOUND_ROAMOJIS.map(s => (
            <SoundButton key={s.label} emoji={s.emoji} level={soundLevels[s.emoji] || 0} onClick={(e) => playSound(s, e.currentTarget)} />
          ))}
          <div className="roamoji-divider" />
          {ROAMOJIS.map((emoji, i) => (
            <button key={emoji + i} className="roamoji-btn" onClick={(e) => spawnGhostFromButton(emoji, e.currentTarget)}>
              {emoji}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="theater-win-toolbar-wrap">
          <div className="meeting-win-toolbar">
            {/* Left — chat button */}
            <div className="theater-win-avatar-btn" onClick={onOpenChat}>
              <img src="/icons/chat.svg" alt="" />
            </div>

            {/* Center pill group */}
            <div className="meeting-win-pill-group">
              <div className={`meeting-win-pill ${roamojiOpen ? 'meeting-win-pill-active' : ''}`} onClick={() => setRoamojiOpen(o => !o)}><img src="/icons/emoji.svg" alt="" /></div>
              <div className="meeting-win-pill meeting-win-pill-muted"><img src="/icons/microphone.svg" alt="" /></div>
              <div className="meeting-win-pill"><img src="/icons/magic-quill.svg" alt="" /></div>
              <div className="meeting-win-pill meeting-win-pill-leave" onClick={handleClose}><img src="/icons/door.svg" alt="" /></div>
            </div>

            {/* Right pill group */}
            <div className="meeting-win-toolbar-right">
              <div className="meeting-win-pill-group">
                <div className="meeting-win-pill"><img src="/icons/meeting-chat.svg" alt="" /></div>
                <div className="meeting-win-pill"><img src="/icons/floors.svg" alt="" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
