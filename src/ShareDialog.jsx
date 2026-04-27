import React, { useEffect, useRef, useState } from 'react';
import './ShareDialog.css';

const SCREENS = [
  { id: 'desktop', label: 'Desktop', thumb: '/share-dialog/desktop.png' },
  { id: 'arc', label: 'Arc', thumb: '/share-dialog/arc.png', icon: '/share-dialog/arc-icon.png' },
  { id: 'spotify', label: 'Spotify', thumb: '/share-dialog/spotify.png', icon: '/share-dialog/spotify-icon.png' },
  { id: 'roam', label: 'Roam', thumb: '/share-dialog/roam.png', icon: '/share-dialog/roam-icon.png' },
  { id: 'notes', label: 'Notes', thumb: '/share-dialog/notes.png', icon: '/share-dialog/notes-icon.png' },
];

const SHARE_MODES = [
  { id: 'screen', label: 'Screen without Sound', buttonLabel: 'Share Screen without Sound', icon: '/icons/monitor-no-sound.svg' },
  { id: 'screen-sound', label: 'Screen with Sound', buttonLabel: 'Share Screen with Sound', icon: '/icons/monitor.svg' },
  { id: 'sound', label: 'Sound Only', buttonLabel: 'Share Sound Only', icon: '/icons/audio.svg' },
];

export default function ShareDialog({ open, onClose }) {
  const [selected, setSelected] = useState('desktop');
  const [shareMode, setShareMode] = useState('screen');
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const modeMenuRef = useRef(null);

  useEffect(() => {
    if (!modeMenuOpen) return;
    const onDocClick = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) {
        setModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [modeMenuOpen]);

  if (!open) return null;

  const currentMode = SHARE_MODES.find(m => m.id === shareMode) || SHARE_MODES[0];

  return (
    <div className="share-dialog-overlay" onClick={onClose}>
      <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-dialog-header">
          <button className="share-dialog-icon-btn share-dialog-close" onClick={onClose} aria-label="Close">
            <img src="/icons/dismiss.svg" width="16" height="16" alt="" />
          </button>
          <p className="share-dialog-title">Share</p>
          <button className="share-dialog-icon-btn share-dialog-search" aria-label="Search">
            <img src="/icons/search.svg" width="16" height="16" alt="" />
          </button>
        </div>

        {/* Screens grid */}
        <div className="share-dialog-body">
          <div className="share-dialog-screens">
            {SCREENS.map((screen) => (
              <div
                key={screen.id}
                className={`share-dialog-tile ${selected === screen.id ? 'share-dialog-tile-selected' : ''}`}
                onClick={() => setSelected(screen.id)}
              >
                <div className="share-dialog-thumb">
                  <img src={screen.thumb} alt="" />
                </div>
                <div className="share-dialog-label">
                  {screen.icon && <img className="share-dialog-label-icon" src={screen.icon} alt="" />}
                  <span>{screen.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="share-dialog-footer">
          <div className="share-dialog-mode" ref={modeMenuRef}>
            {modeMenuOpen && (
              <div className="share-dialog-mode-menu" role="menu">
                {SHARE_MODES.map((m) => (
                  <button
                    key={m.id}
                    role="menuitemradio"
                    aria-checked={shareMode === m.id}
                    className={`share-dialog-mode-item ${shareMode === m.id ? 'share-dialog-mode-item-selected' : ''}`}
                    onClick={() => { setShareMode(m.id); setModeMenuOpen(false); }}
                  >
                    <img className="share-dialog-mode-icon" src={m.icon} width="20" height="20" alt="" />
                    <span className="share-dialog-mode-label">{m.label}</span>
                    {shareMode === m.id && (
                      <svg className="share-dialog-mode-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
            <button
              className="share-dialog-btn share-dialog-btn-secondary"
              aria-haspopup="menu"
              aria-expanded={modeMenuOpen}
              onClick={() => setModeMenuOpen(o => !o)}
            >
              <img src={currentMode.icon} width="16" height="16" alt="" />
              {currentMode.buttonLabel}
              <svg className="share-dialog-btn-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button className="share-dialog-btn share-dialog-btn-primary" onClick={onClose}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
