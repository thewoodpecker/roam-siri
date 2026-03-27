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

function CrowdScrollWrap({ children, scrollEnabled }) {
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
    if (userScrolledRef.current) return;
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

function MeetingRoomCard({ room }) {
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

  // Gradually fill the room for crowd rooms
  useEffect(() => {
    if (!room.crowd) return;
    const total = room.people.length;
    const timers = [];

    // Continuous flow — people arrive and leave at random intervals
    const tick = () => {
      setArrivedCount(prev => {
        // Draining phase
        if (drainingRef.current) {
          if (Math.random() < 0.9) return Math.max(0, prev - 1 - Math.floor(Math.random() * 3));
          return prev;
        }
        // Filling phase
        if (prev >= 600) {
          // Hit 600 — pause then start draining
          if (!pauseStartedRef.current) {
            pauseStartedRef.current = true;
            setTimeout(() => { drainingRef.current = true; }, 10000);
          }
          return prev;
        }
        if (prev >= SIZE_SMALL) {
          if (Math.random() < 0.95) return Math.min(600, prev + 2 + Math.floor(Math.random() * 4));
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
  const baseColor = hasClaude ? claudeColor : CODEX;
  const intensity = Math.min(activeCount, 8);

  return (
    <div className={`meeting-room-card ${room.crowd ? 'meeting-room-crowd' : ''}`}>
      {hasAnyTool && <SiriGlow active={isActive} color={baseColor} intensity={intensity} borderRadius={12} />}
      {hasClaude && activeCount >= 3 && (
        <SiriGlow active={true} color="#E8604A" intensity={Math.max(activeCount - 2, 0) * 0.5} borderRadius={12} />
      )}
      {hasCodex && hasClaude && codexCount > 0 && claudeCount > 0 && (
        <SiriGlow active={true} color={CODEX} intensity={codexCount} borderRadius={12} />
      )}
      {hasAnyTool && showLabel && (
        <span className={`token-label ${fading ? 'fade-out' : ''}`} style={{ color: claudeCount >= 2 ? 'rgba(213, 37, 32, 0.8)' : hasClaude ? 'rgba(235, 97, 57, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}>
          <span className="activity-text">{activeCount} Vibing</span>
          <img className="ai-icon" src="/claude-ai-icon.svg" alt="" />
        </span>
      )}
      <div className="card-header">
        <h3 className="office-name">{room.name} <span className="room-count">{arrivedCount} here</span></h3>
      </div>
      {room.crowd ? (
        <CrowdScrollWrap scrollEnabled={arrivedCount > SIZE_SMALL}>
          <CrowdGrid room={room} activeUsers={activeUsers} arrivedCount={arrivedCount} />
        </CrowdScrollWrap>
      ) : (
        <div className="meeting-room-people">
          {room.people.map((person, i) => (
            <div key={i} className="person meeting-room-person">
              <img className="avatar" src={person.avatar} alt={person.name} />
              <div className={`avatar-inner-glow ${activeUsers[person.name] ? (activeUsers[person.name] === 'claude' ? 'glow-claude' : 'glow-codex') : 'glow-off'}`} />
            </div>
          ))}
        </div>
      )}
      <div className="meeting-room-lines" />
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
        const available = ids.filter(id => !prev[id]);
        if (available.length === 0) return prev;
        const count = 3;
        const next = { ...prev };
        for (let i = 0; i < count; i++) {
          const remaining = available.filter(id => !next[id]);
          if (remaining.length === 0) break;
          const id = remaining[Math.floor(Math.random() * remaining.length)];

          // Long durations so many stay lit simultaneously
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
    <div className="layout">
      <div className="floor-plan">
        <div className="meeting-room-sidebar">
          {meetingRooms.map(room => (
            <MeetingRoomCard key={room.id} room={room} />
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
                    glowColor={activeMap[o.id] || CLAUDE}
                    onStatusEdit={(v) => setEditingId(v ? o.id : null)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
