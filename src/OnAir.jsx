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

export default function OnAir({ win, onDrag }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  const [selectedColor, setSelectedColor] = useState(0);
  const colors = ONAIR_COLORS;

  return (
    <div
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
        <span className="onair-title">On-Air Details</span>
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
            <div className="onair-field onair-field-title">
              <input type="text" placeholder="Set Title" className="onair-input onair-input-title" />
            </div>
            <div className="onair-field onair-field-desc">
              <input type="text" placeholder="Set Description" className="onair-input onair-input-desc" />
            </div>
          </div>

          <div className="onair-form">
            <div className="onair-field">
              <input type="text" placeholder="Set Date" className="onair-input" />
            </div>
            <div className="onair-field">
              <input type="text" placeholder="Set Location" className="onair-input" />
            </div>
          </div>

          <div className="onair-host">
            <div className="onair-host-avatar">
              <img src="/on-air/3d-guy.png" alt="" />
            </div>
            <div className="onair-host-label">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>Add Host</span>
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
