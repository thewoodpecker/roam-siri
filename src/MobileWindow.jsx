import React, { useState, useEffect, useRef } from 'react';
import { FLOORS } from './ShowcaseMap';
import './MobileWindow.css';

const ROAMS = [
  {
    id: 'roam-hq',
    name: 'Roam HQ',
    peopleCount: 56,
    logoIcon: 'roam',
    orbitors: [
      '/headshots/keegan-lanzillotta.jpg',
      '/headshots/howard-lerman.jpg',
      '/headshots/ava-lee.jpg',
    ],
  },
  {
    id: 'design-inc',
    name: 'Design Inc.',
    peopleCount: 91,
    logoIcon: 'd',
    orbitors: [
      '/headshots/chelsea-turbin.jpg',
      '/headshots/john-beutner.jpg',
      '/headshots/grace-sutherland.jpg',
    ],
  },
];

const MAP_ROOMS = [
  { id: 'howard', name: 'Howard Lerman', avatars: ['/headshots/howard-lerman.jpg'], size: 'small' },
  { id: 'will', name: 'Will Hou', avatars: ['/headshots/will-hou.jpg'], size: 'small', badge: 'spotify' },
  { id: 'thomas', name: 'Thomas', avatars: ['/headshots/thomas-grapperon.jpg'], size: 'small' },
  { id: 'tim', name: 'Tim McIsaac', avatars: ['/headshots/sean-macisaac.jpg', '/headshots/john-moffa.jpg'], size: 'small', badge: 'github' },
  { id: 'huffy', name: 'Huffy Smith', avatars: ['/headshots/john-huffsmith.jpg', '/headshots/mattias-leino.jpg'], size: 'small' },
  { id: 'tina', name: 'Tina Turner', avatars: ['/headshots/garima-kewlani.jpg', '/headshots/chelsea-turbin.jpg'], size: 'small' },
  { id: 'alan', name: 'Alan Kay', avatars: [], size: 'wide', meeting: true },
  { id: 'walt', name: 'Walt Disney', avatars: ['/headshots/derek-cicerone.jpg', '/headshots/michael-miller.jpg', '/headshots/jeff-grossman.jpg'], size: 'wide' },
  { id: 'tanner', name: 'Tanner Wils…', avatars: ['/headshots/jon-brod.jpg'], size: 'small', badge: 'lock' },
  { id: 'adam', name: 'Adam Akers', avatars: ['/headshots/peter-lerman.jpg', '/headshots/rob-figueiredo.jpg'], size: 'small' },
  { id: 'abraham', name: 'Abraham Rose', avatars: ['/headshots/aaron-wadhwa.jpg', '/headshots/john-beutner.jpg'], size: 'small' },
];

const AINBOX_FEATURED = [
  { id: 'will', name: 'Will', avatar: '/headshots/will-hou.jpg' },
  { id: 'howard', name: 'Howard', avatar: '/headshots/howard-lerman.jpg' },
  { id: 'design', name: 'Design', groupKind: 'design' },
];

const AINBOX_DMS = [
  { id: 'thomas', name: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg' },
  { id: 'jeff', name: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg' },
];

const AINBOX_MEETINGS = [
  { id: 'inbox-design', name: 'Inbox Design Discussion', read: false },
  { id: 'standup', name: 'Meetings Standup', read: true },
  { id: 'roam-project', name: 'Build a Roam Project and Website Updates', read: true },
];

const AINBOX_THREADS = [
  { id: 'figma', text: 'The new figma design can be found', avatar: '/headshots/mattias-leino.jpg', read: false },
  { id: 'computers', text: 'Computers are back online and', avatar: '/headshots/keegan-lanzillotta.jpg', read: true },
  { id: 'android', text: 'There is a new Android release', avatar: '/headshots/john-moffa.jpg', read: true },
];

const AINBOX_GROUPS = [
  { id: 'design', name: 'Design', kind: 'design' },
  { id: 'apple', name: 'Apple', kind: 'apple' },
  { id: 'android', name: 'Android', kind: 'android' },
];

function PodCoreLogo({ kind }) {
  if (kind === 'roam') {
    return <img src="/icons/mobile-tabs/roam-planet-logo.svg" alt="" className="mw-pod-core-svg" />;
  }
  return <img src="/icons/mobile-tabs/design-inc-logo.svg" alt="" className="mw-pod-core-svg" />;
}

function PodDots({ count, seed }) {
  const dots = React.useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const arr = [];
    const rMin = 22; // % — inner exclusion around the center logo
    const rMax = 44; // % — outer bound inside pod border
    for (let i = 0; i < count; i++) {
      // Uniform area distribution between rMin and rMax
      const r = Math.sqrt(rMin * rMin + rand() * (rMax * rMax - rMin * rMin));
      const theta = rand() * Math.PI * 2;
      arr.push({
        x: 50 + r * Math.cos(theta),
        y: 50 + r * Math.sin(theta),
        delay: rand() * -14,
        duration: 8 + rand() * 6,
        ax: (rand() - 0.5) * 5,
        ay: (rand() - 0.5) * 5,
        bx: (rand() - 0.5) * 5,
        by: (rand() - 0.5) * 5,
        cx: (rand() - 0.5) * 5,
        cy: (rand() - 0.5) * 5,
      });
    }
    return arr;
  }, [count, seed]);
  return (
    <div className="mw-pod-dots" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="mw-pod-dot"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            '--ax': `${d.ax}px`,
            '--ay': `${d.ay}px`,
            '--bx': `${d.bx}px`,
            '--by': `${d.by}px`,
            '--cx': `${d.cx}px`,
            '--cy': `${d.cy}px`,
          }}
        />
      ))}
    </div>
  );
}

