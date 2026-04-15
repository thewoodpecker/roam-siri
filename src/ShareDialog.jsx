import React, { useState } from 'react';
import './ShareDialog.css';

const SCREENS = [
  { id: 'desktop', label: 'Desktop', thumb: '/share-dialog/desktop.png' },
  { id: 'arc', label: 'Arc', thumb: '/share-dialog/arc.png', icon: '/share-dialog/arc-icon.png' },
  { id: 'spotify', label: 'Spotify', thumb: '/share-dialog/spotify.png', icon: '/share-dialog/spotify-icon.png' },
  { id: 'roam', label: 'Roam', thumb: '/share-dialog/roam.png', icon: '/share-dialog/roam-icon.png' },
  { id: 'notes', label: 'Notes', thumb: '/share-dialog/notes.png', icon: '/share-dialog/notes-icon.png' },
];

export default function ShareDialog({ open, onClose }) {
  const [selected, setSelected] = useState('desktop');

  if (!open) return null;

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
          <button className="share-dialog-btn share-dialog-btn-secondary">
            <img src="/icons/monitor.svg" width="16" height="16" alt="" />
            Share Screen with Sound
          </button>
          <button className="share-dialog-btn share-dialog-btn-primary" onClick={onClose}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
