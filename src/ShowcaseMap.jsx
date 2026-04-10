import React, { useEffect, useState, useRef, useMemo } from 'react';
import { offices as officeData, meetingRooms } from './data';
import SiriGlow from './SiriGlow';
import Navbar from './Navbar';
import AInbox from './AInbox';
import { WindowManagerProvider, useWindow } from './WindowManager';
import './ShowcaseMap.css';

const CLAUDE = '#EB6139';
const CODEX = '#0000FF';

// Real names from headshot filenames
const SHOWCASE_PEOPLE = [
  { name: 'Ava L.', avatar: '/headshots/ava-lee.jpg' },
  { name: 'Derek C.', avatar: '/headshots/derek-cicerone.jpg' },
  { name: 'John M.', avatar: '/headshots/john-moffa.jpg' },
  { name: 'Jon B.', avatar: '/headshots/jon-brod.jpg' },
  { name: 'Keegan L.', avatar: '/headshots/keegan-lanzillotta.jpg' },
  { name: 'Grace S.', avatar: '/headshots/grace-sutherland.jpg' },
  { name: 'Michael W.', avatar: '/headshots/michael-walrath.jpg' },
  { name: 'Rob F.', avatar: '/headshots/rob-figueiredo.jpg' },
  { name: 'Chelsea T.', avatar: '/headshots/chelsea-turbin.jpg' },
  { name: 'Lexi B.', avatar: '/headshots/lexi-bohonnon.jpg' },
  { name: 'Will H.', avatar: '/headshots/will-hou.jpg' },
  { name: 'Howard L.', avatar: '/headshots/howard-lerman.jpg' },
  { name: 'Jeff G.', avatar: '/headshots/jeff-grossman.jpg' },
  { name: 'Peter L.', avatar: '/headshots/peter-lerman.jpg' },
  { name: 'Sean M.', avatar: '/headshots/sean-macisaac.jpg' },
  { name: 'Arnav B.', avatar: '/headshots/arnav-bansal.jpg' },
  { name: 'Aaron W.', avatar: '/headshots/aaron-wadhwa.jpg' },
  { name: 'Thomas G.', avatar: '/headshots/thomas-grapperon.jpg' },
  { name: 'Tom D.', avatar: '/headshots/tom-dixon.jpg' },
  { name: 'John H.', avatar: '/headshots/john-huffsmith.jpg' },
  { name: 'Mattias L.', avatar: '/headshots/mattias-leino.jpg' },
  { name: 'Klas L.', avatar: '/headshots/klas-leino.jpg' },
  { name: 'John B.', avatar: '/headshots/john-beutner.jpg' },
  { name: 'Michael M.', avatar: '/headshots/michael-miller.jpg' },
  { name: 'Garima K.', avatar: '/headshots/garima-kewlani.jpg' },
  { name: 'Joe W.', avatar: '/headshots/joe-woodward.jpg' },
];

const p = (name) => SHOWCASE_PEOPLE.find(p => p.name === name) || SHOWCASE_PEOPLE[0];

// Room layout
const SHOWCASE_ROOMS = [
  // Row 1
  { id: 'r1', type: 'private', name: 'Ava L.', people: [p('Ava L.')], pos: { col: 0, row: 0 }, span: 1 },
  { id: 'r2', type: 'private', name: 'Derek C.', people: [p('Derek C.'), p('Michael M.')], pos: { col: 1, row: 0 }, span: 1 },
  { id: 'r3', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 2, row: 0 }, span: 1 },
  { id: 'r4', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 3, row: 0 }, span: 1 },
  { id: 'r5', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
  { id: 'r5b', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 5, row: 0 }, span: 1 },

  // Row 2
  { id: 'r6', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 0, row: 1 }, span: 1 },
  { id: 'r7', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 1, row: 1 }, span: 1 },
  // Theater — spans 2 cols, 2 rows
  { id: 'theater', type: 'theater', name: 'Theater', people: [], pos: { col: 2, row: 1 }, colSpan: 2, rowSpan: 2 },
  { id: 'r8', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 4, row: 1 }, span: 1 },
  { id: 'r8b', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 5, row: 1 }, span: 1 },

  // Row 3
  { id: 'r12', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
  { id: 'r13', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 1, row: 2 }, span: 1 },
  { id: 'r14', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 4, row: 2 }, span: 1 },
  { id: 'r14b', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 2 }, span: 1 },

  // Row 4-5
  { id: 'r15', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 0, row: 3 }, span: 1 },
  { id: 'r16', type: 'game', name: 'Game Room', people: [], pos: { col: 1, row: 3 }, span: 1 },
  // Meeting Room — spans 2 cols, 2 rows
  { id: 'alan-kay', type: 'meeting', name: 'Meeting Room', people: [
    p('Thomas G.'), p('Tom D.'), p('John H.'),
    p('Garima K.'), p('Joe W.'), p('John B.'),
  ], pos: { col: 2, row: 3 }, colSpan: 2, rowSpan: 2 },
  { id: 'standup', type: 'meeting', name: 'Daily Standup', people: [
    p('Lexi B.'), p('Will H.'), p('Arnav B.'), p('Mattias L.'),
  ], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
];