function Pod({ logoIcon, orbitors, peopleCount = 40, seed = 1 }) {
  return (
    <div className="mw-pod">
      <PodDots count={Math.min(peopleCount, 48)} seed={seed} />
      {orbitors[0] && (
        <div className="mw-pod-avatar mw-pod-avatar-left">
          <img src={orbitors[0]} alt="" />
        </div>
      )}
      {orbitors[1] && (
        <div className="mw-pod-avatar mw-pod-avatar-right">
          <img src={orbitors[1]} alt="" />
        </div>
      )}
      {orbitors[2] && (
        <div className="mw-pod-avatar mw-pod-avatar-top">
          <img src={orbitors[2]} alt="" />
        </div>
      )}
      <div className="mw-pod-core">
        <PodCoreLogo kind={logoIcon} />
      </div>
    </div>
  );
}

function RoamCard({ roam, onOpen }) {
  return (
    <button className="mw-roam-card" onClick={onOpen}>
      <div className="mw-roam-info">
        <h3 className="mw-roam-name">{roam.name}</h3>
        <p className="mw-roam-meta">{roam.peopleCount} People Here Now</p>
      </div>
      <div className="mw-roam-pod-wrap">
        <Pod logoIcon={roam.logoIcon} orbitors={roam.orbitors} peopleCount={roam.peopleCount} seed={roam.id === 'roam-hq' ? 7 : 42} />
      </div>
    </button>
  );
}

function ChevronIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M11 5H6.5M11 5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MagicQuillAvatar() {
  return (
    <div className="mw-list-avatar mw-list-avatar-magic" aria-hidden="true">
      <img src="/icons/magic-quill.svg" alt="" width="16" height="16" />
    </div>
  );
}

const GROUP_IMAGES = {
  design: '/groups/Group Design.png',
  apple: '/groups/Group Apple.png',
  android: '/groups/Group Android.png',
};

function GroupAvatar({ kind, size = 24 }) {
  const src = GROUP_IMAGES[kind];
  return (
    <img
      className="mw-group-avatar"
      src={src}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
    />
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 6V4.5C5 3.4 5.9 2.5 7 2.5C8.1 2.5 9 3.4 9 4.5V6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" fill="#1DB954" />
      <path d="M4 6C6 5.2 8.3 5.4 10 6.4M4.3 7.8C6 7.2 7.8 7.4 9.2 8.1M4.6 9.5C5.8 9.1 7.1 9.3 8.2 9.9" stroke="#000" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0.5C5.7 0.5 0.5 5.7 0.5 12c0 5 3.3 9.3 7.9 10.8.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function WindowChromeIcon({ name }) {
  if (name === 'home') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 7L8 3L13 7V13H10V10H6V13H3V7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
  );
  if (name === 'camera') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M6 4.5V3.5H10V4.5" stroke="currentColor" strokeWidth="1.2" /></svg>
  );
  if (name === 'rotate') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M6 7L9 4L12 7M9 4V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  return null;
}

