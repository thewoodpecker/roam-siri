import React, { useEffect, useState, useRef } from 'react';
import SiriGlow from './SiriGlow';
import { offices as officeData, meetingRooms } from './data';
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
  { bg: null, text: null, placeholder: null, swatch: 'shimmer', shimmer: true },
  { bg: null, text: null, placeholder: null, swatch: 'gradient-green', gradient: 'linear-gradient(90deg, #D4FC79, #96E6A1, #D4FC79)' },
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
      className={`status-wrapper corner-top-right ${float.floating && !editing ? 'floating' : ''} ${editing && !closing ? 'editing-active' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {editing && !closing && (
        <div className="color-swatches">
          {BUBBLE_COLORS.map((c, i) => (
            <button
              key={i}
              className={`color-swatch ${colorIdx === i ? 'swatch-active' : ''}`}
              style={{ background: c.swatch === 'shimmer' ? 'linear-gradient(90deg, #888, #fff, #888)' : c.gradient ? c.gradient : c.swatch }}
              onMouseDown={(e) => { e.preventDefault(); setColorIdx(i); inputRef.current?.focus(); }}
            />
          ))}
        </div>
      )}
      <div className="status-tail-small" style={bgStyle} />
      <div className="status-tail" style={bgStyle} />
      <div
        className={`status-bubble ${isPlaceholder && !closing ? 'placeholder' : ''}`}
        style={{ ...bgStyle, ...(editing ? { minWidth: '40px' } : {}) }}
        onClick={() => { if (!editing) startEdit(); }}
      >
        <div className="status-bubble-inner">
          {editing ? (
            <input
              ref={inputRef}
              className={`status-input ${activeColor.shimmer && status ? 'shimmer-text' : ''} ${activeColor.gradient && status ? 'gradient-text-green' : ''}`}
              style={{ opacity: closing ? 0 : 1, transition: 'opacity 0.2s ease-out, color 0.2s ease-out, width 0.2s ease-out', width: Math.max(status.length * 8, 105) + 'px', color: activeColor.shimmer ? undefined : textColor, '--placeholder-color': activeColor.placeholder || 'rgba(255, 255, 255, 0.35)' }}
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
            <span className={`${isPlaceholder ? 'status-text-placeholder' : 'status-text'} ${activeColor.shimmer ? 'shimmer-text' : ''} ${activeColor.gradient ? 'gradient-text-green' : ''} ${!activeColor.shimmer && !activeColor.gradient ? 'status-fade-in' : ''}`} style={textColor ? { color: textColor } : undefined}>{isPlaceholder ? '…' : status}</span>
          )}
        </div>
        <DismissButton visible={hovering && !editing && !!status} onClick={dismiss} />
      </div>
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
              style={{ opacity: closing ? 0 : 1, transition: 'opacity 0.2s ease-out', width: Math.max(status.length * 8, 105) + 'px' }}
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

const STATIC_STATUSES = {};

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
  const hasColorBubble = false;
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
        <span className={`token-label ${fading ? 'fade-out' : ''}`}>
          <img
            className="ai-icon"
            src="/claude-ai-icon.svg"
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

function CrowdScrollWrap({ children, scrollEnabled, disableAutoScroll }) {
  const scrollRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScroll = scrollHeight > clientHeight;
      wrap.classList.toggle('mask-top', canScroll && scrollTop > 4);
      wrap.classList.toggle('mask-bottom', canScroll && scrollTop < scrollHeight - clientHeight - 4);
    };
    el.addEventListener('scroll', update);
    const observer = new MutationObserver(update);
    observer.observe(el, { childList: true, subtree: true });
    update();
    return () => { el.removeEventListener('scroll', update); observer.disconnect(); };
  }, []);

  // Auto-scroll to bottom as new dots arrive, stop once user scrolls up
  const userScrolledRef = useRef(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      userScrolledRef.current = scrollHeight - scrollTop - clientHeight > 60;
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (disableAutoScroll || userScrolledRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });

  return (
    <div ref={wrapRef} className={`crowd-scroll-wrap ${scrollEnabled ? '' : 'no-scroll'}`}>
      <div ref={scrollRef} className="crowd-scroll">
        {children}
      </div>
    </div>
  );
}

function TheaterGrid({ room, arrivedCount, speakerOverride, showSeats, joinedSeat, onJoinSeat }) {
  const [activeSpeakers, setActiveSpeakers] = useState([]);
  const [people, setPeople] = useState(room.people);
  const basePeople = useRef(room.people.slice());
  const sizeMode = arrivedCount <= SIZE_FULL ? 'full' : arrivedCount <= SIZE_SMALL ? 'small' : 'dots';
  const isTheaterMode = sizeMode === 'dots';
  const maxArrivedRef = useRef(0);
  if (arrivedCount > maxArrivedRef.current) maxArrivedRef.current = arrivedCount;
  useEffect(() => {
    if (arrivedCount < maxArrivedRef.current) {
      const t = setTimeout(() => { maxArrivedRef.current = arrivedCount; }, 350);
      return () => clearTimeout(t);
    }
  }, [arrivedCount]);
  const renderCount = Math.max(arrivedCount, maxArrivedRef.current);

  // Grow people array
  useEffect(() => {
    if (arrivedCount > people.length) {
      const base = basePeople.current;
      const newPeople = [...people];
      while (newPeople.length < arrivedCount) {
        const src = base[newPeople.length % base.length];
        newPeople.push({ ...src, name: `${src.displayName || src.name}_${newPeople.length}` });
      }
      setPeople(newPeople);
    }
  }, [arrivedCount]);

  // Rotate active speakers once in theater mode
  useEffect(() => {
    if (!isTheaterMode) return;
    const timers = [];
    const promote = () => {
      const idx = Math.floor(Math.random() * Math.min(arrivedCount, people.length));
      const person = people[idx];
      if (!person) return;
      const maxSpeakers = speakerOverride || 6;
      setActiveSpeakers(prev => {
        if (prev.length >= maxSpeakers || prev.some(s => s.idx === idx)) return prev;
        return [...prev, { idx, person }];
      });
      const duration = 5000 + Math.random() * 10000;
      const t = setTimeout(() => {
        setActiveSpeakers(prev => prev.filter(s => s.idx !== idx));
      }, duration);
      timers.push(t);
    };
    for (let i = 0; i < 3; i++) {
      const t = setTimeout(promote, 500 + i * 800);
      timers.push(t);
    }
    const interval = setInterval(promote, 2000 + Math.random() * 3000);
    return () => { clearInterval(interval); timers.forEach(t => clearTimeout(t)); };
  }, [isTheaterMode, speakerOverride]);

  // Trim speakers if override reduces
  useEffect(() => {
    if (speakerOverride) {
      setActiveSpeakers(prev => prev.slice(0, speakerOverride));
    }
  }, [speakerOverride]);

  // Speaking indicator for dots
  const [dotSpeakers, setDotSpeakers] = useState({});
  useEffect(() => {
    if (!isTheaterMode) return;
    const timers = [];
    const startSpeaker = () => {
      setDotSpeakers(prev => {
        if (Object.keys(prev).length >= 2) return prev;
        const idx = Math.floor(Math.random() * Math.min(arrivedCount, people.length));
        if (prev[idx] || activeSpeakers.some(s => s.idx === idx)) return prev;
        return { ...prev, [idx]: true };
      });
      const idx = Math.floor(Math.random() * Math.min(arrivedCount, people.length));
      const t = setTimeout(() => {
        setDotSpeakers(prev => { const n = { ...prev }; delete n[idx]; return n; });
      }, 1500 + Math.random() * 3000);
      timers.push(t);
    };
    const interval = setInterval(startSpeaker, 2000 + Math.random() * 3000);
    return () => { clearInterval(interval); timers.forEach(t => clearTimeout(t)); };
  }, [isTheaterMode, arrivedCount, activeSpeakers.length]);

  // Speaking indicator for avatar mode
  const [speakers, setSpeakers] = useState({});
  useEffect(() => {
    if (isTheaterMode) return;
    const timers = [];
    const startSpeaker = () => {
      setSpeakers(prev => {
        if (Object.keys(prev).length >= 2) return prev;
        const idx = Math.floor(Math.random() * Math.min(arrivedCount, people.length));
        if (prev[idx]) return prev;
        return { ...prev, [idx]: true };
      });
      const idx = Math.floor(Math.random() * Math.min(arrivedCount, people.length));
      const t = setTimeout(() => {
        setSpeakers(prev => { const n = { ...prev }; delete n[idx]; return n; });
      }, 1500 + Math.random() * 4000);
      timers.push(t);
    };
    if (arrivedCount > 0) {
      const t = setTimeout(startSpeaker, Math.random() * 1000);
      timers.push(t);
    }
    const interval = setInterval(() => { if (arrivedCount > 0) startSpeaker(); }, 2000 + Math.random() * 3000);
    return () => { clearInterval(interval); timers.forEach(t => clearTimeout(t)); };
  }, [isTheaterMode, arrivedCount]);

  // Calculate seat count to fill the card
  const cardW = 320 - 32;
  const cardH = 340 - 40;
  const itemSize = isTheaterMode ? 6 : sizeMode === 'full' ? 48 : sizeMode === 'small' ? 24 : 6;
  const gapSize = isTheaterMode ? 3 : sizeMode === 'full' ? 8 : sizeMode === 'small' ? 5 : 3;
  const cols = Math.floor((cardW + gapSize) / (itemSize + gapSize));
  const rowsFit = Math.floor((cardH + gapSize) / (itemSize + gapSize));
  const totalSeats = cols * rowsFit;

  if (!isTheaterMode) {
    // Full / small avatar mode
    const visibleCount = Math.max(renderCount, showSeats ? totalSeats : 0);
    return (
      <div className={`crowd-container crowd-${sizeMode}`} style={{ padding: '4px 16px' }}>
        {Array.from({ length: visibleCount }).map((_, i) => {
          const person = people[i];
          const isOccupied = i < arrivedCount;
          const isJoined = joinedSeat === i;
          const isLeaving = i >= arrivedCount && i < renderCount;
          const isEmpty = !isOccupied && !isJoined;

          if (isJoined) {
            return (
              <div key={i} className="crowd-item">
                <img className="avatar crowd-avatar" src="/headshots/joe-woodward.jpg" alt="Joe Woodward" />
                <div className="avatar-hover-name">
                  <span className="dot-hover-name">Joe Woodward</span>
                </div>
              </div>
            );
          }

          if (isEmpty && showSeats) {
            return (
              <div key={i} className="crowd-item seat-empty" onClick={() => onJoinSeat?.(i)}>
                <div className="seat-circle" />
                <img className="seat-preview-avatar" src="/headshots/joe-woodward.jpg" alt="" />
              </div>
            );
          }

          if (!person || isEmpty) return null;

          return (
            <div key={i} className={`crowd-item ${isLeaving ? 'crowd-item-leaving' : ''}`}>
              <img className="avatar crowd-avatar" src={person.avatar} alt={person.displayName || person.name} />
              <div className={`crowd-speak ${speakers[i] ? 'speaking' : ''}`} />
              <div className="avatar-hover-name">
                <span className="dot-hover-name">{person.displayName || person.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const activeSpeakerIdxs = new Set(activeSpeakers.map(s => s.idx));
  const passivePeople = people.slice(0, arrivedCount).filter((_, i) => !activeSpeakerIdxs.has(i));

  return (
    <div className="theater-container">
      {activeSpeakers.length > 0 && (
        <div className="theater-stage">
          {activeSpeakers.map(({ idx, person }) => (
            <div key={idx} className="theater-speaker">
              <div className="theater-avatar-wrap">
                <img className="avatar theater-avatar" src={person.avatar} alt={person.displayName || person.name} />
                <div className="theater-speak-ring" style={{ animationDelay: `${(idx * 0.37) % 1.2}s` }} />
              </div>
              <div className="theater-name"><span className="dot-hover-name">{person.displayName || person.name}</span></div>
            </div>
          ))}
        </div>
      )}
      <CrowdScrollWrap scrollEnabled={true} disableAutoScroll={showSeats}>
        <div className="theater-audience">
          {Array.from({ length: showSeats ? totalSeats : passivePeople.length }).map((_, i) => {
            const person = passivePeople[i];
            const isOccupied = i < passivePeople.length && person;
            const isEmpty = !isOccupied;

            if (isEmpty && showSeats) {
              return (
                <div key={i} className="crowd-item crowd-dots-item seat-empty" onClick={() => onJoinSeat?.(`dot-${i}`)}>
                  <div className="seat-circle seat-dot" />
                </div>
              );
            }

            if (!isOccupied) return null;

            return (
              <div key={person.name} className={`crowd-item crowd-dots-item ${i < cols * 3 ? 'dot-hover-below' : ''}`}>
                <div className="theater-dot theater-dot-occupied" />
                <div className={`dot-speaking-ring ${dotSpeakers[i] ? 'speaking' : ''}`} />
                {person.avatar && (
                  <div className="dot-hover-avatar">
                    <img src={person.avatar} alt="" />
                    <span className="dot-hover-name">{person.displayName || person.name}</span>
                  </div>
                )}
              </div>
            );
          })}
          {joinedSeat && joinedSeat.startsWith('dot-') && (
            <div className="crowd-item crowd-dots-item">
              <div className="theater-dot theater-dot-joined" />
            </div>
          )}
        </div>
      </CrowdScrollWrap>
    </div>
  );
}

// Thresholds: full avatars → small avatars → dots
const SIZE_FULL = 12;   // up to 12: 48px avatars
const SIZE_SMALL = 40;  // up to 40: 24px avatars
                        // 40+: 6px dots

function CrowdGrid({ room, activeUsers, arrivedCount }) {
  const [speakers, setSpeakers] = useState({});
  const containerRef = useRef(null);
  const itemRectsRef = useRef(new Map());
  const prevModeRef = useRef(null);

  // FLIP: capture positions before mode change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sizeMode = arrivedCount <= SIZE_FULL ? 'full' : arrivedCount <= SIZE_SMALL ? 'small' : 'dots';
    if (prevModeRef.current && prevModeRef.current !== sizeMode) {
      // Capture current positions
      const rects = new Map();
      Array.from(container.children).forEach((el, i) => {
        rects.set(i, el.getBoundingClientRect());
      });
      itemRectsRef.current = rects;
    }
    prevModeRef.current = sizeMode;
  });

  // FLIP: after render, animate from old to new position
  useEffect(() => {
    const container = containerRef.current;
    const oldRects = itemRectsRef.current;
    if (!container || oldRects.size === 0) return;

    requestAnimationFrame(() => {
      Array.from(container.children).forEach((el, i) => {
        const oldRect = oldRects.get(i);
        if (!oldRect) return;
        const newRect = el.getBoundingClientRect();
        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;

        requestAnimationFrame(() => {
          el.style.transition = 'transform 1s ease-in-out';
          el.style.transform = '';
          const onEnd = () => {
            el.style.transition = '';
            el.removeEventListener('transitionend', onEnd);
          };
          el.addEventListener('transitionend', onEnd);
        });
      });
      itemRectsRef.current = new Map();
    });
  });

  // Grow people array dynamically as more arrive
  const basePeople = useRef(room.people.slice());
  const [people, setPeople] = useState(room.people);
  useEffect(() => {
    if (arrivedCount > people.length) {
      const base = basePeople.current;
      const newPeople = [...people];
      while (newPeople.length < arrivedCount) {
        const src = base[newPeople.length % base.length];
        newPeople.push({ ...src, name: `${src.displayName || src.name}_${newPeople.length}` });
      }
      setPeople(newPeople);
    }
  }, [arrivedCount]);

  const sizeMode = arrivedCount <= SIZE_FULL ? 'full' : arrivedCount <= SIZE_SMALL ? 'small' : 'dots';
  const maxArrivedRef = useRef(0);
  if (arrivedCount > maxArrivedRef.current) maxArrivedRef.current = arrivedCount;
  // Shrink max after exit animations complete
  useEffect(() => {
    if (arrivedCount < maxArrivedRef.current) {
      const t = setTimeout(() => { maxArrivedRef.current = arrivedCount; }, 350);
      return () => clearTimeout(t);
    }
  }, [arrivedCount]);
  const renderCount = Math.max(arrivedCount, maxArrivedRef.current);

  useEffect(() => {
    const timers = [];
    const startSpeaker = () => {
      setSpeakers(prev => {
        if (Object.keys(prev).length >= 2) return prev;
        const idx = Math.floor(Math.random() * Math.min(arrivedCount, room.people.length));
        if (prev[idx]) return prev;
        return { ...prev, [idx]: true };
      });
      const idx = Math.floor(Math.random() * Math.min(arrivedCount, room.people.length));
      const duration = 1500 + Math.random() * 4000;
      const t = setTimeout(() => {
        setSpeakers(prev => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
      }, duration);
      timers.push(t);
    };
    if (arrivedCount > 0) {
      const t = setTimeout(startSpeaker, Math.random() * 1000);
      timers.push(t);
    }
    const interval = setInterval(() => { if (arrivedCount > 0) startSpeaker(); }, 2000 + Math.random() * 3000);
    return () => { clearInterval(interval); timers.forEach(t => clearTimeout(t)); };
  }, [arrivedCount, room.people.length]);

  return (
    <div ref={containerRef} className={`crowd-container crowd-${sizeMode}`}>
      {people.slice(0, renderCount).map((person, i) => (
        <div key={i} className={`crowd-item ${i >= arrivedCount ? 'crowd-item-leaving' : ''} ${sizeMode === 'dots' && i < 80 ? 'dot-hover-below' : ''}`}>
          <img className="avatar crowd-avatar" src={person.avatar} alt={person.displayName || person.name} />
          <div className={`crowd-speak ${speakers[i] ? 'speaking' : ''}`} />
          <div className={sizeMode === 'dots' ? 'dot-hover-avatar' : 'avatar-hover-name'}>
            {sizeMode === 'dots' && <img src={person.avatar} alt="" />}
            <span className="dot-hover-name">{person.displayName || person.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MeetingRoomCard({ room, vibeOverride, peopleOverride, speakerOverride, glowColorOverride }) {
  const [activeUsers, setActiveUsers] = useState({});
  const [tokens, setTokens] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const [fading, setFading] = useState(false);
  const [activity, setActivity] = useState('');
  const [activityFading, setActivityFading] = useState(false);
  const [showTokens, setShowTokens] = useState(true);
  const [arrivedCount, setArrivedCount] = useState(room.crowd ? 0 : room.people.length);
  const arrivedCountRef = useRef(0);
  const pauseStartedRef = useRef(false);
  const drainingRef = useRef(false);
  useEffect(() => { arrivedCountRef.current = arrivedCount; }, [arrivedCount]);

  // peopleOverride: animate toward target count
  const peopleTargetRef = useRef(peopleOverride);
  useEffect(() => {
    if (peopleOverride === undefined || peopleOverride === null) return;
    peopleTargetRef.current = peopleOverride;
    const interval = setInterval(() => {
      setArrivedCount(prev => {
        const target = peopleTargetRef.current;
        if (prev === target) { clearInterval(interval); return prev; }
        if (prev < target) {
          const step = Math.max(1, Math.ceil((target - prev) * 0.15));
          return Math.min(prev + step, target);
        }
        const step = Math.max(1, Math.ceil((prev - target) * 0.15));
        return Math.max(prev - step, target);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [peopleOverride]);

  // Gradually fill the room for crowd rooms
  useEffect(() => {
    if (!room.crowd) return;
    if (peopleOverride !== undefined && peopleOverride !== null) return;
    const total = room.people.length;
    const timers = [];

    const cap = total;
    // Continuous flow — people arrive and leave at random intervals
    const tick = () => {
      setArrivedCount(prev => {
        // Draining phase
        if (drainingRef.current) {
          if (Math.random() < 0.9) return Math.max(0, prev - 1 - Math.floor(Math.random() * 3));
          return prev;
        }
        // Filling phase
        if (prev >= cap) {
          // Hit cap — pause then start draining
          if (!pauseStartedRef.current) {
            pauseStartedRef.current = true;
            setTimeout(() => { drainingRef.current = true; }, 10000);
          }
          return prev;
        }
        if (prev >= SIZE_SMALL) {
          if (Math.random() < 0.95) return Math.min(cap, prev + 2 + Math.floor(Math.random() * 4));
          return Math.max(SIZE_SMALL, prev - 1);
        }
        if (Math.random() < 0.9) return prev + 1 + Math.floor(Math.random() * 2);
        if (Math.random() < 0.3) return Math.max(0, prev - 1);
        return prev;
      });
      const inDots = arrivedCountRef.current >= SIZE_SMALL;
      const delay = inDots
        ? 15 + Math.random() * 30
        : 80 + Math.random() * 200;
      const t = setTimeout(tick, delay);
      timers.push(t);
    };

    const t = setTimeout(tick, 500);
    timers.push(t);

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const activeCount = Object.keys(activeUsers).length;
  const claudeCount = Object.values(activeUsers).filter(t => t === 'claude').length;
  const codexCount = Object.values(activeUsers).filter(t => t === 'codex').length;
  const isActive = activeCount > 0;
  const activeCountRef = useRef(activeCount);
  useEffect(() => { activeCountRef.current = activeCount; }, [activeCount]);

  // Cycle people on/off
  useEffect(() => {
    if (!room.people.some(p => p.aiTool)) {
      setActiveUsers({});
      return;
    }

    if (room.crowd) {
      // Batch activation for large crowds — hover around ~20 active
      const targetActive = 20;
      const interval = setInterval(() => {
        setActiveUsers(prev => {
          const next = { ...prev };
          const currentCount = Object.keys(next).length;
          // Drift toward target: activate more if below, deactivate more if above
          const toggleCount = 3 + Math.floor(Math.random() * 5);
          for (let j = 0; j < toggleCount; j++) {
            const person = room.people[Math.floor(Math.random() * room.people.length)];
            if (next[person.name]) {
              if (currentCount > targetActive - 5 || Math.random() < 0.4) delete next[person.name];
            } else {
              if (currentCount < targetActive + 5 || Math.random() < 0.2) next[person.name] = person.aiTool;
            }
          }
          return next;
        });
      }, 1000);
      // Seed initial batch around target
      setTimeout(() => {
        setActiveUsers(() => {
          const next = {};
          const shuffled = [...room.people].sort(() => Math.random() - 0.5);
          shuffled.slice(0, targetActive).forEach(p => { next[p.name] = p.aiTool; });
          return next;
        });
      }, 500);
      return () => clearInterval(interval);
    }

    // Normal per-person activation for small rooms
    const timers = [];
    const activatePerson = (person) => {
      setActiveUsers(prev => ({ ...prev, [person.name]: person.aiTool }));
      const duration = 6000 + Math.random() * 29000;
      const t = setTimeout(() => {
        setActiveUsers(prev => {
          const next = { ...prev };
          delete next[person.name];
          return next;
        });
        const pause = 3000 + Math.random() * 15000;
        const t2 = setTimeout(() => activatePerson(person), pause);
        timers.push(t2);
      }, duration);
      timers.push(t);
    };
    room.people.forEach((person) => {
      const delay = 1000 + Math.random() * 12000;
      const t = setTimeout(() => activatePerson(person), delay);
      timers.push(t);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Dev override: force exact number of vibers
  useEffect(() => {
    if (vibeOverride === null || vibeOverride === undefined) return;
    const target = Math.min(vibeOverride, room.people.length);
    const activePeople = room.people.filter(p => p.aiTool).slice(0, target);
    const next = {};
    activePeople.forEach(p => { next[p.name] = p.aiTool; });
    setActiveUsers(next);
  }, [vibeOverride]);

  // Token counter — rate scales with active headcount
  useEffect(() => {
    if (!isActive) {
      if (showLabel) {
        setFading(true);
        const t = setTimeout(() => { setShowLabel(false); setFading(false); }, 500);
        return () => clearTimeout(t);
      }
      return;
    }
    setFading(false);
    setShowLabel(true);
    setTokens(0);
    setShowTokens(true);
    setActivity(DEV_ACTIVITIES[Math.floor(Math.random() * DEV_ACTIVITIES.length)]);
    const tokenInterval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 40 * activeCountRef.current + 10));
    }, 200);
    const actInterval = setInterval(() => {
      setActivityFading(true);
      setTimeout(() => {
        setShowTokens(prev => {
          if (prev) setActivity(DEV_ACTIVITIES[Math.floor(Math.random() * DEV_ACTIVITIES.length)]);
          return !prev;
        });
        setActivityFading(false);
      }, 400);
    }, 3000 + Math.random() * 2000);
    return () => { clearInterval(tokenInterval); clearInterval(actInterval); };
  }, [isActive]);

  const displayTokens = useAnimatedNumber(tokens);
  // Check if room has any AI tool users at all
  const hasAnyTool = room.people.some(p => p.aiTool);
  const hasCodex = room.people.some(p => p.aiTool === 'codex');
  const hasClaude = room.people.some(p => p.aiTool === 'claude');
  // Shift color redder as more Claude users pile on
  const claudeColor = claudeCount >= 4 ? '#E05A3A' : claudeCount >= 3 ? '#E04E30' : claudeCount >= 2 ? '#E05535' : CLAUDE;
  const baseColor = glowColorOverride || (hasClaude ? claudeColor : CODEX);
  const intensity = vibeOverride !== null && vibeOverride !== undefined ? vibeOverride : activeCount;

  const [hovered, setHovered] = useState(false);
  const [joinedSeat, setJoinedSeat] = useState(null);

  return (
    <div
      className={`meeting-room-card ${room.crowd ? 'meeting-room-crowd' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hasAnyTool && <SiriGlow active={isActive} color={baseColor} intensity={intensity} borderRadius={12} />}
      {!glowColorOverride && hasClaude && activeCount >= 3 && (
        <SiriGlow active={true} color="#E8604A" intensity={Math.max(activeCount - 2, 0) * 0.5} borderRadius={12} />
      )}
      {!glowColorOverride && hasCodex && hasClaude && codexCount > 0 && claudeCount > 0 && (
        <SiriGlow active={true} color={CODEX} intensity={codexCount} borderRadius={12} />
      )}
      {hasAnyTool && showLabel && (
        <span className={`token-label ${fading ? 'fade-out' : ''}`} style={{ color: glowColorOverride ? `${glowColorOverride}CC` : claudeCount >= 2 ? 'rgba(213, 37, 32, 0.8)' : hasClaude ? 'rgba(235, 97, 57, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}>
          <span className="activity-text">{activeCount} Vibing</span>
          <svg className="ai-icon" viewBox="0 0 512 509.64" xmlns="http://www.w3.org/2000/svg">
            <path fill={baseColor} d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
            <path fill={['#FFFFFF', '#00FF88', '#22D3EE', '#00D4FF'].includes(baseColor) ? '#1D1E20' : '#FCF2EE'} fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
          </svg>
        </span>
      )}
      <div className="card-header">
        <h3 className="office-name">{room.name} {arrivedCount > 20 && <span className="room-count">{arrivedCount} here</span>}</h3>
      </div>
      {room.theater ? (
        <TheaterGrid room={room} arrivedCount={arrivedCount} speakerOverride={speakerOverride} showSeats={hovered} joinedSeat={joinedSeat} onJoinSeat={setJoinedSeat} />
      ) : room.crowd ? (
        <CrowdScrollWrap scrollEnabled={arrivedCount > SIZE_SMALL}>
          <CrowdGrid room={room} activeUsers={activeUsers} arrivedCount={arrivedCount} />
        </CrowdScrollWrap>
      ) : (
        <div className="meeting-room-people">
          {room.people.map((person, i) => (
            <div key={i} className="person meeting-room-person">
              <img className="avatar" src={person.avatar} alt={person.name} />
              <div
                className={`avatar-inner-glow ${activeUsers[person.name] ? 'glow-active' : 'glow-off'}`}
                style={activeUsers[person.name] && glowColorOverride ? { borderColor: `${glowColorOverride}80` } : undefined}
              />
            </div>
          ))}
        </div>
      )}
      <div className="meeting-room-lines" />
    </div>
  );
}

function TabSwitcher({ activeTab, onTabChange }) {
  return (
    <div className="tab-switcher">
      <button
        className={`tab-button ${activeTab === 'claude-max' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('claude-max')}
      >
        Claude Max
      </button>
      <button
        className={`tab-button ${activeTab === 'big-meetings' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('big-meetings')}
      >
        Big Meetings
      </button>
    </div>
  );
}

const GLOW_COLORS = [
  { name: 'Claude', color: '#EB6139' },
  { name: 'Red', color: '#FF2D55' },
  { name: 'Blue', color: '#00D4FF' },
  { name: 'Purple', color: '#A855F7' },
  { name: 'Green', color: '#00FF88' },
  { name: 'Pink', color: '#FF3CAC' },
  { name: 'Cyan', color: '#22D3EE' },
  { name: 'White', color: '#FFFFFF' },
];

function DevControls({ room, vibeCount, onVibeCountChange, glowColor, onGlowColorChange }) {
  return (
    <div className="dev-controls">
      <div className="dev-controls-header">dev controls</div>
      <div className="dev-controls-row">
        <span className="dev-label">vibers</span>
        <input
          type="range"
          min={0}
          max={50}
          value={vibeCount}
          onChange={(e) => onVibeCountChange(Number(e.target.value))}
          className="dev-slider"
        />
        <span className="dev-value">{vibeCount}</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">glow</span>
        <div className="dev-swatches">
          {GLOW_COLORS.map(c => (
            <button
              key={c.color}
              className={`dev-swatch ${glowColor === c.color ? 'dev-swatch-active' : ''}`}
              style={{ background: c.color }}
              onClick={() => onGlowColorChange(c.color)}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClaudeMaxView() {
  const [activeMap, setActiveMap] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [warRoomVibeCount, setWarRoomVibeCount] = useState(null);
  const [warRoomGlowColor, setWarRoomGlowColor] = useState('#EB6139');

  const small = officeData.filter(o => o.size === 'small');
  const sidebarRooms = meetingRooms.filter(r => r.id !== 'walt-disney' && r.id !== 'alan-kay');

  useEffect(() => {
    if (small.length === 0) return;
    const ids = small.map(o => o.id);

    const tick = () => {
      setActiveMap(prev => {
        const available = ids.filter(id => !prev[id]);
        if (available.length === 0) return prev;
        const count = 3;
        const next = { ...prev };
        for (let i = 0; i < count; i++) {
          const remaining = available.filter(id => !next[id]);
          if (remaining.length === 0) break;
          const id = remaining[Math.floor(Math.random() * remaining.length)];

          const duration = Math.random() < 0.2
            ? 25000 + Math.random() * 50000
            : 8000 + Math.random() * 15000;
          setTimeout(() => {
            setActiveMap(p => {
              const n = { ...p };
              delete n[id];
              return n;
            });
          }, duration);

          next[id] = CLAUDE;
        }
        return next;
      });
    };

    for (let i = 0; i < 8; i++) setTimeout(tick, 200 + i * 400);

    const interval = setInterval(tick, 1500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [small.length]);

  const cols = 5;
  const rows = [];
  for (let i = 0; i < small.length; i += cols) {
    rows.push(small.slice(i, i + cols));
  }

  return (
    <div className="floor-plan">
      <div className="meeting-room-sidebar">
        {sidebarRooms.map(room => (
          <React.Fragment key={room.id}>
            <MeetingRoomCard room={room} vibeOverride={room.id === 'war-room' ? warRoomVibeCount : null} glowColorOverride={room.id === 'war-room' ? warRoomGlowColor : null} />
            {room.id === 'war-room' && (
              <DevControls room={room} vibeCount={warRoomVibeCount ?? 0} onVibeCountChange={setWarRoomVibeCount} glowColor={warRoomGlowColor} onGlowColorChange={setWarRoomGlowColor} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className={`brick-grid ${editingId != null ? 'has-editing' : ''}`}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={`brick-row ${rowIdx % 2 === 1 ? 'offset' : ''}`} style={{ zIndex: rows.length - rowIdx, position: 'relative' }}>
            {row.map(o => (
              <div key={o.id} className={`grid-item ${(o.id === JOE_ID || o.id === CHELSEA_ID || o.id === WILL_ID || o.id === 10 || o.id === 14 || o.id === 20 || STATIC_STATUSES[o.id]) ? 'has-bubble' : ''} ${editingId === o.id ? 'editing-bubble' : ''}`}>
                <SmallCard
                  office={o}
                  isActive={!!activeMap[o.id]}
                  glowColor={warRoomGlowColor}
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

function PeopleCountControls({ value, onChange, speakers, onSpeakersChange }) {
  const stops = [1, 5, 10, 25, 50, 100, 200, 500, 1000];
  const idx = stops.findIndex(s => s >= value);
  const sliderIdx = idx === -1 ? stops.length - 1 : idx;
  return (
    <div className="dev-controls" style={{ width: 320 }}>
      <div className="dev-controls-header">dev controls</div>
      <div className="dev-controls-row">
        <span className="dev-label">people</span>
        <input
          type="range"
          min={0}
          max={stops.length - 1}
          value={sliderIdx}
          onChange={(e) => onChange(stops[Number(e.target.value)])}
          className="dev-slider"
        />
        <span className="dev-value">{value}</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">speaking</span>
        <input
          type="range"
          min={1}
          max={10}
          value={speakers}
          onChange={(e) => onSpeakersChange(Number(e.target.value))}
          className="dev-slider"
        />
        <span className="dev-value">{speakers}</span>
      </div>
    </div>
  );
}

function BigMeetingsView() {
  const baseRoom = meetingRooms.find(r => r.id === 'alan-kay');
  const [peopleCount, setPeopleCount] = useState(500);
  const [speakerCount, setSpeakerCount] = useState(3);
  if (!baseRoom) return null;

  return (
    <div className="big-meetings-view">
      <div className="big-meetings-center">
        <div className="big-meeting-card">
          <MeetingRoomCard room={baseRoom} peopleOverride={peopleCount} speakerOverride={speakerCount} />
        </div>
        <PeopleCountControls value={peopleCount} onChange={setPeopleCount} speakers={speakerCount} onSpeakersChange={setSpeakerCount} />
      </div>
    </div>
  );
}

function useHashTab() {
  const getTab = () => {
    const hash = window.location.hash.replace('#', '');
    return hash === 'big-meetings' ? 'big-meetings' : 'claude-max';
  };
  const [tab, setTab] = useState(getTab);

  useEffect(() => {
    const onHash = () => setTab(getTab());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const setActiveTab = (t) => {
    window.location.hash = t;
    setTab(t);
  };

  return [tab, setActiveTab];
}

export default function App() {
  const [activeTab, setActiveTab] = useHashTab();

  return (
    <div className="layout">
      <div className="toolbar">
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {activeTab === 'claude-max' && <ClaudeMaxView />}
      {activeTab === 'big-meetings' && <BigMeetingsView />}
    </div>
  );
}
