import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ShareDialog from './ShareDialog';
import { TileGestures } from './Gestures';
import './Gestures.css';
import './MeetingWindow.css';

function LiveCaptions({ script }) {
  const [entries, setEntries] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let frame;
    let lineIndex = 0;
    let charsTyped = 0;
    let lineStarted = false;
    let phaseStart = performance.now();
    const CHARS_PER_SECOND = 32;
    const PAUSE_BETWEEN_LINES = 700;
    const RESTART_PAUSE = 1500;
    let local = [];

    const commit = () => {
      if (!cancelled) setEntries(local.slice());
    };

    const tick = () => {
      if (cancelled) return;
      const now = performance.now();

      if (lineIndex >= script.length) {
        if (now - phaseStart >= RESTART_PAUSE) {
          // Loop back to the start of the script, but keep all existing
          // entries — new captions will continue appending to the bottom.
          lineIndex = 0;
          charsTyped = 0;
          lineStarted = false;
          phaseStart = now;
        }
        frame = requestAnimationFrame(tick);
        return;
      }

      const line = script[lineIndex];

      // Inter-line pause after completing the current line.
      if (lineStarted && charsTyped >= line.text.length) {
        if (now - phaseStart >= PAUSE_BETWEEN_LINES) {
          lineIndex += 1;
          charsTyped = 0;
          lineStarted = false;
          phaseStart = now;
        }
        frame = requestAnimationFrame(tick);
        return;
      }

      // Append a fresh entry exactly once per line.
      if (!lineStarted) {
        local.push({ name: line.name, avatar: line.avatar, partial: '' });
        lineStarted = true;
        phaseStart = now;
      }

      const elapsed = now - phaseStart;
      const targetChars = Math.min(line.text.length, Math.floor(elapsed * CHARS_PER_SECOND / 1000));
      if (targetChars !== charsTyped) {
        charsTyped = targetChars;
        const last = local[local.length - 1];
        local[local.length - 1] = { ...last, partial: line.text.slice(0, charsTyped) };
        commit();
      }

      if (charsTyped >= line.text.length) {
        // Switch into pause phase; phaseStart resets so the pause is measured
        // from the moment the line completed.
        phaseStart = now;
      }

      frame = requestAnimationFrame(tick);
    };

    setEntries([]);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [script]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="meeting-win-captions" ref={scrollRef}>
      {entries.map((e, i) => (
        <div key={i} className="meeting-win-caption-row">
          <img className="meeting-win-caption-avatar" src={e.avatar} alt="" />
          <div className="meeting-win-caption-text">
            <div className="meeting-win-caption-name">{e.name}</div>
            <div className="meeting-win-caption-body">{e.partial}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ROAMOJIS = ['🤣', '🔥', '👏', '👍', '🍿', '🎉', '🚀', '😍', '💯'];

const SOUND_ROAMOJIS = [
  { emoji: '👏', label: 'Clap', levels: ['/audio/clap.mp3', '/audio/clap2.mp3', '/audio/clap3.mp3', '/audio/clap4.mp3'] },
  { emoji: '😂', label: 'Laugh', levels: ['/audio/laugh1.mp3', '/audio/laugh2.mp3', '/audio/laugh3.mp3', '/audio/laugh4.mp3'] },
  { emoji: '🥁', label: 'Drum', levels: ['/audio/drum.mp3'] },
  { emoji: '🔥', label: 'Fire', levels: ['/audio/fire.mp3'] },
];

function SoundButton({ emoji, level, onClick }) {
  const bars = 16;
  const levelClass =
    level >= 4 ? 'roamoji-bars-l4' :
    level >= 3 ? 'roamoji-bars-l3' :
    level >= 2 ? 'roamoji-bars-l2' :
    level >= 1 ? 'roamoji-bars-l1' : '';
  const shakeClass = level >= 4 ? 'roamoji-sound-shake-red' : level >= 3 ? 'roamoji-sound-shake' : '';
  return (
    <button className={`roamoji-sound-btn ${level > 0 ? 'roamoji-sound-active' : ''} ${shakeClass}`} onClick={onClick}>
      <span className="roamoji-sound-emoji">{emoji}</span>
      <div className={`roamoji-sound-bars ${levelClass}`}>
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} className="roamoji-sound-bar" />
        ))}
      </div>
    </button>
  );
}

