import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
// data.js imports removed — floor data is self-contained
import SiriGlow from './SiriGlow';
import Navbar from './Navbar';
import AInbox from './AInbox';
import MiniChat, { getChatIdForAvatar } from './MiniChat';
import OnAir from './OnAir';
import MeetingWindow from './MeetingWindow';
import TheaterWindow from './TheaterWindow';
import { ChatProvider } from './ChatContext';
import { WindowManagerProvider, useWindow } from './WindowManager';
import StoryViewer from './StoryViewer';
import ShareDialog from './ShareDialog';
import './ShowcaseMap.css';

// Flip to `false` to show the nav, bottom bar, and theme toggle
const HIDE_CHROME = false;

const CLAUDE = '#EB6139';
const CODEX = '#0000FF';

// Real names from headshot filenames
const SHOWCASE_PEOPLE = [
  { name: 'Joe W.', fullName: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' },
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
  { name: 'Ava L.', fullName: 'Ava Lee', avatar: '/headshots/ava-lee.jpg' },
];

const p = (name) => SHOWCASE_PEOPLE.find(p => p.name === name) || SHOWCASE_PEOPLE[0];

// Floor layouts — each floor has its own rooms
const FLOORS = {
  'R&D': [
    { id: 'r1', type: 'private', name: 'Klas L.', people: [], pos: { col: 0, row: 0 }, span: 1 },
    { id: 'r2', type: 'private', name: 'Derek C.', people: [p('Derek C.'), p('Michael M.')], pos: { col: 1, row: 0 }, span: 1 },
    { id: 'r3', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 2, row: 0 }, span: 1 },
    { id: 'r4', type: 'private', name: 'Howard L.', people: [p('Howard L.')], pos: { col: 3, row: 0 }, span: 1, story: '/story-1.png' },
    { id: 'r5', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'r5b', type: 'private', name: 'Jon B.', people: [p('Jon B.')], pos: { col: 5, row: 0 }, span: 1 },
    { id: 'r6', type: 'private', name: 'Grace S.', people: [p('Grace S.')], pos: { col: 0, row: 1 }, span: 1 },
    { id: 'r7', type: 'private', name: 'Michael W.', people: [p('Michael W.')], pos: { col: 1, row: 1 }, span: 1 },
    { id: 'theater', type: 'theater', name: 'Theater', people: [], pos: { col: 2, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'r8', type: 'private', name: 'Rob F.', people: [p('Rob F.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'r8b', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 5, row: 1 }, span: 1 },
    { id: 'r12', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'r13', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 1, row: 2 }, span: 1 },
    { id: 'r14', type: 'private', name: 'Sean M.', people: [p('Sean M.')], pos: { col: 4, row: 2 }, span: 1 },
    { id: 'r14b', type: 'private', name: 'Joe W.', people: [p('Joe W.')], pos: { col: 5, row: 2 }, span: 1 },
    { id: 'r15', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 0, row: 3 }, span: 1 },
    { id: 'r16', type: 'game', name: 'Game Room', people: [], pos: { col: 1, row: 3 }, span: 1 },
    { id: 'alan-kay', type: 'meeting', name: 'Meeting Room', people: [p('Thomas G.'), p('John H.'), p('Garima K.'), p('John B.')], pos: { col: 2, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'standup', type: 'meeting', name: 'Daily Standup', people: [p('Lexi B.'), p('Will H.'), p('Arnav B.'), p('Mattias L.')], pos: { col: 4, row: 3 }, colSpan: 2, rowSpan: 2 },
  ],
  'Commercial': [
    // Large lobby spanning top-left
    { id: 'c-lobby', type: 'meeting', name: 'Sales Floor', people: [p('Lexi B.'), p('Will H.'), p('Peter L.'), p('Sean M.'), p('Chelsea T.'), p('Garima K.'), p('Joe W.')], pos: { col: 0, row: 0 }, colSpan: 3, rowSpan: 2 },
    { id: 'c1', type: 'private', name: 'Arnav B.', people: [p('Arnav B.')], pos: { col: 3, row: 0 }, span: 1, story: '/story-3.jpg' },
    { id: 'c2', type: 'private', name: 'Aaron W.', people: [p('Aaron W.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'c3', type: 'private', name: 'Tom D.', people: [], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2 — right side offices
    { id: 'c4', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 3, row: 1 }, span: 1 },
    { id: 'c5', type: 'private', name: 'John B.', people: [p('John B.'), p('Thomas G.')], pos: { col: 4, row: 1 }, span: 1 },
    { id: 'c6', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse with gap
    { id: 'c7', type: 'private', name: 'Jeff G.', people: [p('Jeff G.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'c8', type: 'private', name: 'Howard L.', people: [], pos: { col: 1, row: 2 }, span: 1 },
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
    { id: 'm2', type: 'private', name: 'Chelsea T.', people: [p('Chelsea T.')], pos: { col: 1, row: 0 }, span: 1, story: '/story-2.png' },
    { id: 'm3', type: 'private', name: 'Keegan L.', people: [p('Keegan L.')], pos: { col: 4, row: 0 }, span: 1 },
    { id: 'm4', type: 'private', name: 'John M.', people: [p('John M.')], pos: { col: 5, row: 0 }, span: 1 },
    // Row 2 — meeting room in the center
    { id: 'm5', type: 'private', name: 'Lexi B.', people: [p('Lexi B.')], pos: { col: 0, row: 1 }, span: 1, story: '/story-4.jpg' },
    { id: 'm-brand', type: 'meeting', name: 'Brand Review', people: [p('Ava L.'), p('Derek C.'), p('Arnav B.'), p('Aaron W.')], pos: { col: 1, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'm-content', type: 'meeting', name: 'Content Sync', people: [p('Rob F.'), p('Joe W.')], pos: { col: 3, row: 1 }, colSpan: 2, rowSpan: 2 },
    { id: 'm6', type: 'private', name: 'Mattias L.', people: [p('Mattias L.')], pos: { col: 5, row: 1 }, span: 1 },
    // Row 3 — sparse
    { id: 'm7', type: 'private', name: 'Will H.', people: [p('Will H.')], pos: { col: 0, row: 2 }, span: 1 },
    { id: 'm8', type: 'private', name: 'Klas L.', people: [p('Klas L.')], pos: { col: 5, row: 2 }, span: 1 },
    // Row 4 — theater + game + offices
    { id: 'm9', type: 'theater', name: 'Theater', people: [], pos: { col: 0, row: 3 }, colSpan: 2, rowSpan: 2 },
    { id: 'm10', type: 'private', name: 'Peter L.', people: [p('Peter L.')], pos: { col: 2, row: 3 }, span: 1 },
    { id: 'm11', type: 'private', name: 'Tom D.', people: [], pos: { col: 3, row: 3 }, span: 1 },
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
    { id: 'e-board', type: 'meeting', name: 'Boardroom', people: [p('Keegan L.'), p('Thomas G.'), p('Klas L.'), p('Will H.'), p('Arnav B.')], pos: { col: 1, row: 0 }, colSpan: 4, rowSpan: 2 },
    { id: 'e1', type: 'private', name: 'Howard L.', people: [], pos: { col: 0, row: 0 }, span: 1 },
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
    { id: 's4', type: 'private', name: 'Tom D.', people: [], pos: { col: 0, row: 1 }, span: 1 },
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
  const [hovered, setHovered] = useState(false);

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

  const scale = dismissing ? 0.85 : hovered ? 1.15 : 1;
  return (
    <div
      className="sc-story-bubble"
      onClick={(e) => { e.stopPropagation(); handleClick(); }}
      onMouseEnter={() => !dismissing && setHovered(true)}
      onMouseLeave={() => !dismissing && setHovered(false)}
      style={{
        transform: `translateX(-50%) scale(${scale})`,
        opacity: dismissing ? 0 : 1,
        transition: dismissing
          ? 'transform 300ms ease-in, opacity 300ms ease-in'
          : undefined,
      }}
    >
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
  );
}

// Private office room card — uses the same markup as mapv3
function PrivateRoomCard({ room, storyBubble, onPersonClick, onRoomClick }) {
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
  const activeVibe = !isEmpty ? room.vibe : null; // 'claude' | 'codex' | 'both' | null
  const prevVibeRef = useRef(null);
  const [showGlow, setShowGlow] = useState(false);
  const [renderedVibe, setRenderedVibe] = useState(null);

  useEffect(() => {
    if (activeVibe) {
      setRenderedVibe(activeVibe);
      // Small delay so the element renders before fading in
      requestAnimationFrame(() => setShowGlow(true));
    } else if (prevVibeRef.current) {
      setShowGlow(false);
      // Keep the vibe during fade out, then clear
      const t = setTimeout(() => setRenderedVibe(null), 800);
      return () => clearTimeout(t);
    }
    prevVibeRef.current = activeVibe;
  }, [activeVibe]);

  const clickable = !!onRoomClick;
  return (
    <div
      className="sc-room-card"
      onClick={clickable ? () => onRoomClick(room) : undefined}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      <div className={`sc-glow-fade ${showGlow ? 'sc-glow-visible' : ''}`}>
        {renderedVibe === 'claude' && <SiriGlow active={true} color={CLAUDE} intensity={3} borderRadius={12} />}
        {renderedVibe === 'codex' && <SiriGlow active={true} color={CODEX} intensity={3} borderRadius={12} />}
        {renderedVibe === 'both' && (
          <>
            <SiriGlow active={true} color={CLAUDE} intensity={3} borderRadius={12} />
            <SiriGlow active={true} color={CODEX} intensity={3} borderRadius={12} />
          </>
        )}
      </div>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className={`office-name ${isEmpty ? 'sc-office-empty' : ''}`}>{room.name}</h3>
            {activeVibe === 'claude' && <img className="sc-ai-icon" src="/icons/claude.svg" alt="" />}
            {activeVibe === 'codex' && <img className="sc-ai-icon" src="/icons/codex-white.svg" alt="" />}
            {activeVibe === 'both' && <img className="sc-ai-icon sc-ai-icon-combo" src="/icons/vibe-combo.svg" alt="" />}
          </div>
          {room.people.length > 0 && (
            <div className="private-office-seat">
              <div className="seat-row seat-row-hovered">
                {room.people.map((person, i) => (
                  <div key={person.name + i} className={`seat-assigned sc-private-person ${person.isJoining ? 'sc-joining' : ''}`} onClick={(e) => { e.stopPropagation(); onPersonClick && onPersonClick(person, e); }} style={{ cursor: getChatIdForAvatar(person.avatar) ? 'pointer' : 'default' }}>
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

// Theater room card — stage with 2 speakers + audience rows with dots
function TheaterRoomCard({ room, speakers = [], onPersonClick, speakerStories = {}, viewedStories = {}, onStoryClick, onRoomClick }) {
  const [talkingIdx, setTalkingIdx] = useState(1);

  // Alternate which speaker is talking
  useEffect(() => {
    const t = setInterval(() => {
      setTalkingIdx(idx => (idx === 0 ? 1 : 0));
    }, 2200 + Math.random() * 1500);
    return () => clearInterval(t);
  }, []);

  // Row segments — each number is how many audience dots sit in that bench segment
  const audienceRows = [
    [0, 3, 0, 2, 4],
    [4, 0, 2, 3, 0],
    [0, 2, 4, 0, 3],
  ];
  // Which dot in each bench (if any) is the highlighted/active one — [rowIdx, benchIdx, dotIdx]
  const activeDot = [1, 0, 1];

  return (
    <div className="sc-room-card" onClick={() => onRoomClick && onRoomClick(room)} style={{ cursor: 'pointer' }}>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
          </div>
          <div className="theater-preview">
            <div className="theater-preview-stage sc-theater-stage">
              {speakers.map((s, i) => {
                const story = speakerStories[s.name];
                return (
                  <div
                    key={s.name}
                    className="sc-theater-speaker"
                    onClick={(e) => { e.stopPropagation(); onPersonClick && onPersonClick(s, e); }}
                    style={{ cursor: getChatIdForAvatar(s.avatar) ? 'pointer' : 'default' }}
                  >
                    <div className={`sc-private-talk-ring ${talkingIdx === i ? 'sc-talking' : ''}`} />
                    <img className="sc-theater-speaker-img" src={s.avatar} alt={s.name} />
                    {story && !viewedStories[story] && (
                      <SimpleStoryBubble
                        image={story}
                        delay={2000 + i * 400}
                        onClick={() => onStoryClick && onStoryClick(story)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="theater-preview-audience">
              {audienceRows.map((row, rowIdx) => (
                <div key={rowIdx} className="theater-preview-row">
                  {row.map((count, benchIdx) => (
                    <div key={benchIdx} className="theater-preview-bench">
                      {count > 0 && (
                        <div className="theater-preview-dots">
                          {Array.from({ length: count }).map((_, dotIdx) => {
                            const isActive = activeDot[0] === rowIdx && activeDot[1] === benchIdx && activeDot[2] === dotIdx;
                            return <div key={dotIdx} className={`theater-preview-dot ${isActive ? 'theater-preview-dot-active' : ''}`} />;
                          })}
                        </div>
                      )}
                    </div>
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
function MeetingRoomCardShowcase({ room, onPersonClick, onRoomClick }) {
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
    <div className="sc-room-card" onClick={() => onRoomClick && onRoomClick(room)} style={{ cursor: 'pointer' }}>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{room.name}</h3>
            <img src="/icons/video.svg" className="sc-room-video-icon" width="16" height="16" alt="" />
          </div>
          <div className="meeting-room-people">
            {room.people.map((person, i) => (
              <div key={person.name + i} className={`person meeting-room-person ${person._new ? 'sc-person-arriving' : ''} ${person.isJoining ? 'sc-joining' : ''}`} onClick={(e) => { e.stopPropagation(); onPersonClick && onPersonClick(person, e); }} style={{ cursor: getChatIdForAvatar(person.avatar) ? 'pointer' : 'default' }}>
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


function MagicastWindow({ win, onDrag }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 180);
  };
  return (
    <div
      className={`mc-win ${!win.isFocused ? 'mc-win-unfocused' : ''} ${closing ? 'mc-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="mc-win-titlebar" onMouseDown={onDrag}>
        <div className="mc-win-lights">
          <div className="mc-win-light mc-win-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="mc-win-light mc-win-light-min" />
          <div className="mc-win-light mc-win-light-max" />
        </div>
        <span className="mc-win-title">Magicast</span>
      </div>
      <div className="mc-win-body">
        <div className="mc-win-preview">
          <img className="mc-win-preview-bg" src="/magicast/preview.png" alt="" />
          <div className="mc-win-preview-overlay" />
          <img className="mc-win-preview-avatar" src="/magicast/avatar.png" alt="" />
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/video.svg)', maskImage: 'url(/magicast/video.svg)' }} />
          <span className="mc-win-row-label">Camera</span>
          <span className="mc-win-row-value">Logi 4K Pro</span>
          <div className="mc-win-row-chevron">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 5L8 9L12 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/microphone.svg)', maskImage: 'url(/magicast/microphone.svg)' }} />
          <span className="mc-win-row-label">Microphone</span>
          <span className="mc-win-row-value">Default</span>
          <div className="mc-win-row-chevron">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 5L8 9L12 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/monitor.svg)', maskImage: 'url(/magicast/monitor.svg)' }} />
          <span className="mc-win-row-label">Screens</span>
          <span className="mc-win-row-value">Entire Screen</span>
          <svg className="mc-win-row-chev-right" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="mc-win-row">
          <span className="mc-win-row-icon" style={{ WebkitMaskImage: 'url(/magicast/effects.svg)', maskImage: 'url(/magicast/effects.svg)' }} />
          <span className="mc-win-row-label">Effects</span>
          <span className="mc-win-row-value">Background Blur</span>
          <svg className="mc-win-row-chev-right" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <button className="mc-win-record">Start Recording</button>
      </div>
    </div>
  );
}


const INITIAL_WINDOWS = [
  { id: 'map', isOpen: true, position: { x: 0, y: 0 }, zIndex: 25 },
  { id: 'ainbox', isOpen: false, position: { x: 60, y: 300 }, zIndex: 30 },
  { id: 'onair', isOpen: false, position: { x: 60, y: 300 }, zIndex: 30 },
  { id: 'meeting', isOpen: false, position: { x: 80, y: 250 }, zIndex: 30 },
  { id: 'theater', isOpen: false, position: { x: 70, y: 220 }, zIndex: 30 },
  { id: 'shelf', isOpen: false, position: { x: 120, y: 280 }, zIndex: 30 },
  { id: 'magicast', isOpen: false, position: { x: 200, y: 200 }, zIndex: 30 },
];

const SHELF_TOTAL = 12;

function KnockDialog({ room, onCancel }) {
  const firstName = (room?.people?.[0]?.fullName || room?.people?.[0]?.name || room?.name || '').split(/\s+/)[0] || 'their';
  return (
    <div className="sc-knock-overlay" onClick={onCancel}>
      <div className="sc-knock-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sc-knock-icon">
          <img src="/icons/knock.svg" alt="" />
        </div>
        <div className="sc-knock-label">Knocking on {firstName}'s Door<span className="sc-knock-dots"><span>.</span><span>.</span><span>.</span></span></div>
        <button className="sc-knock-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ShelfWindow({ win, onDrag, photoIdx, direction, onPrev, onNext }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 180);
  };
  return (
    <div
      className={`shelf-win ${!win.isFocused ? 'shelf-win-unfocused' : ''} ${closing ? 'shelf-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="shelf-win-titlebar" onMouseDown={onDrag}>
        <div className="shelf-win-lights">
          <div className="shelf-win-light shelf-win-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="shelf-win-light shelf-win-light-min" />
          <div className="shelf-win-light shelf-win-light-max" />
        </div>
        <div className="shelf-win-title">
          <button className="shelf-win-nav" aria-label="Previous" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="shelf-win-title-text">{photoIdx} / {SHELF_TOTAL}</span>
          <button className="shelf-win-nav" aria-label="Next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div className="shelf-win-title-spacer" />
      </div>
      <div className="shelf-win-body">
        <img key={photoIdx} className={`shelf-win-img ${direction ? `shelf-win-img-${direction}` : ''}`} src={`/shelf/photos/photo-${photoIdx}.png`} alt="" />
      </div>
    </div>
  );
}

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

function ProductItem({ name, desc, onClick }) {
  const [hover, setHover] = useState(false);
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (hover && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }, [hover]);

  return (
    <span
      ref={ref}
      className="sc-products-item"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {name}
      {hover && ReactDOM.createPortal(
        <div className="sc-product-tooltip" style={{ left: pos.x, top: pos.y - 12 }}>
          <div className="sc-product-tooltip-inner">{desc}</div>
        </div>,
        document.body
      )}
    </span>
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
  useEffect(() => {
    const handler = () => setShowGrid(g => !g);
    window.addEventListener('toggle-grid', handler);
    return () => window.removeEventListener('toggle-grid', handler);
  }, []);
  const [activeVibes, setActiveVibes] = useState({});
  const miniRoamRef = useRef(null);
  const [storyViewer, setStoryViewer] = useState(null); // { stories, initialIndex }
  const [shareOpen, setShareOpen] = useState(false);
  const [viewedStories, setViewedStories] = useState({});
  // People movement — occasionally move someone between offices and meeting rooms
  const [movements, setMovements] = useState({ removed: {}, added: {}, anim: {} }); // anim: { roomId: 'leaving' | 'arriving' }
  const [miniChats, setMiniChats] = useState([]);

  const openMiniChat = (person, e) => {
    const chatId = getChatIdForAvatar(person.avatar);
    if (!chatId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMiniChats(prev => {
      // Toggle off if already open
      if (prev.find(c => c.chatId === chatId)) {
        return prev.filter(c => c.chatId !== chatId);
      }
      // Pin to top-right of miniRoamOS, stacked horizontally
      const containerRect = miniRoamRef.current?.getBoundingClientRect();
      const containerW = containerRect?.width || 1000;
      const containerH = containerRect?.height || 800;
      const offset = prev.length * 330;
      let x = containerW - 330 - offset;
      // Wrap to next row if off-screen left
      if (x < 10) {
        const row = Math.floor((-x + 10) / containerW) + 1;
        x = containerW - 330 - (offset - row * Math.floor(containerW / 330) * 330);
        if (x < 10) x = 10;
      }
      return [...prev, {
        personName: person.fullName || person.name,
        personAvatar: person.avatar,
        chatId,
        position: { x: Math.max(10, x), y: 150 },
      }];
    });
  };

  const closeMiniChat = (chatId) => {
    setMiniChats(prev => prev.filter(c => c.chatId !== chatId));
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

  const theaterSpeakers = useMemo(() => [p('Tom D.'), p('Klas L.')], []);
  const speakerStories = {};

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
  const onairWin = useWindow('onair');
  const meetingWin = useWindow('meeting');
  const theaterWin = useWindow('theater');
  const shelfWin = useWindow('shelf');
  const magicastWin = useWindow('magicast');
  const [activeMeetingRoom, setActiveMeetingRoom] = useState(null);
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const [knockingRoom, setKnockingRoom] = useState(null);
  const [homecomingId, setHomecomingId] = useState(null);
  const knockTimerRef = useRef(null);
  const suppressHomeRef = useRef(false);
  const knockOnHoward = useCallback(() => {
    const howardRoom = FLOORS['R&D'].find(r => r.id === 'r4');
    if (!howardRoom) return;
    if (activeFloor !== 'R&D') setActiveFloor('R&D');
    if (knockingRoom || joinedRoomId === howardRoom.id) return;
    setKnockingRoom(howardRoom);
    knockTimerRef.current = setTimeout(() => {
      setKnockingRoom(null);
      if (meetingWin.isOpen || theaterWin.isOpen) suppressHomeRef.current = true;
      if (meetingWin.isOpen) meetingWin.close();
      if (theaterWin.isOpen) theaterWin.close();
      setJoinedRoomId(howardRoom.id);
    }, 3000);
  }, [activeFloor, knockingRoom, joinedRoomId, meetingWin, theaterWin]);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [shelfClosing, setShelfClosing] = useState(false);
  const [mapPulse, setMapPulse] = useState(false);
  const [mapMounted, setMapMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMapMounted(true), 500);
    return () => clearTimeout(t);
  }, []);
  const pulseMapWindow = useCallback(() => {
    setMapPulse(false);
    requestAnimationFrame(() => {
      setMapPulse(true);
      setTimeout(() => setMapPulse(false), 720);
    });
  }, []);
  const shelfActive = shelfOpen || shelfClosing;
  const closeShelf = useCallback(() => {
    if (!shelfOpen) return;
    setShelfOpen(false);
    setShelfClosing(true);
    setTimeout(() => setShelfClosing(false), 220);
  }, [shelfOpen]);
  const [shelfPhotoIdx, setShelfPhotoIdx] = useState(1);
  const [shelfDir, setShelfDir] = useState(null);
  const openShelfPhoto = useCallback((idx) => {
    setShelfDir(null);
    setShelfPhotoIdx(idx);
    shelfWin.open();
  }, [shelfWin]);
  const prevShelfPhoto = useCallback(() => {
    setShelfDir('prev');
    setShelfPhotoIdx(i => (i - 2 + SHELF_TOTAL) % SHELF_TOTAL + 1);
  }, []);
  const nextShelfPhoto = useCallback(() => {
    setShelfDir('next');
    setShelfPhotoIdx(i => i % SHELF_TOTAL + 1);
  }, []);

  // If meeting or theater window closes while Joe is in that room, send him home
  const sendHome = useCallback(() => {
    setJoinedRoomId(null);
    const joeOffice = (FLOORS[activeFloor] || []).find(r => r.type === 'private' && r.people.some(p => p.avatar === JOE.avatar));
    if (joeOffice) {
      setHomecomingId(joeOffice.id);
      setTimeout(() => setHomecomingId(null), 700);
    }
  }, [activeFloor]);

  const wasMeetingOpenRef = useRef(false);
  useEffect(() => {
    if (wasMeetingOpenRef.current && !meetingWin.isOpen) {
      if (suppressHomeRef.current) suppressHomeRef.current = false;
      else sendHome();
    }
    wasMeetingOpenRef.current = meetingWin.isOpen;
  }, [meetingWin.isOpen, sendHome]);

  const wasTheaterOpenRef = useRef(false);
  useEffect(() => {
    if (wasTheaterOpenRef.current && !theaterWin.isOpen) {
      if (suppressHomeRef.current) suppressHomeRef.current = false;
      else sendHome();
    }
    wasTheaterOpenRef.current = theaterWin.isOpen;
  }, [theaterWin.isOpen, sendHome]);

  useEffect(() => {
    if (!shelfWin.isOpen || !shelfWin.isFocused) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevShelfPhoto(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextShelfPhoto(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shelfWin.isOpen, shelfWin.isFocused, prevShelfPhoto, nextShelfPhoto]);

  // Preload all shelf photos when the window opens so nav is instant
  useEffect(() => {
    if (!shelfWin.isOpen) return;
    const imgs = [];
    for (let i = 1; i <= SHELF_TOTAL; i++) {
      const img = new Image();
      img.src = `/shelf/photos/photo-${i}.png`;
      imgs.push(img);
    }
  }, [shelfWin.isOpen]);
  const JOE = { name: 'Joe W.', fullName: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' };

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

  // Randomly cycle vibe coding — spread across private rooms all over the floor
  useEffect(() => {
    const privateRooms = currentFloorRooms.filter(
      r => r.type === 'private' && r.people.length === 1
    );
    if (privateRooms.length < 2) return;
    const timers = [];
    const MAX_VIBES = Math.min(8, Math.max(3, Math.round(privateRooms.length * 0.25)));
    const MIN_VIBES = Math.min(3, Math.max(2, Math.round(privateRooms.length * 0.12)));
    const SEED_COUNT = MAX_VIBES;

    // Start a vibe on a random room, then stop it after a random duration
    const startVibe = () => {
      setActiveVibes(prev => {
        const activeIds = Object.keys(prev);
        if (activeIds.length >= MAX_VIBES) return prev;
        const available = privateRooms.filter(r => !prev[r.id]);
        if (available.length === 0) return prev;
        const room = available[Math.floor(Math.random() * available.length)];
        // Always have all 3 vibe types visible — pick whichever is currently least represented
        const counts = { claude: 0, codex: 0, both: 0 };
        Object.values(prev).forEach(v => { if (counts[v] != null) counts[v]++; });
        const minCount = Math.min(counts.claude, counts.codex, counts.both);
        const candidates = Object.keys(counts).filter(k => counts[k] === minCount);
        const type = candidates[Math.floor(Math.random() * candidates.length)];
        return { ...prev, [room.id]: type };
      });
    };

    const stopRandomVibe = () => {
      setActiveVibes(prev => {
        const activeIds = Object.keys(prev);
        if (activeIds.length <= MIN_VIBES) return prev;
        const removeId = activeIds[Math.floor(Math.random() * activeIds.length)];
        const next = { ...prev };
        delete next[removeId];
        return next;
      });
    };

    // Schedule starts and stops independently
    const scheduleStart = () => {
      const delay = 3000 + Math.random() * 5000;
      timers.push(setTimeout(() => { startVibe(); scheduleStart(); }, delay));
    };

    const scheduleStop = () => {
      const delay = 6000 + Math.random() * 9000;
      timers.push(setTimeout(() => { stopRandomVibe(); scheduleStop(); }, delay));
    };

    // Seed with initial vibes staggered across the floor
    for (let i = 0; i < SEED_COUNT; i++) {
      const delay = i === 0 ? 0 : 200 + i * (250 + Math.random() * 400);
      if (delay === 0) startVibe();
      else timers.push(setTimeout(startVibe, delay));
    }

    scheduleStart();
    scheduleStop();

    return () => timers.forEach(t => clearTimeout(t));
  }, [activeFloor]);
  const windowRef = useRef(null);
  const viewportRef = useRef(null);
  const productsBarRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'light' ? '#FFFFFF' : '#0C0C0E';
    return () => {
      document.documentElement.removeAttribute('data-theme');
      document.body.style.background = '';
    };
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
      <div className="sc-navbar-wrap" data-logo-visible={navLogoVisible} style={HIDE_CHROME ? { display: 'none' } : undefined}>
        <div className="sc-platform-badge" aria-hidden={navLogoVisible}>
          <span className="sc-platform-badge-text">VIRTUAL OFFICE PLATFORM</span>
        </div>
        <Navbar />
      </div>

      <div className="miniRoamOS" ref={miniRoamRef}>
        <div className="sc-wallpaper sc-wallpaper-dark" style={{ opacity: theme === 'dark' ? 1 : 0 }} />
        <div className="sc-wallpaper sc-wallpaper-light" style={{ opacity: theme === 'light' ? 1 : 0 }} />
      <div className={`sc-window ${!mapWin.isFocused ? 'sc-window-unfocused' : ''} ${mapMounted ? 'sc-window-mounted' : ''} ${mapPulse ? 'sc-window-pulse' : ''}`} ref={windowRef} style={{ transform: `translate(${mapWin.position.x}px, ${mapWin.position.y}px)`, zIndex: mapWin.zIndex }} onMouseDown={() => mapWin.focus()}>
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
                      <TheaterRoomCard
                        room={room}
                        speakers={theaterSpeakers}
                        onPersonClick={openMiniChat}
                        onRoomClick={() => theaterWin.open()}
                        speakerStories={speakerStories}
                        viewedStories={viewedStories}
                        onStoryClick={(storyImage) => {
                          const speaker = theaterSpeakers.find(s => speakerStories[s.name] === storyImage);
                          setViewedStories(prev => ({ ...prev, [storyImage]: true }));
                          setStoryViewer({
                            stories: [{ image: storyImage, avatar: speaker?.avatar, name: speaker?.fullName || speaker?.name }],
                            initialIndex: 0,
                          });
                        }}
                      />
                    ) : room.type === 'meeting' ? (
                      <MeetingRoomCardShowcase room={{ ...room, people: joinedRoomId === room.id && !room.people.some(p => p.avatar === JOE.avatar) ? [...room.people, { ...JOE, isJoining: true }] : room.people }} onPersonClick={openMiniChat} onRoomClick={(r) => { setJoinedRoomId(r.id); const ppl = r.people.some(p => p.avatar === JOE.avatar) ? r.people : [...r.people, JOE]; setActiveMeetingRoom({ ...r, people: ppl }); meetingWin.open(); }} />
                    ) : room.type === 'game' ? (
                      <GameRoomCard room={room} />
                    ) : room.type === 'command' ? (
                      <CommandCenterCard room={room} />
                    ) : (
                      <PrivateRoomCard
                        onPersonClick={openMiniChat}
                        onRoomClick={room.people.length === 0 ? undefined : (r) => {
                          if (joinedRoomId === r.id) return;
                          const isMyOffice = room.people.some(p => p.avatar === JOE.avatar);
                          if (isMyOffice) {
                            if (knockingRoom) {
                              clearTimeout(knockTimerRef.current);
                              setKnockingRoom(null);
                            }
                            if (meetingWin.isOpen) meetingWin.close();
                            if (theaterWin.isOpen) theaterWin.close();
                            setJoinedRoomId(null);
                            setHomecomingId(room.id);
                            setTimeout(() => setHomecomingId(null), 700);
                            return;
                          }
                          if (knockingRoom) return;
                          setKnockingRoom(r);
                          knockTimerRef.current = setTimeout(() => {
                            setKnockingRoom(null);
                            if (meetingWin.isOpen || theaterWin.isOpen) suppressHomeRef.current = true;
                            if (meetingWin.isOpen) meetingWin.close();
                            if (theaterWin.isOpen) theaterWin.close();
                            setJoinedRoomId(r.id);
                          }, 3000);
                        }}
                        room={{
                          ...room,
                          people: joinedRoomId === room.id && !room.people.some(p => p.avatar === JOE.avatar)
                            ? [...room.people, { ...JOE, isJoining: true }]
                            : joinedRoomId && joinedRoomId !== room.id
                              ? room.people.filter(p => p.avatar !== JOE.avatar)
                              : homecomingId === room.id
                                ? room.people.map(p => p.avatar === JOE.avatar ? { ...p, isJoining: true } : p)
                                : room.people,
                          vibe: activeVibes[room.id] || null,
                        }}
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

        {/* Shelf overlay — dims the entire window behind the open shelf */}
        {shelfActive && <div className={`sc-shelf-overlay ${shelfClosing ? 'sc-shelf-overlay-closing' : ''}`} onClick={closeShelf} />}

        {/* Shelf — absolute-positioned, sits above the toolbar */}
        <div className={`sc-shelf-wrap ${shelfActive ? 'sc-shelf-wrap-open' : ''}`}>
            <div className={`sc-shelf ${shelfOpen ? 'sc-shelf-hidden' : ''}`}>
              <div className="sc-shelf-items">
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className="sc-shelf-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openShelfPhoto(idx)}
                  >
                    <img src={`/shelf/photos/photo-${idx}.png`} alt="" />
                  </div>
                ))}
              </div>
              <div className="sc-shelf-base" />
              <button className="sc-shelf-chevron" aria-label="Open shelf" onClick={() => setShelfOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            {shelfActive && (
              <div className={`sc-shelf-open ${shelfClosing ? 'sc-shelf-open-closing' : ''}`}>
                <div className="sc-shelf-open-header">
                  <div className="sc-shelf-open-pill">
                    <span className="sc-shelf-open-title">Joe's Shelf</span>
                    <div className="sc-shelf-open-avatars">
                      <img className="sc-shelf-open-avatar" src={JOE.avatar} alt="" />
                    </div>
                  </div>
                  <div className="sc-toolbar-pill sc-shelf-open-close" aria-label="Close shelf" onClick={closeShelf}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 7 7)"/></svg>
                  </div>
                </div>
                {(() => {
                  const SIZES = [
                    // Row 0 — 4 items
                    { w: 58, h: 46 }, { w: 44, h: 58 }, { w: 62, h: 44 }, { w: 48, h: 60 },
                    // Row 1 — 4 items
                    { w: 60, h: 48 }, { w: 52, h: 62 }, { w: 68, h: 44 }, { w: 56, h: 56 },
                    // Row 2 — 4 items
                    { w: 70, h: 52 }, { w: 48, h: 60 }, { w: 62, h: 44 }, { w: 58, h: 58 },
                  ];
                  const ROW_COUNTS = [4, 4, 4];
                  let startIdx = 0;
                  return ROW_COUNTS.map((count, rowIdx) => {
                    const rowStart = startIdx;
                    startIdx += count;
                    return (
                      <div key={rowIdx} className="sc-shelf-open-row">
                        <div className="sc-shelf-open-items">
                          {Array.from({ length: count }).map((_, i) => {
                            const idx = rowStart + i;
                            if (idx >= SIZES.length) return null;
                            const { w, h } = SIZES[idx];
                            const photoIdx = idx + 1;
                            return (
                              <div
                                key={i}
                                className="sc-shelf-item"
                                style={{ width: w, height: h, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); openShelfPhoto(photoIdx); }}
                              >
                                <img src={`/shelf/photos/photo-${photoIdx}.png`} alt="" />
                              </div>
                            );
                          })}
                        </div>
                        <div className="sc-shelf-base" />
                      </div>
                    );
                  });
                })()}
              </div>
            )}
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
            <div className="sc-toolbar-pill" data-tooltip="Screenshare" onClick={() => setShareOpen(true)}>
              <img src="/icons/screenshare.svg" width="16" height="16" alt="" />
            </div>
            <div className="sc-toolbar-pill" data-tooltip="Magic Minutes">
              <img src="/icons/magic-quill.svg" width="16" height="16" alt="" />
            </div>
            {joinedRoomId && (
              <div className="sc-toolbar-pill sc-toolbar-pill-exit" data-tooltip="Leave Room" onClick={() => {
                if (meetingWin.isOpen) meetingWin.close();
                if (theaterWin.isOpen) theaterWin.close();
                sendHome();
              }}>
                <img src="/icons/door.svg" width="16" height="16" alt="" />
              </div>
            )}
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
              <div className="sc-toolbar-pill" data-tooltip="Magicast" onClick={() => magicastWin.open()}>
                <img src="/icons/magicast.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Recordings">
                <img src="/icons/recordings.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="On-Air" onClick={() => onairWin.open()}>
                <img src="/icons/on-air.svg" width="16" height="16" alt="" />
              </div>
              <div className="sc-toolbar-pill" data-tooltip="Calendar">
                <img src="/icons/calendar.svg" width="16" height="16" alt="" />
              </div>
            </div>
          </div>
        </div>
        {storyViewer && <StoryViewer stories={storyViewer.stories} initialIndex={storyViewer.initialIndex} onClose={() => setStoryViewer(null)} />}
        <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
        {knockingRoom && <KnockDialog room={knockingRoom} onCancel={() => { clearTimeout(knockTimerRef.current); setKnockingRoom(null); }} />}
      </div>
      {miniChats.map(mc => (
        <MiniChat key={mc.chatId} {...mc} onClose={() => closeMiniChat(mc.chatId)} />
      ))}
      {ainboxWin.isOpen && <AInbox win={ainboxWin} onDrag={makeDragHandler(ainboxWin)} />}
      {onairWin.isOpen && <OnAir win={onairWin} onDrag={makeDragHandler(onairWin)} demo />}
      {meetingWin.isOpen && activeMeetingRoom && <MeetingWindow win={meetingWin} onDrag={makeDragHandler(meetingWin)} roomName={activeMeetingRoom.name} people={activeMeetingRoom.people} onOpenChat={() => ainboxWin.open()} onOpenOnAir={() => onairWin.open()} />}
      {theaterWin.isOpen && <TheaterWindow win={theaterWin} onDrag={makeDragHandler(theaterWin)} speakers={theaterSpeakers} audience={SHOWCASE_PEOPLE} me={JOE} onOpenChat={() => ainboxWin.open()} />}
      {shelfWin.isOpen && <ShelfWindow win={shelfWin} onDrag={makeDragHandler(shelfWin)} photoIdx={shelfPhotoIdx} direction={shelfDir} onPrev={prevShelfPhoto} onNext={nextShelfPhoto} />}
      {magicastWin.isOpen && <MagicastWindow win={magicastWin} onDrag={makeDragHandler(magicastWin)} />}
      {/* Product features bar — inside miniRoamOS, pinned to bottom */}
      <div className="sc-products-bar" ref={productsBarRef} style={HIDE_CHROME ? { display: 'none' } : undefined}>
        {[
          { name: 'Virtual Office', desc: 'See your whole team on a live map. Who\'s here, who\'s meeting, who\'s available — at a glance.' },
          { name: 'Drop-In Meetings', desc: 'Knock on someone\'s office to start a conversation instantly. No scheduling, no links.' },
          { name: 'Theater', desc: 'All-hands for 100+ people. Rows, whispers, backstage, and live Q&A — like a real auditorium.' },
          { name: 'AInbox', desc: 'DMs, group chats, threads, and confidential messages. Custom folders, pinned chats, guest badges.' },
          { name: 'Lobby', desc: 'Share a booking link. Guests reserve time or drop in if you\'re free. Your calendar, simplified.' },
          { name: 'Magicast', desc: 'AI screen recorder with picture-in-picture. Record, transcribe, and share presentations instantly.' },
          { name: 'Magic Minutes', desc: 'AI meeting summaries and transcriptions. Ask follow-up questions. Late? Get an automatic catch-up.' },
          { name: 'On-It', desc: 'Your AI assistant. Schedules meetings, sends follow-ups, extracts action items — all automatically.' },
          { name: 'On-Air', desc: 'Host immersive virtual events. Conferences, panels, and gatherings that feel like being there.' },
          { name: 'Mobile', desc: 'Take your virtual office anywhere. Full Roam experience on iOS and Android.' },
        ].map((item, i) => (
          <React.Fragment key={item.name}>
            {i > 0 && <div className="sc-products-dot" />}
            <ProductItem name={item.name} desc={item.desc} onClick={item.name === 'AInbox' ? () => ainboxWin.open() : item.name === 'On-Air' ? () => onairWin.open() : item.name === 'Theater' ? () => theaterWin.open() : item.name === 'Magicast' ? () => magicastWin.open() : item.name === 'Virtual Office' ? pulseMapWindow : item.name === 'Drop-In Meetings' ? knockOnHoward : undefined} />
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
          <div className="sc-marquee">
            <div className="sc-marquee-track">
              {Array.from({ length: 2 }).map((_, copy) => {
                const logos = [
                  { src: '/marquee/logo-wistia.svg', alt: 'Wistia', w: 110, h: 24 },
                  { src: '/marquee/logo-omni.svg', alt: 'Omni Analytics', w: 71, h: 28 },
                  { src: '/marquee/logo-customer-io.svg', alt: 'Customer.io', w: 174, h: 24 },
                  { src: '/marquee/logo-deepgram.svg', alt: 'Deepgram', w: 130, h: 30 },
                  { src: '/marquee/logo-flex.svg', alt: 'Flex', w: 63, h: 24 },
                  { src: '/marquee/logo-givecampus.svg', alt: 'GiveCampus', w: 149, h: 17 },
                  { src: '/marquee/logo-pulley.svg', alt: 'Pulley', w: 90, h: 28 },
                  { src: '/marquee/logo-keep.svg', alt: 'Keep', w: 84, h: 24 },
                  { src: '/marquee/logo-real.svg', alt: 'Real', w: 71, h: 30 },
                  { src: '/marquee/logo-sonsie.svg', alt: 'Sonsie', w: 98, h: 24 },
                  { src: '/marquee/logo-nofraud.svg', alt: 'NoFraud', w: 128, h: 24 },
                  { src: '/marquee/logo-mpire.svg', alt: 'Mpire Financial', w: 81, h: 40 },
                  { src: '/marquee/logo-frida.svg', alt: 'Fridababy', w: 70, h: 28 },
                ];
                return (
                  <div key={copy} className="sc-marquee-group" aria-hidden={copy === 1 ? 'true' : undefined}>
                    {logos.map(l => (
                      <span
                        key={l.src}
                        className="sc-marquee-logo"
                        role="img"
                        aria-label={l.alt}
                        style={{ width: l.w, height: l.h, WebkitMaskImage: `url(${l.src})`, maskImage: `url(${l.src})` }}
                      />
                    ))}
                  </div>
                );
              })}
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

      {/* Feature section — On-Air */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <div className="sc-feature-visual sc-feature-visual-left">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpaper-${theme}.png)` }}>
              <OnAir win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }} onDrag={() => {}} demo />
            </div>
          </div>
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">ON-AIR</h2>
            <p className="sc-feature-desc">Now anyone can host Immersive Events for the Creator-Era</p>
          </div>
        </div>
      </div>

      {/* Feature section — Meeting Room */}
      <div className="sc-feature-section">
        <div className="sc-section-grid">
          <div className="sc-feature-text">
            <h2 className="sc-feature-title">VIDEO CONFERENCING</h2>
            <p className="sc-feature-desc">Jump into a Meeting Room for video conferencing when you need to collaborate. When you're done, you're done! Includes high resolution screensharing and whiteboard as well. No more back-to-back video meetings filling out all day. Just meet when you need to, and when you're done, back to work.</p>
          </div>
          <div className="sc-feature-visual">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpaper-${theme}.png)` }}>
              <MeetingWindow
                win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }}
                onDrag={() => {}}
                roomName="Daily Standup"
                people={[
                  { name: 'Howard L.', fullName: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
                  { name: 'Grace S.', fullName: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg' },
                  { name: 'Derek C.', fullName: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg' },
                  { name: 'Joe W.', fullName: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature section — Theater */}
      <div className="sc-feature-section sc-feature-section-reverse">
        <div className="sc-section-grid">
          <div className="sc-feature-visual sc-feature-visual-left">
            <div className="sc-feature-wallpaper" style={{ backgroundImage: `url(/wallpaper-${theme}.png)` }}>
              <TheaterWindow
                win={{ position: { x: 0, y: 0 }, zIndex: 1, isFocused: true, focus: () => {}, close: () => {}, open: () => {} }}
                onDrag={() => {}}
                speakers={theaterSpeakers}
                audience={SHOWCASE_PEOPLE}
                me={JOE}
                onOpenChat={() => {}}
              />
            </div>
          </div>
          <div className="sc-feature-text sc-feature-text-right">
            <h2 className="sc-feature-title">THEATER</h2>
            <p className="sc-feature-desc">Take your presentations to the next level with a unique new Theater format for all-hands. Your audience sits in rows where they can whisper to each other. There's a backstage, Q&amp;A microphone, and stadium mode for 100+ people. All the world's a stage!</p>
          </div>
        </div>
      </div>

      {/* Theme capsule + grid toggle — pinned to right side */}
      <div className="sc-right-controls" style={HIDE_CHROME ? { display: 'none' } : undefined}>
        <div className="sc-theme-capsule" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          <div className={`sc-theme-capsule-knob ${theme === 'light' ? 'bottom' : ''}`} />
          <div className={`sc-theme-capsule-icon ${theme === 'dark' ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 8.5C13.3 12.1 10 14.5 6.5 13.5C3 12.5 1 9.5 2 6C2.8 3.2 5.5 1.5 8.5 2C7 3.5 6.5 6 8 8.5C9 10 11 11 14 8.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className={`sc-theme-capsule-icon ${theme === 'light' ? 'active' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M8 2V3.5M8 12.5V14M2 8H3.5M12.5 8H14M3.8 3.8L4.8 4.8M11.2 11.2L12.2 12.2M3.8 12.2L4.8 11.2M11.2 4.8L12.2 3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          </div>
        </div>
      </div>

    </div>
  );
}
