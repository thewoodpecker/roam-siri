import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './StoryViewer.css';

const isVideoSrc = (src) => /\.(mp4|webm|mov)$/i.test(src);

const storyFrames = (story) => {
  if (!story) return [];
  if (Array.isArray(story.frames) && story.frames.length) return story.frames;
  return [{ image: story.image, caption: story.caption }];
};

const prefersReducedMotion = () => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

export default function StoryViewer({ stories, initialIndex = 0, onClose, embedded = false }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [frameIndex, setFrameIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const activeVideoRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const holdEmbedded = embedded && reduceMotion;

  const handleClose = () => {
    if (embedded || !onClose) return;
    setClosing(true);
    setTimeout(onClose, 250);
  };

  // Preload all story images before showing (video sources skip image preload)
  useEffect(() => {
    let cancelled = false;
    const sources = stories.flatMap(s => storyFrames(s).map(frame => frame.image || frame.award?.image).filter(Boolean));
    const promises = sources.map(src => new Promise(resolve => {
      if (/\.(mp4|webm|mov)$/i.test(src)) { resolve(); return; }
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
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
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const measure = () => {
      const gap = 16;
      const containerH = containerEl.offsetHeight;
      if (!containerH) return;
      const activeW = containerH * (9 / 16);
      const peekW = containerH * 0.75 * (9 / 16);

      let totalOffset = 0;
      for (let i = 0; i < currentIndex; i++) {
        totalOffset += peekW + gap;
      }
      totalOffset += activeW / 2;
      setOffset(-totalOffset);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [currentIndex]);

  const current = stories[currentIndex];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Auto-advance progress bar. Videos drive their own progress via
  // timeupdate/ended; images use a fixed 5s timer. The embedded trophy
  // viewer uses the same timer and wraps to the first story. Reduced
  // motion holds the embedded viewer on the current story.
  useEffect(() => {
    if (holdEmbedded) {
      setProgress(0);
      return undefined;
    }
    setProgress(0);
    if (!current) return undefined;
    if (isVideoSrc(current.image)) return undefined; // video effect handles progress
    const duration = 5000;
    let elapsed = 0;
    let lastFrame = Date.now();
    const tick = () => {
      const now = Date.now();
      if (!paused) elapsed += now - lastFrame;
      lastFrame = now;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else if (frameIndex < storyFrames(current).length - 1) {
        setFrameIndex(i => i + 1);
      } else if (currentIndex < stories.length - 1) {
        setFrameIndex(0);
        setCurrentIndex(i => i + 1);
      } else if (embedded) {
        setFrameIndex(0);
        setCurrentIndex(0);
      } else {
        handleClose();
      }
    };
    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [currentIndex, frameIndex, stories.length, current?.image, paused, embedded, holdEmbedded]);

  // Wire up video progress for the active video story. Browser `timeupdate`
  // events fire ~4× per second which feels steppy, so we sample currentTime
  // on every animation frame instead for a silky progress bar.
  useEffect(() => {
    if (holdEmbedded || !current || !isVideoSrc(current.image)) return undefined;
    const video = activeVideoRef.current;
    if (!video) return undefined;
    let rafId;
    const tick = () => {
      const d = video.duration;
      if (d && isFinite(d)) setProgress(Math.min(video.currentTime / d, 1));
      rafId = requestAnimationFrame(tick);
    };
    const onEnded = () => {
      setProgress(1);
      if (currentIndex < stories.length - 1) setCurrentIndex(i => i + 1);
      else if (embedded) setCurrentIndex(0);
      else handleClose();
    };
    video.addEventListener('ended', onEnded);
    try { video.currentTime = 0; } catch {}
    video.play?.().catch(() => {});
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('ended', onEnded);
    };
  }, [currentIndex, current?.image, embedded, holdEmbedded, stories.length]);

  // Pause/resume the active video without restarting it. Kept separate
  // from the init effect above so toggling `paused` doesn't reset
  // `currentTime` — resume picks up exactly where the user paused.
  useEffect(() => {
    if (!current || !isVideoSrc(current.image)) return;
    const video = activeVideoRef.current;
    if (!video) return;
    if (holdEmbedded || paused) video.pause?.();
    else video.play?.().catch(() => {});
  }, [paused, current?.image, holdEmbedded]);

  const goNext = () => {
    if (frameIndex < storyFrames(current).length - 1) {
      setFrameIndex(i => i + 1);
      return;
    }
    setFrameIndex(0);
    if (currentIndex < stories.length - 1) setCurrentIndex(i => i + 1);
    else if (embedded) setCurrentIndex(0);
    else handleClose();
  };

  const goPrev = () => {
    if (frameIndex > 0) {
      setFrameIndex(i => i - 1);
      return;
    }
    if (currentIndex > 0) {
      setFrameIndex(storyFrames(stories[currentIndex - 1]).length - 1);
      setCurrentIndex(i => i - 1);
    }
  };

  // Keyboard shortcuts: Space toggles pause/play; arrows navigate.
  useEffect(() => {
    if (embedded) return undefined;
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setPaused(p => !p);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, stories.length, embedded]);

  return (
    <div
      className={`sv-overlay${embedded ? ' sv-embedded' : ''} ${loaded ? 'sv-loaded' : 'sv-loading'} ${closing ? 'sv-closing' : ''}`}
      onClick={(e) => { if (!embedded && e.target === e.currentTarget) handleClose(); }}
    >
      <div className="sv-container" ref={containerRef} style={{ transform: `translate(${offset}px, -50%)` }}>
        {stories.map((story, i) => {
          const isCurrent = i === currentIndex;
          const frames = storyFrames(story);
          const frame = frames[isCurrent ? Math.min(frameIndex, frames.length - 1) : 0] || frames[0];
          const caption = frame?.caption;
          const frameAward = frame?.award || (!story.frames && story.award);
          return (
            <div
              key={story.id || story.image}
              className={`sv-card ${isCurrent ? 'sv-card-active' : 'sv-card-peek'}${frameAward ? ' sv-card-award' : ''}${caption && !frameAward ? ' sv-card-caption' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={isCurrent ? undefined : () => { setFrameIndex(0); setCurrentIndex(i); }}
            >
              {frameAward ? (
                <div className="sv-award">
                  <div className="sv-award-photo">
                    <img src={frameAward.image} alt="" />
                  </div>
                  {isCurrent && (
                    <div className="sv-award-copy">
                      <p className="sv-award-title">{frameAward.title}</p>
                      <img className="sv-award-rule" src={frameAward.rule} alt="" />
                      <p className="sv-award-who">{frameAward.who}</p>
                      <p className="sv-award-when">{frameAward.when}</p>
                      {caption && <p className="sv-caption">{caption}</p>}
                    </div>
                  )}
                </div>
              ) : isVideoSrc(story.image) ? (
                <video
                  ref={isCurrent ? activeVideoRef : undefined}
                  className="sv-image"
                  src={isCurrent ? story.image : undefined}
                  poster={story.image.replace(/^(.*\/)([^/]+)\.(mp4|webm|mov)$/i, '$1posters/$2.jpg')}
                  preload={isCurrent ? 'auto' : 'none'}
                  autoPlay={isCurrent && !holdEmbedded}
                  muted={isCurrent ? muted : true}
                  playsInline
                />
              ) : (
                <img className="sv-image" src={frame?.image || story.image} alt="" />
              )}
              {isCurrent && (
                <>
                  <div className="sv-progress-bar">
                    {(() => {
                      const segments = [];
                      stories.forEach((s, si) => {
                        if (s.name !== current.name) return;
                        storyFrames(s).forEach((_, fi) => segments.push({ si, fi }));
                      });
                      const activeSeg = segments.findIndex(seg => seg.si === currentIndex && seg.fi === frameIndex);
                      return segments.map((seg, j) => (
                        <div key={`${seg.si}-${seg.fi}`} className="sv-progress-segment">
                          <div className="sv-progress-fill" style={{ width: j < activeSeg ? '100%' : j === activeSeg ? `${progress * 100}%` : '0%' }} />
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
                    {isVideoSrc(current.image) && (
                      <button
                        className="sv-mute"
                        onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
                        aria-label={muted ? 'Unmute' : 'Mute'}
                      >
                        {muted ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3L4.5 5.5H2V10.5H4.5L8 13V3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                            <path d="M11 6L14 9M14 6L11 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3L4.5 5.5H2V10.5H4.5L8 13V3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                            <path d="M11 5.5C11.6 6.2 12 7.05 12 8C12 8.95 11.6 9.8 11 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            <path d="M12.5 3.5C13.75 4.75 14.5 6.3 14.5 8C14.5 9.7 13.75 11.25 12.5 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                          </svg>
                        )}
                      </button>
                    )}
                    {!embedded && (
                    <button type="button" aria-label="Close story" className="sv-close" onClick={handleClose}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    )}
                  </div>
                  <button type="button" aria-label="Previous story" className="unbutton sv-click-prev" onClick={goPrev} />
                  <button type="button" aria-label="Next story" className="unbutton sv-click-next" onClick={goNext} />
                  {caption && !frameAward && <p className="sv-caption">{caption}</p>}
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