function RoamojiGhost({ emoji, avatar, id, onDone, startX }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="roamoji-ghost"
      style={{ left: startX }}
    >
      <img src={avatar} alt="" className="roamoji-ghost-avatar" />
      <span className="roamoji-ghost-emoji">{emoji}</span>
    </div>
  );
}

const STOCK_VIDEOS = [
  '/videos/Female/ashley_brooks.mp4',
  '/videos/Female/emily_carter.mp4',
  '/videos/Female/grace_thompson.mp4',
  '/videos/Female/hannah_bennett.mp4',
  '/videos/Female/jessica_hall.mp4',
  '/videos/Female/olivia_sanders.mp4',
  '/videos/Male/daniel_russell.mp4',
  '/videos/Male/ethan_bishop.mp4',
];

const VIEW_ICONS = {
  dynamic: <img src="/icons/sparkle-double.svg" alt="" className="meeting-win-view-svg" />,
  gallery: <img src="/icons/gallery.svg" alt="" className="meeting-win-view-svg" />,
  speaker: <img src="/icons/active-speaker.svg" alt="" className="meeting-win-view-svg" />,
};

const VIEW_MODES = [
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'speaker', label: 'Active Speaker' },
];

const MM_INITIAL_RECAP = (
  <>
    <p>Welcome back, Joe — here’s what you missed in the last 18 minutes:</p>
    <ul>
      <li><strong>Decision:</strong> Magic Minutes ships GA on Friday with EU residency on day one. Howard signed off on the Frankfurt region spend live.</li>
      <li><strong>Action items so far:</strong> Lexi is provisioning the EU bucket by Thursday. Chelsea is locking the launch checklist. Grace is closing the legal review on Stop &amp; Shred.</li>
      <li><strong>Open question:</strong> auto-assign action items vs. suggestions — Howard called it: auto-assign with a one-click undo.</li>
      <li><strong>Right now:</strong> the team is walking through the launch-day comms plan. Chelsea has the floor.</li>
    </ul>
  </>
);

const MM_RECAP_RESPONSES = [
  (
    <>
      <p>Last minute recap:</p>
      <ul>
        <li>Chelsea walked through the launch-day comms plan — Tuesday teaser, Friday GA tweet, Sunday customer email.</li>
        <li>Howard added that he’ll personally ping the top 10 enterprise accounts the night before launch.</li>
        <li>Lexi flagged a tail-latency spike on the EU prefill path — being chased now, not a launch blocker.</li>
      </ul>
    </>
  ),
  (
    <>
      <p>Quick recap of the last 60 seconds:</p>
      <ul>
        <li>Grace confirmed legal sign-off on the Stop &amp; Shred docs — they’ll publish alongside GA.</li>
        <li>Chelsea proposed defaulting the auto-summary template to “Stand-Up” for any room called *standup* — the team agreed.</li>
        <li>Howard asked engineering to lock the launch checklist in #magic-minutes-launch by EOD Wednesday.</li>
      </ul>
    </>
  ),
  (
    <>
      <p>Here’s the last minute:</p>
      <ul>
        <li>Lexi reported the on-device Whisper pipeline is hitting 2.4× throughput on the M4 Max with the Medusa draft.</li>
        <li>Open question on tokenizer alignment between draft + target — John Beutner taking it.</li>
        <li>Chelsea closing the @MagicMinutes prompt-UI spec right now and posting it after standup.</li>
      </ul>
    </>
  ),
];

const MM_PROMPT_RESPONSES = [
  "Two commitments came up: Lexi will provision the EU bucket by Thursday, and Chelsea will lock the GA launch checklist by EOD Wednesday.",
  "The team agreed to default confidential messages to a 24-hour TTL for launch — Howard wants it opinionated; they’ll revisit if customers push back.",
  "Howard approved the Frankfurt region spend in #ops a few minutes ago, so EU residency is officially day-one for the GA.",
  "Grace finished the privacy review with legal on Stop &amp; Shred — the docs publish alongside GA on Friday.",
  "On the inference side: Medusa-style draft heads picked over the linear draft, with 8-token KV-cache pages so tree pruning doesn’t fragment memory bandwidth.",
];

