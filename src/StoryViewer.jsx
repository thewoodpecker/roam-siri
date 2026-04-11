import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './StoryViewer.css';

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  // Preload all story images before showing
  useEffect(() => {
    let cancelled = false;
    const promises = stories.map(s => new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = s.image;
    }));
    Promise.all(promises).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [stories]);

  // Calculate offset based on which card is active
  // Each peek card width = height * 9/16 at 75% container height
  // Active card width = height * 9/16 at 100% container height
  // Use a simple calculation instead of DOM measurement
  useLayoutEffect(() => {
    const gap = 16;
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const containerH = containerEl.offsetHeight;
    const activeW = containerH * (9 / 16);
    const peekW = containerH * 0.75 * (9 / 16);

    let totalOffset = 0;
    for (let i = 0; i < currentIndex; i++) {
      totalOffset += peekW + gap;
    }
    totalOffset += activeW / 2;
    setOffset(-totalOffset);
  }, [currentIndex]);

  const current = stories[currentIndex];

  // Auto-advance progress bar
  useEffect(() => {
    setProgress(0);
    const duration = 5000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Advance to next story or close
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(i => i + 1);
        } else {
          handleClose();
        }
      }
    };
    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [currentIndex, stories.length]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex(i => i + 1);
    else handleClose();
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  return (
    <div className={`sv-overlay ${loaded ? 'sv-loaded' : 'sv-loading'} ${closing ? 'sv-closing' : ''}`} onClick={handleClose}>
      <div className="sv-container" ref={containerRef} onClick={e => e.stopPropagation()} style={{ transform: `translate(${offset}px, -50%)` }}>
        {stories.map((story, i) => {
          const isCurrent = i === currentIndex;
          return (
            <div
              key={story.image}
              className={`sv-card ${isCurrent ? 'sv-card-active' : 'sv-card-peek'}`}
              onClick={isCurrent ? undefined : () => setCurrentIndex(i)}
            >
              <img className="sv-image" src={story.image} alt="" />
              {isCurrent && (
                <>
                  <div className="sv-progress-bar">
                    {(() => {
                      const personStories = stories.filter(s => s.name === current.name);
                      const personIndex = personStories.indexOf(current);
                      return personStories.map((_, j) => (
                        <div key={j} className="sv-progress-segment">
                          <div className="sv-progress-fill" style={{ width: j < personIndex ? '100%' : j === personIndex ? `${progress * 100}%` : '0%' }} />
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="sv-header">
                    <img className="sv-avatar" src={current.avatar} alt="" />
                    <div className="sv-header-info">
                      <span className="sv-name">{current.name}</span>
                      <span className="sv-time">Just now</span>
                    </div>
                    <button className="sv-close" onClick={handleClose}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="sv-click-prev" onClick={goPrev} />
                  <div className="sv-click-next" onClick={goNext} />
                </>
              )}
              {!isCurrent && (
                <div className="sv-peek-info">
                  <img className="sv-peek-avatar" src={story.avatar} alt="" />
                  <span className="sv-peek-name">{story.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
