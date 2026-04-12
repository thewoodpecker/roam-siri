import React, { useEffect, useState, useRef, useMemo } from 'react';
// data.js imports removed — floor data is self-contained
import SiriGlow from './SiriGlow';
import Navbar from './Navbar';
import AInbox from './AInbox';
import MiniChat, { getChatIdForAvatar } from './MiniChat';
import { ChatProvider } from './ChatContext';
import { WindowManagerProvider, useWindow } from './WindowManager';
import StoryViewer from './StoryViewer';
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
  { name: 'Chelsea T.', fullName: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
  { name: 'Lexi B.', avatar: '/headshots/lexi-bohonnon.jpg' },
  { name: 'Will H.', avatar: '/headshots/will-hou.jpg' },
  { name: 'Howard L.', fullName: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
  { name: 'Jeff G.', avatar: '/headshots/jeff-grossman.jpg' },
  { name: 'Peter L.', fullName: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg' },
  { name: 'Sean M.', fullName: 'Sean MacIsaac', avatar: '/headshots/sean-macisaac.jpg' },
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

// Floor layouts — each floor has its own rooms
const FLOORS = {
  'R&D': [
    { id: 'r1', type: 'private', name: 'Ava L.', people: [p('Ava L.')], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'r2', type: 'private', name: 'Derek C.', people: [p('Derek C.'), p('Michael M.')], pos: { col: 1, row: 0 }, span: 1 },
    { id: 'r3', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 2, row: 0 }, span: 1 },
    { id: 'r4', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 3, row: 0 }, span: 1, story: '/story-1.png' },
    { id: 'r5', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'r5b', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 5, row: 0 }, span: 1 },
    { id: 'r6', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 'r7', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 1, row: 1 }, span: 1 },
    { id: 'theater', type: 'theater', name: 'Theater', people: [], pos: { col: 2, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'r8', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'r8b', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 5, row: 1 }, span: 1, story: '/story-2.png' },
    { id: 'r12', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'r13', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 1, row: 2 }, span: 1 },
    { id: 'r14', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 4, row: 2 }, span: 1 },
    { id: 'r14b', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 2 }, span: 1 },
    { id: 'r15', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 0, row: 3 }, span: 1 },
    { id: 'r16', type: 'game', name: 'Game Room', people: [], pos: { col: 1, row: 3 }, span: 1 },
    { id: 'alan-kay', type: 'meeting', name: 'Meeting Room', people: [p('Thomas G.'), p('Tom D.'), p('John H.'), p('Garima K.'), p('Joe W.'), p('John B.')], pos: { col: 2, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'standup', type: 'meeting', name: 'Daily Standup', people: [p('Lexi B.'), p('Will H.'), p('Arnav B.'), p('Mattias L.')], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
  ],
  'Commercial': [
    // Large lobby spanning top-left
    { id: 'c-lobby', type: 'meeting', name: 'Sales Floor', people: [p('Lexi B.'), p('Will H.'), p('Peter L.'), p('Sean M.'), p('Chelsea T.'), p('Garima K.'), p('Joe W.')], pos: { col: 0, row: 0 }, colSpan: 3, rowSpan: 2 },
    { id: 'c1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 3, row: 0 }, span: 1, story: '/story-3.jpg' },
    { id: 'c2', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'c3', type: 'private', name: 'Tom D.', people: [p('Tom D.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2 — right side offices
    { id: 'c4', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 3, row: 1 }, span: 1 },
    { id: 'c5', type: 'private', name: 'John B.', people: [p('John B.'), p('Thomas G.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'c6', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse with gap
    { id: 'c7', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'c8', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 1, row: 2 }, span: 1 },
    { id: 'c9', type: 'game', name: 'Game Room', people: [], pos: { col: 4, row: 2 }, colSpan: 2, rowSpan: 1 },
    // Row 4 — theater and offices
    { id: 'c10', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 0, row: 3 }, span: 1 },
    { id: 'c11', type: 'theater', name: 'Theater', people: [], pos: { col: 1, row: 3 }, colSpan: 3, rowSpan: 2 },
    { id: 'c12', type: 'private', name: 'Derek C.', people: [p('Derek C.')], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'c13', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 5, row: 3 }, span: 1 },
  ],
  'Marketing': [
    // Row 1 — offices with a gap in the middle
    { id: 'm1', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'm2', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 1, row: 0 }, span: 1 },
    { id: 'm3', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'm4', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2 — meeting room in the center
    { id: 'm5', type: 'private', name: 'Lexi B.', people: [p('Lexi B.')], pos: { col: 0, row: 1 }, span: 1, story: '/story-4.jpg' },
    { id: 'm-brand', type: 'meeting', name: 'Brand Review', people: [p('Ava L.'), p('Derek C.'), p('Arnav B.'), p('Aaron W.')], pos: { col: 1, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'm-content', type: 'meeting', name: 'Content Sync', people: [p('Howard L.'), p('Rob F.'), p('Joe W.')], pos: { col: 3, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'm6', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse
    { id: 'm7', type: 'private', name: 'Will H.', people: [p('Will H.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'm8', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 2 }, span: 1 },
    // Row 4 — theater + game + offices
    { id: 'm9', type: 'theater', name: 'Theater', people: [], pos: { col: 0, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'm10', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 'm11', type: 'private', name: 'Tom D.', people: [p('Tom D.')], pos: { col: 3, row: 3 }, span: 1 },
    { id: 'm12', type: 'game', name: 'Game Room', people: [], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'm13', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 5, row: 3 }, span: 1 },
    // Row 5
    { id: 'm14', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 2, row: 4 }, span: 1 },
    { id: 'm15', type: 'private', name: 'Thomas G.', people: [p('Thomas G.')], pos: { col: 3, row: 4 }, span: 1 },
    { id: 'm16', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 4, row: 4 }, span: 1 },
    { id: 'm17', type: 'private', name: 'John H.', people: [p('John H.')], pos: { col: 5, row: 4 }, span: 1 },
  ],
  'Executive': [
    // Large boardroom center
    { id: 'e-board', type: 'meeting', name: 'Boardroom', people: [p('Howard L.'), p('Joe W.'), p('Peter L.'), p('Derek C.'), p('Rob F.')], pos: { col: 1, row: 0 }, colSpan: 4, rowSpan: 2 },
    { id: 'e1', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'e2', type: 'private', name: 'Joe W.', people: [p('Joe W.')], pos: { col: 5, row: 0 }, span: 1 },
    { id: 'e3', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 'e4', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse executive offices
    { id: 'e5', type: 'private', name: 'Derek C.', people: [p('Derek C.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'e6', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 2, row: 2 }, span: 1 },
    { id: 'e7', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 4, row: 2 }, span: 1 },
    // Row 4 — lounge
    { id: 'e-lounge', type: 'game', name: 'Executive Lounge', people: [], pos: { col: 0, row: 3 }, colSpan: 3, rowSpan: 2 },
    { id: 'e8', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 3, row: 3 }, span: 1 },
    { id: 'e9', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 4, row: 3 }, span: 1 },
    { id: 'e10', type: 'theater', name: 'Theater', people: [], pos: { col: 5, row: 3 }, rowSpan: 2 },
  ],
  'Support': [
    // Row 1 — help desk spanning top
    { id: 's-help', type: 'meeting', name: 'Help Desk', people: [p('Garima K.'), p('Lexi B.'), p('Will H.')], pos: { col: 0, row: 0 }, colSpan: 2, rowSpan: 1 },
    { id: 's1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 3, row: 0 }, span: 1 },
    { id: 's2', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 's3', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2
    { id: 's4', type: 'private', name: 'Tom D.', people: [p('Tom D.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 's5', type: 'private', name: 'Thomas G.', people: [p('Thomas G.')], pos: { col: 1, row: 1 }, span: 1 },
    { id: 's-triage', type: 'meeting', name: 'Triage Room', people: [p('John H.'), p('John M.'), p('Sean M.')], pos: { col: 3, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 's6', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — training area
    { id: 's-train', type: 'theater', name: 'Training', people: [], pos: { col: 0, row: 2 }, colSpan: 2, rowSpan: 3 },
    { id: 's7', type: 'private', name: 'John B.', people: [p('John B.')], pos: { col: 5, row: 2 }, span: 1 },
    // Row 4
    { id: 's8', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 's9', type: 'private', name: 'Michael M.', people: [p('Michael M.')], pos: { col: 3, row: 3 }, span: 1 },
    { id: 's10', type: 'game', name: 'Break Room', people: [], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 's11', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 2, row: 4 }, span: 1 },
    { id: 's12', type: 'private', name: 'Ava L.', people: [p('Ava L.')], pos: { col: 3, row: 4 }, span: 1 },
  ],
};

const FLOOR_NAMES = Object.keys(FLOORS);

// Sidebar rooms


// Story bubble — appears above avatar, matches Wonder's MapStory
// Simple story bubble — positioned via CSS inside grid cell
function SimpleStoryBubble({ image, delay = 0, onClick }) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleClick = () => {
    setDismissing(true);
    setTimeout(() => {
      if (onClick) onClick();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div className={`sc-story-bubble ${dismissing ? 'sc-story-dismissing' : ''}`} onClick={handleClick}>
    <div className="sc-story-bubble">
      <div className="sc-story-rings">
        <div className="sc-story-ring" style={{ animationDelay: '0.4s' }} />
        <div className="sc-story-ring" style={{ animationDelay: '0.7s' }} />
        <div className="sc-story-ring" style={{ animationDelay: '1.4s' }} />
        <div className="sc-story-ring" style={{ animationDelay: '1.7s' }} />
      </div>
      <div className="sc-story-circle">
        <div className="sc-story-photo">
          <img className="sc-story-thumb" src={image} alt="" />
          <div className="sc-story-overlay">
            <img src="/icons/story.svg" width="20" height="20" alt="" />
          </div>
        </div>
      </div>
      {/* Tip arrow */}
      <div className="sc-story-tip">
        <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
          <path d="M5.586 5.586L0 0H14L8.414 5.586a2 2 0 01-2.828 0z" fill="#2C80FF" />
        </svg>
      </div>
    </div>
    </div>
  );
}

// Private office room card — uses the same markup as mapv3
function PrivateRoomCard({ room, storyBubble }) {
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

  const isEmpty = room.people.length === 0;
  const vibeColor = !isEmpty && room.vibe === 'claude' ? CLAUDE : !isEmpty && room.vibe === 'codex' ? CODEX : null;
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
            <h3 className={`office-name ${isEmpty ? 'sc-office-empty' : ''}`}>{room.name}</h3>
            {vibeColor && room.vibe === 'claude' && <img className="sc-ai-icon" src="/icons/claude.svg" alt="" />}
            {vibeColor && room.vibe === 'codex' && <img className="sc-ai-icon" src="/icons/codex.svg" alt="" />}
          </div>
          {room.people.length > 0 && (
            <div className="private-office-seat">
              <div className="seat-row seat-row-hovered">
                {room.people.map((person, i) => (
                  <div key={person.name + i} className="seat-assigned sc-private-person" onClick={(e) => openMiniChat(person, e)} style={{ cursor: getChatIdForAvatar(person.avatar) ? 'pointer' : 'default' }}>
                    <img className="seat-avatar" src={person.avatar} alt={person.name} />
                    <span className="seat-nametag">{person.name}</span>
                    {hasTalk && <div className={`sc-private-talk-ring ${talking[person.name] ? 'sc-talking' : ''}`} />}
                    {i === 0 && storyBubble}
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
              {Array.from({ length: 3 }).map((_, row) => (
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
              <div key={person.name + i} className={`person meeting-room-person ${person._new ? 'sc-person-arriving' : ''}`} onClick={(e) => openMiniChat(person, e)} style={{ cursor: getChatIdForAvatar(person.avatar) ? 'pointer' : 'default' }}>
                <img className="avatar" src={person.avatar} alt={person.name} />
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


// Floor card — auto-generates mini map from room data
function FloorCard({ name, rooms, active, onClick }) {
  return (
    <div className={`sc-floor-card ${active ? 'sc-floor-active' : ''}`} onClick={onClick}>
      <span className="sc-floor-name">{name}</span>
      <div className="sc-floor-mini-grid">
        {rooms.map(room => {
          const gridColumn = room.colSpan ? `${room.pos.col + 1} / span ${room.colSpan}` : `${room.pos.col + 1}`;
          const gridRow = room.rowSpan ? `${room.pos.row + 1} / span ${room.rowSpan}` : `${room.pos.row + 1}`;
          return (
            <div key={room.id} className="sc-mini-office" style={{ gridColumn, gridRow }}>
              {room.people.slice(0, 4).map((person, i) => (
                <img key={person.name + i} className="sc-mini-avatar" src={person.avatar} alt="" />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}


const INITIAL_WINDOWS = [
  { id: 'map', isOpen: true, position: { x: 0, y: 0 }, zIndex: 25 },
  { id: 'ainbox', isOpen: false, position: { x: 60, y: 300 }, zIndex: 30 },
];

// Main showcase component
export default function ShowcaseMap() {
  return (
    <ChatProvider>
      <WindowManagerProvider initialWindows={INITIAL_WINDOWS}>
        <ShowcaseMapInner />
      </WindowManagerProvider>
    </ChatProvider>
  );
}

function ShowcaseMapInner() {
  const [theme, setTheme] = useState('dark');
  const [activeFloor, setActiveFloor] = useState('R&D');
  const [floorTransition, setFloorTransition] = useState('visible'); // 'visible' | 'out' | 'in'

  const switchFloor = (floorName) => {
    if (floorName === activeFloor || floorTransition !== 'visible') return;
    setFloorTransition('out');
    setTimeout(() => {
      setActiveFloor(floorName);
      setFloorTransition('in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFloorTransition('visible');
        });
      });
    }, 200);
  };
  const [navLogoVisible, setNavLogoVisible] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeVibes, setActiveVibes] = useState({});
  const miniRoamRef = useRef(null);
  const [storyViewer, setStoryViewer] = useState(null); // { stories, initialIndex }
  const [viewedStories, setViewedStories] = useState({});
  // People movement — occasionally move someone between offices and meeting rooms
  const [movements, setMovements] = useState({ removed: {}, added: {}, anim: {} }); // anim: { roomId: 'leaving' | 'arriving' }
  const [miniChat, setMiniChat] = useState(null); // { personName, personAvatar, chatId, position }

  const openMiniChat = (person, e) => {
    e.stopPropagation();
    const chatId = getChatIdForAvatar(person.avatar);
    if (!chatId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMiniChat({
      personName: person.fullName || person.name,
      personAvatar: person.avatar,
      chatId,
      position: { x: rect.right + 10, y: Math.max(40, rect.top - 100) },
    });
  };

  useEffect(() => {
    const floor = FLOORS[activeFloor];
    const privateRooms = floor.filter(r => r.type === 'private' && r.people.length === 1 && !r.story);
    const meetingRooms = floor.filter(r => r.type === 'meeting' && r.people.length > 0);
    if (privateRooms.length === 0 || meetingRooms.length === 0) return;
    const timers = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };

    const tick = () => {
      const srcRoom = privateRooms[Math.floor(Math.random() * privateRooms.length)];
      const dstRoom = meetingRooms[Math.floor(Math.random() * meetingRooms.length)];
      const person = srcRoom.people[0];

      // 1. Leaving: show person with leaving animation
      setMovements({ removed: {}, added: {}, anim: { [srcRoom.id]: 'leaving' } });

      // 2. After leave anim, remove person and add to destination with arriving animation
      t(() => {
        setMovements({ removed: { [srcRoom.id]: true }, added: { [dstRoom.id]: person }, anim: { [dstRoom.id]: 'arriving' } });

        // 3. After arrive anim, clear animation state
        t(() => {
          setMovements({ removed: { [srcRoom.id]: true }, added: { [dstRoom.id]: person }, anim: {} });

          // 4. After a while, return: leaving animation on destination
          t(() => {
            setMovements({ removed: { [srcRoom.id]: true }, added: { [dstRoom.id]: person }, anim: { [dstRoom.id]: 'leaving-added' } });

            // 5. Remove from destination, restore source with arriving animation
            t(() => {
              setMovements({ removed: {}, added: {}, anim: { [srcRoom.id]: 'arriving' } });

              // 6. Clear
              t(() => setMovements({ removed: {}, added: {}, anim: {} }), 400);
            }, 300);
          }, 8000 + Math.random() * 7000);
        }, 400);
      }, 300);
    };

    const interval = setInterval(tick, 15000 + Math.random() * 10000);
    t(tick, 5000);
    return () => { clearInterval(interval); timers.forEach(clearTimeout); };
  }, [activeFloor]);

  // Apply movements to get the current floor rooms
  const currentFloorRooms = useMemo(() => {
    return FLOORS[activeFloor].map(room => {
      let people = room.people;
      if (movements.removed[room.id]) people = [];
      if (movements.added[room.id]) people = [...room.people, { ...movements.added[room.id], _new: true }];
      return { ...room, people, _anim: movements.anim[room.id] || null };
    });
  }, [activeFloor, movements]);

  const allStoryRooms = useMemo(() => {
    const rooms = [];
    FLOOR_NAMES.forEach(floor => {
      FLOORS[floor].forEach(r => {
        if (r.story && r.people[0]) rooms.push(r);
      });
    });
    return rooms;
  }, []);

  const allStoriesData = useMemo(() =>
    allStoryRooms.map(r => ({ image: r.story, avatar: r.people[0].avatar, name: r.people[0].fullName || r.people[0].name })),
  [allStoryRooms]);

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
    const privateRooms = currentFloorRooms.filter(r => r.type === 'private' && r.people.length === 1);
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
  }, [activeFloor]);
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
      setNavLogoVisible(viewport.scrollTop >= 200);
    };
    viewport.addEventListener('scroll', onScroll);
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sc-viewport" data-theme={theme} ref={viewportRef}>
      {/* Debug grid overlay */}
      {showGrid && <div className="sc-grid-debug">
        {Array.from({ length: 12 }).map((_, i) => <div key={i} className="sc-grid-debug-col" />)}
      </div>}
      {/* Website navbar */}
      <div className="sc-navbar-wrap" data-logo-visible={navLogoVisible}>
        <Navbar />
      </div>

      <div className="miniRoamOS" ref={miniRoamRef}>
        <div className="sc-wallpaper sc-wallpaper-dark" style={{ opacity: theme === 'dark' ? 1 : 0 }} />
        <div className="sc-wallpaper sc-wallpaper-light" style={{ opacity: theme === 'light' ? 1 : 0 }} />
      <div className={`sc-window ${!mapWin.isFocused ? 'sc-window-unfocused' : ''}`} ref={windowRef} style={{ transform: `translate(${mapWin.position.x}px, ${mapWin.position.y}px)`, zIndex: mapWin.zIndex }} onMouseDown={() => mapWin.focus()}>
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
            <div className={`sc-grid sc-floor-${floorTransition}`}>
              {currentFloorRooms.map(room => {
                const gridColumn = room.colSpan
                  ? `${room.pos.col + 1} / span ${room.colSpan}`
                  : `${room.pos.col + 1}`;
                const gridRow = room.rowSpan
                  ? `${room.pos.row + 1} / span ${room.rowSpan}`
                  : `${room.pos.row + 1}`;

                return (
                  <div
                    key={room.id}
                    className={`sc-grid-cell ${room._anim ? `sc-move-${room._anim}` : ''}`}
                    style={{ gridColumn, gridRow }}
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
                      <PrivateRoomCard
                        room={{ ...room, vibe: activeVibes[room.id] || null }}
                        storyBubble={room.story && room.people[0] && !viewedStories[room.story] ? (
                          <SimpleStoryBubble
                            image={room.story}
                            delay={currentFloorRooms.filter(r => r.story).indexOf(room) * 3000 + 3000}
                            onClick={() => {
                              const clickedIndex = allStoriesData.findIndex(s => s.image === room.story);
                              const reordered = [...allStoriesData.slice(clickedIndex), ...allStoriesData.slice(0, clickedIndex)];
                              const viewed = {};
                              allStoryRooms.forEach(r => { viewed[r.story] = true; });
                              setViewedStories(prev => ({ ...prev, ...viewed }));
                              setStoryViewer({ stories: reordered, initialIndex: 0 });
                            }}
                          />
                        ) : null}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar — elevator */}
          <div className="sc-sidebar">
            {FLOOR_NAMES.map(floorName => (
              <FloorCard
                key={floorName}
                name={floorName}
                rooms={FLOORS[floorName]}
                active={activeFloor === floorName}
                onClick={() => switchFloor(floorName)}
              />
            ))}
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
              <div className="sc-toolbar-pill" data-tooltip="Story" onClick={() => {
                if (allStoriesData.length > 0) {
                  const viewed = {};
                  allStoryRooms.forEach(r => { viewed[r.story] = true; });
                  setViewedStories(prev => ({ ...prev, ...viewed }));
                  setStoryViewer({ stories: allStoriesData, initialIndex: 0 });
                }
              }}>
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
        {storyViewer && <StoryViewer stories={storyViewer.stories} initialIndex={storyViewer.initialIndex} onClose={() => setStoryViewer(null)} />}
      </div>
      {ainboxWin.isOpen && <AInbox win={ainboxWin} onDrag={makeDragHandler(ainboxWin)} />}
      {/* Product features bar */}
      <div className="sc-products-bar">
        {['Virtual Office', 'Drop-In Meetings', 'Theater', 'AInbox', 'Lobby', 'Magicast', 'Magic Minutes', 'On-It', 'On-Air', 'Mobile'].map((item, i) => (
          <React.Fragment key={item}>
            {i > 0 && <div className="sc-products-dot" />}
            <span className="sc-products-item" onClick={item === 'AInbox' ? () => ainboxWin.open() : undefined}>{item}</span>
          </React.Fragment>
        ))}
      </div>
      </div>

      {/* Promo section */}
      <div className="sc-section">
        <div className="sc-section-grid">
          <div className="sc-promo-content">
            <h2 className="sc-promo-title">THE OFFICE THAT THINKS</h2>
            <p className="sc-promo-subtitle">Roam is a Virtual Office Platform where remote work happens in the open and every action makes your company smarter.</p>
            <div className="sc-promo-buttons">
              <button className="sc-promo-btn">Book Demo</button>
              <button className="sc-promo-btn">Free Trial</button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section — AInbox */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
        <div className="sc-feature-text">
          <h2 className="sc-feature-title">GROUP CHAT</h2>
          <p className="sc-feature-desc">Send Direct Messages, Group Chats, or Confidential Chats with AInbox. Set up your own custom groups. Tailor for your own bespoke workflow with custom folders, pinned chats, bookmarks, scheduled messages, and drag-and-drop reordering. Search your entire history. Give out guest badges to chat with people outside your organization, free!</p>
        </div>
        <div className="sc-feature-visual">
          <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpaper-${theme}.png)` }}>
            <AInbox win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }} onDrag={() => {}} />
          </div>
        </div>
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
      <button className="sc-grid-toggle-fixed" onClick={() => setShowGrid(g => !g)} style={{ opacity: showGrid ? 1 : undefined }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="10" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      {miniChat && <MiniChat {...miniChat} onClose={() => setMiniChat(null)} />}
    </div>
  );
}