function formatClock(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export default function MobileWindow({ win, onDrag, onOpenStories, initialTab = 'roam', initialView = 'overworld', initialPlatform = 'ios' }) {
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewStack, setViewStack] = useState(initialTab === 'roam' && initialView === 'map' ? ['overworld', 'map'] : ['overworld']);
  const currentView = viewStack[viewStack.length - 1];
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [platform, setPlatform] = useState(initialPlatform);

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);

  const openRoam = (roam) => setViewStack(v => [...v, 'map']);
  const goBack = () => {
    setViewStack(v => (v.length > 1 ? v.slice(0, -1) : v));
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'roam') setViewStack(['overworld']);
  };

  return (
    <div
      className={`mw-win mw-win-${platform} ${!win.isFocused ? 'mw-win-unfocused' : ''} ${closing ? 'mw-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="mw-chrome" onMouseDown={onDrag}>
        <div className="mw-chrome-lights">
          <button className="mw-light mw-light-close" onMouseDown={(e) => e.stopPropagation()} onClick={handleClose} aria-label="Close" />
          <button className="mw-light mw-light-min" onMouseDown={(e) => e.stopPropagation()} aria-label="Minimize" />
          <button className="mw-light mw-light-max" onMouseDown={(e) => e.stopPropagation()} aria-label="Maximize" />
        </div>
        <div className="mw-chrome-title">
          <span className="mw-chrome-title-primary">{platform === 'ios' ? 'iPhone 16e' : 'Pixel 9'}</span>
          <span className="mw-chrome-title-secondary">{platform === 'ios' ? 'iOS 26.2' : 'Android 15'}</span>
        </div>
        <div className="mw-chrome-platform-toggle" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`mw-chrome-platform-seg ${platform === 'ios' ? 'mw-chrome-platform-seg-active' : ''}`}
            onClick={() => setPlatform('ios')}
            aria-label="iOS"
            aria-pressed={platform === 'ios'}
            title="iOS"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.54 12.94c-.02-2.33 1.9-3.45 1.99-3.5-1.08-1.59-2.77-1.8-3.37-1.83-1.43-.14-2.79.84-3.52.84-.73 0-1.85-.82-3.04-.8-1.56.02-3 .91-3.8 2.31-1.62 2.82-.41 7 1.17 9.27.77 1.12 1.69 2.37 2.9 2.33 1.17-.05 1.61-.75 3.03-.75 1.41 0 1.81.75 3.04.73 1.26-.02 2.05-1.14 2.82-2.26.88-1.3 1.25-2.57 1.27-2.63-.03-.02-2.44-.94-2.46-3.7zm-2.34-6.79c.65-.78 1.09-1.87.96-2.95-.93.04-2.06.62-2.73 1.4-.6.7-1.12 1.81-.98 2.87 1.04.08 2.1-.53 2.75-1.32z"/></svg>
          </button>
          <button
            type="button"
            className={`mw-chrome-platform-seg ${platform === 'android' ? 'mw-chrome-platform-seg-active' : ''}`}
            onClick={() => setPlatform('android')}
            aria-label="Android"
            aria-pressed={platform === 'android'}
            title="Android"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341a1.006 1.006 0 1 1 .005-2.01 1.006 1.006 0 0 1-.005 2.01zm-11.046 0a1.006 1.006 0 1 1 .005-2.01 1.006 1.006 0 0 1-.005 2.01zm11.4-6.02 2.004-3.47a.417.417 0 0 0-.722-.417l-2.03 3.513A12.56 12.56 0 0 0 12 7.792c-1.86 0-3.608.405-5.13 1.155L4.843 5.434a.417.417 0 0 0-.722.417L6.124 9.32C2.68 11.19.32 14.67 0 18.79h24c-.32-4.12-2.68-7.6-6.123-9.47z"/></svg>
          </button>
        </div>
        <div className="mw-chrome-spacer" aria-hidden="true" />
      </div>

      <div className="mw-phone">
        <div className="mw-phone-frame">
          <div className="mw-notch" />
          <div className="mw-screen">
            {(activeTab === 'roam' || activeTab === 'ainbox') && <div className="mw-topbar-bg" aria-hidden="true" />}
            <div className="mw-status">
              <span className="mw-time">{clock}</span>
              <img className="mw-status-icons" src={platform === 'ios' ? '/icons/mobile-tabs/status.svg' : '/icons/mobile-tabs/android-status.svg'} alt="" />
            </div>

            {activeTab === 'roam' && currentView === 'overworld' && (
              <div className="mw-content mw-overworld">
                <div className="mw-top-nav">
                  <img className="mw-top-avatar" src="/headshots/joe-woodward.jpg" alt="" />
                  <img className="mw-top-logo" src="/icons/mobile-tabs/logo-with-wordmark.svg" alt="Roam" />
                </div>
                <div className="mw-overworld-inner">
                  <div className="mw-roam-group">
                    <RoamCard roam={ROAMS[0]} onOpen={() => openRoam(ROAMS[0])} />
                    <button className="mw-stories-bar" onClick={(e) => e.preventDefault()}>
                      <span className="mw-stories-icon" aria-hidden="true" style={{ WebkitMaskImage: 'url(/icons/mobile-tabs/Story.svg)', maskImage: 'url(/icons/mobile-tabs/Story.svg)' }} />
                      <span className="mw-stories-label">Stories</span>
                      <span className="mw-stories-chevron"><ChevronIcon size={12} /></span>
                    </button>
                  </div>
                  <RoamCard roam={ROAMS[1]} onOpen={() => openRoam(ROAMS[1])} />
                </div>
              </div>
            )}

            {activeTab === 'roam' && currentView === 'map' && (
              <div className="mw-content mw-map">
                <div className="mw-top-nav">
                  <button className="mw-top-avatar mw-top-back" onClick={goBack} aria-label="Back">
                    <ChevronIcon size={14} />
                  </button>
                  <img className="mw-top-logo" src="/icons/mobile-tabs/logo-with-wordmark.svg" alt="Roam" />
                </div>
                <MobileMapGrid />
              </div>
            )}

            {activeTab === 'ainbox' && (
              <div className="mw-content mw-ainbox">
                <div className="mw-ainbox-header">
                  <img className="mw-ainbox-profile" src="/headshots/joe-woodward.jpg" alt="" />
                  <div className="mw-ainbox-title">
                    <span>AInbox</span>
                    <span className="mw-ainbox-title-caret"><ChevronIcon size={10} /></span>
                  </div>
                  <button className="mw-ainbox-compose" aria-label="Compose">
                    <img src="/icons/mobile-tabs/Compose.svg" alt="" width="20" height="20" />
                  </button>
                </div>
                <div className="mw-ainbox-featured">
                  {AINBOX_FEATURED.map((u) => (
                    <div key={u.id} className="mw-featured-user">
                      <div className="mw-featured-avatar-wrap">
                        {u.label && (
                          <div className="mw-featured-label">
                            <span>{u.label}</span>
                          </div>
                        )}
                        {u.groupKind === 'design' ? (
                          <GroupAvatar kind="design" size={60} />
                        ) : (
                          <img className="mw-featured-avatar" src={u.avatar} alt="" />
                        )}
                      </div>
                      <span className="mw-featured-name">{u.name}</span>
                    </div>
                  ))}
                </div>
                <AinboxSection title="Direct Messages">
                  {AINBOX_DMS.map((d) => (
                    <div key={d.id} className="mw-list-cell">
                      <img className="mw-list-avatar" src={d.avatar} alt="" />
                      <span className="mw-list-name">{d.name}</span>
                    </div>
                  ))}
                </AinboxSection>
                <AinboxSection title="Meetings">
                  {AINBOX_MEETINGS.map((m) => (
                    <div key={m.id} className={`mw-list-cell ${m.read ? 'mw-list-cell-read' : ''}`}>
                      <MagicQuillAvatar />
                      <span className="mw-list-name">{m.name}</span>
                    </div>
                  ))}
                </AinboxSection>
                <AinboxSection title="Threads">
                  {AINBOX_THREADS.map((t) => (
                    <div key={t.id} className={`mw-list-cell ${t.read ? 'mw-list-cell-read' : ''}`}>
                      <img className="mw-list-avatar" src={t.avatar} alt="" />
                      <span className="mw-list-name">{t.text}</span>
                    </div>
                  ))}
                </AinboxSection>
                <AinboxSection title="My Groups">
                  {AINBOX_GROUPS.map((g) => (
                    <div key={g.id} className="mw-list-cell">
                      <GroupAvatar kind={g.kind} size={24} />
                      <span className="mw-list-name">{g.name}</span>
                    </div>
                  ))}
                </AinboxSection>
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="mw-content mw-camera">
                <div className="mw-camera-viewfinder" />
                <div className="mw-camera-controls">
                  <div className="mw-camera-thumb"><img src="/stories/story-2.png" alt="" /></div>
                  <button className="mw-camera-shutter" aria-label="Capture" />
                  <button className="mw-camera-flip" aria-label="Flip">
                    <img src="/icons/mobile-tabs/camera-rotate.svg" alt="" width="22" height="22" />
                  </button>
                </div>
              </div>
            )}

            <div className="mw-tabbar">
              <div className="mw-tabbar-main">
                <button className={`mw-tab ${activeTab === 'ainbox' ? 'mw-tab-active' : ''}`} onClick={() => selectTab('ainbox')} aria-label="AInbox">
                  <span className="mw-tab-icon" style={{ WebkitMaskImage: 'url(/icons/mobile-tabs/Chat.svg)', maskImage: 'url(/icons/mobile-tabs/Chat.svg)' }} />
                </button>
                <button className={`mw-tab ${activeTab === 'roam' ? 'mw-tab-active' : ''}`} onClick={() => selectTab('roam')} aria-label="Roam">
                  <span className="mw-tab-icon" style={{ WebkitMaskImage: 'url(/icons/mobile-tabs/logo.svg)', maskImage: 'url(/icons/mobile-tabs/logo.svg)' }} />
                </button>
                <button className={`mw-tab ${activeTab === 'camera' ? 'mw-tab-active' : ''}`} onClick={() => selectTab('camera')} aria-label="Camera">
                  <span className="mw-tab-icon" style={{ WebkitMaskImage: 'url(/icons/mobile-tabs/Camera.svg)', maskImage: 'url(/icons/mobile-tabs/Camera.svg)' }} />
                </button>
              </div>
              <button className="mw-tab mw-tab-eye" aria-label="Presence">
                <span className="mw-tab-icon" style={{ WebkitMaskImage: 'url(/icons/mobile-tabs/Eye.svg)', maskImage: 'url(/icons/mobile-tabs/Eye.svg)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapRoom({ room }) {
  const [talking, setTalking] = useState({});
  const hasTalk = room.people.length > 1;

  useEffect(() => {
    if (!hasTalk) return;
    let timer;
    const tick = () => {
      setTalking(() => {
        const next = {};
        const r = Math.random();
        if (r < 0.4) {
          const idx = Math.floor(Math.random() * room.people.length);
          next[room.people[idx].name] = true;
        } else if (r < 0.55) {
          room.people.forEach(p => { next[p.name] = true; });
        }
        return next;
      });
      timer = setTimeout(tick, 1200 + Math.random() * 2000);
    };
    timer = setTimeout(tick, 400 + Math.random() * 800);
    return () => clearTimeout(timer);
  }, [hasTalk, room.people]);

  return (
    <div className="big-meeting-card-inner" style={{ height: '100%' }}>
      <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header" style={{ padding: '0 12px' }}>
          <h3 className={`office-name ${room.people.length === 0 ? 'sc-office-empty' : ''}`}>{room.name}</h3>
        </div>
        {room.people.length > 0 && (
          <div className="private-office-seat">
            <div className="seat-row seat-row-hovered">
              {room.people.map((person, i) => (
                <div key={person.name + i} className="seat-assigned sc-private-person">
                  <img className="seat-avatar" src={person.avatar} alt={person.name} />
                  {hasTalk && <div className={`sc-private-talk-ring ${talking[person.name] ? 'sc-talking' : ''}`} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileMapGrid() {
  const rooms = FLOORS['R&D'] || [];
  const viewportRef = useRef(null);
  const INITIAL_Y = 100;
  const [pos, setPos] = useState({ x: 0, y: INITIAL_Y });
  const drag = useRef(null);

  const onMouseDown = (e) => {
    drag.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      const vp = viewportRef.current;
      if (!vp) return;
      const content = vp.firstElementChild;
      const maxX = 0;
      const minX = Math.min(0, vp.clientWidth - content.offsetWidth);
      const maxY = INITIAL_Y;
      const minY = Math.min(INITIAL_Y, vp.clientHeight - content.offsetHeight - 80);
      setPos({
        x: Math.max(minX, Math.min(maxX, drag.current.origX + dx)),
        y: Math.max(minY, Math.min(maxY, drag.current.origY + dy)),
      });
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div className="mw-map-viewport" ref={viewportRef} onMouseDown={onMouseDown}>
      <div className="mw-map-canvas" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
        <div className="sc-map">
          <div className="sc-grid mw-map-sc-grid">
            {rooms.map((room) => {
              const gridColumn = room.colSpan
                ? `${room.pos.col + 1} / span ${room.colSpan}`
                : `${room.pos.col + 1}`;
              const gridRow = room.rowSpan
                ? `${room.pos.row + 1} / span ${room.rowSpan}`
                : `${room.pos.row + 1}`;
              return (
                <div
                  key={room.id}
                  className="sc-grid-cell sc-room-card"
                  data-room-type={room.type}
                  data-room-name={room.name}
                  style={{ gridColumn, gridRow }}
                >
                  <MapRoom room={room} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AinboxSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`mw-ainbox-section ${open ? 'mw-ainbox-section-open' : ''}`}>
      <button
        type="button"
        className="mw-ainbox-section-header"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mw-ainbox-section-caret" aria-hidden="true">
          <ChevronIcon size={10} />
        </span>
        <span className="mw-ainbox-section-title">{title}</span>
        <ArrowIcon />
      </button>
      {open && (
        <div className="mw-ainbox-section-list">
          {children}
        </div>
      )}
    </div>
  );
}
