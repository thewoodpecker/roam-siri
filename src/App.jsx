import React, { useEffect, useState, useRef } from 'react';
import SiriGlow from './SiriGlow';
import { offices as officeData } from './data';
import './App.css';

const CLAUDE = '#EB6139';
const CODEX = '#FFFFFF';

function useAnimatedNumber(target) {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);
  const animRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      const diff = target - currentRef.current;
      if (Math.abs(diff) < 1) {
        currentRef.current = target;
        setDisplay(target);
        return;
      }
      currentRef.current += diff * 0.15;
      setDisplay(Math.round(currentRef.current));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [target]);

  return display;
}

const JOE_ID = 11;
const CHELSEA_ID = 4;

function StatusBubble({ onEditChange }) {
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const startEdit = () => {
    setEditing(true);
    onEditChange?.(true);
  };

  const [closing, setClosing] = useState(false);

  const stopEdit = () => {
    setClosing(true);
    onEditChange?.(false);
    setTimeout(() => {
      setEditing(false);
      setClosing(false);
    }, 400);
  };

  const dismiss = (e) => {
    e.stopPropagation();
    setStatus('');
    stopEdit();
  };

  const isPlaceholder = !status && !editing;

  return (
    <div
      ref={wrapperRef}
      className="status-wrapper corner-top-right"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="status-tail-small" />
      <div className="status-tail" />
      <div
        className={`status-bubble ${editing && !closing ? 'expanded' : ''} ${isPlaceholder && !closing ? 'placeholder' : ''}`}
        onClick={() => { if (!editing) startEdit(); }}
      >
        <div className={`status-bubble-inner ${status && !editing ? 'has-text' : ''}`}>
          {editing ? (
            <input
              ref={inputRef}
              className="status-input"
              style={{ width: Math.max(100, (status.length || 15) * 8.5) + 'px' }}
              value={status}
              placeholder="What's the vibe?"
              onChange={(e) => setStatus(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') stopEdit(); if (e.key === 'Escape') stopEdit(); }}
              onBlur={stopEdit}
              maxLength={30}
            />
          ) : (
            <span className={isPlaceholder ? 'status-text-placeholder' : 'status-text'}>{isPlaceholder ? '…' : status}</span>
          )}
        </div>
        {hovering && !editing && status && (
          <button className="status-dismiss" onClick={dismiss}>×</button>
        )}
      </div>
    </div>
  );
}

function DraggableBubble({ text }) {
  const [corner, setCorner] = useState('top-right');
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState(null);
  const [avatarCenter, setAvatarCenter] = useState(null);
  const wrapperRef = useRef(null);
  const bubbleRef = useRef(null);
  const didDrag = useRef(false);

  const getAvatarCenter = () => {
    if (!wrapperRef.current) return null;
    const person = wrapperRef.current.closest('.person');
    if (!person) return null;
    const avatar = person.querySelector('.avatar');
    if (!avatar) return null;
    const rect = avatar.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    didDrag.current = false;
    const wrapper = wrapperRef.current;
    const rect = wrapper.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const center = getAvatarCenter();

    const handlePointerMove = (e) => {
      if (!didDrag.current) {
        didDrag.current = true;
        setDragging(true);
        setAvatarCenter(center);
      }
      setDragPos({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    };

    const handlePointerUp = (e) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (didDrag.current) {
        const ac = getAvatarCenter();
        if (ac) {
          const dx = e.clientX - ac.x;
          const dy = e.clientY - ac.y;
          setCorner(`${dy <= 0 ? 'top' : 'bottom'}-${dx >= 0 ? 'right' : 'left'}`);
        }
      }
      setDragging(false);
      setDragPos(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Dynamic tail positions while dragging — place between bubble edge and avatar
  let tailStyle = null;
  let tailSmallStyle = null;
  if (dragging && dragPos && avatarCenter && bubbleRef.current) {
    const bubbleRect = bubbleRef.current.getBoundingClientRect();
    const bx = bubbleRect.left + bubbleRect.width / 2;
    const by = bubbleRect.top + bubbleRect.height / 2;
    const ax = avatarCenter.x;
    const ay = avatarCenter.y;
    // Find the closest point on the bubble edge (ellipse approximation)
    const dx = ax - bx;
    const dy = ay - by;
    const angle = Math.atan2(dy, dx);
    const hw = bubbleRect.width / 2;
    const hh = bubbleRect.height / 2;
    // Point on ellipse edge
    const edgeX = bx + Math.cos(angle) * hw;
    const edgeY = by + Math.sin(angle) * hh;
    // Place tails between edge and avatar, 30% and 50% of the way
    const gapX = ax - edgeX;
    const gapY = ay - edgeY;
    tailStyle = {
      position: 'fixed',
      left: edgeX + gapX * 0.2 - 5,
      top: edgeY + gapY * 0.2 - 5,
      transition: 'none',
    };
    tailSmallStyle = {
      position: 'fixed',
      left: edgeX + gapX * 0.4 - 3,
      top: edgeY + gapY * 0.4 - 3,
      transition: 'none',
    };
  }

  const wrapperStyle = dragging && dragPos ? {
    position: 'fixed',
    top: dragPos.y,
    left: dragPos.x,
    transition: 'none',
  } : undefined;

  return (
    <div
      ref={wrapperRef}
      className={`status-wrapper draggable ${dragging ? '' : `corner-${corner}`}`}
      style={wrapperStyle}
      onPointerDown={handlePointerDown}
    >
      <div className="status-tail-small" style={tailSmallStyle || undefined} />
      <div className="status-tail" style={tailStyle || undefined} />
      <div ref={bubbleRef} className="status-bubble">
        <div className="status-bubble-inner has-text">
          <span className="status-text">{text}</span>
        </div>
      </div>
    </div>
  );
}

const DEV_ACTIVITIES = [
  'Brewing', 'Cascading', 'Deploying', 'Debugging', 'Refactoring', 'Testing',
  'Reviewing', 'Shipping', 'Fixing', 'Building',
  'Migrating', 'Optimizing', 'Pushing',
];

function SmallCard({ office, isActive, glowColor }) {
  const [tokens, setTokens] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const [fading, setFading] = useState(false);
  const [activity, setActivity] = useState('');
  const [activityFading, setActivityFading] = useState(false);
  const [showTokens, setShowTokens] = useState(true);
  const [statusEditing, setStatusEditing] = useState(false);
  const intervalRef = useRef(null);
  const activityRef = useRef(null);
  const isJoe = office.id === JOE_ID;
  const isChelsea = office.id === CHELSEA_ID;

  useEffect(() => {
    if (isActive) {
      setTokens(0);
      setFading(false);
      setShowLabel(true);
      setActivity(DEV_ACTIVITIES[Math.floor(Math.random() * DEV_ACTIVITIES.length)]);
      setActivityFading(false);
      setShowTokens(true);
      intervalRef.current = setInterval(() => {
        setTokens(prev => prev + Math.floor(Math.random() * 40 + 10));
      }, 200);
      // Alternate between tokens and activity
      activityRef.current = setInterval(() => {
        setActivityFading(true);
        setTimeout(() => {
          setShowTokens(prev => {
            if (prev) {
              // Switching to activity — pick a new one
              setActivity(DEV_ACTIVITIES[Math.floor(Math.random() * DEV_ACTIVITIES.length)]);
            }
            return !prev;
          });
          setActivityFading(false);
        }, 400);
      }, 3000 + Math.random() * 2000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (activityRef.current) clearInterval(activityRef.current);
      if (showLabel) {
        setFading(true);
        const t = setTimeout(() => { setShowLabel(false); setFading(false); }, 500);
        return () => clearTimeout(t);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (activityRef.current) clearInterval(activityRef.current);
    };
  }, [isActive]);

  const displayTokens = useAnimatedNumber(tokens);

  return (
    <div className="office-card">
      <SiriGlow active={isActive} color={glowColor} borderRadius={12} />
      {showLabel && (
        <span className={`token-label ${fading ? 'fade-out' : ''}`} style={{ color: glowColor === CLAUDE ? 'rgba(235, 97, 57, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}>
          <span className={`activity-text ${activityFading ? 'activity-fade-out' : 'activity-fade-in'}`}>
            {showTokens ? `${displayTokens.toLocaleString()} tk` : activity}
          </span>
          <img
            className="ai-icon"
            src={glowColor === CLAUDE ? '/claude-ai-icon.svg' : '/chatgpt-icon.svg'}
            alt=""
          />
        </span>
      )}
      <div className="card-header">
        <h3 className={`office-name ${showLabel ? 'name-hidden' : ''}`}>{office.name}</h3>
        {!showLabel && office.icon === 'lock' && <span className="card-icon">🔒</span>}
        {!showLabel && office.icon === 'verified' && <span className="card-icon">✅</span>}
      </div>
      <div className="people">
        {office.people.map((person, i) => (
          <div key={i} className="person">
            {isJoe && <StatusBubble onEditChange={setStatusEditing} />}
            {isChelsea && <DraggableBubble text="In a meeting" />}
            <img
              className="avatar"
              src={person.avatar}
              alt={person.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeMap, setActiveMap] = useState({});

  const small = officeData.filter(o => o.size === 'small');

  // Randomly activate offices with random Claude/Codex
  useEffect(() => {
    if (small.length === 0) return;
    const ids = small.map(o => o.id);

    const tick = () => {
      setActiveMap(prev => {
        // Pick an office that isn't already active
        const available = ids.filter(id => !prev[id]);
        if (available.length === 0) return prev;
        const id = available[Math.floor(Math.random() * available.length)];
        const color = Math.random() > 0.5 ? CLAUDE : CODEX;

        // Most are 5-20s, but ~20% run for 1-5 minutes (long agent sessions)
        const duration = Math.random() < 0.2
          ? 60000 + Math.random() * 240000
          : 5000 + Math.random() * 15000;
        setTimeout(() => {
          setActiveMap(p => {
            const next = { ...p };
            delete next[id];
            return next;
          });
        }, duration);

        return { ...prev, [id]: color };
      });
    };

    for (let i = 0; i < 2; i++) {
      setTimeout(tick, i * 800);
    }

    const interval = setInterval(tick, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [small.length]);

  const [cols, setCols] = useState(5);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 600) setCols(2);
      else if (w <= 900) setCols(3);
      else setCols(5);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const rows = [];
  for (let i = 0; i < small.length; i += cols) {
    rows.push(small.slice(i, i + cols));
  }

  return (
    <div className="layout">
      <div className="brick-grid">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={`brick-row ${rowIdx % 2 === 1 ? 'offset' : ''}`} style={row.some(o => o.id === JOE_ID) ? { zIndex: 99999, position: 'relative' } : undefined}>
            {row.map(o => (
              <div key={o.id} className={`grid-item ${(o.id === JOE_ID || o.id === CHELSEA_ID) ? 'has-bubble' : ''}`}>
                <SmallCard
                  office={o}
                  isActive={!!activeMap[o.id]}
                  glowColor={activeMap[o.id] || CLAUDE}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
