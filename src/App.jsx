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
        <div className="status-bubble-inner">
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

const DEV_ACTIVITIES = [
  'Deploying', 'Debugging', 'Refactoring', 'Testing',
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
      <div className="card-header">
        <h3 className={`office-name ${showLabel ? 'name-hidden' : ''}`}>{office.name}</h3>
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
        {!showLabel && office.icon === 'lock' && <span className="card-icon">🔒</span>}
        {!showLabel && office.icon === 'verified' && <span className="card-icon">✅</span>}
      </div>
      <div className="people">
        {office.people.map((person, i) => (
          <div key={i} className="person">
            {isJoe && <StatusBubble onEditChange={setStatusEditing} />}
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
      const id = ids[Math.floor(Math.random() * ids.length)];
      const color = Math.random() > 0.5 ? CLAUDE : CODEX;
      setActiveMap(prev => ({ ...prev, [id]: color }));

      const duration = 5000 + Math.random() * 15000;
      setTimeout(() => {
        setActiveMap(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, duration);
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
              <div key={o.id} className={`grid-item ${o.id === JOE_ID ? 'has-bubble' : ''}`}>
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
