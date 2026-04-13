import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import SiriGlow from './SiriGlow';
import { offices as officeData, meetingRooms } from './data';
import ShowcaseMap from './ShowcaseMap';
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
      {provider === 'both' ? (
        <>
          <SiriGlow active={isActive} color={CLAUDE} intensity={4} borderRadius={12} />
          <SiriGlow active={isActive} color={CODEX} intensity={3} borderRadius={12} />
        </>
      ) : (
        <SiriGlow active={isActive} color={glowColor} borderRadius={12} />
      )}
      {showLabel && (
        <span className={`token-label ${fading ? 'fade-out' : ''}`}>
          {provider === 'both' ? (
            <svg className="ai-icon ai-icon-combo" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.2002 1C10.6366 1 11.0163 1.00013 11.3506 1.00586C10.9771 1.33633 10.6647 1.73398 10.4355 2.18359C10.3193 2.41182 10.2344 2.65931 10.1719 2.94141C9.99744 2.94821 9.82278 2.96843 9.65039 3.00488C9.28981 2.60933 8.83009 2.31432 8.31738 2.14941C7.8045 1.98448 7.25631 1.95541 6.72852 2.06543C6.20079 2.17547 5.71189 2.4209 5.31055 2.77637C4.90922 3.13183 4.6099 3.58509 4.44238 4.09082C4.01966 4.17632 3.61984 4.34974 3.27051 4.59961C2.92108 4.84965 2.62973 5.17104 2.41602 5.54102C2.08909 6.09538 1.94893 6.73813 2.0166 7.37598C2.08432 8.01361 2.35598 8.6134 2.79199 9.08887C2.65547 9.49273 2.60767 9.92129 2.65234 10.3447C2.69704 10.7681 2.83293 11.1775 3.05078 11.5449C3.3746 12.1003 3.86949 12.5402 4.46289 12.8008C5.05625 13.0612 5.71849 13.1285 6.35352 12.9941C6.63997 13.3123 6.99176 13.5669 7.38574 13.7402C7.77984 13.9136 8.20716 14.0024 8.63867 14C9.23137 14.0005 9.80878 13.8294 10.3047 13.5137C10.3435 13.6186 10.3862 13.7195 10.4355 13.8164C10.6646 14.2658 10.9773 14.6628 11.3506 14.9932C11.0163 14.9989 10.6366 15 10.2002 15H5.7998C4.11978 15 3.27941 14.9998 2.6377 14.6729C2.07347 14.3853 1.61472 13.9265 1.32715 13.3623C1.00018 12.7206 1 11.8802 1 10.2002V5.7998C1 4.11978 1.00018 3.27941 1.32715 2.6377C1.61472 2.07347 2.07347 1.61472 2.6377 1.32715C3.27941 1.00018 4.11978 1 5.7998 1H10.2002ZM10 7.63672V9.59961C10 10.9908 10.0001 11.9504 10.1045 12.6826C9.69556 13.0228 9.17772 13.2137 8.63867 13.2148C8.10584 13.2157 7.5896 13.0313 7.18066 12.6943L7.25293 12.6543L9.6748 11.2744C9.73492 11.2396 9.78548 11.1905 9.82031 11.1309C9.85515 11.0712 9.87358 11.0034 9.87402 10.9346V7.56543L10 7.63672ZM9.32422 10.5488C9.32392 10.5548 9.32222 10.5611 9.31934 10.5664C9.31646 10.5715 9.31238 10.5757 9.30762 10.5791L6.85449 11.9746C6.33094 12.2721 5.7086 12.3526 5.125 12.1982C4.54183 12.0439 4.04458 11.6679 3.74219 11.1523C3.47494 10.6972 3.37849 10.1626 3.4707 9.64453L3.54297 9.6875L5.9668 11.0664C6.02679 11.1011 6.09548 11.1201 6.16504 11.1201C6.23459 11.1201 6.3033 11.1011 6.36328 11.0664L9.32422 9.38281V10.5488ZM4.30273 7.7998C4.30182 7.86838 4.31991 7.9366 4.35449 7.99609C4.38907 8.0554 4.43968 8.10489 4.5 8.13867L7.44727 9.81543L6.42285 10.3994C6.41744 10.4022 6.4114 10.4042 6.40527 10.4043C6.399 10.4043 6.39226 10.4023 6.38672 10.3994L3.93848 9.00684C3.416 8.7081 3.0344 8.21695 2.87793 7.6416C2.72151 7.06612 2.80257 6.45213 3.10352 5.93555V5.94824C3.37261 5.49014 3.79755 5.1398 4.30273 4.96094V7.7998ZM9.32422 7.24902V8.74805L8.00781 9.49805L6.68652 8.74805L6.68457 7.24902L8.00293 6.49902L9.32422 7.24902ZM6.39844 3.00293C6.79053 2.82187 7.22685 2.75414 7.65625 2.80859C8.08563 2.86308 8.49035 3.03752 8.82324 3.31055L8.75098 3.35059L6.3291 4.72949C6.26889 4.76436 6.21846 4.81435 6.18359 4.87402C6.14883 4.93366 6.13026 5.00152 6.12988 5.07031L6.12793 8.43164L5.10352 7.84961C5.09856 7.84661 5.09408 7.84264 5.09082 7.83789C5.08751 7.83302 5.08588 7.82708 5.08496 7.82129V5.03711C5.08552 4.61016 5.20898 4.19219 5.44141 3.83203C5.674 3.47177 6.0063 3.18405 6.39844 3.00293ZM9.61719 5.59961L10.002 5.81934C10.0016 6.00416 10 6.19789 10 6.40039V7.00684L8.55957 6.18164L9.58105 5.59961C9.58643 5.59682 9.59256 5.59577 9.59863 5.5957C9.60488 5.5957 9.61166 5.59673 9.61719 5.59961ZM10.0586 3.73535C10.0293 4.07769 10.0139 4.46591 10.0068 4.91504C9.95574 4.89205 9.9012 4.87695 9.84473 4.87695C9.77479 4.87698 9.70582 4.89575 9.64551 4.93066L6.68652 6.61523V5.44824C6.686 5.44256 6.68708 5.43684 6.68945 5.43164C6.69199 5.42623 6.69619 5.42134 6.70117 5.41797L9.14941 4.02441C9.42945 3.86529 9.7395 3.76716 10.0586 3.73535Z" fill="white"/>
              <rect x="11" y="1" width="14" height="14" rx="3" fill="#DE7356"/>
              <path d="M14.8902 9.6977L16.9042 8.56246L16.9381 8.46387L16.9042 8.40904L16.8061 8.40901L16.4695 8.38816L15.3187 8.3569L14.3207 8.31526L13.3538 8.26317L13.1106 8.21112L12.8825 7.90908L12.906 7.75843L13.1106 7.62026L13.4036 7.64594L14.0512 7.69036L15.0229 7.75772L15.7279 7.79939L16.7722 7.90839H16.9381L16.9616 7.84106L16.9049 7.79939L16.8606 7.75772L15.855 7.0731L14.7665 6.34959L14.1963 5.93297L13.8881 5.72192L13.7326 5.52402L13.6656 5.09216L13.9455 4.78248L14.3214 4.80817L14.4175 4.83388L14.7983 5.12825L15.6118 5.76081L16.674 6.5468L16.8296 6.67665L16.8918 6.63223L16.8994 6.60097L16.8296 6.48364L16.2518 5.43447L15.6353 4.3673L15.3609 3.925L15.2883 3.65977C15.2628 3.55077 15.2441 3.45913 15.2441 3.34732L15.5627 2.91266L15.7389 2.85571L16.164 2.91266L16.343 3.06888L16.607 3.67576L17.0348 4.63118L17.6983 5.93028L17.8926 6.31563L17.9962 6.67253L18.0349 6.78153L18.1019 6.7815V6.71901L18.1565 5.98717L18.2574 5.0887L18.3556 3.93263L18.3894 3.607L18.5497 3.21676L18.8684 3.0057L19.1172 3.12514L19.3217 3.41951L19.2934 3.60977L19.1718 4.40408L18.9333 5.64832L18.7778 6.48153H18.8684L18.9721 6.37739L19.3916 5.81776L20.0966 4.93247L20.4076 4.58115L20.7704 4.19303L21.0033 4.00831L21.4436 4.00829L21.7677 4.49223L21.6226 4.99217L21.1692 5.56984L20.7932 6.05934L20.2541 6.7884L19.9175 7.37162L19.9487 7.41816L20.0288 7.41052L21.2466 7.15013L21.9046 7.03071L22.6897 6.89534L23.0449 7.06198L23.0837 7.23139L22.944 7.57787L22.1043 7.78618L21.1195 7.98407L19.6528 8.33265L19.6349 8.34583L19.6556 8.37152L20.3163 8.43401L20.599 8.44929H21.2908L22.5791 8.54582L22.9157 8.7694L23.1175 9.04297L23.0836 9.25128L22.5653 9.51651L21.8659 9.34987L20.2334 8.95966L19.6735 8.81939L19.5962 8.81937V8.8659L20.0627 9.32416L20.9176 10.0997L21.9882 11.0996L22.0428 11.3468L21.9052 11.5419L21.7601 11.521L20.8195 10.81L20.4566 10.49L19.6349 9.79492L19.5803 9.79489V9.8678L19.7697 10.1462L20.7697 11.6564L20.8215 12.1195L20.749 12.2702L20.4898 12.3612L20.2051 12.3091L19.6197 11.4835L19.0156 10.5538L18.5284 9.72061L18.4689 9.75462L18.1814 12.8659L18.0466 13.0249L17.7356 13.1444L17.4765 12.9465L17.3389 12.6264L17.4765 11.9938L17.6423 11.1683L17.7771 10.5121L17.8987 9.69699L17.9713 9.42619L17.9665 9.40814L17.9071 9.41578L17.2954 10.2594L16.3651 11.5224L15.6291 12.314L15.4528 12.3841L15.1473 12.2251L15.1757 11.9411L15.3464 11.6884L16.3651 10.3865L16.9795 9.57966L17.3762 9.11374L17.3735 9.04641H17.35L14.6442 10.8114L14.1625 10.8739L13.9551 10.6788L13.9807 10.3587L14.0789 10.2546L14.8923 9.69213L14.8895 9.69493L14.8902 9.6977Z" fill="#FCF2EE"/>
            </svg>
          ) : provider === 'codex' ? (
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
  const theaterRef = useRef(null);
  const roRef = useRef(null);
  const [containerDims, setContainerDims] = useState({ w: 0, h: 0 });

  // Callback ref to attach ResizeObserver whenever the rendered element changes
  const measureRef = useCallback((el) => {
    // Clean up previous observer
    if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
    theaterRef.current = el;
    if (!el) return;
    const boundary = el.closest('.big-meeting-card-inner') || el.parentElement;
    if (!boundary) return;
    const measure = () => {
      const bRect = boundary.getBoundingClientRect();
      const style = getComputedStyle(el);
      const px = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const py = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const w = Math.floor(bRect.width) - px;
      const h = Math.floor(bRect.height) - 40 - py;
      setContainerDims(prev => (prev.w === w && prev.h === h) ? prev : { w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(boundary);
    roRef.current = ro;
  }, []);

  const cardW = containerDims.w;
  const cardH = containerDims.h;
  const compactMode = cardW > 0 && cardW < 200;
  const dynFullSize = compactMode ? 32 : AVATAR_SIZES.full.size;
  const dynFullGap = compactMode ? 6 : AVATAR_SIZES.full.gap;
  const fullCapacity = avatarCapacity(cardW, cardH, dynFullSize, dynFullGap);
  const smallCapacity = avatarCapacity(cardW, cardH, AVATAR_SIZES.small.size, AVATAR_SIZES.small.gap);
  const rawSizeMode = arrivedCount <= fullCapacity ? 'full' : arrivedCount <= smallCapacity ? 'small' : 'dots';
  // Cap at 'small' on the map — never show dots; use maximize dialog for overflow
  const sizeMode = rawSizeMode === 'dots' ? 'small' : rawSizeMode;
  const isTheaterMode = false;
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
  const maxSpeakers = speakerOverride || 3;
  const [speakers, setSpeakers] = useState({});
  useEffect(() => {
    if (isTheaterMode) return;
    const timers = [];
    const startSpeaker = () => {
      setSpeakers(prev => {
        if (Object.keys(prev).length >= maxSpeakers) return prev;
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

  // Calculate seat count to fill the card — shrink avatars for narrow containers
  const compactFull = cardW > 0 && cardW < 200;
  const fullSize = compactFull ? 32 : 48;
  const fullGap = compactFull ? 6 : 8;
  const itemSize = isTheaterMode ? 6 : sizeMode === 'full' ? fullSize : sizeMode === 'small' ? 24 : 6;
  const gapSize = isTheaterMode ? 3 : sizeMode === 'full' ? fullGap : sizeMode === 'small' ? 5 : 3;
  const cols = Math.floor((cardW + gapSize) / (itemSize + gapSize));
  const rowsFit = Math.floor((cardH + gapSize) / (itemSize + gapSize));
  const totalSeats = cols * rowsFit;

  if (!isTheaterMode) {
    // Full / small avatar mode
    const visibleCount = Math.max(renderCount, showSeats ? totalSeats : 0);
    return (
      <div ref={measureRef} className={`crowd-container crowd-${sizeMode} ${compactFull ? 'crowd-compact' : ''}`} style={{ padding: '4px 16px' }}>
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
    <div ref={measureRef} className="theater-container">
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

// Avatar size configs for each mode
const AVATAR_SIZES = {
  full:  { size: 48, gap: 8 },
  small: { size: 24, gap: 5 },
  dots:  { size: 6,  gap: 3 },
};

// Compute how many avatars fit in a container at a given size
function avatarCapacity(containerWidth, containerHeight, avatarSize, gap) {
  if (containerWidth <= 0 || containerHeight <= 0) return 0;
  const cols = Math.max(1, Math.floor((containerWidth + gap) / (avatarSize + gap)));
  const rows = Math.max(1, Math.floor((containerHeight + gap) / (avatarSize + gap)));
  return cols * rows;
}

// Backward compat defaults when container hasn't been measured yet
const SIZE_FULL = 12;
const SIZE_SMALL = 40;

function CrowdGrid({ room, activeUsers, arrivedCount }) {
  const [speakers, setSpeakers] = useState({});
  const containerRef = useRef(null);
  const itemRectsRef = useRef(new Map());
  const prevModeRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Measure the scroll-wrap ancestor which represents actual available space
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Walk up to crowd-scroll-wrap (grandparent) which has the real available size
    const scrollWrap = container.closest('.crowd-scroll-wrap') || container.parentElement;
    if (!scrollWrap) return;
    const measure = () => {
      const rect = scrollWrap.getBoundingClientRect();
      // Account for padding inside crowd-scroll (12px each side)
      const w = Math.floor(rect.width) - 24;
      const h = Math.floor(rect.height);
      setContainerSize(prev => {
        if (prev.w === w && prev.h === h) return prev;
        return { w, h };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scrollWrap);
    return () => ro.disconnect();
  }, []);

  // Compute capacity-based thresholds from container size
  const fullCapacity = containerSize.w > 0
    ? avatarCapacity(containerSize.w, containerSize.h, AVATAR_SIZES.full.size, AVATAR_SIZES.full.gap)
    : SIZE_FULL;
  const smallCapacity = containerSize.w > 0
    ? avatarCapacity(containerSize.w, containerSize.h, AVATAR_SIZES.small.size, AVATAR_SIZES.small.gap)
    : SIZE_SMALL;

  const computeSizeMode = (count) => {
    if (count <= fullCapacity) return 'full';
    return 'small';
  };

  // FLIP: capture positions before mode change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sizeMode = computeSizeMode(arrivedCount);
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

  const sizeMode = computeSizeMode(arrivedCount);
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

  const vibingVisible = (hasAnyTool && showLabel) || (vibeOverride !== null && vibeOverride > 0);
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
      {vibingVisible && (
        <span className={`token-label ${fading ? 'fade-out' : ''}`} style={{ color: glowColorOverride ? `${glowColorOverride}CC` : claudeCount >= 2 ? 'rgba(213, 37, 32, 0.8)' : hasClaude ? 'rgba(235, 97, 57, 0.8)' : 'rgba(255, 255, 255, 0.5)' }}>
          {arrivedCount > 0 && <span className="room-count" style={{ color: 'rgba(255, 255, 255, 0.35)' }}>{arrivedCount} here</span>}
          <span className="activity-text">{activeCount} Vibing</span>
          {providerOverride === 'both' ? (
            <svg className="ai-icon ai-icon-combo" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.2002 1C10.6366 1 11.0163 1.00013 11.3506 1.00586C10.9771 1.33633 10.6647 1.73398 10.4355 2.18359C10.3193 2.41182 10.2344 2.65931 10.1719 2.94141C9.99744 2.94821 9.82278 2.96843 9.65039 3.00488C9.28981 2.60933 8.83009 2.31432 8.31738 2.14941C7.8045 1.98448 7.25631 1.95541 6.72852 2.06543C6.20079 2.17547 5.71189 2.4209 5.31055 2.77637C4.90922 3.13183 4.6099 3.58509 4.44238 4.09082C4.01966 4.17632 3.61984 4.34974 3.27051 4.59961C2.92108 4.84965 2.62973 5.17104 2.41602 5.54102C2.08909 6.09538 1.94893 6.73813 2.0166 7.37598C2.08432 8.01361 2.35598 8.6134 2.79199 9.08887C2.65547 9.49273 2.60767 9.92129 2.65234 10.3447C2.69704 10.7681 2.83293 11.1775 3.05078 11.5449C3.3746 12.1003 3.86949 12.5402 4.46289 12.8008C5.05625 13.0612 5.71849 13.1285 6.35352 12.9941C6.63997 13.3123 6.99176 13.5669 7.38574 13.7402C7.77984 13.9136 8.20716 14.0024 8.63867 14C9.23137 14.0005 9.80878 13.8294 10.3047 13.5137C10.3435 13.6186 10.3862 13.7195 10.4355 13.8164C10.6646 14.2658 10.9773 14.6628 11.3506 14.9932C11.0163 14.9989 10.6366 15 10.2002 15H5.7998C4.11978 15 3.27941 14.9998 2.6377 14.6729C2.07347 14.3853 1.61472 13.9265 1.32715 13.3623C1.00018 12.7206 1 11.8802 1 10.2002V5.7998C1 4.11978 1.00018 3.27941 1.32715 2.6377C1.61472 2.07347 2.07347 1.61472 2.6377 1.32715C3.27941 1.00018 4.11978 1 5.7998 1H10.2002ZM10 7.63672V9.59961C10 10.9908 10.0001 11.9504 10.1045 12.6826C9.69556 13.0228 9.17772 13.2137 8.63867 13.2148C8.10584 13.2157 7.5896 13.0313 7.18066 12.6943L7.25293 12.6543L9.6748 11.2744C9.73492 11.2396 9.78548 11.1905 9.82031 11.1309C9.85515 11.0712 9.87358 11.0034 9.87402 10.9346V7.56543L10 7.63672ZM9.32422 10.5488C9.32392 10.5548 9.32222 10.5611 9.31934 10.5664C9.31646 10.5715 9.31238 10.5757 9.30762 10.5791L6.85449 11.9746C6.33094 12.2721 5.7086 12.3526 5.125 12.1982C4.54183 12.0439 4.04458 11.6679 3.74219 11.1523C3.47494 10.6972 3.37849 10.1626 3.4707 9.64453L3.54297 9.6875L5.9668 11.0664C6.02679 11.1011 6.09548 11.1201 6.16504 11.1201C6.23459 11.1201 6.3033 11.1011 6.36328 11.0664L9.32422 9.38281V10.5488ZM4.30273 7.7998C4.30182 7.86838 4.31991 7.9366 4.35449 7.99609C4.38907 8.0554 4.43968 8.10489 4.5 8.13867L7.44727 9.81543L6.42285 10.3994C6.41744 10.4022 6.4114 10.4042 6.40527 10.4043C6.399 10.4043 6.39226 10.4023 6.38672 10.3994L3.93848 9.00684C3.416 8.7081 3.0344 8.21695 2.87793 7.6416C2.72151 7.06612 2.80257 6.45213 3.10352 5.93555V5.94824C3.37261 5.49014 3.79755 5.1398 4.30273 4.96094V7.7998ZM9.32422 7.24902V8.74805L8.00781 9.49805L6.68652 8.74805L6.68457 7.24902L8.00293 6.49902L9.32422 7.24902ZM6.39844 3.00293C6.79053 2.82187 7.22685 2.75414 7.65625 2.80859C8.08563 2.86308 8.49035 3.03752 8.82324 3.31055L8.75098 3.35059L6.3291 4.72949C6.26889 4.76436 6.21846 4.81435 6.18359 4.87402C6.14883 4.93366 6.13026 5.00152 6.12988 5.07031L6.12793 8.43164L5.10352 7.84961C5.09856 7.84661 5.09408 7.84264 5.09082 7.83789C5.08751 7.83302 5.08588 7.82708 5.08496 7.82129V5.03711C5.08552 4.61016 5.20898 4.19219 5.44141 3.83203C5.674 3.47177 6.0063 3.18405 6.39844 3.00293ZM9.61719 5.59961L10.002 5.81934C10.0016 6.00416 10 6.19789 10 6.40039V7.00684L8.55957 6.18164L9.58105 5.59961C9.58643 5.59682 9.59256 5.59577 9.59863 5.5957C9.60488 5.5957 9.61166 5.59673 9.61719 5.59961ZM10.0586 3.73535C10.0293 4.07769 10.0139 4.46591 10.0068 4.91504C9.95574 4.89205 9.9012 4.87695 9.84473 4.87695C9.77479 4.87698 9.70582 4.89575 9.64551 4.93066L6.68652 6.61523V5.44824C6.686 5.44256 6.68708 5.43684 6.68945 5.43164C6.69199 5.42623 6.69619 5.42134 6.70117 5.41797L9.14941 4.02441C9.42945 3.86529 9.7395 3.76716 10.0586 3.73535Z" fill="white"/>
              <rect x="11" y="1" width="14" height="14" rx="3" fill="#DE7356"/>
              <path d="M14.8902 9.6977L16.9042 8.56246L16.9381 8.46387L16.9042 8.40904L16.8061 8.40901L16.4695 8.38816L15.3187 8.3569L14.3207 8.31526L13.3538 8.26317L13.1106 8.21112L12.8825 7.90908L12.906 7.75843L13.1106 7.62026L13.4036 7.64594L14.0512 7.69036L15.0229 7.75772L15.7279 7.79939L16.7722 7.90839H16.9381L16.9616 7.84106L16.9049 7.79939L16.8606 7.75772L15.855 7.0731L14.7665 6.34959L14.1963 5.93297L13.8881 5.72192L13.7326 5.52402L13.6656 5.09216L13.9455 4.78248L14.3214 4.80817L14.4175 4.83388L14.7983 5.12825L15.6118 5.76081L16.674 6.5468L16.8296 6.67665L16.8918 6.63223L16.8994 6.60097L16.8296 6.48364L16.2518 5.43447L15.6353 4.3673L15.3609 3.925L15.2883 3.65977C15.2628 3.55077 15.2441 3.45913 15.2441 3.34732L15.5627 2.91266L15.7389 2.85571L16.164 2.91266L16.343 3.06888L16.607 3.67576L17.0348 4.63118L17.6983 5.93028L17.8926 6.31563L17.9962 6.67253L18.0349 6.78153L18.1019 6.7815V6.71901L18.1565 5.98717L18.2574 5.0887L18.3556 3.93263L18.3894 3.607L18.5497 3.21676L18.8684 3.0057L19.1172 3.12514L19.3217 3.41951L19.2934 3.60977L19.1718 4.40408L18.9333 5.64832L18.7778 6.48153H18.8684L18.9721 6.37739L19.3916 5.81776L20.0966 4.93247L20.4076 4.58115L20.7704 4.19303L21.0033 4.00831L21.4436 4.00829L21.7677 4.49223L21.6226 4.99217L21.1692 5.56984L20.7932 6.05934L20.2541 6.7884L19.9175 7.37162L19.9487 7.41816L20.0288 7.41052L21.2466 7.15013L21.9046 7.03071L22.6897 6.89534L23.0449 7.06198L23.0837 7.23139L22.944 7.57787L22.1043 7.78618L21.1195 7.98407L19.6528 8.33265L19.6349 8.34583L19.6556 8.37152L20.3163 8.43401L20.599 8.44929H21.2908L22.5791 8.54582L22.9157 8.7694L23.1175 9.04297L23.0836 9.25128L22.5653 9.51651L21.8659 9.34987L20.2334 8.95966L19.6735 8.81939L19.5962 8.81937V8.8659L20.0627 9.32416L20.9176 10.0997L21.9882 11.0996L22.0428 11.3468L21.9052 11.5419L21.7601 11.521L20.8195 10.81L20.4566 10.49L19.6349 9.79492L19.5803 9.79489V9.8678L19.7697 10.1462L20.7697 11.6564L20.8215 12.1195L20.749 12.2702L20.4898 12.3612L20.2051 12.3091L19.6197 11.4835L19.0156 10.5538L18.5284 9.72061L18.4689 9.75462L18.1814 12.8659L18.0466 13.0249L17.7356 13.1444L17.4765 12.9465L17.3389 12.6264L17.4765 11.9938L17.6423 11.1683L17.7771 10.5121L17.8987 9.69699L17.9713 9.42619L17.9665 9.40814L17.9071 9.41578L17.2954 10.2594L16.3651 11.5224L15.6291 12.314L15.4528 12.3841L15.1473 12.2251L15.1757 11.9411L15.3464 11.6884L16.3651 10.3865L16.9795 9.57966L17.3762 9.11374L17.3735 9.04641H17.35L14.6442 10.8114L14.1625 10.8739L13.9551 10.6788L13.9807 10.3587L14.0789 10.2546L14.8923 9.69213L14.8895 9.69493L14.8902 9.6977Z" fill="#FCF2EE"/>
            </svg>
          ) : providerOverride === 'codex' ? (
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
        <h3 className="office-name">{room.name}</h3>
        {room.conference != null && room.conference !== '' && (
          <span className="conference-badge">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 1C11.866 1 14.9999 4.13406 15 8L14.9863 8.38965C14.8501 10.298 13.714 11.5624 12.25 11.5625C11.3864 11.5625 10.6381 11.1216 10.1406 10.3691C9.55702 11.0563 8.71786 11.5 7.75 11.5C5.88941 11.5 4.5 9.86413 4.5 8C4.5 6.13587 5.88941 4.5 7.75 4.5C8.41614 4.5 9.02121 4.71065 9.52441 5.06543C9.60601 4.73954 9.89882 4.49805 10.25 4.49805C10.6642 4.49805 11 4.83383 11 5.24805V8C11.0001 9.62539 11.8119 10.0625 12.25 10.0625C12.6607 10.0624 13.4003 9.67807 13.4912 8.29102L13.5 8C13.4999 4.96249 11.0375 2.5 8 2.5C4.96247 2.5 2.50007 4.96249 2.5 8C2.50007 11.0375 4.96247 13.5 8 13.5C8.63922 13.5 9.2528 13.3895 9.82324 13.1885C10.1328 13.0795 10.4837 13.1363 10.7158 13.3682C11.0805 13.7329 10.9957 14.3463 10.5146 14.5322C9.73428 14.8338 8.88678 15 8 15C4.13405 15 1.00007 11.8659 1 8C1.00007 4.13406 4.13405 1 8 1ZM7.75 6C6.84917 6 6 6.82656 6 8C6 9.17344 6.84917 10 7.75 10C8.65083 10 9.5 9.17344 9.5 8C9.5 6.82656 8.65083 6 7.75 6Z" fill="currentColor"/></svg>
            <span>{room.conference}</span>
          </span>
        )}
        {arrivedCount > 0 && !vibingVisible && <span className="room-count">{arrivedCount} here</span>}
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const tabs = [
    { id: 'showcase', label: 'Showcase' },
    { section: 'WIP' },
    { id: 'map-v3', label: 'Map V3' },
    { id: 'claude-max', label: 'Vibe Code' },
    { id: 'war-room', label: 'War Room' },
    { id: 'big-meetings', label: 'Big Meetings' },
    { id: 'experimental', label: 'EPCOT' },
  ];

  return (
    <div className="dev-settings-wrap" ref={menuRef}>
      <button className="dev-settings-btn" onClick={() => setOpen(!open)}>
        <img src="/icons/Settings.svg" alt="" width="16" height="16" className="dev-settings-icon" />
      </button>
      {open && (
        <div className="dev-settings-menu">
          {tabs.map((t, i) => (
            t.section ? (
              <div key={`section-${i}`} className="dev-settings-section">{t.section}</div>
            ) : (
              <button
                key={t.id}
                className={`dev-settings-item ${activeTab === t.id ? 'dev-settings-active' : ''}`}
                onClick={() => { onTabChange(t.id); setOpen(false); }}
              >
                {t.label}
              </button>
            )
          ))}
          <div className="dev-settings-section">Tools</div>
          <button className="dev-settings-item" onClick={() => { window.dispatchEvent(new Event('toggle-grid')); setOpen(false); }}>
            Toggle Grid
          </button>
        </div>
      )}
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
          max={room.people.length}
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
            <button className={`dev-provider-btn ${provider === 'both' ? 'dev-provider-active' : ''}`} onClick={() => onProviderChange('both')}>Both</button>
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
          <button className={`dev-provider-btn ${provider === 'both' ? 'dev-provider-active' : ''}`} onClick={() => onProviderChange('both')}>Both</button>
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

function PeopleCountControls({ value, onChange, speakers, onSpeakersChange, editMode, onEditModeChange }) {
  const stops = [1, 5, 10, 25, 50, 100, 200, 500, 1000, 1600];
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
      <div className="dev-controls-row">
        <button className={`dev-provider-btn ${editMode ? 'dev-provider-active' : ''}`} onClick={() => onEditModeChange(!editMode)} style={{ flex: 1 }}>
          Edit Map
        </button>
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
    <div className="war-room-view">
      <div className="war-room-standalone">
        <MeetingRoomCard room={room} vibeOverride={vibeCount} glowColorOverride={glowColor} providerOverride={provider} />
      </div>
      <div className="floor-dev-controls">
        <DevControls room={room} vibeCount={vibeCount} onVibeCountChange={setVibeCount} glowColor={glowColor} onGlowColorChange={setGlowColor} provider={provider} onProviderChange={setProvider} />
      </div>
    </div>
  );
}

const EDIT_BG_COLORS = [
  { id: 'black', color: '#0C0C0E', room: '#1D1E20', swatch: '#0C0C0E', label: 'Default' },
  { id: 'red', color: '#201318', room: '#2E1E24', swatch: '#E53935', label: 'Red' },
  { id: 'orange', color: '#201613', room: '#2E221C', swatch: '#FF6F00', label: 'Orange' },
  { id: 'yellow', color: '#201D13', room: '#2E2B1C', swatch: '#FFC107', label: 'Yellow' },
  { id: 'green', color: '#132017', room: '#1C2E22', swatch: '#46D08F', label: 'Green' },
  { id: 'cyan', color: '#131F20', room: '#1C2D2E', swatch: '#4DD0E1', label: 'Cyan' },
  { id: 'blue', color: '#131620', room: '#1C222E', swatch: '#0059DC', label: 'Blue' },
  { id: 'purple', color: '#181320', room: '#241E2E', swatch: '#835CE9', label: 'Purple' },
  { id: 'pink', color: '#201318', room: '#2E1E24', swatch: '#C2185B', label: 'Pink' },
];

function EditMapView() {
  const baseRoom = meetingRooms.find(r => r.id === 'alan-kay');
  const [peopleCount, setPeopleCount] = useState(500);
  const [speakerCount, setSpeakerCount] = useState(3);
  const [bgColor, setBgColor] = useState('black');
  const [rooms, setRooms] = useState([
    { id: 'main', roomData: null, size: { w: 320, h: 400 }, pos: { x: -160, y: -200 } },
  ]);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [interacting, setInteracting] = useState(false);
  const [drawingRoom, setDrawingRoom] = useState(null);
  const [editingNameId, setEditingNameId] = useState(null);
  const [seatMenuRoom, setSeatMenuRoom] = useState(null);
  const [seatMenuIndex, setSeatMenuIndex] = useState(null);
  const [seatSearch, setSeatSearch] = useState('');
  const cardRefs = useRef({});
  const gridRef = useRef(null);
  const viewRef = useRef(null);
  const resizingRef = useRef(false);
  const draggingRef = useRef(false);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;
  if (!baseRoom) return null;
  const snap = 10;

  const getPointer = (e) => {
    if (e.touches && e.touches[0]) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    return { clientX: e.clientX || 0, clientY: e.clientY || 0 };
  };

  const updateRoom = (id, updates) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const startInteraction = (roomId) => {
    const el = cardRefs.current[roomId];
    const grid = gridRef.current;
    if (el && grid) {
      const rect = el.getBoundingClientRect();
      grid.style.backgroundPosition = `${rect.left % 10}px ${rect.top % 10}px`;
    }
    setInteracting(true);
  };

  const onResizeStart = (e, room, dir) => {
    e.preventDefault(); e.stopPropagation();
    resizingRef.current = true;
    startInteraction(room.id);
    const ptr = getPointer(e);
    const roomId = room.id;
    startRef.current = { x: ptr.clientX, y: ptr.clientY, w: room.size.w, h: room.size.h, px: room.pos.x, py: room.pos.y };
    const onMove = (e) => {
      if (!resizingRef.current) return;
      const ptr = getPointer(e);
      const dx = ptr.clientX - startRef.current.x, dy = ptr.clientY - startRef.current.y;
      let newW = startRef.current.w, newH = startRef.current.h, newX = startRef.current.px, newY = startRef.current.py;
      if (dir.includes('e')) newW = Math.max(60, Math.round((startRef.current.w + dx) / snap) * snap);
      if (dir.includes('w')) { newW = Math.max(60, Math.round((startRef.current.w - dx) / snap) * snap); newX = startRef.current.px + (startRef.current.w - newW); }
      if (dir.includes('s')) newH = Math.max(60, Math.round((startRef.current.h + dy) / snap) * snap);
      if (dir.includes('n')) { newH = Math.max(60, Math.round((startRef.current.h - dy) / snap) * snap); newY = startRef.current.py + (startRef.current.h - newH); }
      updateRoom(roomId, { size: { w: newW, h: newH }, pos: { x: newX, y: newY } });
    };
    const onUp = () => {
      resizingRef.current = false; setInteracting(false);
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp);
  };

  const onDragStart = (e, room) => {
    e.preventDefault(); draggingRef.current = true; startInteraction(room.id);
    const ptr = getPointer(e);
    startRef.current = { ...startRef.current, x: ptr.clientX, y: ptr.clientY, px: room.pos.x, py: room.pos.y };
    const dragRoomId = room.id;
    const origPos = { x: room.pos.x, y: room.pos.y };
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const ptr = getPointer(e);
      updateRoom(dragRoomId, { pos: { x: Math.round((startRef.current.px + ptr.clientX - startRef.current.x) / snap) * snap, y: Math.round((startRef.current.py + ptr.clientY - startRef.current.y) / snap) * snap } });
    };
    const onUp = () => {
      draggingRef.current = false; setInteracting(false);
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onUp);
  };

  const drawingRoomRef = useRef(drawingRoom);
  drawingRoomRef.current = drawingRoom;

  const onBgMouseDown = (e) => {
    if (e.target.closest('.big-meeting-card') || e.target.closest('.map-toolbar')) return;
    setSelectedRoom(null); setEditingNameId(null); setSeatMenuRoom(null);
    e.preventDefault(); drawingRef.current = true;
    const viewRect = viewRef.current.getBoundingClientRect();
    const cx = viewRect.width / 2, cy = viewRect.height / 2;
    const startX = Math.round((e.clientX - viewRect.left - cx) / snap) * snap;
    const startY = Math.round((e.clientY - viewRect.top - cy) / snap) * snap;
    const mouseStartX = e.clientX, mouseStartY = e.clientY;
    setInteracting(true); setDrawingRoom({ x: startX, y: startY, w: 0, h: 0 });
    const onMove = (e) => {
      if (!drawingRef.current) return;
      const dx = e.clientX - mouseStartX, dy = e.clientY - mouseStartY;
      const w = Math.max(snap, Math.round(Math.abs(dx) / snap) * snap);
      const h = Math.max(snap, Math.round(Math.abs(dy) / snap) * snap);
      setDrawingRoom({ x: dx < 0 ? startX - w : startX, y: dy < 0 ? startY - h : startY, w, h });
    };
    const onUp = () => {
      drawingRef.current = false; setInteracting(false);
      const dr = drawingRoomRef.current; setDrawingRoom(null);
      if (dr && dr.w >= 60 && dr.h >= 60) {
        const newId = `room-${Date.now()}`;
        const area = dr.w * dr.h;
        const type = area < 40000 ? 'private' : area >= 120000 ? 'theater' : 'meeting';
        const unique = [...new Map(baseRoom.people.map(p => [p.displayName || p.name, p])).values()].map(p => ({ ...p, name: p.displayName || p.name })).sort(() => Math.random() - 0.5);
        const count = type === 'private' ? 1 : type === 'theater' ? 20 : 20;
        const assignees = type === 'private' ? [unique[0]] : undefined;
        const roomNames = { private: `${unique[0]?.name?.split(' ')[0] || 'Private'}'s Office`, meeting: ['Lobby', 'Fireside', 'The Den', 'Starlight', 'Horizon', 'Basecamp', 'The Loft', 'Greenhouse'][Math.floor(Math.random() * 8)], theater: 'Theater' };
        const name = type === 'meeting' ? roomNames.meeting : roomNames[type];
        setRooms(prev => [...prev, { id: newId, roomData: { ...baseRoom, id: newId, name, type, people: unique.slice(0, count), assignees }, size: { w: dr.w, h: dr.h }, pos: { x: dr.x, y: dr.y } }]);
        setSelectedRoom(newId);
      }
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    if (!selectedRoom) return;
    const onKey = (e) => { if (e.key === 'Backspace' && !editingNameId) { e.preventDefault(); setRooms(prev => prev.filter(r => r.id !== selectedRoom)); setSelectedRoom(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedRoom, editingNameId]);

  const themeColors = EDIT_BG_COLORS.find(c => c.id === bgColor) || EDIT_BG_COLORS[0];

  const addRoom = (type) => {
    const roomNames = { 'private': 'Private Office', 'team': 'Team Room', 'meeting': 'Meeting Room', 'theater': 'Theater', 'game': 'Game Room', 'command': 'Command Center' };
    const newId = `room-${Date.now()}`;
    const w = type === 'private' ? 200 : type === 'theater' ? 280 : 220;
    const h = type === 'private' ? 150 : type === 'theater' ? 400 : 220;
    const unique = [...new Map(baseRoom.people.map(p => [p.displayName || p.name, p])).values()].map(p => ({ ...p, name: p.displayName || p.name })).sort(() => Math.random() - 0.5);
    const count = type === 'private' ? 1 : type === 'team' ? 3 : type === 'game' ? 0 : 20;
    const assignees = type === 'private' ? [unique[0]] : undefined;
    const name = type === 'private' && unique[0] ? `${unique[0].name.split(' ')[0]}'s Office` : (roomNames[type] || type);
    setRooms(prev => [...prev, { id: newId, roomData: { ...baseRoom, id: newId, name, type, people: unique.slice(0, count), assignees }, size: { w, h }, pos: { x: 0, y: 0 } }]);
  };

  const roomTypes = [
    { id: 'private', name: 'Private Office' }, { id: 'team', name: 'Team Room' }, { id: 'meeting', name: 'Meeting Room' },
    { id: 'theater', name: 'Theater' }, { id: 'game', name: 'Game Room' }, { id: 'command', name: 'Command Center' },
  ];
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div ref={viewRef} className="big-meetings-view edit-mode" style={{ backgroundColor: themeColors.color }} onMouseDown={onBgMouseDown}>
      <div ref={gridRef} className="grid-bg grid-bg-visible" />
      <div className="big-meetings-center">
        {rooms.map(room => {
          const isHovered = hoveredRoom === room.id;
          const roomData = room.roomData || baseRoom;
          const roomSurfaceColor = themeColors.room;

          return (
            <div key={room.id} className="big-meeting-card-wrap"
              style={{ position: 'absolute', left: '50%', top: '50%', width: room.size.w, zIndex: (isHovered || selectedRoom === room.id) ? 100 : 1, transform: `translate(${room.pos.x}px, ${room.pos.y}px)` }}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => { if (!resizingRef.current && !draggingRef.current) setHoveredRoom(null); }}
            >
              <div ref={el => { cardRefs.current[room.id] = el; }}
                className="big-meeting-card"
                style={{ width: room.size.w, height: room.size.h }}
                onMouseDown={(e) => { if (!e.target.closest('.sel-edge') && !e.target.closest('.sel-corner')) { setSelectedRoom(room.id); onDragStart(e, room); } }}
              >
                <div style={{ height: room.size.h, '--room-surface': roomSurfaceColor }} className="big-meeting-card-inner">
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    {(roomData.type === 'meeting' || (!roomData.type && roomData.crowd)) && <div className="meeting-room-lines" />}
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      {editingNameId === room.id ? (
                        <input className="room-name-input" defaultValue={roomData.name} autoFocus
                          onBlur={(e) => { const val = e.target.value.trim(); if (val) updateRoom(room.id, { roomData: { ...roomData, name: val } }); setEditingNameId(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingNameId(null); }}
                          onMouseDown={(e) => e.stopPropagation()} />
                      ) : (
                        <h3 className="office-name room-name-editable" onClick={(e) => { e.stopPropagation(); setEditingNameId(room.id); }}>{roomData.name}</h3>
                      )}
                    </div>
                    {roomData.type === 'private' && (
                      <div className="private-office-seat">
                        <div className={`seat-row ${isHovered ? 'seat-row-hovered' : ''}`}>
                          {(roomData.assignees || []).map((person, i) => (
                            <div key={i} className="seat-assigned" onClick={(e) => { e.stopPropagation(); setSeatMenuRoom(room.id); setSeatMenuIndex(i); setSeatSearch(''); }}>
                              <img className="seat-avatar" src={person.avatar} alt={person.name} />
                              <span className="seat-nametag">{person.name}</span>
                            </div>
                          ))}
                          {isHovered && ((roomData.assignees || []).length + 1) * 48 < room.size.w - 24 && (
                            <button className="seat-empty-btn" onClick={(e) => { e.stopPropagation(); setSeatMenuRoom(seatMenuRoom === room.id && seatMenuIndex === null ? null : room.id); setSeatMenuIndex(null); setSeatSearch(''); }} onMouseDown={(e) => e.stopPropagation()}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            </button>
                          )}
                        </div>
                        {seatMenuRoom === room.id && (
                          <div className="seat-menu" onMouseDown={(e) => e.stopPropagation()}>
                            <input className="seat-search" placeholder="Search people..." value={seatSearch} onChange={(e) => setSeatSearch(e.target.value)} autoFocus />
                            <div className="seat-list">
                              {officeData.filter(o => o.people[0]?.name.toLowerCase().includes(seatSearch.toLowerCase())).map(o => (
                                <button key={o.id} className="seat-option" onClick={() => {
                                  const person = o.people[0];
                                  let assignees;
                                  if (seatMenuIndex !== null) { assignees = [...(roomData.assignees || [])]; assignees[seatMenuIndex] = person; }
                                  else { assignees = [...(roomData.assignees || []), person]; }
                                  const name = assignees.length === 1 ? `${person.name.split(' ')[0]}'s Office` : roomData.name;
                                  updateRoom(room.id, { roomData: { ...roomData, assignees, name } });
                                  setSeatMenuRoom(null); setSeatMenuIndex(null);
                                }}>
                                  <img className="seat-option-avatar" src={o.people[0]?.avatar} alt="" />
                                  <span>{o.people[0]?.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {roomData.type === 'theater' && (
                      <div className="theater-preview"><div className="theater-preview-stage" /><div className="theater-preview-audience">{Array.from({ length: 4 }).map((_, row) => (<div key={row} className="theater-preview-row">{Array.from({ length: 5 }).map((_, col) => (<div key={col} className="theater-preview-bench" />))}</div>))}</div></div>
                    )}
                    {roomData.type === 'game' && <div className="game-room-lines"><div className="game-room-zigzag" /></div>}
                    {roomData.type === 'command' && <div className="command-center-preview"><div className="command-screen" /><div className="command-screen" /><div className="command-screen" /></div>}
                  </div>
                </div>
                {(isHovered || selectedRoom === room.id) && (
                  <div className="selection-frame">
                    {['n','s','e','w'].map(d => <div key={d} className={`sel-edge sel-${d}`} onMouseDown={(e) => onResizeStart(e, room, d)} />)}
                    {['nw','ne','sw','se'].map(d => <div key={d} className={`sel-corner sel-${d}`} onMouseDown={(e) => onResizeStart(e, room, d)} />)}
                  </div>
                )}
              </div>
              {(isHovered || selectedRoom === room.id) && (
                <div className="room-info-pill" onMouseDown={(e) => e.stopPropagation()}>
                  <select className="room-type-select" value={room.roomData?.type || 'meeting'}
                    onChange={(e) => { const type = e.target.value; const names = { private: 'Private Office', team: 'Team Room', meeting: 'Meeting Room', theater: 'Theater', game: 'Game Room', command: 'Command Center' }; updateRoom(room.id, { roomData: { ...roomData, type, name: names[type] || type } }); }}>
                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          );
        })}
        {drawingRoom && drawingRoom.w > 0 && drawingRoom.h > 0 && (
          <div className="drawing-room-preview" style={{ position: 'absolute', left: '50%', top: '50%', width: drawingRoom.w, height: drawingRoom.h, transform: `translate(${drawingRoom.x}px, ${drawingRoom.y}px)` }} />
        )}
      </div>
      <div className="map-toolbar">
        <div className="map-toolbar-inner" style={{ backgroundColor: themeColors.room }}>
          <button className={`toolbar-btn ${!selectedRoom ? 'toolbar-disabled-btn' : ''}`}
            onClick={() => { if (selectedRoom) { setRooms(prev => prev.filter(r => r.id !== selectedRoom)); setSelectedRoom(null); } }} title="Delete Room">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M5 3H7C7 2.44772 6.55228 2 6 2C5.44772 2 5 2.44772 5 3ZM4 3C4 1.89543 4.89543 1 6 1C7.10457 1 8 1.89543 8 3L10.5 3C10.7761 3 11 3.22386 11 3.5C11 3.77614 10.7761 4 10.5 4H10.059L9.61576 9.1708C9.52709 10.2054 8.66143 11 7.62307 11H4.37693C3.33857 11 2.47291 10.2054 2.38424 9.1708L1.94102 4H1.5C1.22386 4 1 3.77614 1 3.5C1 3.22386 1.22386 3 1.5 3L4 3ZM7.5 6C7.5 5.72386 7.27614 5.5 7 5.5C6.72386 5.5 6.5 5.72386 6.5 6V8C6.5 8.27614 6.72386 8.5 7 8.5C7.27614 8.5 7.5 8.27614 7.5 8V6ZM5 5.5C4.72386 5.5 4.5 5.72386 4.5 6V8C4.5 8.27614 4.72386 8.5 5 8.5C5.27614 8.5 5.5 8.27614 5.5 8V6C5.5 5.72386 5.27614 5.5 5 5.5Z" fill="currentColor"/></svg>
          </button>
          <div className="toolbar-add-wrap" style={{ position: 'relative' }}>
            <button className="toolbar-btn" onClick={() => setShowAddMenu(!showAddMenu)} title="Add Room">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
            {showAddMenu && (
              <div className="add-room-menu" style={{ backgroundColor: themeColors.room }}>
                {roomTypes.map(t => (<button key={t.id} className="add-room-option" onClick={() => { addRoom(t.id); setShowAddMenu(false); }}><span className="add-room-name">{t.name}</span></button>))}
              </div>
            )}
          </div>
          <div className="toolbar-bg-swatches">
            {EDIT_BG_COLORS.map(c => (
              <button key={c.id} className={`toolbar-swatch ${bgColor === c.id ? 'toolbar-swatch-active' : ''}`}
                style={{ background: c.swatch, border: c.id === 'black' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
                onClick={() => setBgColor(c.id)} title={c.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DialogRoomBody({ people, speakerCount, surfaceColor }) {
  const n = Math.min(speakerCount, people.length);
  const [speakerIdxs, setSpeakerIdxs] = useState(() => {
    const idxs = Array.from({ length: people.length }, (_, i) => i).sort(() => Math.random() - 0.5);
    return idxs.slice(0, n);
  });
  const [talking, setTalking] = useState({});
  const [fadingSlots, setFadingSlots] = useState({});

  // Swap one speaker at a time: fade out slot → pause → swap → fade in
  useEffect(() => {
    if (people.length <= n) return;
    const tick = () => {
      const slot = Math.floor(Math.random() * n);
      // Fade out
      setFadingSlots(prev => ({ ...prev, [slot]: true }));
      // Wait for fade out, then pause, then swap and fade in
      setTimeout(() => {
        setSpeakerIdxs(prev => {
          const allIdxs = Array.from({ length: people.length }, (_, i) => i);
          const nonSpeakers = allIdxs.filter(i => !prev.includes(i));
          if (nonSpeakers.length === 0) return prev;
          const next = [...prev];
          next[slot] = nonSpeakers[Math.floor(Math.random() * nonSpeakers.length)];
          return next;
        });
        // Fade in after another short delay
        setTimeout(() => {
          setFadingSlots(prev => { const next = { ...prev }; delete next[slot]; return next; });
        }, 150);
      }, 400);
    };
    const schedule = () => setTimeout(() => { tick(); timerId = schedule(); }, 4000 + Math.random() * 4000);
    let timerId = schedule();
    return () => clearTimeout(timerId);
  }, [people.length, n]);

  // Random talking indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTalking(() => {
        const next = {};
        speakerIdxs.forEach(idx => { if (Math.random() < 0.45) next[idx] = true; });
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [speakerIdxs]);

  const audience = people.filter((_, i) => !speakerIdxs.includes(i));

  return (
    <div className="dialog-room-body" style={{ backgroundColor: surfaceColor, overflowY: 'auto' }}>
      {n > 0 && (
        <div className="dialog-speakers">
          {speakerIdxs.map((idx, slot) => {
            const p = people[idx];
            if (!p) return null;
            return (
              <div key={slot} className={`dialog-speaker ${fadingSlots[slot] ? 'dialog-speaker-fading' : ''}`} style={{ position: 'relative' }}>
                <img key={idx} className="avatar dialog-speaker-avatar" src={p.avatar} alt={p.displayName || p.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                <div className={`avatar-inner-glow ${talking[idx] ? 'glow-active' : 'glow-off'}`} style={{ width: 80, height: 80 }} />
                <div className="avatar-hover-name"><span className="dot-hover-name">{p.displayName || p.name}</span></div>
              </div>
            );
          })}
        </div>
      )}
      {n > 0 && audience.length > 0 && (
        <div className="dialog-divider" />
      )}
      {audience.length > 0 && (
        <div className="dialog-audience">
          {audience.map((p, i) => (
            <div key={i} className="dialog-audience-item">
              <img className="avatar" src={p.avatar} alt={p.displayName || p.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              <div className="avatar-hover-name"><span className="dot-hover-name">{p.displayName || p.name}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BigMeetingsView() {
  const baseRoom = meetingRooms.find(r => r.id === 'alan-kay');
  const [peopleCount, setPeopleCount] = useState(10);
  const [speakerCount, setSpeakerCount] = useState(3);
  const [bgColor, setBgColor] = useState('black');
  const [rooms, setRooms] = useState(() => {
    const allPeople = baseRoom ? baseRoom.people : [];
    const uniquePeople = [...new Map(allPeople.map(p => [p.displayName || p.name, p])).values()].map(p => ({ ...p, name: p.displayName || p.name }));
    const shuffle = () => [...uniquePeople].sort(() => Math.random() - 0.5);
    const take = (n) => shuffle().slice(0, n);
    const snap = 10;
    const g = snap;
    const s = (v) => Math.round(v / snap) * snap; // snap to grid
    // Helper: compute room size snapped to grid
    const pad = 32;
    const headerH = 44;
    const avatarSize = 48, avatarGap = 8;
    const gridSize = (cols, rows) => ({
      w: s(cols * avatarSize + (cols - 1) * avatarGap + pad),
      h: s(rows * avatarSize + (rows - 1) * avatarGap + headerH + 16),
    });
    const main = gridSize(7, 5);
    const side = gridSize(4, 3);
    return [
      // Computer Department — centered
      { id: 'main', roomData: null, size: main, pos: { x: s(-main.w / 2), y: s(-main.h / 2) } },
      // Top-left: meeting room
      { id: 'meeting-standup', roomData: { ...baseRoom, id: 'meeting-standup', name: 'Daily Standup', type: 'meeting', people: take(6), crowd: false }, size: side, pos: { x: s(-main.w / 2 - side.w - g), y: s(-main.h / 2) } },
      // Top-right: private office
      { id: 'office-joe', roomData: { ...baseRoom, id: 'office-joe', name: "Joe's Office", type: 'private', people: take(1), assignees: [{ name: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' }] }, size: { w: 180, h: 150 }, pos: { x: s(main.w / 2 + g), y: s(-main.h / 2) } },
      // Bottom-left: team room
      { id: 'team-design', roomData: { ...baseRoom, id: 'team-design', name: 'Design Team', type: 'team', people: take(4), crowd: false }, size: side, pos: { x: s(-main.w / 2 - side.w - g), y: s(-main.h / 2 + side.h + g) } },
      // Bottom-right: command center
      { id: 'command', roomData: { ...baseRoom, id: 'command', name: 'Mission Control', type: 'command', people: take(8) }, size: { w: 180, h: 190 }, pos: { x: s(main.w / 2 + g), y: s(-main.h / 2 + 150 + g) } },
    ];
  });
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [maximizedRoom, setMaximizedRoom] = useState(null);
  const [dialogClosing, setDialogClosing] = useState(false);
  const [dialogScrolled, setDialogScrolled] = useState(false);
  const closeDialog = () => {
    setDialogClosing(true);
    setTimeout(() => { setMaximizedRoom(null); setDialogClosing(false); }, 200);
  };
  const [interacting, setInteracting] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0, scale: 1 });
  const panningRef = useRef(false);
  const [drawingRoom, setDrawingRoom] = useState(null);
  const [editingNameId, setEditingNameId] = useState(null);

  useEffect(() => {
    if (!selectedRoom) return;
    const onKey = (e) => {
      if (e.key === 'Backspace' && !editingNameId) {
        e.preventDefault();
        setRooms(prev => prev.filter(r => r.id !== selectedRoom));
        setSelectedRoom(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedRoom, editingNameId]);
  const [seatMenuRoom, setSeatMenuRoom] = useState(null);
  const [seatMenuIndex, setSeatMenuIndex] = useState(null); // null = adding new, number = replacing that index
  const [seatSearch, setSeatSearch] = useState('');
  const cardRefs = useRef({});
  const gridRef = useRef(null);
  const viewRef = useRef(null);
  const resizingRef = useRef(null);
  const draggingRef = useRef(false);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  if (!baseRoom) return null;

  const snap = 10;

  const startInteraction = (roomId) => {
    const el = cardRefs.current[roomId];
    const grid = gridRef.current;
    if (el && grid) {
      const rect = el.getBoundingClientRect();
      grid.style.backgroundPosition = `${rect.left % 10}px ${rect.top % 10}px`;
    }
    setInteracting(true);
  };

  const comfortableW = 280;
  const comfortableH = 320;

  const updateRoom = (id, updates) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;

  // Helper to get clientX/Y from mouse or touch event
  const getPointer = (e) => {
    if (e.touches && e.touches[0]) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    return { clientX: e.clientX || 0, clientY: e.clientY || 0 };
  };

  const rectsOverlap = (a, b) => {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  };

  const overlapsAny = (rect, excludeId) => {
    return roomsRef.current.some(r => r.id !== excludeId && rectsOverlap(rect, { x: r.pos.x, y: r.pos.y, w: r.size.w, h: r.size.h }));
  };

  // dir: combination of 'n','s','e','w' e.g. 'se', 'n', 'nw'
  const onResizeStart = (e, room, dir) => {
    e.preventDefault();
    e.stopPropagation();
    const roomId = room.id;
    resizingRef.current = roomId;
    startInteraction(room.id);
    const ptr = getPointer(e);
    startRef.current = { x: ptr.clientX, y: ptr.clientY, w: room.size.w, h: room.size.h, px: room.pos.x, py: room.pos.y };
    const onMove = (e) => {
      if (!resizingRef.current) return;
      const ptr = getPointer(e);
      if (!ptr.clientX && !ptr.clientY) return;
      const dx = ptr.clientX - startRef.current.x;
      const dy = ptr.clientY - startRef.current.y;
      let newW = startRef.current.w;
      let newH = startRef.current.h;
      let newX = startRef.current.px;
      let newY = startRef.current.py;
      if (dir.includes('e')) newW = Math.max(60, Math.round((startRef.current.w + dx) / snap) * snap);
      if (dir.includes('w')) { newW = Math.max(60, Math.round((startRef.current.w - dx) / snap) * snap); newX = startRef.current.px + (startRef.current.w - newW); }
      if (dir.includes('s')) newH = Math.max(60, Math.round((startRef.current.h + dy) / snap) * snap);
      if (dir.includes('n')) { newH = Math.max(60, Math.round((startRef.current.h - dy) / snap) * snap); newY = startRef.current.py + (startRef.current.h - newH); }
      updateRoom(roomId, { size: { w: newW, h: newH }, pos: { x: newX, y: newY } });
    };
    const onUp = () => {
      resizingRef.current = null;
      setInteracting(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const onDragStart = (e, room) => {
    e.preventDefault();
    draggingRef.current = true;
    startInteraction(room.id);
    const ptr = getPointer(e);
    startRef.current = { ...startRef.current, x: ptr.clientX, y: ptr.clientY, px: room.pos.x, py: room.pos.y };
    let dragRoomId = room.id;
    let duplicated = false;

    // If alt/option held, duplicate the room
    if (e.altKey) {
      const newId = `room-${Date.now()}`;
      const roomData = room.roomData || baseRoom;
      const roomNames = ['Lobby', 'Fireside', 'The Den', 'Starlight', 'Horizon', 'Basecamp', 'The Loft', 'Greenhouse', 'Moonrise', 'Solar', 'Coral Reef', 'North Star', 'Summit', 'Treehouse', 'Oasis', 'Nebula', 'Canopy', 'Tidepool'];
      const name = roomNames[Math.floor(Math.random() * roomNames.length)];
      setRooms(prev => [...prev, {
        id: newId,
        roomData: { ...roomData, id: newId, name },
        size: { ...room.size },
        pos: { ...room.pos },
      }]);
      dragRoomId = newId;
      duplicated = true;
    }

    const origPos = { x: room.pos.x, y: room.pos.y };
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const ptr = getPointer(e);
      const dx = ptr.clientX - startRef.current.x;
      const dy = ptr.clientY - startRef.current.y;
      const newX = Math.round((startRef.current.px + dx) / snap) * snap;
      const newY = Math.round((startRef.current.py + dy) / snap) * snap;
      updateRoom(dragRoomId, { pos: { x: newX, y: newY } });
    };
    const onUp = () => {
      draggingRef.current = false;
      setInteracting(false);
      // Snap back if overlapping another room
      const currentRoom = roomsRef.current.find(r => r.id === dragRoomId);
      const size = currentRoom?.size || room.size;
      const pos = currentRoom?.pos || origPos;
      if (overlapsAny({ x: pos.x, y: pos.y, w: size.w, h: size.h }, dragRoomId)) {
        updateRoom(dragRoomId, { pos: origPos });
      }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  // Use a ref to capture drawingRoom for the mouseup handler
  const drawingRoomRef = useRef(drawingRoom);
  drawingRoomRef.current = drawingRoom;

  const onBgMouseDownWrapped = (e) => {
    // Don't draw if clicking on a room card, toolbar, or dev controls
    if (e.target.closest('.big-meeting-card') || e.target.closest('.map-toolbar') || e.target.closest('.room-info-pill') || e.target.closest('.big-meetings-dev-controls')) return;
    // Deselect room and stop editing when clicking background
    setSelectedRoom(null);
    setEditingNameId(null);
    setSeatMenuRoom(null);
    e.preventDefault();
    drawingRef.current = true;
    const viewRect = viewRef.current.getBoundingClientRect();
    const centerX = viewRect.width / 2;
    const centerY = viewRect.height / 2;
    const startX = Math.round((e.clientX - viewRect.left - centerX) / snap) * snap;
    const startY = Math.round((e.clientY - viewRect.top - centerY) / snap) * snap;
    const mouseStartX = e.clientX;
    const mouseStartY = e.clientY;

    const grid = gridRef.current;
    if (grid) {
      grid.style.backgroundPosition = `${(viewRect.left + centerX) % 10}px ${(viewRect.top + centerY) % 10}px`;
    }
    setInteracting(true);
    setDrawingRoom({ x: startX, y: startY, w: 0, h: 0 });

    const onMove = (e) => {
      if (!drawingRef.current) return;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;
      const w = Math.max(snap, Math.round(Math.abs(dx) / snap) * snap);
      const h = Math.max(snap, Math.round(Math.abs(dy) / snap) * snap);
      const x = dx < 0 ? startX - w : startX;
      const y = dy < 0 ? startY - h : startY;
      setDrawingRoom({ x, y, w, h });
    };
    const onUp = () => {
      drawingRef.current = false;
      setInteracting(false);
      const dr = drawingRoomRef.current;
      setDrawingRoom(null);
      const didDrag = dr && (dr.w > snap || dr.h > snap);
      if (didDrag && dr.w >= 60 && dr.h >= 60 && !overlapsAny({ x: dr.x, y: dr.y, w: dr.w, h: dr.h }, null)) {
        const newId = `room-${Date.now()}`;
        const area = dr.w * dr.h;
        const type = area < 40000 ? 'private' : area >= 120000 ? 'theater' : 'meeting';
        const roomNames = { private: 'Private Office', meeting: ['Lobby', 'Fireside', 'The Den', 'Starlight', 'Horizon', 'Basecamp', 'The Loft', 'Greenhouse', 'Moonrise', 'Solar', 'Coral Reef', 'North Star', 'Summit', 'Treehouse', 'Oasis', 'Nebula', 'Canopy', 'Tidepool'], theater: 'Theater' };
        const name = type === 'meeting' ? roomNames.meeting[Math.floor(Math.random() * roomNames.meeting.length)] : roomNames[type];
        const unique = [...new Map(baseRoom.people.map(p => [p.displayName || p.name, p])).values()].map(p => ({ ...p, name: p.displayName || p.name }));
        const shuffled = unique.sort(() => Math.random() - 0.5);
        const count = type === 'private' ? 1 : type === 'theater' ? 20 : 20;
        setRooms(prev => [...prev, {
          id: newId,
          roomData: { ...baseRoom, id: newId, name, type, people: shuffled.slice(0, count) },
          size: { w: dr.w, h: dr.h },
          pos: { x: dr.x, y: dr.y },
        }]);
        setSelectedRoom(newId);
      }
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const panOffsetRef = useRef(panOffset);
  panOffsetRef.current = panOffset;

  const onPanStart = (e) => {
    if (!e.touches || e.target.closest('.big-meeting-card') || e.target.closest('.map-toolbar') || e.target.closest('.room-info-pill')) return;

    const startPan = { ...panOffsetRef.current };
    const startScale = startPan.scale || 1;

    if (e.touches.length === 1) {
      // Single finger pan
      panningRef.current = true;
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      const onMove = (e) => {
        if (!panningRef.current || !e.touches[0]) return;
        e.preventDefault();
        if (e.touches.length === 2) return; // Let pinch handle it
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        setPanOffset(prev => ({ ...prev, x: startPan.x + dx, y: startPan.y + dy }));
      };
      const onEnd = () => {
        panningRef.current = false;
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      };
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }

    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const getDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
      const startDist = getDist(e.touches);
      const onMove = (e) => {
        if (e.touches.length < 2) return;
        e.preventDefault();
        const dist = getDist(e.touches);
        const newScale = Math.min(3, Math.max(0.3, startScale * (dist / startDist)));
        setPanOffset(prev => ({ ...prev, scale: newScale }));
      };
      const onEnd = () => {
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
      };
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }
  };

  return (
    <div ref={viewRef} className="big-meetings-view edit-mode" style={{ backgroundColor: BG_COLORS.find(c => c.id === bgColor)?.color }} onMouseDown={onBgMouseDownWrapped} onTouchStart={onPanStart}>
      <div ref={gridRef} className="grid-bg grid-bg-visible" />
      <div className="big-meetings-center" style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${panOffset.scale || 1})` }}>
        {rooms.map(room => {
          const isHovered = hoveredRoom === room.id;
          const isSmall = room.size.w < comfortableW || room.size.h < comfortableH;
          const expandOnHover = false;
          const roomData = room.roomData || baseRoom;
          const themeColors = BG_COLORS.find(c => c.id === bgColor) || BG_COLORS[0];
          const roomSurfaceColor = themeColors.room;
          const isCircle = roomData.shape === 'circle';
          let displayW = expandOnHover ? Math.max(room.size.w, comfortableW) : room.size.w;
          let displayH = expandOnHover ? Math.max(room.size.h, comfortableH) : room.size.h;
          if (isCircle) { const s = Math.max(displayW, displayH); displayW = s; displayH = s; }

          return (
            <div
              key={room.id}
              className="big-meeting-card-wrap"
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => { if (!resizingRef.current && !draggingRef.current) setHoveredRoom(null); }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: displayW,
                zIndex: seatMenuRoom === room.id ? 200 : (isHovered || selectedRoom === room.id) ? 100 : 1,
                transform: `translate(${room.pos.x}px, ${room.pos.y}px)`,
              }}
            >
            <div
              ref={el => { cardRefs.current[room.id] = el; }}
              className={`big-meeting-card ${expandOnHover ? 'big-meeting-card-expanded' : ''} ${roomData.shape ? `big-meeting-card-${roomData.shape}` : ''}`}
              style={{ width: displayW, height: displayH }}
              onMouseDown={(e) => { if (!e.target.closest('.widget-resize-handle')) { setSelectedRoom(room.id); onDragStart(e, room); } }}
              onTouchStart={(e) => { if (!e.target.closest('.widget-resize-handle')) { setSelectedRoom(room.id); onDragStart(e, room); } }}
            >
              <div style={{ height: displayH, '--room-surface': roomSurfaceColor }} className="big-meeting-card-inner">
                {roomData.type === 'theater' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                      <span className="room-count">{roomData.people?.length || 0} here</span>
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
                ) : roomData.type === 'game' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="game-room-lines"><div className="game-room-zigzag" /></div>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                    </div>
                  </div>
                ) : roomData.type === 'command' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                      <span className="room-count">{roomData.people?.length || 0} here</span>
                    </div>
                    <div className="command-center-preview">
                      <div className="command-screen" />
                      <div className="command-screen" />
                      <div className="command-screen" />
                    </div>
                  </div>
                ) : roomData.type === 'private' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                    </div>
                    {(roomData.assignees || []).length > 0 && (
                      <div className="private-office-seat">
                        <div className="seat-row seat-row-hovered">
                          {roomData.assignees.map((person, i) => (
                            <div key={i} className="seat-assigned">
                              <img className="seat-avatar" src={person.avatar} alt={person.name} />
                              <span className="seat-nametag">{person.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <MeetingRoomCard room={roomData} peopleOverride={room.id === 'main' ? peopleCount : undefined} speakerOverride={room.id === 'main' ? speakerCount : undefined} />
                )}
              </div>
              {(() => {
                const pCount = room.id === 'main' ? peopleCount : (roomData.people?.length || 0);
                const innerW = room.size.w - 32;
                const innerH = room.size.h - 52;
                const cols = Math.max(1, Math.floor((innerW + 5) / (24 + 5)));
                const rows = Math.max(1, Math.floor((innerH + 5) / (24 + 5)));
                const overflowing = pCount > cols * rows;
                return (
                  <div className="room-action-btns">
                    <button
                      className="room-action-btn"
                      onMouseDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { e.stopPropagation(); }}
                      title="Join Room"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M9.64645 7.64645L8.5 8.7929L8.5 2.5C8.5 2.22386 8.27614 2 8 2C7.72386 2 7.5 2.22386 7.5 2.5L7.5 8.79289L6.35355 7.64645C6.15829 7.45118 5.84171 7.45118 5.64645 7.64645C5.45118 7.84171 5.45118 8.15829 5.64645 8.35355L7.64645 10.3536C7.84171 10.5488 8.15829 10.5488 8.35355 10.3536L10.3536 8.35355C10.5488 8.15829 10.5488 7.84171 10.3536 7.64645C10.1583 7.45119 9.84171 7.45119 9.64645 7.64645Z" fill="currentColor"/><path d="M4.11088 11.2891C3.91561 11.0938 3.59903 11.0938 3.40377 11.2891C3.20851 11.4843 3.20851 11.8009 3.40377 11.9962C5.94218 14.5346 10.0577 14.5346 12.5962 11.9962C12.7914 11.8009 12.7914 11.4843 12.5962 11.2891C12.4009 11.0938 12.0843 11.0938 11.889 11.2891C9.74117 13.437 6.25876 13.437 4.11088 11.2891Z" fill="currentColor"/></svg>
                    </button>
                    {overflowing && (
                      <button
                        className="room-action-btn"
                        onMouseDown={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); setMaximizedRoom(room.id); setHoveredRoom(null); setDialogScrolled(false); }}
                        title="Expand"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 9.5V13H6.5M13 6.5V3H9.5M3 13L7 9M13 3L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    )}
                  </div>
                );
              })()}
              {(isHovered || resizingRef.current === room.id) && (
                <div
                  className="widget-resize-handle"
                  onMouseDown={(e) => onResizeStart(e, room, 'se')}
                  onTouchStart={(e) => onResizeStart(e, room, 'se')}
                />
              )}
            </div>
            </div>
          );
        })}
        {drawingRoom && drawingRoom.w > 0 && drawingRoom.h > 0 && (
          <div
            className="drawing-room-preview"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: drawingRoom.w,
              height: drawingRoom.h,
              transform: `translate(${drawingRoom.x}px, ${drawingRoom.y}px)`,
            }}
          />
        )}
      </div>
      {maximizedRoom && (() => {
        const room = rooms.find(r => r.id === maximizedRoom);
        if (!room) return null;
        const roomData = room.roomData || baseRoom;
        const themeColors = BG_COLORS.find(c => c.id === bgColor) || BG_COLORS[0];
        const roomSurfaceColor = themeColors.room;
        return (
          <div className={`room-dialog-overlay ${dialogClosing ? 'room-dialog-overlay-closing' : ''}`} onClick={closeDialog}>
            <div className={`room-dialog ${dialogClosing ? 'room-dialog-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className={`room-dialog-header ${dialogScrolled ? 'room-dialog-header-scrolled' : ''}`} style={{ background: roomSurfaceColor }}>
                <h3 className="office-name">{roomData.name}</h3>
                <button className="room-join-btn"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}><path d="M9.64645 7.64645L8.5 8.7929L8.5 2.5C8.5 2.22386 8.27614 2 8 2C7.72386 2 7.5 2.22386 7.5 2.5L7.5 8.79289L6.35355 7.64645C6.15829 7.45118 5.84171 7.45118 5.64645 7.64645C5.45118 7.84171 5.45118 8.15829 5.64645 8.35355L7.64645 10.3536C7.84171 10.5488 8.15829 10.5488 8.35355 10.3536L10.3536 8.35355C10.5488 8.15829 10.5488 7.84171 10.3536 7.64645C10.1583 7.45119 9.84171 7.45119 9.64645 7.64645Z" fill="currentColor"/><path d="M4.11088 11.2891C3.91561 11.0938 3.59903 11.0938 3.40377 11.2891C3.20851 11.4843 3.20851 11.8009 3.40377 11.9962C5.94218 14.5346 10.0577 14.5346 12.5962 11.9962C12.7914 11.8009 12.7914 11.4843 12.5962 11.2891C12.4009 11.0938 12.0843 11.0938 11.889 11.2891C9.74117 13.437 6.25876 13.437 4.11088 11.2891Z" fill="currentColor"/></svg>Join {room.id === 'main' ? peopleCount : (roomData.people?.length || 0)} People</button>
              </div>
              <div className="room-dialog-inner" style={{ '--room-surface': roomSurfaceColor }} onScrollCapture={(e) => setDialogScrolled(e.target.scrollTop > 0)}>
                {roomData.type === 'theater' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                      <span className="room-count">{roomData.people?.length || 0} here</span>
                    </div>
                    <div className="theater-preview" style={{ flex: 1 }}>
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
                ) : roomData.type === 'game' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="game-room-lines"><div className="game-room-zigzag" /></div>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                    </div>
                  </div>
                ) : roomData.type === 'command' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                      <span className="room-count">{roomData.people?.length || 0} here</span>
                    </div>
                    <div className="command-center-preview" style={{ flex: 1 }}>
                      <div className="command-screen" />
                      <div className="command-screen" />
                      <div className="command-screen" />
                    </div>
                  </div>
                ) : roomData.type === 'private' ? (
                  <div className="meeting-room-card" style={{ height: '100%', backgroundColor: roomSurfaceColor, display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ padding: '0 12px' }}>
                      <h3 className="office-name">{roomData.name}</h3>
                    </div>
                    {(roomData.assignees || []).length > 0 && (
                      <div className="private-office-seat" style={{ flex: 1 }}>
                        <div className="seat-row seat-row-hovered">
                          {roomData.assignees.map((person, i) => (
                            <div key={i} className="seat-assigned">
                              <img className="seat-avatar" src={person.avatar} alt={person.name} />
                              <span className="seat-nametag">{person.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <DialogRoomBody people={roomData.people.slice(0, room.id === 'main' ? peopleCount : roomData.people.length)} speakerCount={speakerCount} surfaceColor={roomSurfaceColor} />
                )}
              </div>
            </div>
          </div>
        );
      })()}
      <div className="big-meetings-dev-controls">
        <div className="dev-controls" style={{ width: 280 }}>
          <div className="dev-controls-header">dev controls</div>
          <div className="dev-controls-row">
            <span className="dev-label">people</span>
            <input
              type="range"
              min={0}
              max={9}
              value={[1, 5, 10, 25, 50, 100, 200, 500, 1000, 1200].findIndex(s => s >= peopleCount)}
              onChange={(e) => setPeopleCount([1, 5, 10, 25, 50, 100, 200, 500, 1000, 1200][Number(e.target.value)])}
              className="dev-slider"
            />
            <span className="dev-value">{peopleCount}</span>
          </div>
          <div className="dev-controls-row">
            <span className="dev-label">speaking</span>
            <input
              type="range"
              min={1}
              max={10}
              value={speakerCount}
              onChange={(e) => setSpeakerCount(Number(e.target.value))}
              className="dev-slider"
            />
            <span className="dev-value">{speakerCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tint700: hue from accent, saturation 25%, lightness 10%. Room surface ~15% lightness.
const BG_COLORS = [
  { id: 'black', color: '#0C0C0E', room: '#1D1E20', swatch: '#0C0C0E', label: 'Default' },
  { id: 'red', color: '#201318', room: '#2E1E24', swatch: '#E53935', label: 'Red' },
  { id: 'orange', color: '#201613', room: '#2E221C', swatch: '#FF6F00', label: 'Orange' },
  { id: 'yellow', color: '#201D13', room: '#2E2B1C', swatch: '#FFC107', label: 'Yellow' },
  { id: 'green', color: '#132017', room: '#1C2E22', swatch: '#46D08F', label: 'Green' },
  { id: 'cyan', color: '#131F20', room: '#1C2D2E', swatch: '#4DD0E1', label: 'Cyan' },
  { id: 'blue', color: '#131620', room: '#1C222E', swatch: '#0059DC', label: 'Blue' },
  { id: 'purple', color: '#181320', room: '#241E2E', swatch: '#835CE9', label: 'Purple' },
  { id: 'pink', color: '#201318', room: '#2E1E24', swatch: '#C2185B', label: 'Pink' },
];

function MapToolbar({ onAddRoom, bgColor, onBgColorChange, selectedRoom, onUpdateSelectedRoom, onDeleteRoom }) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showAddMenu) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowAddMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showAddMenu]);

  const roomTypes = [
    { id: 'private', name: 'Private Office', desc: 'Audio only room for each member of your team' },
    { id: 'team', name: 'Team Room', desc: 'Audio only conference room' },
    { id: 'meeting', name: 'Meeting Room', desc: 'Video conference room' },
    { id: 'theater', name: 'Theater', desc: 'Perfect for your company all-hands' },
    { id: 'game', name: 'Game Room', desc: 'Teams that play together, win together' },
    { id: 'command', name: 'Command Center', desc: 'Mission control for your team' },
  ];

  const themeColors = BG_COLORS.find(c => c.id === bgColor) || BG_COLORS[0];

  return (
    <div className="map-toolbar">
      <div className="map-toolbar-inner" style={{ backgroundColor: themeColors.room }}>
        <button
          className={`toolbar-btn ${selectedRoom && selectedRoom.roomData?.conference != null ? 'toolbar-btn-active' : ''} ${!selectedRoom || (selectedRoom.roomData?.type && selectedRoom.roomData.type !== 'meeting') ? 'toolbar-disabled-btn' : ''}`}
          onClick={() => {
            if (!selectedRoom) return;
            const type = selectedRoom.roomData?.type;
            if (type && type !== 'meeting') return;
            if (selectedRoom.roomData?.conference !== undefined && selectedRoom.roomData?.conference !== null) {
              onUpdateSelectedRoom({ roomData: { ...selectedRoom.roomData, conference: null } });
            } else {
              onUpdateSelectedRoom({ roomData: { ...selectedRoom.roomData, conference: '' } });
            }
          }}
          title="Conference"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1C11.866 1 14.9999 4.13406 15 8L14.9863 8.38965C14.8501 10.298 13.714 11.5624 12.25 11.5625C11.3864 11.5625 10.6381 11.1216 10.1406 10.3691C9.55702 11.0563 8.71786 11.5 7.75 11.5C5.88941 11.5 4.5 9.86413 4.5 8C4.5 6.13587 5.88941 4.5 7.75 4.5C8.41614 4.5 9.02121 4.71065 9.52441 5.06543C9.60601 4.73954 9.89882 4.49805 10.25 4.49805C10.6642 4.49805 11 4.83383 11 5.24805V8C11.0001 9.62539 11.8119 10.0625 12.25 10.0625C12.6607 10.0624 13.4003 9.67807 13.4912 8.29102L13.5 8C13.4999 4.96249 11.0375 2.5 8 2.5C4.96247 2.5 2.50007 4.96249 2.5 8C2.50007 11.0375 4.96247 13.5 8 13.5C8.63922 13.5 9.2528 13.3895 9.82324 13.1885C10.1328 13.0795 10.4837 13.1363 10.7158 13.3682C11.0805 13.7329 10.9957 14.3463 10.5146 14.5322C9.73428 14.8338 8.88678 15 8 15C4.13405 15 1.00007 11.8659 1 8C1.00007 4.13406 4.13405 1 8 1ZM7.75 6C6.84917 6 6 6.82656 6 8C6 9.17344 6.84917 10 7.75 10C8.65083 10 9.5 9.17344 9.5 8C9.5 6.82656 8.65083 6 7.75 6Z" fill="currentColor"/>
          </svg>
        </button>

        <button
          className={`toolbar-btn ${!selectedRoom ? 'toolbar-disabled-btn' : ''}`}
          onClick={() => {
            if (!selectedRoom) return;
            const id = selectedRoom.id;
            onUpdateSelectedRoom(null);
            onDeleteRoom(id);
          }}
          title="Delete Room"
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M5 3H7C7 2.44772 6.55228 2 6 2C5.44772 2 5 2.44772 5 3ZM4 3C4 1.89543 4.89543 1 6 1C7.10457 1 8 1.89543 8 3L10.5 3C10.7761 3 11 3.22386 11 3.5C11 3.77614 10.7761 4 10.5 4H10.059L9.61576 9.1708C9.52709 10.2054 8.66143 11 7.62307 11H4.37693C3.33857 11 2.47291 10.2054 2.38424 9.1708L1.94102 4H1.5C1.22386 4 1 3.77614 1 3.5C1 3.22386 1.22386 3 1.5 3L4 3ZM7.5 6C7.5 5.72386 7.27614 5.5 7 5.5C6.72386 5.5 6.5 5.72386 6.5 6V8C6.5 8.27614 6.72386 8.5 7 8.5C7.27614 8.5 7.5 8.27614 7.5 8V6ZM5 5.5C4.72386 5.5 4.5 5.72386 4.5 6V8C4.5 8.27614 4.72386 8.5 5 8.5C5.27614 8.5 5.5 8.27614 5.5 8V6C5.5 5.72386 5.27614 5.5 5 5.5Z" fill="currentColor"/>
          </svg>
        </button>

        <div ref={menuRef} className="toolbar-add-wrap">
          <button className="toolbar-btn" onClick={() => setShowAddMenu(!showAddMenu)} title="Add Room">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          {showAddMenu && (
            <div className="add-room-menu" style={{ backgroundColor: themeColors.room }}>
              {roomTypes.map(t => (
                <button key={t.id} className="add-room-option" onClick={() => { onAddRoom(t.id); setShowAddMenu(false); }}>
                  <span className="add-room-name">{t.name}</span>
                  <span className="add-room-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-bg-swatches">
          {BG_COLORS.map(c => (
            <button
              key={c.id}
              className={`toolbar-swatch ${bgColor === c.id ? 'toolbar-swatch-active' : ''}`}
              style={{ background: c.swatch, border: c.id === 'black' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
              onClick={() => onBgColorChange(c.id)}
              title={c.label}
            />
          ))}
        </div>
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
    const valid = ['map-v3', 'claude-max', 'big-meetings', 'war-room', 'experimental', 'showcase'];
    return valid.includes(hash) ? hash : 'showcase';
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
      {activeTab === 'map-v3' && <EditMapView />}
      {activeTab === 'claude-max' && <ClaudeMaxView />}
      {activeTab === 'war-room' && <WarRoomView />}
      {activeTab === 'big-meetings' && <BigMeetingsView />}
      {activeTab === 'experimental' && <ExperimentalView />}
      {activeTab === 'showcase' && <ShowcaseMap />}
    </div>
  );
}
