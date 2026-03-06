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

function useRandomFloat() {
  const [floating, setFloating] = useState(false);
  const key = useRef(0);

  useEffect(() => {
    let timeout;
    const schedule = () => {
      const pause = 3000 + Math.random() * 5000;
      timeout = setTimeout(() => {
        key.current += 1;
        setFloating(true);
        timeout = setTimeout(() => {
          setFloating(false);
          schedule();
        }, 2000);
      }, pause);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  return { floating, key: key.current };
}

function DismissButton({ visible, className, ...props }) {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setExiting(false);
    } else if (mounted) {
      setExiting(true);
      const t = setTimeout(() => { setMounted(false); setExiting(false); }, 200);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;
  return <button className={`status-dismiss ${exiting ? 'dismiss-out' : ''} ${className || ''}`} {...props} />;
}

const JOE_ID = 11;
const CHELSEA_ID = 4;
const WILL_ID = 30;

const BUBBLE_COLORS = [
  { bg: null, text: null, placeholder: null, swatch: '#444' },
  { bg: '#E8E8E8', text: '#1D1E20', placeholder: 'rgba(29, 30, 32, 0.4)', swatch: '#E8E8E8' },
  { bg: '#5C2020', text: '#FF8A8A', placeholder: 'rgba(255, 138, 138, 0.4)', swatch: '#CC3333' },
  { bg: '#3A3210', text: '#FFE03C', placeholder: 'rgba(255, 224, 60, 0.4)', swatch: '#DDBB00' },
  { bg: '#103A3A', text: '#3CF5F5', placeholder: 'rgba(60, 245, 245, 0.4)', swatch: '#00CCCC' },
  { bg: '#3A1028', text: '#FF3C8E', placeholder: 'rgba(255, 60, 142, 0.4)', swatch: '#FF2D78' },
  { bg: '#103A20', text: '#46D08F', placeholder: 'rgba(70, 208, 143, 0.4)', swatch: '#2DB86E' },
];

function ColorStatusBubble({ onEditChange }) {
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const float = useRandomFloat();

  const activeColor = BUBBLE_COLORS[colorIdx];

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const startEdit = () => { setEditing(true); onEditChange?.(true); };

  const stopEdit = () => {
    setClosing(true);
    onEditChange?.(false);
    setTimeout(() => { setEditing(false); setClosing(false); }, 350);
  };

  const dismiss = (e) => {
    e.stopPropagation();
    setStatus('');
    setColorIdx(0);
    stopEdit();
  };

  const isPlaceholder = !status && !editing;
  const bgStyle = activeColor.bg ? { background: activeColor.bg } : undefined;
  const textColor = activeColor.text || undefined;

  return (
    <div
      ref={wrapperRef}
      className={`status-wrapper corner-top-right ${float.floating && !editing ? 'floating' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="status-tail-small" style={bgStyle} />
      <div className="status-tail" style={bgStyle} />
      <div
        className={`status-bubble ${isPlaceholder && !closing ? 'placeholder' : ''}`}
        style={bgStyle}
        onClick={() => { if (!editing) startEdit(); }}
      >
        <div className="status-bubble-inner">
          {editing ? (
            <input
              ref={inputRef}
              className="status-input"
              style={{ opacity: closing ? 0 : 1, transition: 'opacity 0.2s ease-out, color 0.2s ease-out', width: (status ? Math.max(status.length * 8, 24) : 105) + 'px', color: textColor, '--placeholder-color': activeColor.placeholder || 'rgba(255, 255, 255, 0.35)' }}
              value={status}
              placeholder="What's the vibe?"
              size={1}
              onChange={(e) => setStatus(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') stopEdit(); }}
              onBlur={(e) => {
                if (wrapperRef.current?.contains(e.relatedTarget)) return;
                stopEdit();
              }}
              maxLength={30}
            />
          ) : (
            <span className={`${isPlaceholder ? 'status-text-placeholder' : 'status-text'} status-fade-in`} style={textColor ? { color: textColor } : undefined}>{isPlaceholder ? '…' : status}</span>
          )}
        </div>
        <DismissButton visible={hovering && !editing && !!status} onClick={dismiss} />
      </div>
      {editing && !closing && (
        <div className="color-swatches">
          {BUBBLE_COLORS.map((c, i) => (
            <button
              key={i}
              className={`color-swatch ${colorIdx === i ? 'swatch-active' : ''}`}
              style={{ background: c.swatch }}
              onMouseDown={(e) => { e.preventDefault(); setColorIdx(i); inputRef.current?.focus(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBubble({ onEditChange }) {
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const float = useRandomFloat();

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const [closing, setClosing] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const triggerBounce = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 350);
  };

  const startEdit = () => {
    setEditing(true);
    onEditChange?.(true);
  };

  const stopEdit = () => {
    setClosing(true);
    onEditChange?.(false);
    setTimeout(() => {
      setEditing(false);
      setClosing(false);
    }, 350);
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
      className={`status-wrapper corner-top-right ${float.floating ? 'floating' : ''}`}

      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="status-tail-small" />
      <div className="status-tail" />
      <div
        className={`status-bubble ${isPlaceholder && !closing ? 'placeholder' : ''}`}
        onClick={() => { if (!editing) startEdit(); }}
      >
        <div className={`status-bubble-pop-wrap ${bouncing ? 'pop' : ''}`}>
        <div className="status-bubble-inner">
          {editing ? (
            <input
              ref={inputRef}
              className="status-input"
              style={{ opacity: closing ? 0 : 1, transition: 'opacity 0.2s ease-out', width: (status ? Math.max(status.length * 8, 24) : 105) + 'px' }}
              value={status}
              placeholder="What's the vibe?"
              size={1}
              onChange={(e) => { if (!status && e.target.value) triggerBounce(); setStatus(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') stopEdit(); if (e.key === 'Escape') stopEdit(); }}
              onBlur={stopEdit}
              maxLength={30}
            />
          ) : (
            <span className={`${isPlaceholder ? 'status-text-placeholder' : 'status-text'} status-fade-in`}>{isPlaceholder ? '…' : status}</span>
          )}
        </div>
        </div>
        <DismissButton visible={hovering && !editing && !!status} onClick={dismiss} />
      </div>
    </div>
  );
}

function DraggableBubble({ text, onDismiss }) {
  const [corner, setCorner] = useState('top-right');
  const [hovering, setHovering] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const float = useRandomFloat();
  const [justDropped, setJustDropped] = useState(false);
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
          const newCorner = `${dy <= 0 ? 'top' : 'bottom'}-${dx >= 0 ? 'right' : 'left'}`;

          // FLIP: record current position before React re-renders
          const firstRect = wrapperRef.current.getBoundingClientRect();

          setCorner(newCorner);
          setDragging(false);
          setJustDropped(true);
          setTimeout(() => setJustDropped(false), 400);
          setDragPos(null);

          // After React commits the new DOM, invert + play
          requestAnimationFrame(() => {
            const el = wrapperRef.current;
            if (!el) return;
            const lastRect = el.getBoundingClientRect();
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;

            el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            el.style.transition = 'none';

            requestAnimationFrame(() => {
              el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
              el.style.transform = 'translate(0, 0)';
              const onEnd = () => {
                el.style.transform = '';
                el.style.transition = '';
                el.removeEventListener('transitionend', onEnd);
              };
              el.addEventListener('transitionend', onEnd);
            });
          });
          return;
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

  const isLeft = corner.endsWith('-left');

  const wrapperStyle = dragging && dragPos ? {
    position: 'fixed',
    top: dragPos.y,
    left: dragPos.x,
    transition: 'none',
  } : undefined;

  return (
    <div
      ref={wrapperRef}
      className={`status-wrapper draggable ${dragging ? '' : `corner-${corner}`} ${float.floating && !dragging ? 'floating' : ''}`}

      style={wrapperStyle}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="status-tail-small" style={tailSmallStyle || undefined} />
      <div className="status-tail" style={tailStyle || undefined} />
      <div ref={bubbleRef} className="status-bubble">
        <div className="status-bubble-inner has-text">
          <span className="status-text">{text}</span>
        </div>
        {onDismiss && <DismissButton
          visible={(isLeft || (hovering && !justDropped) || dragging) && !dismissing}
          className={isLeft ? 'dismiss-left' : ''}
          onPointerDown={(e) => {
            e.stopPropagation();
            const ac = getAvatarCenter();
            const wrapperRect = wrapperRef.current.getBoundingClientRect();
            const wx = wrapperRect.left + wrapperRect.width / 2;
            const wy = wrapperRect.top + wrapperRect.height / 2;
            const dx = ac ? ac.x - wx : 0;
            const dy = ac ? ac.y - wy : 0;
            const el = wrapperRef.current;
            el.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
            el.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
            el.style.opacity = '0';
            setDismissing(true);
            setTimeout(() => onDismiss(), 200);
          }}
        />}
      </div>
    </div>
  );
}

const STATIC_STATUSES = {
  1: 'Do not disturb',
  6: 'On a call',
  13: 'AFK',
  15: 'Heads down',
};

const DEV_ACTIVITIES = [
  'Brewing', 'Cascading', 'Deploying', 'Debugging', 'Refactoring', 'Testing',
  'Reviewing', 'Shipping', 'Fixing', 'Building',
  'Migrating', 'Optimizing', 'Pushing',
];

function SmallCard({ office, isActive, glowColor, onStatusEdit }) {
  const [tokens, setTokens] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const [fading, setFading] = useState(false);
  const [activity, setActivity] = useState('');
  const [activityFading, setActivityFading] = useState(false);
  const [showTokens, setShowTokens] = useState(true);
  const setStatusEditing = (v) => onStatusEdit?.(v);
  const intervalRef = useRef(null);
  const activityRef = useRef(null);
  const isJoe = office.id === JOE_ID;
  const isJeff = office.id === 10;
  const isChelsea = office.id === CHELSEA_ID;
  const isWill = office.id === WILL_ID;
  const isMoffa = office.id === 14;
  const hasColorBubble = isJoe || isWill || isJeff || isMoffa;
  const [dismissed, setDismissed] = useState({});
  const staticStatus = !dismissed[office.id] && STATIC_STATUSES[office.id];

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
            {hasColorBubble && <ColorStatusBubble onEditChange={setStatusEditing} />}
            {isChelsea && !dismissed[CHELSEA_ID] && <DraggableBubble text="In a meeting" onDismiss={() => setDismissed(d => ({ ...d, [CHELSEA_ID]: true }))} />}
            {staticStatus && <DraggableBubble text={staticStatus} onDismiss={() => setDismissed(d => ({ ...d, [office.id]: true }))} />}
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
  const [editingId, setEditingId] = useState(null);

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

        // Most are 5-15s, but ~10% run for 30s-2 minutes (long agent sessions)
        const duration = Math.random() < 0.1
          ? 30000 + Math.random() * 90000
          : 5000 + Math.random() * 10000;
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

    setTimeout(tick, 800);

    const interval = setInterval(tick, 5000 + Math.random() * 4000);
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
      <div className={`brick-grid ${editingId != null ? 'has-editing' : ''}`}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={`brick-row ${rowIdx % 2 === 1 ? 'offset' : ''}`} style={{ zIndex: rows.length - rowIdx, position: 'relative' }}>
            {row.map(o => (
              <div key={o.id} className={`grid-item ${(o.id === JOE_ID || o.id === CHELSEA_ID || o.id === WILL_ID || o.id === 10 || o.id === 14 || STATIC_STATUSES[o.id]) ? 'has-bubble' : ''} ${editingId === o.id ? 'editing-bubble' : ''}`}>
                <SmallCard
                  office={o}
                  isActive={!!activeMap[o.id]}
                  glowColor={activeMap[o.id] || CLAUDE}
                  onStatusEdit={(v) => setEditingId(v ? o.id : null)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