// Sidebar rooms
const SIDEBAR_ROOMS = [
  { id: 'jacks-lobby', name: "Joe's Lobby", count: 20, status: 'OPEN', people: [p('Joe W.'), p('Derek C.'), p('Michael M.'), p('Garima K.'), p('John B.')], color: '#46D08F' },
  { id: 'reception', name: 'Reception', count: 8, people: [p('Ava L.'), p('John M.'), p('Grace S.')], color: '#4DD0E1' },
  { id: 'rnd', name: 'R&D', count: 12, people: [p('Thomas G.'), p('Tom D.'), p('John H.'), p('Peter L.')], color: '#835CE9' },
  { id: 'commercial', name: 'Commercial', count: 6, people: [p('Rob F.'), p('Chelsea T.'), p('Michael W.')], color: '#FF6F00' },
];

// Chat bubble component
function ChatBubble() {
  const [visible, setVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const fullText = 'Hey, is the code ready for th...';

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true);
      setTyping(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        i++;
        setText(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(typeInterval);
          setTyping(false);
          // Hide and restart after a delay
          setTimeout(() => {
            setVisible(false);
            setText('');
            setTimeout(() => {
              setVisible(true);
              setTyping(true);
              let j = 0;
              const typeInterval2 = setInterval(() => {
                j++;
                setText(fullText.slice(0, j));
                if (j >= fullText.length) {
                  clearInterval(typeInterval2);
                  setTyping(false);
                }
              }, 50);
            }, 3000);
          }, 6000);
        }
      }, 50);
    }, 2000);
    return () => clearTimeout(showTimer);
  }, []);

  if (!visible) return null;
  return (
    <div className="sc-chat-bubble">
      <img className="sc-chat-avatar" src={p('Alan Kay').avatar} alt="" />
      <div className="sc-chat-content">
        <span className="sc-chat-text">{text}</span>
        {typing && <span className="sc-chat-cursor" />}
      </div>
    </div>
  );
}