function MagicMinutesCatchUpPanel() {
  const [messages, setMessages] = useState(() => [
    { id: 'init', from: 'mm', content: MM_INITIAL_RECAP },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const idRef = useRef(2);
  const recapIdxRef = useRef(0);
  const promptIdxRef = useRef(0);
  const bodyRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, thinking]);

  const respond = (content) => {
    setThinking(true);
    const t = setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [...prev, { id: `mm-${idRef.current++}`, from: 'mm', content }]);
    }, 700);
    timersRef.current.push(t);
  };

  const sendUserMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: `me-${idRef.current++}`, from: 'me', content: trimmed }]);
    setInput('');
    const reply = MM_PROMPT_RESPONSES[promptIdxRef.current % MM_PROMPT_RESPONSES.length];
    promptIdxRef.current += 1;
    respond(reply);
  };

  const onRecap = () => {
    setMessages((prev) => [...prev, { id: `me-${idRef.current++}`, from: 'me', content: 'Recap the last minute' }]);
    const reply = MM_RECAP_RESPONSES[recapIdxRef.current % MM_RECAP_RESPONSES.length];
    recapIdxRef.current += 1;
    respond(reply);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendUserMessage(input);
    }
  };

  return (
    <div className="meeting-win-mm-panel">
      <div className="meeting-win-mm-header">
        <button type="button" className="meeting-win-mm-dismiss" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="meeting-win-mm-titles">
          <div className="meeting-win-mm-title">Magic Minutes</div>
          <div className="meeting-win-mm-subtitle">Catch Up</div>
        </div>
        <span aria-hidden="true" />
      </div>

      <div className="meeting-win-mm-body" ref={bodyRef}>
        {messages.map((m) => (
          m.from === 'mm' ? (
            <div key={m.id} className="meeting-win-mm-msg">
              <div className="meeting-win-mm-msg-avatar">
                <img src="/icons/magic-quill.svg" alt="" />
              </div>
              <div className="meeting-win-mm-msg-bubble">
                {typeof m.content === 'string' ? <p>{m.content}</p> : m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="meeting-win-mm-msg meeting-win-mm-msg-self">
              <div className="meeting-win-mm-msg-bubble meeting-win-mm-msg-bubble-self">
                <p>{m.content}</p>
              </div>
            </div>
          )
        ))}

        <div className="meeting-win-mm-privacy">Only you can see this</div>
      </div>

      <div className="meeting-win-mm-suggestions">
        <button type="button" className="meeting-win-mm-suggestion" onClick={onRecap}>
          <span className="meeting-win-mm-suggestion-icon" aria-hidden="true">↻</span>
          <span>Recap the last minute</span>
        </button>
      </div>

      <div className="meeting-win-mm-composer">
        {thinking && (
          <div className="meeting-win-mm-typing-indicator">
            <span className="meeting-win-mm-typing-face">
              <img src="/icons/magic-quill.svg" alt="" />
            </span>
            <div className="meeting-win-mm-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
        <input
          type="text"
          className="meeting-win-mm-composer-field"
          placeholder="Ask about this meeting…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className={`meeting-win-mm-composer-send ${input.trim() ? 'meeting-win-mm-composer-send-active' : ''}`}
          aria-label="Send"
          onClick={() => sendUserMessage(input)}
        >
          <img src="/icons/mm-send-btn.svg" alt="" width="16" height="16" />
        </button>
      </div>
    </div>
  );
}

export default function MeetingWindow({ win, onDrag, roomName, people: allPeople, onOpenChat, onOpenOnAir, onOpenMagicMinutes, locked, autoReactions = true, handsRaised = false, onClickHands, roamojiOpen: roamojiInitialOpen = true, gesturesEnabled = true, incomingGesturesEnabled = false, captionsScript, initialViewMode = 'gallery', initialViewMenuOpen = false, compact = false, mmCatchUp = false, lockViewMode = false }) {
  const people = useMemo(() => (allPeople || []).filter(p => p && (p.video || p.avatar)), [allPeople]);
  const [closing, setClosing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [viewMenuOpen, setViewMenuOpen] = useState(initialViewMenuOpen);
  const viewMenuRef = useRef(null);
  const [roamojiOpen, setRoamojiOpen] = useState(roamojiInitialOpen);
  const [roamojiClosing, setRoamojiClosing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [ghosts, setGhosts] = useState([]);
  const ghostIdRef = useRef(0);

  const [soundLevels, setSoundLevels] = useState({});
  const soundClickCounts = useRef({});
  const soundTimers = useRef({});
  const activeAudios = useRef({});

  // Cleanup activeAudios and soundTimers on unmount
  useEffect(() => {
    return () => {
      Object.values(soundTimers.current).forEach(t => clearTimeout(t));
      Object.values(activeAudios.current).forEach(a => {
        if (a) { a.pause(); a.currentTime = 0; }
      });
    };
  }, []);

  // Simulated incoming gestures — once the meeting scrolls into view, a tile
  // periodically sends a gesture *to me* so the user can practice reciprocating.
  // Cycles through people and gestures so each round is different.
  const [incomingByTile, setIncomingByTile] = useState({});
  const incomingActiveRef = useRef(false);
  const winRef = useRef(null);
  const [inView, setInView] = useState(false);
  const cycleRef = useRef({ person: 0, gesture: 0 });
  const GESTURE_POOL = ['fistBump', 'highFive', 'handshake', 'bow'];
  const VARIATION_MAX = { bow: 20, fistBump: 16, handshake: 5, highFive: 21, roamaniac: 4 };

  useEffect(() => {
    if (!incomingGesturesEnabled || !winRef.current) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => setInView(e.isIntersecting)),
      { threshold: 0.3 }
    );
    observer.observe(winRef.current);
    return () => observer.disconnect();
  }, [incomingGesturesEnabled]);

  useEffect(() => {
    if (!incomingGesturesEnabled || !inView || people.length === 0) return;
    let timeout;
    const schedule = (firstDelay) => {
      const delay = firstDelay ?? (4000 + Math.random() * 4000);
      timeout = setTimeout(() => {
        if (!incomingActiveRef.current) {
          const tileIndex = cycleRef.current.person % people.length;
          const gesture = GESTURE_POOL[cycleRef.current.gesture % GESTURE_POOL.length];
          cycleRef.current.person += 1;
          cycleRef.current.gesture += 1;
          const variation = Math.floor(Math.random() * VARIATION_MAX[gesture]) + 1;
          incomingActiveRef.current = true;
          setIncomingByTile({
            [people[tileIndex].name]: { gesture, variation, key: Date.now() },
          });
        }
        schedule();
      }, delay);
    };
    schedule(800);
    return () => clearTimeout(timeout);
  }, [incomingGesturesEnabled, inView, people]);

  const onIncomingResolved = useCallback((personName) => {
    incomingActiveRef.current = false;
    setIncomingByTile(prev => {
      if (!prev[personName]) return prev;
      const next = { ...prev };
      delete next[personName];
      return next;
    });
  }, []);


  const playSound = useCallback((soundItem) => {
    const key = soundItem.emoji;
    // Track clicks within a 3-second window
    if (!soundClickCounts.current[key]) soundClickCounts.current[key] = 0;
    soundClickCounts.current[key]++;
    const clicks = soundClickCounts.current[key];

    // Determine level: 1-3 clicks = level 0, 4-8 = level 1, 9-15 = level 2, 16+ = level 3
    const level = clicks <= 3 ? 0 : clicks <= 8 ? 1 : clicks <= 15 ? 2 : 3;
    const clampedLevel = Math.min(level, soundItem.levels.length - 1);

    setSoundLevels(prev => ({ ...prev, [key]: level }));

    // Stop previous audio for this sound and play the right level
    if (activeAudios.current[key]) {
      activeAudios.current[key].pause();
      activeAudios.current[key] = null;
    }
    const audio = new Audio(soundItem.levels[clampedLevel]);
    audio.volume = 0.3 + level * 0.15;
    audio.play().catch(() => {});
    activeAudios.current[key] = audio;

    // Decay clicks after 3 seconds of no clicking
    clearTimeout(soundTimers.current[key]);
    soundTimers.current[key] = setTimeout(() => {
      soundClickCounts.current[key] = 0;
      setSoundLevels(prev => ({ ...prev, [key]: 0 }));
      activeAudios.current[key] = null;
    }, 3000);

    // Show ghost
    const startX = 20 + Math.random() * 60 + '%';
    setGhosts(prev => [...prev, { id: ghostIdRef.current++, emoji: soundItem.emoji, avatar: '/headshots/joe-woodward.jpg', startX }]);
  }, []);

  const sendRoamoji = useCallback((emoji) => {
    const startX = 30 + Math.random() * 60 + '%';
    setGhosts(prev => [...prev, {
      id: ghostIdRef.current++,
      emoji,
      avatar: '/headshots/joe-woodward.jpg',
      startX,
    }]);
  }, []);

  const removeGhost = useCallback((id) => {
    setGhosts(prev => prev.filter(g => g.id !== id));
  }, []);

  // Auto-reactions from other participants — sometimes burst multiple
  useEffect(() => {
    if (!autoReactions) return;
    if (!people.length) return;
    const timers = [];
    const scheduleReaction = () => {
      const delay = 1000 + Math.random() * 3000;
      const t = setTimeout(() => {
        const person = people[Math.floor(Math.random() * people.length)];
        if (!person) return;
        const emoji = ROAMOJIS[Math.floor(Math.random() * ROAMOJIS.length)];
        const burstCount = Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 4);
        for (let b = 0; b < burstCount; b++) {
          const bt = setTimeout(() => {
            const startX = 20 + Math.random() * 60 + '%';
            setGhosts(prev => [...prev, {
              id: ghostIdRef.current++,
              emoji,
              avatar: person.avatar,
              startX,
            }]);
          }, b * (150 + Math.random() * 200));
          timers.push(bt);
        }
        scheduleReaction();
      }, delay);
      timers.push(t);
    };
    scheduleReaction();
    return () => timers.forEach(t => clearTimeout(t));
  }, [people]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  // Close view menu on click outside
  useEffect(() => {
    if (!viewMenuOpen) return;
    const handler = (e) => { if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) setViewMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [viewMenuOpen]);

  // Stock videos — fill every tile; rotate per-room so each meeting room gets a different order
  const videoMap = useMemo(() => {
    const roomHash = (roomName || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return people.map((p) => p?.video || null);
  }, [roomName, people.length]);

  // Rotate active speaker with variable timing
  useEffect(() => {
    let timerId;
    const scheduleNext = () => {
      timerId = setTimeout(() => {
        setActiveSpeaker(prev => (prev + 1) % people.length);
        scheduleNext();
      }, 4000 + Math.random() * 3000);
    };
    scheduleNext();
    return () => clearTimeout(timerId);
  }, [people.length]);

  // Grid layout: 1 person = 1x1, 2 = 2x1, 3-4 = 2x2, 5-6 = 3x2, 7+ = 3x3
  const cols = people.length <= 1 ? 1 : people.length <= 4 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(people.length / cols));
  // Double the grid tracks so an underfilled last row can be centered (half-column precision)
  const virtualCols = cols * 2;
  const lastRowStart = (rows - 1) * cols;
  const lastRowCount = people.length - lastRowStart;
  const centerLastRow = lastRowCount > 0 && lastRowCount < cols;

  return (
    <div
      ref={winRef}
      className={`meeting-win ${!win.isFocused ? 'meeting-win-unfocused' : ''} ${closing ? 'meeting-win-closing' : ''} ${compact ? 'meeting-win-compact' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      {/* Header */}
      <div className="meeting-win-header" onMouseDown={onDrag}>
        <div className="meeting-win-lights">
          <button
            type="button"
            aria-label="Close meeting"
            className="unbutton meeting-win-light meeting-win-light-close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span aria-hidden="true" className="meeting-win-light meeting-win-light-min" />
          <span aria-hidden="true" className="meeting-win-light meeting-win-light-max" />
        </div>
        <div className="meeting-win-header-center">
          <span className="meeting-win-title">
            {roomName}
            {locked && <span className="meeting-win-lock" role="img" aria-label="Locked" />}
          </span>
          <span className="meeting-win-subtitle">Recording Magic Minutes</span>
        </div>
        <div className="meeting-win-header-right" ref={viewMenuRef}>
          <button
            type="button"
            className="unbutton meeting-win-gallery-btn"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={lockViewMode ? undefined : () => setViewMenuOpen(v => !v)}
            disabled={lockViewMode}
            aria-haspopup="menu"
            aria-expanded={viewMenuOpen}
            style={lockViewMode ? { cursor: 'default' } : undefined}
          >
            <span className="meeting-win-gallery-icon" aria-hidden="true">{VIEW_ICONS[viewMode]}</span>
            <span>{VIEW_MODES.find(m => m.id === viewMode)?.label}</span>
            {!lockViewMode && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
          {!lockViewMode && viewMenuOpen && (
            <div className="meeting-win-view-menu" role="menu">
              {VIEW_MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={viewMode === m.id}
                  className={`unbutton meeting-win-view-item ${viewMode === m.id ? 'meeting-win-view-active' : ''}`}
                  onClick={() => { setViewMode(m.id); setViewMenuOpen(false); }}
                >
                  <span className="meeting-win-view-icon" aria-hidden="true">{VIEW_ICONS[m.id]}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video grid */}
      <div className={`meeting-win-body ${mmCatchUp ? 'meeting-win-body-mm' : ''}`}>
        {(() => {
          const renderTile = (person, i, { style, className = '' } = {}) => (
            <div
              key={person.name}
              data-tile-id={person.name}
              style={style}
              className={`meeting-win-tile ${i === activeSpeaker ? 'meeting-win-tile-active' : ''} ${!videoMap[i] ? 'meeting-win-tile-off' : ''} ${className}`}
            >
              {videoMap[i] ? (
                <video
                  className="meeting-win-video"
                  src={videoMap[i]}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div className="meeting-win-avatar-wrap">
                  <img className="meeting-win-avatar" src={person.avatar} alt="" />
                </div>
              )}
              <div className="meeting-win-name">
                {i === activeSpeaker && (
                  <div className="meeting-win-talking" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                )}
                <span>{person.fullName || person.name}</span>
              </div>
              {gesturesEnabled && !(person.avatar === '/headshots/joe-woodward.jpg' || person.name === 'Joe W.') && (
                <TileGestures
                  isRoamaniac
                  occupantName={person.name?.split(' ')[0] || 'them'}
                  incoming={incomingByTile[person.name]}
                  onIncomingResolved={() => onIncomingResolved(person.name)}
                />
              )}
            </div>
          );

          if (viewMode === 'speaker' && people.length > 0) {
            const main = people[activeSpeaker] || people[0];
            const others = people.filter((_, i) => i !== activeSpeaker);
            return (
              <div className="meeting-win-speaker-layout">
                <div className="meeting-win-speaker-main">
                  {renderTile(main, activeSpeaker, { className: 'meeting-win-speaker-main-tile' })}
                </div>
                {others.length > 0 && (
                  <div className="meeting-win-speaker-thumbs">
                    {others.map((p) => {
                      const i = people.indexOf(p);
                      return renderTile(p, i, { className: 'meeting-win-thumb' });
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (viewMode === 'dynamic') {
            return (
              <div className="meeting-win-dynamic-layout">
                {people.map((person, i) => renderTile(person, i, {
                  className: i === activeSpeaker ? 'meeting-win-dynamic-active' : '',
                }))}
              </div>
            );
          }

          return (
            <div className={`meeting-win-grid ${people.length === 2 ? 'meeting-win-grid-two' : ''}`} style={{ gridTemplateColumns: `repeat(${virtualCols}, 1fr)`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
              {people.map((person, i) => {
                const isLastRow = i >= lastRowStart;
                const tileStyle = { gridColumnEnd: 'span 2' };
                if (centerLastRow && isLastRow) {
                  tileStyle.gridColumnStart = 1 + (cols - lastRowCount) + (i - lastRowStart) * 2;
                }
                return renderTile(person, i, { style: tileStyle });
              })}
            </div>
          );
        })()}

        {/* Roamoji ghosts */}
        <div className="roamoji-ghost-container">
          {ghosts.map(g => (
            <RoamojiGhost key={g.id} emoji={g.emoji} avatar={g.avatar} id={g.id} startX={g.startX} onDone={() => removeGhost(g.id)} />
          ))}
        </div>

        {/* Roamoji bar */}
        {roamojiOpen && (
          <div className={`roamoji-bar ${roamojiClosing ? 'roamoji-bar-closing' : ''}`}>
            {SOUND_ROAMOJIS.map(s => (
              <SoundButton key={s.label} emoji={s.emoji} sound={s.sound} level={soundLevels[s.emoji] || 0} onClick={() => playSound(s)} />
            ))}
            <div className="roamoji-divider" />
            {ROAMOJIS.map((emoji, i) => (
              <button key={emoji + i} className="roamoji-btn" onClick={() => sendRoamoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Magic Minutes Catch Up side panel */}
        {mmCatchUp && <MagicMinutesCatchUpPanel />}

        {/* Live captions */}
        {captionsScript && captionsScript.length > 0 && (
          <LiveCaptions script={captionsScript} />
        )}

        {/* Toolbar */}
        <div className="meeting-win-toolbar-wrap">
          <div className="meeting-win-toolbar">
            {/* Left */}
            <div className="meeting-win-pill-group">
              <button type="button" aria-label="Chat" className="unbutton meeting-win-pill" data-tooltip="Chat" onClick={onOpenChat}><img src="/icons/chat.svg" alt="" width="20" height="20" /></button>
            </div>
            {/* Center */}
            <div className="meeting-win-pill-group">
              <button type="button" aria-label="Video off" aria-pressed="true" className="unbutton meeting-win-pill meeting-win-pill-muted" data-tooltip="Video"><img src="/icons/video-off.svg" alt="" width="20" height="20" /></button>
              <button type="button" aria-label="Microphone" className="unbutton meeting-win-pill" data-tooltip="Microphone"><img src="/icons/microphone.svg" alt="" width="20" height="20" /></button>
              <button type="button" aria-label="Share Screen" className="unbutton meeting-win-pill" data-tooltip="Share Screen" onClick={() => setShareOpen(true)}><img src="/icons/screenshare.svg" alt="" width="20" height="20" /></button>
              <button
                type="button"
                aria-label={handsRaised ? 'Lower hand' : 'Raise hand'}
                aria-pressed={handsRaised}
                className={`unbutton meeting-win-pill ${handsRaised ? 'meeting-win-pill-hands-raised' : ''}`}
                data-tooltip={handsRaised ? 'Raised Hands' : 'Raise Hand'}
                onClick={onClickHands}
                data-hand-pill="true"
              >
                <span
                  className={`meeting-win-hand-glyph ${handsRaised ? 'meeting-win-hand-glyph-raised' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <button type="button" aria-label="Roamoji" aria-pressed={roamojiOpen} className={`unbutton meeting-win-pill ${roamojiOpen ? 'meeting-win-pill-active' : ''}`} data-tooltip="Roamoji" onClick={() => {
                if (roamojiOpen) {
                  setRoamojiClosing(true);
                  setTimeout(() => { setRoamojiOpen(false); setRoamojiClosing(false); }, 200);
                } else {
                  setRoamojiOpen(true);
                }
              }}><img src="/icons/emoji.svg" alt="" width="20" height="20" /></button>
              <button type="button" aria-label="Magic Minutes" className="unbutton meeting-win-pill" data-tooltip="Magic Minutes" onClick={onOpenMagicMinutes}><img src="/icons/magic-quill.svg" alt="" width="20" height="20" /></button>
              <button type="button" aria-label="Leave meeting" className="unbutton meeting-win-pill meeting-win-pill-leave" data-tooltip="Leave" onClick={handleClose}><img src="/icons/door.svg" alt="" width="20" height="20" /></button>
            </div>
            {/* Right */}
            <div className="meeting-win-toolbar-right">
              <div className="meeting-win-pill-group">
                <button type="button" aria-label="Add people" className="unbutton meeting-win-pill" data-tooltip="Add People"><img src="/icons/add-people.svg" alt="" width="20" height="20" /></button>
                <button type="button" aria-label="Meeting chat" className="unbutton meeting-win-pill" data-tooltip="Meeting Chat"><img src="/icons/meeting-chat.svg" alt="" width="20" height="20" /></button>
                <button type="button" aria-label="Magic Minutes" aria-pressed={mmCatchUp} className={`unbutton meeting-win-pill ${mmCatchUp ? 'meeting-win-pill-active' : ''}`} data-tooltip="Magic Minutes"><img src="/icons/magic-quill.svg" alt="" width="20" height="20" /></button>
                <button type="button" aria-label="Floors" className="unbutton meeting-win-pill" data-tooltip="Floors"><img src="/icons/floors.svg" alt="" width="20" height="20" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
