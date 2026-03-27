import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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

function SmallCard({ office, isActive, glowColor, onStatusEdit, provider }) {
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
          {provider === 'codex' ? (
            <svg className="ai-icon" viewBox="0 0 512 509.639" xmlns="http://www.w3.org/2000/svg">
              <path fill={glowColor} d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
              <path fill={['#FFFFFF', '#00FF88', '#22D3EE', '#00D4FF'].includes(glowColor) ? '#1D1E20' : '#FCF2EE'} fillRule="nonzero" d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z"/>
            </svg>
          ) : (
            <svg className="ai-icon" viewBox="0 0 512 509.64" xmlns="http://www.w3.org/2000/svg">
              <path fill={glowColor} d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
              <path fill={['#FFFFFF', '#00FF88', '#22D3EE', '#00D4FF'].includes(glowColor) ? '#1D1E20' : '#FCF2EE'} fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
            </svg>
          )}
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

function MeetingRoomCard({ room, vibeOverride, peopleOverride, speakerOverride, glowColorOverride, providerOverride }) {
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
      {(hasAnyTool && showLabel || (vibeOverride !== null && vibeOverride > 0)) && (
        <span className={`token-label ${fading ? 'fade-out' : ''}`} style={{ color: glowColorOverride ? `${glowColorOverride}CC` : claudeCount >= 2 ? 'rgba(213, 37, 32, 0.8)' : hasClaude ? 'rgba(235, 97, 57, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}>
          <span className="activity-text">{vibeOverride !== null && vibeOverride !== undefined ? vibeOverride : activeCount} Vibing</span>
          {providerOverride === 'codex' ? (
            <svg className="ai-icon" viewBox="0 0 512 509.639" xmlns="http://www.w3.org/2000/svg">
              <path fill={baseColor} d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
              <path fill={['#FFFFFF', '#00FF88', '#22D3EE', '#00D4FF'].includes(baseColor) ? '#1D1E20' : '#FCF2EE'} fillRule="nonzero" d="M412.037 221.764a90.834 90.834 0 004.648-28.67 90.79 90.79 0 00-12.443-45.87c-16.37-28.496-46.738-46.089-79.605-46.089-6.466 0-12.943.683-19.264 2.04a90.765 90.765 0 00-67.881-30.515h-.576c-.059.002-.149.002-.216.002-39.807 0-75.108 25.686-87.346 63.554-25.626 5.239-47.748 21.31-60.682 44.03a91.873 91.873 0 00-12.407 46.077 91.833 91.833 0 0023.694 61.553 90.802 90.802 0 00-4.649 28.67 90.804 90.804 0 0012.442 45.87c16.369 28.504 46.74 46.087 79.61 46.087a91.81 91.81 0 0019.253-2.04 90.783 90.783 0 0067.887 30.516h.576l.234-.001c39.829 0 75.119-25.686 87.357-63.588 25.626-5.242 47.748-21.312 60.682-44.033a91.718 91.718 0 0012.383-46.035 91.83 91.83 0 00-23.693-61.553l-.004-.005zM275.102 413.161h-.094a68.146 68.146 0 01-43.611-15.8 56.936 56.936 0 002.155-1.221l72.54-41.901a11.799 11.799 0 005.962-10.251V241.651l30.661 17.704c.326.163.55.479.596.84v84.693c-.042 37.653-30.554 68.198-68.21 68.273h.001zm-146.689-62.649a68.128 68.128 0 01-9.152-34.085c0-3.904.341-7.817 1.005-11.663.539.323 1.48.897 2.155 1.285l72.54 41.901a11.832 11.832 0 0011.918-.002l88.563-51.137v35.408a1.1 1.1 0 01-.438.94l-73.33 42.339a68.43 68.43 0 01-34.11 9.12 68.359 68.359 0 01-59.15-34.11l-.001.004zm-19.083-158.36a68.044 68.044 0 0135.538-29.934c0 .625-.036 1.731-.036 2.5v83.801l-.001.07a11.79 11.79 0 005.954 10.242l88.564 51.13-30.661 17.704a1.096 1.096 0 01-1.034.093l-73.337-42.375a68.36 68.36 0 01-34.095-59.143 68.412 68.412 0 019.112-34.085l-.004-.003zm251.907 58.621l-88.563-51.137 30.661-17.697a1.097 1.097 0 011.034-.094l73.337 42.339c21.109 12.195 34.132 34.746 34.132 59.132 0 28.604-17.849 54.199-44.686 64.078v-86.308c.004-.032.004-.065.004-.096 0-4.219-2.261-8.119-5.919-10.217zm30.518-45.93c-.539-.331-1.48-.898-2.155-1.286l-72.54-41.901a11.842 11.842 0 00-5.958-1.611c-2.092 0-4.15.558-5.957 1.611l-88.564 51.137v-35.408l-.001-.061a1.1 1.1 0 01.44-.88l73.33-42.303a68.301 68.301 0 0134.108-9.129c37.704 0 68.281 30.577 68.281 68.281a68.69 68.69 0 01-.984 11.545v.005zm-191.843 63.109l-30.668-17.704a1.09 1.09 0 01-.596-.84v-84.692c.016-37.685 30.593-68.236 68.281-68.236a68.332 68.332 0 0143.689 15.804 63.09 63.09 0 00-2.155 1.222l-72.54 41.9a11.794 11.794 0 00-5.961 10.248v.068l-.05 102.23zm16.655-35.91l39.445-22.782 39.444 22.767v45.55l-39.444 22.767-39.445-22.767v-45.535z"/>
            </svg>
          ) : (
          <svg className="ai-icon" viewBox="0 0 512 509.64" xmlns="http://www.w3.org/2000/svg">
            <path fill={baseColor} d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.612-115.613 115.612H115.612C52.026 509.639 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z"/>
            <path fill={['#FFFFFF', '#00FF88', '#22D3EE', '#00D4FF'].includes(baseColor) ? '#1D1E20' : '#FCF2EE'} fillRule="nonzero" d="M142.27 316.619l73.655-41.326 1.238-3.589-1.238-1.996-3.589-.001-12.31-.759-42.084-1.138-36.498-1.516-35.361-1.896-8.897-1.895-8.34-10.995.859-5.484 7.482-5.03 10.717.935 23.683 1.617 35.537 2.452 25.782 1.517 38.193 3.968h6.064l.86-2.451-2.073-1.517-1.618-1.517-36.776-24.922-39.81-26.338-20.852-15.166-11.273-7.683-5.687-7.204-2.451-15.721 10.237-11.273 13.75.935 3.513.936 13.928 10.716 29.749 23.027 38.848 28.612 5.687 4.727 2.275-1.617.278-1.138-2.553-4.271-21.13-38.193-22.546-38.848-10.035-16.101-2.654-9.655c-.935-3.968-1.617-7.304-1.617-11.374l11.652-15.823 6.445-2.073 15.545 2.073 6.547 5.687 9.655 22.092 15.646 34.78 24.265 47.291 7.103 14.028 3.791 12.992 1.416 3.968 2.449-.001v-2.275l1.997-26.641 3.69-32.707 3.589-42.084 1.239-11.854 5.863-14.206 11.652-7.683 9.099 4.348 7.482 10.716-1.036 6.926-4.449 28.915-8.72 45.294-5.687 30.331h3.313l3.792-3.791 15.342-20.372 25.782-32.227 11.374-12.789 13.27-14.129 8.517-6.724 16.1-.001 11.854 17.617-5.307 18.199-16.581 21.029-13.75 17.819-19.716 26.54-12.309 21.231 1.138 1.694 2.932-.278 44.536-9.479 24.062-4.347 28.714-4.928 12.992 6.066 1.416 6.167-5.106 12.613-30.71 7.583-36.018 7.204-53.636 12.689-.657.48.758.935 24.164 2.275 10.337.556h25.301l47.114 3.514 12.309 8.139 7.381 9.959-1.238 7.583-18.957 9.655-25.579-6.066-59.702-14.205-20.474-5.106-2.83-.001v1.694l17.061 16.682 31.266 28.233 39.152 36.397 1.997 8.999-5.03 7.102-5.307-.758-34.401-25.883-13.27-11.651-30.053-25.302-1.996-.001v2.654l6.926 10.136 36.574 54.975 1.895 16.859-2.653 5.485-9.479 3.311-10.414-1.895-21.408-30.054-22.092-33.844-17.819-30.331-2.173 1.238-10.515 113.261-4.929 5.788-11.374 4.348-9.478-7.204-5.03-11.652 5.03-23.027 6.066-30.052 4.928-23.886 4.449-29.674 2.654-9.858-.177-.657-2.173.278-22.37 30.71-34.021 45.977-26.919 28.815-6.445 2.553-11.173-5.789 1.037-10.337 6.243-9.2 37.257-47.392 22.47-29.371 14.508-16.961-.101-2.451h-.859l-98.954 64.251-17.618 2.275-7.583-7.103.936-11.652 3.589-3.791 29.749-20.474-.101.102.024.101z"/>
          </svg>
          )}
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
        className={`tab-button ${activeTab === 'war-room' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('war-room')}
      >
        War Room
      </button>
      <button
        className={`tab-button ${activeTab === 'big-meetings' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('big-meetings')}
      >
        Big Meetings
      </button>
      <button
        className={`tab-button ${activeTab === 'experimental' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('experimental')}
      >
        EPCOT
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

function DevControls({ room, vibeCount, onVibeCountChange, glowColor, onGlowColorChange, provider, onProviderChange }) {
  return (
    <div className="dev-controls">
      <div className="dev-controls-header">dev controls</div>
      <div className="dev-controls-row">
        <span className="dev-label">vibers</span>
        <input
          type="range"
          min={0}
          max={20}
          value={vibeCount}
          onChange={(e) => onVibeCountChange(Number(e.target.value))}
          className="dev-slider"
        />
        <span className="dev-value">{vibeCount}</span>
      </div>
      {onProviderChange && (
        <div className="dev-controls-row">
          <span className="dev-label">provider</span>
          <div className="dev-provider-toggle">
            <button className={`dev-provider-btn ${provider === 'claude' ? 'dev-provider-active' : ''}`} onClick={() => onProviderChange('claude')}>Claude</button>
            <button className={`dev-provider-btn ${provider === 'codex' ? 'dev-provider-active' : ''}`} onClick={() => onProviderChange('codex')}>Codex</button>
          </div>
        </div>
      )}
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

function FloorDevControls({ vibePercent, onVibePercentChange, glowColor, onGlowColorChange, provider, onProviderChange }) {
  return (
    <div className="dev-controls floor-dev-controls">
      <div className="dev-controls-header">dev controls</div>
      <div className="dev-controls-row">
        <span className="dev-label">vibing</span>
        <input
          type="range"
          min={0}
          max={100}
          value={vibePercent}
          onChange={(e) => onVibePercentChange(Number(e.target.value))}
          className="dev-slider"
        />
        <span className="dev-value">{vibePercent}%</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">provider</span>
        <div className="dev-provider-toggle">
          <button className={`dev-provider-btn ${provider === 'claude' ? 'dev-provider-active' : ''}`} onClick={() => onProviderChange('claude')}>Claude</button>
          <button className={`dev-provider-btn ${provider === 'codex' ? 'dev-provider-active' : ''}`} onClick={() => onProviderChange('codex')}>Codex</button>
        </div>
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
  const [vibePercent, setVibePercent] = useState(50);
  const [glowColor, setGlowColor] = useState(CLAUDE);
  const [provider, setProvider] = useState('claude');

  const small = officeData.filter(o => o.size === 'small');
  const sidebarRooms = meetingRooms.filter(r => r.id !== 'walt-disney' && r.id !== 'alan-kay');

  // Activate offices based on percentage
  useEffect(() => {
    const ids = small.map(o => o.id);
    const targetCount = Math.round(ids.length * vibePercent / 100);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    const active = {};
    shuffled.slice(0, targetCount).forEach(id => { active[id] = glowColor; });
    setActiveMap(active);
  }, [vibePercent, small.length, glowColor]);

  const cols = 5;
  const rows = [];
  for (let i = 0; i < small.length; i += cols) {
    rows.push(small.slice(i, i + cols));
  }

  return (
    <div className="claude-max-layout">
      <div className={`brick-grid ${editingId != null ? 'has-editing' : ''}`}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className={`brick-row ${rowIdx % 2 === 1 ? 'offset' : ''}`} style={{ zIndex: rows.length - rowIdx, position: 'relative' }}>
            {row.map(o => (
              <div key={o.id} className={`grid-item ${(o.id === JOE_ID || o.id === CHELSEA_ID || o.id === WILL_ID || o.id === 10 || o.id === 14 || o.id === 20 || STATIC_STATUSES[o.id]) ? 'has-bubble' : ''} ${editingId === o.id ? 'editing-bubble' : ''}`}>
                <SmallCard
                  office={o}
                  isActive={!!activeMap[o.id]}
                  glowColor={glowColor}
                  onStatusEdit={(v) => setEditingId(v ? o.id : null)}
                  provider={provider}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <FloorDevControls vibePercent={vibePercent} onVibePercentChange={setVibePercent} glowColor={glowColor} onGlowColorChange={setGlowColor} provider={provider} onProviderChange={setProvider} />
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

function WarRoomView() {
  const room = meetingRooms.find(r => r.id === 'war-room');
  const [vibeCount, setVibeCount] = useState(0);
  const [glowColor, setGlowColor] = useState(CLAUDE);
  const [provider, setProvider] = useState('claude');
  if (!room) return null;

  return (
    <div className="big-meetings-view">
      <div className="big-meetings-center">
        <div className="war-room-standalone">
          <MeetingRoomCard room={room} vibeOverride={vibeCount} glowColorOverride={glowColor} providerOverride={provider} />
        </div>
        <DevControls room={room} vibeCount={vibeCount} onVibeCountChange={setVibeCount} glowColor={glowColor} onGlowColorChange={setGlowColor} provider={provider} onProviderChange={setProvider} />
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

function CircularRoom({ peopleCount = 200, speakerCount = 4, spacing = 22, rotation = 0, glowColor = '#00D4FF' }) {
  const [speakers, setSpeakers] = useState({});
  const [leavingSpeakers, setLeavingSpeakers] = useState({});
  const [dotSpeakers, setDotSpeakers] = useState({});
  const [time, setTime] = useState(0);
  const [joinedSeat, setJoinedSeat] = useState(null);

  // Orbit animation
  useEffect(() => {
    if (rotation === 0) return;
    const interval = setInterval(() => {
      setTime(t => t + 0.02 * (rotation / 50));
    }, 30);
    return () => clearInterval(interval);
  }, [rotation]);

  // Generate ring layout
  const rings = [];
  let placed = 0;
  let ringIdx = 0;
  rings.push({ radius: 0, count: 1, startIdx: 0 });
  placed = 1;
  ringIdx = 1;
  while (placed < peopleCount) {
    const count = Math.floor(6 * ringIdx);
    rings.push({ radius: ringIdx * spacing, count, startIdx: placed });
    placed += count;
    ringIdx++;
  }
  // Add extra empty rings so the room feels spacious
  const extraRings = Math.max(3, Math.ceil(ringIdx * 0.5));
  for (let e = 0; e < extraRings; e++) {
    const count = Math.floor(6 * ringIdx);
    rings.push({ radius: ringIdx * spacing, count, startIdx: placed });
    placed += count;
    ringIdx++;
  }

  const totalSlots = placed;
  const totalRings = rings.length;
  const outerRadius = (totalRings - 1) * spacing + 16;
  const size = outerRadius * 2 + 20;

  // Randomly distribute people across all slots (deterministic per peopleCount)
  const occupiedSlots = useMemo(() => {
    let s = (peopleCount * 2654435761) >>> 0;
    const rand = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return (s >>> 16) / 0xffff; };
    const all = Array.from({ length: totalSlots }, (_, i) => i);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return new Set(all.slice(0, Math.min(peopleCount, totalSlots)));
  }, [peopleCount, totalSlots]);

  // Occupied positions as array (for random speaker picking)
  const occupiedArray = useMemo(() => [...occupiedSlots], [occupiedSlots]);

  // Build stage positions — occupied slots in inner rings (radius < spacing*3)
  const stageSlots = useMemo(() => {
    // Ring 0: 1 slot. Ring k: floor(6*k) slots. Inner = rings with radius < spacing*3 (rings 0,1,2)
    let innerEnd = 1;
    for (let k = 1; k < 3; k++) innerEnd += Math.floor(6 * k);
    const slots = [];
    for (let idx = 1; idx < innerEnd; idx++) {
      if (occupiedSlots.has(idx)) slots.push(idx);
    }
    return slots;
  }, [occupiedSlots]);

  // Cycle active speakers using stage slots
  useEffect(() => {
    if (stageSlots.length === 0) return;
    const timers = [];
    const promote = () => {
      const slot = stageSlots[Math.floor(Math.random() * stageSlots.length)];
      setSpeakers(prev => {
        if (Object.keys(prev).length >= speakerCount) return prev;
        if (prev[slot]) return prev;
        return { ...prev, [slot]: true };
      });
      const duration = 4000 + Math.random() * 8000;
      const t = setTimeout(() => {
        setLeavingSpeakers(prev => ({ ...prev, [slot]: true }));
        setTimeout(() => {
          setSpeakers(prev => { const n = { ...prev }; delete n[slot]; return n; });
          setLeavingSpeakers(prev => { const n = { ...prev }; delete n[slot]; return n; });
        }, 400);
      }, duration);
      timers.push(t);
    };
    for (let i = 0; i < speakerCount; i++) {
      const t = setTimeout(promote, 500 + i * 600);
      timers.push(t);
    }
    const interval = setInterval(promote, 2000 + Math.random() * 2000);
    return () => { clearInterval(interval); timers.forEach(t => clearTimeout(t)); };
  }, [peopleCount, speakerCount, spacing, stageSlots]);

  // Dot speaking indicators — only on occupied seats
  useEffect(() => {
    if (occupiedArray.length === 0) return;
    const timers = [];
    const startSpeaker = () => {
      const idx = occupiedArray[Math.floor(Math.random() * occupiedArray.length)];
      setDotSpeakers(prev => {
        if (Object.keys(prev).length >= 2) return prev;
        return { ...prev, [idx]: true };
      });
      const t = setTimeout(() => {
        setDotSpeakers(prev => { const n = { ...prev }; delete n[idx]; return n; });
      }, 1500 + Math.random() * 3000);
      timers.push(t);
    };
    const interval = setInterval(startSpeaker, 2000 + Math.random() * 3000);
    return () => { clearInterval(interval); timers.forEach(t => clearTimeout(t)); };
  }, [occupiedArray]);

  // Avatars for hover
  const avatarList = [
    'aaron-wadhwa', 'arnav-bansal', 'ava-lee', 'chelsea-turbin', 'derek-cicerone',
    'garima-kewlani', 'grace-sutherland', 'howard-lerman', 'jeff-grossman', 'joe-woodward',
    'john-beutner', 'john-huffsmith', 'john-moffa', 'jon-brod', 'keegan-lanzillotta',
    'lexi-bohonnon', 'mattias-leino', 'klas-leino', 'michael-miller', 'michael-walrath',
    'peter-lerman', 'rob-figueiredo', 'sean-macisaac', 'thomas-grapperon', 'tom-dixon',
  ];

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="circular-room" style={{ width: size, height: size }}>
      {/* EPCOT-inspired architectural guides */}
      <svg className="circular-guides" width={size} height={size}>
        {/* Radial fade gradient for wedge sectors */}
        <defs>
          <radialGradient id="wedgeFade" cx="50%" cy="50%" r="50%">
            <stop offset="20%" stopColor="rgba(255,255,255,0.025)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Zone fills — wedge sectors between spokes, extending to edge */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a1 = (i / 16) * Math.PI * 2;
          const a2 = ((i + 1) / 16) * Math.PI * 2;
          const innerR = spacing * 3;
          if (i % 2 === 0) {
            const d = `M ${cx + Math.cos(a1) * innerR} ${cy + Math.sin(a1) * innerR} A ${innerR} ${innerR} 0 0 1 ${cx + Math.cos(a2) * innerR} ${cy + Math.sin(a2) * innerR} L ${cx + Math.cos(a2) * outerRadius} ${cy + Math.sin(a2) * outerRadius} A ${outerRadius} ${outerRadius} 0 0 0 ${cx + Math.cos(a1) * outerRadius} ${cy + Math.sin(a1) * outerRadius} Z`;
            return <path key={`w${i}`} d={d} fill="url(#wedgeFade)" />;
          }
          return null;
        })}

        {/* Concentric ring guides — zone boundaries */}
        {rings.map((ring, ri) => ri > 0 && (
          <circle key={ri} cx={cx} cy={cy} r={ring.radius} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1.5" />
        ))}

        {/* Central stage */}
        <circle cx={cx} cy={cy} r={spacing * 3} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" style={{ cursor: 'pointer', pointerEvents: 'all' }} onClick={() => setJoinedSeat('stage')} />


        {/* Radial avenues — 16 spokes, starting outside stage */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const isMajor = i % 4 === 0;
          const innerR = spacing * 3;
          return (
            <line key={`r${i}`} x1={cx + Math.cos(angle) * innerR} y1={cy + Math.sin(angle) * innerR} x2={cx + Math.cos(angle) * outerRadius} y2={cy + Math.sin(angle) * outerRadius} stroke={isMajor ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'} strokeWidth={isMajor ? 1.5 : 0.5} />
          );
        })}

        {/* Transit cross-lines (horizontal + vertical, outside stage) */}
        <line x1={cx - outerRadius} y1={cy} x2={cx - spacing * 3} y2={cy} stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
        <line x1={cx + spacing * 3} y1={cy} x2={cx + outerRadius} y2={cy} stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
        <line x1={cx} y1={cy - outerRadius} x2={cx} y2={cy - spacing * 3} stroke="rgba(255,255,255,0.025)" strokeWidth="1.5" />
        <line x1={cx} y1={cy + spacing * 3} x2={cx} y2={cy + outerRadius} stroke="rgba(255,255,255,0.025)" strokeWidth="1.5" />

      </svg>

      {/* People dots arranged in rings */}
      {rings.map((ring) =>
        Array.from({ length: ring.count }).map((_, dotIdx) => {
          const globalIdx = ring.startIdx + dotIdx;
          // Each ring orbits at a different speed, alternating direction
          const orbitOffset = rotation > 0 ? time * (ringIdx % 2 === 0 ? 1 : -0.7) * (1 + ringIdx * 0.1) : 0;
          const angle = ring.count === 1 ? 0 : (dotIdx / ring.count) * Math.PI * 2 - Math.PI / 2 + orbitOffset;
          const x = cx + Math.cos(angle) * ring.radius;
          const y = cy + Math.sin(angle) * ring.radius;
          const isJoined = joinedSeat === globalIdx;
          const isOccupied = occupiedSlots.has(globalIdx);
          const isEmpty = !isOccupied && !isJoined;
          const isSpeaker = isOccupied && speakers[globalIdx];
          const isDotSpeaking = isOccupied && dotSpeakers[globalIdx];
          const isInner = ring.radius < spacing * 3;
          const dotSize = isInner ? 10 : 6;
          const avatarFile = avatarList[globalIdx % avatarList.length];
          const personName = avatarFile.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

          return (
            isInner && isEmpty ? null :
            isInner && isSpeaker ? (
              <div
                key={globalIdx}
                className={`circular-avatar-speaker ${leavingSpeakers[globalIdx] ? 'circular-avatar-leaving' : ''}`}
                style={{
                  left: x - 20,
                  top: y - 20,
                }}
              >
                <img className="avatar" src={`/headshots/${avatarFile}.jpg`} alt={personName} style={{ width: 40, height: 40, display: 'block' }} />
                <div className="circular-speak-pulse" style={{ animationDelay: `${(globalIdx * 0.4) % 1.2}s` }} />
                <div className="avatar-hover-name">
                  <span className="dot-hover-name">{personName}</span>
                </div>
              </div>
            ) : isJoined ? (
              <div
                key={globalIdx}
                className="circular-dot circular-dot-joined"
                style={{
                  left: x - dotSize / 2,
                  top: y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                }}
              >
                <div className="dot-hover-avatar" style={{ bottom: y > cy ? 'auto' : 'calc(100% + 6px)', top: y > cy ? 'calc(100% + 6px)' : 'auto', transformOrigin: y > cy ? 'top center' : 'bottom center' }}>
                  <img src="/headshots/joe-woodward.jpg" alt="" />
                  <span className="dot-hover-name">Joe Woodward</span>
                </div>
              </div>
            ) : (
              <div
                key={globalIdx}
                className={`circular-dot ${isEmpty ? 'circular-dot-empty' : ''} ${isSpeaker ? 'circular-dot-speaker' : ''} ${isDotSpeaking ? 'circular-dot-talking' : ''}`}
                style={{
                  left: x - dotSize / 2,
                  top: y - dotSize / 2,
                  width: dotSize,
                  height: dotSize,
                  ...(isSpeaker ? { background: glowColor, boxShadow: `0 0 8px ${glowColor}60` } : {}),
                  ...(isDotSpeaking ? { background: `${glowColor}AA` } : {}),
                }}
                {...(isEmpty ? { onClick: () => setJoinedSeat(globalIdx) } : {})}
              >
                {!isEmpty && (
                  <div className="dot-hover-avatar" style={{ bottom: y > cy ? 'auto' : 'calc(100% + 6px)', top: y > cy ? 'calc(100% + 6px)' : 'auto', transformOrigin: y > cy ? 'top center' : 'bottom center' }}>
                    <img src={`/headshots/${avatarFile}.jpg`} alt="" />
                    <span className="dot-hover-name">{personName}</span>
                  </div>
                )}
              </div>
            )
          );
        })
      )}

      {/* User avatar on stage */}
      {joinedSeat === 'stage' && (
        <div
          className="circular-avatar-speaker"
          style={{ left: cx - 20, top: cy - 20 }}
        >
          <img className="avatar" src="/headshots/joe-woodward.jpg" alt="Joe Woodward" style={{ width: 40, height: 40, display: 'block' }} />
          <div className="avatar-hover-name">
            <span className="dot-hover-name">Joe Woodward</span>
          </div>
        </div>
      )}

    </div>
  );
}

function EpcotControls({ people, onPeople, speakers, onSpeakers, spacing, onSpacing, rotation, onRotation, glowColor, onGlowColor, zoom, onZoom }) {
  const stops = [1, 5, 10, 25, 50, 100, 200, 500, 1000];
  const idx = stops.findIndex(s => s >= people);
  const sliderIdx = idx === -1 ? stops.length - 1 : idx;
  return (
    <div className="dev-controls epcot-controls">
      <div className="dev-controls-header">epcot controls</div>
      <div className="dev-controls-row">
        <span className="dev-label">people</span>
        <input type="range" min={0} max={stops.length - 1} value={sliderIdx} onChange={(e) => onPeople(stops[Number(e.target.value)])} className="dev-slider" />
        <span className="dev-value">{people}</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">speakers</span>
        <input type="range" min={1} max={10} value={speakers} onChange={(e) => onSpeakers(Number(e.target.value))} className="dev-slider" />
        <span className="dev-value">{speakers}</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">density</span>
        <input type="range" min={12} max={40} value={spacing} onChange={(e) => onSpacing(Number(e.target.value))} className="dev-slider" />
        <span className="dev-value">{spacing}px</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">orbit</span>
        <input type="range" min={0} max={100} value={rotation} onChange={(e) => onRotation(Number(e.target.value))} className="dev-slider" />
        <span className="dev-value">{rotation === 0 ? 'off' : `${rotation}%`}</span>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">glow</span>
        <div className="dev-swatches">
          {GLOW_COLORS.map(c => (
            <button key={c.color} className={`dev-swatch ${glowColor === c.color ? 'dev-swatch-active' : ''}`} style={{ background: c.color }} onClick={() => onGlowColor(c.color)} title={c.name} />
          ))}
        </div>
      </div>
      <div className="dev-controls-row">
        <span className="dev-label">zoom</span>
        <input type="range" min={15} max={300} value={Math.round(zoom * 100)} onChange={(e) => onZoom(Number(e.target.value) / 100)} className="dev-slider" />
        <span className="dev-value">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}

function SatelliteOffice({ name, people }) {
  const count = people.length;
  const size = count <= 1 ? 90 : count <= 3 ? 130 : count <= 5 ? 170 : 210;
  const avatarSize = count <= 1 ? 44 : count <= 3 ? 36 : 30;
  const [speakingIdx, setSpeakingIdx] = useState(-1);

  useEffect(() => {
    if (count <= 1) return;
    const cycle = () => {
      setSpeakingIdx(Math.floor(Math.random() * count));
      const t = setTimeout(() => {
        setSpeakingIdx(-1);
        timerId = setTimeout(cycle, 1500 + Math.random() * 3000);
      }, 2000 + Math.random() * 4000);
      timerId = t;
    };
    let timerId = setTimeout(cycle, Math.random() * 3000);
    return () => clearTimeout(timerId);
  }, [count]);

  return (
    <div className="satellite-office" style={{ width: size, height: size }}>
      {people.map((p, i) => {
        const radius = count === 1 ? 0 : size * 0.28;
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = count === 1 ? (size - avatarSize) / 2 : size / 2 + Math.cos(angle) * radius - avatarSize / 2;
        const y = count === 1 ? (size - avatarSize) / 2 : size / 2 + Math.sin(angle) * radius - avatarSize / 2;
        const isSpeaking = i === speakingIdx;
        return (
          <div key={i} className={`satellite-avatar-wrap ${isSpeaking ? 'satellite-speaking' : ''}`}
            style={{ position: 'absolute', left: x, top: y, width: avatarSize, height: avatarSize }}>
            <img
              className="avatar"
              src={p.avatar}
              alt={p.name}
              style={{ width: avatarSize, height: avatarSize, display: 'block' }}
            />
          </div>
        );
      })}
      <span className="satellite-office-label">{name}</span>
    </div>
  );
}

function ExperimentalView() {
  const [peopleCount, setPeopleCount] = useState(200);
  const [speakerCount, setSpeakerCount] = useState(4);
  const [spacing, setSpacing] = useState(22);
  const [rotation, setRotation] = useState(0);
  const [glowColor, setGlowColor] = useState('#00D4FF');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.7);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(null);

  // Center canvas on mount
  useEffect(() => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  // Zoom with wheel (non-passive so we can preventDefault)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom (trackpad) or ctrl+scroll (mouse)
        const factor = Math.exp(-e.deltaY * 0.01);
        setZoom(prev => {
          const next = Math.max(0.15, Math.min(3, prev * factor));
          if (next === prev) return prev;
          const rect = el.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          const scale = next / prev;
          setPan(p => ({
            x: cx - scale * (cx - p.x),
            y: cy - scale * (cy - p.y),
          }));
          return next;
        });
      } else {
        // Two-finger scroll — pan
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY,
        }));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleMouseDown = (e) => {
    // Don't pan when clicking interactive room elements
    if (e.target.closest('.circular-dot, .circular-avatar-speaker, .satellite-office, .dev-controls')) return;
    if (e.target.tagName === 'circle' && e.target.style.cursor === 'pointer') return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: pan.x, y: pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    setPan({
      x: panOrigin.current.x + (e.clientX - panStart.current.x),
      y: panOrigin.current.y + (e.clientY - panStart.current.y),
    });
  };

  const handleMouseUp = () => { isPanning.current = false; };

  // Compute approximate main room size for layout
  let approxPlaced = 1, approxRing = 1;
  while (approxPlaced < peopleCount) {
    approxPlaced += Math.floor(6 * approxRing);
    approxRing++;
  }
  approxRing += Math.max(3, Math.ceil(approxRing * 0.5));
  const approxRadius = (approxRing - 1) * spacing + 16;
  const mainSize = approxRadius * 2 + 20;

  // Satellite rooms — mix of team rooms and individual offices
  const satelliteRooms = useMemo(() => [
    { id: 'eng-1', name: 'Tomorrowland', people: officeData.slice(0, 4).flatMap(o => o.people) },
    { id: 'product', name: 'Horizons', people: officeData.slice(4, 7).flatMap(o => o.people) },
    { id: 'design', name: 'Spaceship Earth', people: officeData.slice(7, 10).flatMap(o => o.people) },
    { id: 'ops', name: 'The Living Seas', people: officeData.slice(10, 13).flatMap(o => o.people) },
    { id: 'growth', name: 'Imagination', people: officeData.slice(13, 16).flatMap(o => o.people) },
    { id: 'leadership', name: 'Mission Control', people: officeData.slice(16, 19).flatMap(o => o.people) },
    { id: 'eng-2', name: 'Cosmic Ray', people: officeData.slice(19, 22).flatMap(o => o.people) },
    { id: 'data', name: 'Moonliner', people: officeData.slice(22, 25).flatMap(o => o.people) },
    ...officeData.map(o => ({ id: `solo-${o.id}`, name: o.name, people: o.people })),
  ], []);

  // Lay out satellites in multiple rings so they don't overlap
  const satelliteLayout = useMemo(() => {
    // Team rooms (multi-person) on inner ring, solo offices on outer ring
    const teams = satelliteRooms.filter(r => r.people.length > 1);
    const solos = satelliteRooms.filter(r => r.people.length <= 1);
    const layout = [];
    const innerOrbit = mainSize / 2 + 140;
    teams.forEach((room, i) => {
      const angle = (i / teams.length) * Math.PI * 2 - Math.PI / 2;
      layout.push({ ...room, angle, orbit: innerOrbit });
    });
    const outerOrbit = innerOrbit + 200;
    solos.forEach((room, i) => {
      const angle = (i / solos.length) * Math.PI * 2 - Math.PI / 2;
      layout.push({ ...room, angle, orbit: outerOrbit });
    });
    return layout;
  }, [satelliteRooms, mainSize]);

  return (
    <div
      ref={viewportRef}
      className="canvas-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="canvas-content" style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      }}>
        {/* Main EPCOT room centered at origin */}
        <div style={{ position: 'absolute', left: -mainSize / 2, top: -mainSize / 2 }}>
          <CircularRoom peopleCount={peopleCount} speakerCount={speakerCount} spacing={spacing} rotation={rotation} glowColor={glowColor} />
        </div>

        {/* Satellite offices in rings */}
        {satelliteLayout.map((room) => {
          const count = room.people.length;
          const roomSize = count <= 1 ? 90 : count <= 3 ? 130 : count <= 5 ? 170 : 210;
          return (
            <div key={room.id} style={{
              position: 'absolute',
              left: Math.cos(room.angle) * room.orbit - roomSize / 2,
              top: Math.sin(room.angle) * room.orbit - roomSize / 2,
            }}>
              <SatelliteOffice name={room.name} people={room.people} />
            </div>
          );
        })}
      </div>

      <EpcotControls people={peopleCount} onPeople={setPeopleCount} speakers={speakerCount} onSpeakers={setSpeakerCount} spacing={spacing} onSpacing={setSpacing} rotation={rotation} onRotation={setRotation} glowColor={glowColor} onGlowColor={setGlowColor} zoom={zoom} onZoom={setZoom} />
    </div>
  );
}

function useHashTab() {
  const getTab = () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['big-meetings', 'war-room', 'experimental'];
    return valid.includes(hash) ? hash : 'claude-max';
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
      {activeTab === 'war-room' && <WarRoomView />}
      {activeTab === 'big-meetings' && <BigMeetingsView />}
      {activeTab === 'experimental' && <ExperimentalView />}
    </div>
  );
}