// Private office room card — uses the same markup as mapv3
function PrivateRoomCard({ room }) {
  const [talking, setTalking] = useState({});
  const hasTalk = room.people.length > 1;

  useEffect(() => {
    if (!hasTalk) return;
    const tick = () => {
      setTalking(prev => {
        const next = {};
        // Pick one person to talk, occasionally both, occasionally none
        const r = Math.random();
        if (r < 0.4) {
          // One person talks
          const idx = Math.floor(Math.random() * room.people.length);
          next[room.people[idx].name] = true;
        } else if (r < 0.55) {
          // Both talk (overlap)
          room.people.forEach(p => { next[p.name] = true; });
        }
        // else: silence
        return next;
      });
      return setTimeout(tick, 1200 + Math.random() * 2000);
    };
    let timer = tick();
    return () => clearTimeout(timer);
  }, [hasTalk]);

  const vibeColor = room.vibe === 'claude' ? CLAUDE : room.vibe === 'codex' ? CODEX : null;
  const prevVibeRef = useRef(null);
  const [showGlow, setShowGlow] = useState(false);
  const [glowColor, setGlowColor] = useState(null);

  useEffect(() => {
    if (vibeColor) {
      setGlowColor(vibeColor);
      // Small delay so the element renders before fading in
      requestAnimationFrame(() => setShowGlow(true));
    } else if (prevVibeRef.current) {
      setShowGlow(false);
      // Keep the color during fade out, then clear
      const t = setTimeout(() => setGlowColor(null), 800);
      return () => clearTimeout(t);
    }
    prevVibeRef.current = vibeColor;
  }, [vibeColor]);

  return (
    <div className="sc-room-card">
      <div className={`sc-glow-fade ${showGlow ? 'sc-glow-visible' : ''}`}>
        {glowColor && <SiriGlow active={true} color={glowColor} intensity={3} borderRadius={12} />}
      </div>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            {room.vibe === 'claude' && <img className="sc-ai-icon" src="/icons/claude.svg" alt="" />}
            {room.vibe === 'codex' && <img className="sc-ai-icon" src="/icons/codex.svg" alt="" />}
          </div>
          {room.people.length > 0 && (
            <div className="private-office-seat">
              <div className="seat-row seat-row-hovered">
                {room.people.map((person, i) => (
                  <div key={person.name + i} className="seat-assigned sc-private-person">
                    <img className="seat-avatar" src={person.avatar} alt={person.name} />
                    <span className="seat-nametag">{person.name}</span>
                    {hasTalk && <div className={`sc-private-talk-ring ${talking[person.name] ? 'sc-talking' : ''}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Theater room card — same markup as mapv3
function TheaterRoomCard({ room }) {
  const roomSurfaceColor = '#1D1E20';
  return (
    <div className="sc-room-card">
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            {room.people.length > 0 && <span className="room-count">{room.people.length} here</span>}
          </div>
          <div className="theater-preview">
            <div className="theater-preview-stage" />
            <div className="theater-preview-audience">
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="theater-preview-row">
                  {Array.from({ length: 5 }).map((_, col) => (
                    <div key={col} className="theater-preview-bench" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Meeting room card — same markup as mapv3, with talking indicators
function MeetingRoomCardShowcase({ room }) {
  const [talking, setTalking] = useState({});

  useEffect(() => {
    if (!room.people.length) return;
    const interval = setInterval(() => {
      setTalking(() => {
        const next = {};
        room.people.forEach(p => { if (Math.random() < 0.35) next[p.name] = true; });
        return next;
      });
    }, 1500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [room.people]);

  return (
    <div className="sc-room-card">
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            <img src="/icons/video.svg" className="sc-room-video-icon" width="16" height="16" alt="" />
          </div>
          <div className="meeting-room-people">
            {room.people.map((person, i) => (
              <div key={person.name + i} className="person meeting-room-person">
                <img className="avatar" src={person.avatar} alt={person.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div className={`avatar-inner-glow ${talking[person.name] ? 'sc-talking' : 'glow-off'}`} />
              </div>
            ))}
          </div>
          <div className="meeting-room-lines" />
        </div>
      </div>
    </div>
  );
}

// Game room card — same markup as mapv3
function GameRoomCard({ room }) {
  const roomSurfaceColor = '#1D1E20';
  return (
    <div className="sc-room-card">
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="game-room-lines"><div className="game-room-zigzag" /></div>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

// Command center card — same markup as mapv3
function CommandCenterCard({ room }) {
  const roomSurfaceColor = '#1D1E20';
  return (
    <div className="sc-room-card">
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            <span className="room-count">{room.people.length} here</span>
          </div>
          <div className="command-center-preview">
            <div className="command-screen" />
            <div className="command-screen" />
            <div className="command-screen" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Lobby card at top of sidebar
function LobbyCard() {
  return (
    <div className="sc-lobby-card">
      <div className="sc-lobby-bg" />
      <div className="sc-lobby-info">
        <div className="sc-lobby-title-row">
          <span className="sc-lobby-name">Joe's Lobby</span>
          <img src="/icons/calendar.svg" width="12" height="12" alt="" style={{ opacity: 0.5 }} />
        </div>
        <div className="sc-lobby-meta">
          <span>ro.am/joe</span>
        </div>
        <div className="sc-lobby-meta">
          <span>15 mins · One-on-One</span>
        </div>
        <div className="sc-lobby-meta">
          <span>Drop-ins</span>
          <span className="sc-lobby-open-badge"><span className="sc-lobby-dot" />OPEN</span>
        </div>
      </div>
    </div>
  );
}

// Mini office cell for floor maps
function MiniOffice({ people = [], width, height, highlight }) {
  const style = { width: width || '100%', height: height || 'auto' };
  return (
    <div className={`sc-mini-office ${highlight ? 'sc-mini-office-highlight' : ''}`} style={style}>
      {people.map((person, i) => (
        <img key={person.name + i} className="sc-mini-avatar" src={person.avatar} alt="" />
      ))}
    </div>
  );
}

// Theater mini preview
function MiniTheater() {
  return (
    <div className="sc-mini-theater">
      <div className="sc-mini-theater-stage" />
      <div className="sc-mini-theater-rows">
        {Array.from({ length: 4 }).map((_, r) => (
          <div key={r} className="sc-mini-theater-row">
            {Array.from({ length: 4 }).map((_, c) => (
              <div key={c} className="sc-mini-theater-seat" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Floor card with mini map grid
function FloorCard({ name, layout }) {
  return (
    <div className="sc-floor-card">
      <span className="sc-floor-name">{name}</span>
      <div className="sc-floor-grid">
        {layout.map((col, ci) => (
          <div key={ci} className="sc-floor-col">
            {col.map((cell, ri) => {
              if (cell.type === 'empty') return <div key={ri} className="sc-mini-office sc-mini-empty" style={{ height: cell.h || 22 }} />;
              if (cell.type === 'theater') return <MiniTheater key={ri} />;
              return <MiniOffice key={ri} people={cell.people || []} height={cell.h} highlight={cell.highlight} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Floor layouts using real people
const FLOOR_RND = [
  [ { people: [p('Ava L.')] }, { type: 'empty' }, { people: [p('Derek C.')], highlight: true }, { type: 'empty' }, { people: [p('John M.')] }, { people: [p('Jon B.')] } ],
  [ { type: 'empty' }, { people: [p('Keegan L.'), p('Howard L.')] }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' } ],
  [ { type: 'empty' }, { type: 'empty', h: 80 }, { people: [p('Grace S.')] }, { type: 'empty' }, { people: [p('Michael W.')] }, { people: [p('Rob F.')] } ],
  [ { people: [p('Chelsea T.')] }, { type: 'empty' }, { type: 'theater' }, { type: 'empty' } ],
  [ { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { people: [p('Lexi B.')] }, { people: [p('Will H.')] } ],
];

const FLOOR_COMMERCIAL = [
  [ { people: [p('Arnav B.'), p('Aaron W.')] }, { people: [p('Mattias L.')] }, { people: [p('Klas L.')] }, { people: [p('John B.')] } ],
  [ { type: 'empty' }, { type: 'empty', h: 60 } ],
  [ { people: [p('Tom D.')] }, { people: [p('Thomas G.'), p('Peter L.')] }, { type: 'empty' }, { people: [p('Sean M.')] } ],
  [ { people: [p('Michael M.')] }, { type: 'empty' }, { people: [p('Garima K.')] }, { type: 'empty' }, { type: 'empty' }, { people: [p('Joe W.')] } ],
  [ { people: [p('Jeff G.'), p('Howard L.')] }, { people: [p('Ava L.')] }, { type: 'empty' }, { people: [p('Rob F.')] }, { type: 'empty' } ],
];

const FLOOR_MARKETING = [
  [ { people: [p('Grace S.')] }, { people: [p('Chelsea T.')] }, { type: 'empty', h: 57 }, { type: 'empty' }, { type: 'empty' } ],
  [ { type: 'empty' }, { type: 'empty' }, { people: [p('Will H.')] }, { people: [p('Lexi B.')] } ],
  [ { people: [p('Michael W.')] }, { people: [p('Jon B.')] }, { type: 'empty', h: 75 }, { people: [p('Keegan L.')] } ],
  [ { people: [p('Ava L.')] }, { type: 'empty' }, { people: [p('Derek C.')] }, { type: 'empty' }, { type: 'empty' }, { people: [p('John M.')] }, { people: [p('Arnav B.')] } ],
  [ { people: [p('Klas L.'), p('Mattias L.')] }, { people: [p('Aaron W.'), p('Tom D.')] }, { people: [p('Chelsea T.')] }, { people: [p('Peter L.')] } ],
];

const INITIAL_WINDOWS = [
  { id: 'map', isOpen: true, position: { x: 0, y: 0 }, zIndex: 2 },
  { id: 'ainbox', isOpen: false, position: { x: 40, y: 100 }, zIndex: 1 },
];

// Main showcase component
export default function ShowcaseMap() {
  return (
    <WindowManagerProvider initialWindows={INITIAL_WINDOWS}>
      <ShowcaseMapInner />
    </WindowManagerProvider>
  );
}

function ShowcaseMapInner() {
  const [hovered, setHovered] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [navLogoVisible, setNavLogoVisible] = useState(false);
  const [activeVibes, setActiveVibes] = useState({});
  const mapWin = useWindow('map');
  const ainboxWin = useWindow('ainbox');

  const makeDragHandler = (win) => (e) => {
    if (e.target.closest('.sc-traffic-lights') || e.target.closest('.ainbox-traffic-lights') || e.target.closest('.sc-theme-toggle')) return;
    e.preventDefault();
    win.focus();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...win.position };
    const onMove = (e) => {
      win.move({ x: startPos.x + e.clientX - startX, y: startPos.y + e.clientY - startY });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Randomly cycle vibe coding across private offices
  useEffect(() => {
    const privateRooms = SHOWCASE_ROOMS.filter(r => r.type === 'private' && r.people.length === 1);
    const pickVibes = () => {
      const shuffled = [...privateRooms].sort(() => Math.random() - 0.5);
      const next = {};
      // 1 claude + 1 codex
      if (shuffled[0]) next[shuffled[0].id] = 'claude';
      if (shuffled[1]) next[shuffled[1].id] = 'codex';
      setActiveVibes(next);
    };
    pickVibes();
    const interval = setInterval(pickVibes, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);
  const windowRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onScroll = () => {
      const windowEl = windowRef.current;
      if (!windowEl) return;
      const rect = windowEl.getBoundingClientRect();
      setNavLogoVisible(rect.top <= 80);
    };
    viewport.addEventListener('scroll', onScroll);
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sc-viewport" data-theme={theme} ref={viewportRef}>
      {/* Website navbar */}
      <div className="sc-navbar-wrap" data-logo-visible={navLogoVisible}>
        <Navbar />
      </div>

      {/* Promo section */}
      <div className="sc-promo">
        <div className="sc-promo-top">
          <div className="sc-promo-text">
            <h2 className="sc-promo-title">THE OFFICE THAT THINKS</h2>
            <p className="sc-promo-subtitle">Virtual Office Platform with company visualization, presence, drop-ins, AI agents and more</p>
          </div>
          <div className="sc-promo-stats">
            <div className="sc-promo-stat">
              <span className="sc-promo-stat-value">8.3</span>
              <span className="sc-promo-stat-label">Minute Meetings</span>
              <span className="sc-promo-stat-category">Productivity</span>
            </div>
            <div className="sc-promo-stat">
              <span className="sc-promo-stat-value">88%</span>
              <span className="sc-promo-stat-label">More Connected</span>
              <span className="sc-promo-stat-category">Culture</span>
            </div>
          </div>
        </div>
        <div className="sc-promo-field">
          <span className="sc-promo-placeholder">What's your work email?</span>
          <button className="sc-promo-cta">Get Started for Free</button>
        </div>
      </div>

      <div className="sc-wallpaper-container">
        <div className="sc-wallpaper" style={{ backgroundImage: `url(/wallpaper-${theme}.png)` }} />
      <div className={`sc-window ${!mapWin.isFocused ? 'sc-window-unfocused' : ''}`} data-theme={theme} ref={windowRef} style={{ transform: `translate(${mapWin.position.x}px, ${mapWin.position.y}px)`, zIndex: mapWin.zIndex }} onMouseDown={() => mapWin.focus()}>
        {/* Mac window title bar */}
        <div className="sc-titlebar" onMouseDown={makeDragHandler(mapWin)}>
          <div className="sc-traffic-lights">
            <div className="sc-light sc-light-close" />
            <div className="sc-light sc-light-minimize" />
            <div className="sc-light sc-light-maximize" />
          </div>
          <img className="sc-titlebar-logo" src="/roam-logo.png" alt="roam" />
          <div className="sc-titlebar-spacer" />
        </div>

        {/* Main content area */}
        <div className="sc-content">
          {/* Map grid */}
          <div className="sc-map">
            <div className="sc-grid">
              {SHOWCASE_ROOMS.map(room => {
                const gridColumn = room.colSpan
                  ? `${room.pos.col + 1} / span ${room.colSpan}`
                  : `${room.pos.col + 1}`;
                const gridRow = room.rowSpan
                  ? `${room.pos.row + 1} / span ${room.rowSpan}`
                  : `${room.pos.row + 1}`;

                return (
                  <div
                    key={room.id}
                    className="sc-grid-cell"
                    style={{ gridColumn, gridRow }}
                    onMouseEnter={() => setHovered(room.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {room.type === 'theater' ? (
                      <TheaterRoomCard room={room} />
                    ) : room.type === 'meeting' ? (
                      <MeetingRoomCardShowcase room={room} />
                    ) : room.type === 'game' ? (
                      <GameRoomCard room={room} />
                    ) : room.type === 'command' ? (
                      <CommandCenterCard room={room} />
                    ) : (
                      <PrivateRoomCard room={{ ...room, vibe: activeVibes[room.id] || null }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="sc-sidebar">
            <FloorCard name="R&D" layout={FLOOR_RND} />
            <FloorCard name="Commercial" layout={FLOOR_COMMERCIAL} />
            <FloorCard name="Marketing" layout={FLOOR_MARKETING} />
          </div>
        </div>

        {/* Bottom toolbar — matches Figma */}
        <div className="sc-toolbar">
          {/* Left group */}
          <div className="sc-toolbar-group">
            <div className="sc-toolbar-pill" data-tooltip="AInbox" onClick={() => { ainboxWin.open(); }}>
              <img src="/icons/chat.svg" width="16" height="16" alt="" />
            </div>
          </div>

          {/* Center group */}
          <div className="sc-toolbar-pill-group">
            <div className="sc-toolbar-pill" data-tooltip="Access — Knock Required">
              <img src="/icons/door.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill" data-tooltip="Microphone">
              <img src="/icons/microphone.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill" data-tooltip="Screenshare">
              <img src="/icons/screenshare.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill" data-tooltip="Magic Minutes">
              <img src="/icons/magic-quill.svg" width="16" height="16" alt="" />
            </div>
          </div>

          {/* Right group */}
          <div className="sc-toolbar-group">
            <div className="sc-toolbar-pill-group">
              <div className="sc-toolbar-pill" data-tooltip="Story">
                <img src="/icons/story.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Magicast">
                <img src="/icons/magicast.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Recordings">
                <img src="/icons/recordings.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="On-Air">
                <img src="/icons/on-air.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Calendar">
                <img src="/icons/calendar.svg" width="16" height="16" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {ainboxWin.isOpen && <AInbox win={ainboxWin} onDrag={makeDragHandler(ainboxWin)} />}
      </div>

      {/* Mock content blocks for scrolling */}
      <div className="sc-mock-sections">
        <div className="sc-mock-section">
          <h2 className="sc-mock-heading">Drop into any room, instantly</h2>
          <p className="sc-mock-text">No links. No scheduling. Just click a room and you're there. Roam recreates the spontaneity of a real office — walk up to someone's desk, pop into a meeting, or hang out in the lounge.</p>
        </div>
        <div className="sc-mock-section">
          <h2 className="sc-mock-heading">See your whole company, at a glance</h2>
          <p className="sc-mock-text">The map gives you a bird's-eye view of who's where, who's talking, and who's available. No more wondering if someone is free — just look at the map.</p>
        </div>
        <div className="sc-mock-section">
          <h2 className="sc-mock-heading">AI that works alongside you</h2>
          <p className="sc-mock-text">On-It, your AI assistant, lives right in your office. It joins meetings, takes notes, answers questions, and helps your team move faster — without leaving Roam.</p>
        </div>
      </div>

      {/* Theme toggle — fixed bottom-left next to hamburger */}
      <button className="sc-theme-toggle-fixed" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.2" /><path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8.5C13.3 12.1 10 14.5 6.5 13.5C3 12.5 1 9.5 2 6C2.8 3.2 5.5 1.5 8.5 2C7 3.5 6.5 6 8 8.5C9 10 11 11 14 8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>

    </div>
  );
}
