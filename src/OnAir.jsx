import React, { useState } from 'react';
import './OnAir.css';

export default function OnAir({ win, onDrag }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  const [selectedColor, setSelectedColor] = useState(0);
  const colors = [
    { bg: '#1a1a1a', video: '/on-air/curtain-sway-landscape-black.mp4' },
    { bg: '#f2f2f2', video: null },
    { bg: '#d32f2f', video: '/on-air/curtain-sway-landscape-red.mp4' },
    { bg: '#ff8f00', video: '/on-air/curtain-sway-landscape-orange.mp4' },
    { bg: '#008e52', video: '/on-air/curtain-sway-landscape-green.mp4' },
    { bg: '#0059dc', video: '/on-air/curtain-sway-landscape-blue.mp4' },
    { bg: '#5700c9', video: '/on-air/curtain-sway-landscape-purple.mp4' },
  ];

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
        {/* Curtain video background */}
        {colors[selectedColor].video && (
          <video
            key={colors[selectedColor].video}
            className="onair-curtain-video"
            src={colors[selectedColor].video}
            autoPlay
            loop
            muted
            playsInline
          />
        )}

        {/* Center content */}
        <div className="onair-center">
          <div className="onair-form">
            <div className="onair-field onair-field-title">
              <span>Set Title</span>
            </div>
            <div className="onair-field onair-field-desc">
              <span>Set Description</span>
            </div>
          </div>

          <div className="onair-form">
            <div className="onair-field">
              <span>Set Date</span>
            </div>
            <div className="onair-field">
              <span>Set Location</span>
            </div>
          </div>

          <div className="onair-host">
            <div className="onair-host-avatar">
              <img src="/headshots/howard-lerman.jpg" alt="" />
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8H12M12 8L8.5 4.5M12 8L8.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="onair-tool">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="12" r="1.5" fill="currentColor"/><path d="M3 11L7 7L11 11L14 8L17 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="onair-tool">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2"/><circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M10 3V5M10 15V17M3 10H5M15 10H17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
        </div>

        {/* Bottom toggles */}
        <div className="onair-toggle-curtain">
          <div className="onair-toggle-line onair-toggle-line-v" />
          <div className="onair-toggle-pill">
            <span>Curtain</span>
            <div className="onair-toggle-switch onair-toggle-on">
              <div className="onair-toggle-knob" />
            </div>
          </div>
        </div>

        <div className="onair-toggle-logo">
          <div className="onair-toggle-line" />
          <div className="onair-toggle-pill">
            <span>Add Logo</span>
            <div className="onair-toggle-switch onair-toggle-on">
              <div className="onair-toggle-knob" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
