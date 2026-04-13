import React, { useState, useEffect, useRef } from 'react';
import './OnAir.css';

const ONAIR_COLORS = [
  { bg: '#1a1a1a', image: '/on-air/static-landscape-black.png' },
  { bg: '#d32f2f', image: '/on-air/static-landscape-red.png' },
  { bg: '#ff8f00', image: '/on-air/static-landscape-orange.png' },
  { bg: '#008e52', image: '/on-air/static-landscape-green.png' },
  { bg: '#0059dc', image: '/on-air/on-air-blue-landscape.png' },
  { bg: '#5700c9', image: '/on-air/static-landscape-purple.png' },
];

// Preload all images
ONAIR_COLORS.forEach(c => {
  if (c.image) {
    const img = new Image();
    img.src = c.image;
  }
});

const DEMO_EVENTS = [
  { title: 'The Future of Remote Work', desc: 'How AI and spatial computing will reshape the office', date: 'June 15, 2026 · 2:00 PM EST', location: 'Roam Virtual Auditorium', host: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', color: 5 },
  { title: 'Design Systems at Scale', desc: 'Building and maintaining design systems across platforms', date: 'July 8, 2026 · 11:00 AM PST', location: 'Roam Design Studio', host: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', color: 4 },
  { title: 'AI-First Products', desc: 'When AI is the foundation, not an afterthought', date: 'August 22, 2026 · 3:00 PM GMT', location: 'Roam Innovation Lab', host: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', color: 3 },
  { title: 'Roam Creator Summit', desc: 'Where builders, makers, and creators collide', date: 'Sept 10, 2026 · 1:00 PM EST', location: 'Roam Main Stage', host: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', color: 2 },
  { title: 'Engineering All-Hands', desc: 'Q3 roadmap, architecture deep-dives, and demos', date: 'Oct 3, 2026 · 10:00 AM PST', location: 'Roam Theater', host: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', color: 0 },
];

function useTypewriter(text, active, speed = 40, key = 0) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active || !text) { setDisplayed(''); return; }
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, key]);
  return displayed;
}

export default function OnAir({ win, onDrag, demo }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  const [selectedColor, setSelectedColor] = useState(0);
  const colors = ONAIR_COLORS;

  // Demo mode — cycle through events with typewriter effect
  const [demoActive, setDemoActive] = useState(false);
  const [demoEvent, setDemoEvent] = useState(null);
  const [demoKey, setDemoKey] = useState(0); // increment to reset typewriter
  const containerRef = useRef(null);
  const demoIndexRef = useRef(0);
  const shuffledRef = useRef([...DEMO_EVENTS].sort(() => Math.random() - 0.5));
  const demoTimerRef = useRef(null);

  const startNextEvent = () => {
    const events = shuffledRef.current;
    const evt = events[demoIndexRef.current % events.length];
    demoIndexRef.current++;
    setDemoActive(false);
    setDemoEvent(null);
    // Brief pause before new event types in
    setTimeout(() => {
      setDemoEvent(evt);
      setSelectedColor(evt.color);
      setDemoKey(k => k + 1);
      setDemoActive(true);
    }, 600);
  };

  useEffect(() => {
    if (!demo) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(startNextEvent, 2000);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [demo]);

  const titleLen = demoEvent?.title?.length || 0;
  const descLen = demoEvent?.desc?.length || 0;
  const dateLen = demoEvent?.date?.length || 0;

  const typedTitle = useTypewriter(demoEvent?.title || '', demoActive, 50, demoKey);
  const typedDesc = useTypewriter(demoEvent?.desc || '', demoActive && typedTitle.length > titleLen * 0.7, 30, demoKey);
  const typedDate = useTypewriter(demoEvent?.date || '', demoActive && typedDesc.length > descLen * 0.7, 35, demoKey);
  const typedLocation = useTypewriter(demoEvent?.location || '', demoActive && typedDate.length > dateLen * 0.7, 35, demoKey);

  // When location finishes typing, wait then cycle to next event
  useEffect(() => {
    if (!demo || !demoEvent || !demoActive) return;
    if (typedLocation === demoEvent.location) {
      demoTimerRef.current = setTimeout(startNextEvent, 5000);
      return () => clearTimeout(demoTimerRef.current);
    }
  }, [typedLocation, demoEvent, demoActive]);

  return (
    <div
      ref={containerRef}
      className={`onair-window ${!win.isFocused ? 'onair-unfocused' : ''} ${closing ? 'onair-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      {/* Titlebar */}
      <div className="onair-titlebar" onMouseDown={onDrag}>
        <div className="onair-traffic-lights">
          <div className="onair-light onair-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="onair-light onair-light-minimize" />
          <div className="onair-light onair-light-maximize" />
        </div>
        <span className="onair-title">New On-Air Event</span>
      </div>

      {/* Body */}
      <div className="onair-body">
        {/* Curtain backgrounds — all stacked, cross-fade with opacity */}
        {colors.map((c, i) => c.image && (
          <img
            key={c.image}
            className={`onair-curtain-bg ${i === selectedColor ? 'onair-curtain-active' : ''}`}
            src={c.image}
            alt=""
          />
        ))}

        {/* Center content */}
        <div className="onair-center">
          <div className="onair-form">
            <div className={`onair-field onair-field-title ${demo && typedTitle ? 'onair-field-filled' : ''}`}>
              <input type="text" placeholder="Set Title" className="onair-input onair-input-title" value={demo ? typedTitle : undefined} readOnly={demo} />
            </div>
            <div className={`onair-field onair-field-desc ${demo && typedDesc ? 'onair-field-filled' : ''}`}>
              <input type="text" placeholder="Set Description" className="onair-input onair-input-desc" value={demo ? typedDesc : undefined} readOnly={demo} />
            </div>
          </div>

          <div className="onair-form">
            <div className={`onair-field ${demo && typedDate ? 'onair-field-filled' : ''}`}>
              <input type="text" placeholder="Set Date" className="onair-input" value={demo ? typedDate : undefined} readOnly={demo} />
            </div>
            <div className={`onair-field ${demo && typedLocation ? 'onair-field-filled' : ''}`}>
              <input type="text" placeholder="Set Location" className="onair-input" value={demo ? typedLocation : undefined} readOnly={demo} />
            </div>
          </div>

          <div className="onair-host">
            <div className={`onair-host-avatar ${demo && demoActive && typedLocation.length > (demoEvent?.location?.length || 0) * 0.7 ? 'onair-host-avatar-filled' : ''}`}>
              <img src="/on-air/3d-guy.png" alt="" className={`onair-host-img-default ${demo && demoActive && typedLocation.length > (demoEvent?.location?.length || 0) * 0.7 ? 'onair-host-img-out' : ''}`} />
              {demo && demoEvent?.avatar && (
                <img src={demoEvent.avatar} alt="" className={`onair-host-img-real ${demoActive && typedLocation.length > (demoEvent?.location?.length || 0) * 0.7 ? 'onair-host-img-in' : ''}`} />
              )}
            </div>
            <div className="onair-host-label-wrap">
              <div className={`onair-host-label ${demo && demoActive && typedLocation.length > (demoEvent?.location?.length || 0) * 0.7 ? 'onair-host-hidden' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span>Add Host</span>
              </div>
              {demo && demoEvent && (
                <div className={`onair-host-label onair-host-name ${demoActive && typedLocation.length > (demoEvent?.location?.length || 0) * 0.7 ? 'onair-host-name-visible' : ''}`}>
                  <span>{demoEvent.host}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left color picker */}
        <div className="onair-colors">
          {colors.map((c, i) => (
            <div
              key={i}
              className={`onair-color ${selectedColor === i ? 'onair-color-selected' : ''}`}
              style={{ background: c.bg, border: c.border ? '0.5px solid var(--border)' : '0.5px solid var(--border)' }}
              onClick={() => setSelectedColor(i)}
            >
              {selectedColor === i && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </div>
          ))}
        </div>

        {/* Right toolbar */}
        <div className="onair-tools">
          <div className="onair-tool onair-tool-share">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M4 8H12M12 8L8.5 4.5M12 8L8.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="onair-tool">
            <img src="/icons/on-air-image.svg" alt="" className="onair-tool-icon" />
          </div>
          <div className="onair-tool">
            <img src="/icons/on-air-settings.svg" alt="" className="onair-tool-icon" />
          </div>
        </div>

        {/* Bottom toggles */}
      </div>
    </div>
  );
}
