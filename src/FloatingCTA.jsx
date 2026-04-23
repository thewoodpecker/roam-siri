import { useEffect, useRef, useState } from 'react';

// A small portrait CTA card pinned to the bottom of the viewport.
// Fades out when the page's own footer CTA scrolls into view, fades back in
// once it leaves. Stays hidden before the user has scrolled past the hero, and
// hidden permanently after the user dismisses it.
// Works regardless of whether the page scrolls on `window` (FeaturePage) or on
// a `position: fixed; overflow-y: auto` viewport (ShowcaseMap homepage).
export default function FloatingCTA({ title = 'Ready to meet Roam?', sub = 'Give your team an office that thinks.', showAfter = 320 }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const rafRef = useRef(null);
  const rootRef = useRef(null);
  const prevVisibleRef = useRef(false);
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    if (prevVisibleRef.current && !visible) {
      setLeaving(true);
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = setTimeout(() => setLeaving(false), 320);
    } else if (visible) {
      setLeaving(false);
      clearTimeout(leaveTimerRef.current);
    }
    prevVisibleRef.current = visible;
    return () => clearTimeout(leaveTimerRef.current);
  }, [visible]);

  const handleDismiss = () => {
    setDismissing(true);
    setTimeout(() => setDismissed(true), 300);
  };

  useEffect(() => {
    const findScrollHost = (el) => {
      let current = el && el.parentElement;
      while (current) {
        const style = getComputedStyle(current);
        if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
          return current;
        }
        current = current.parentElement;
      }
      return window;
    };

    const scrollHost = findScrollHost(rootRef.current);
    const isWindow = scrollHost === window;

    const compute = () => {
      const all = document.querySelectorAll('.fp-footer-cta');
      const target = all[all.length - 1];
      const scrollTop = isWindow ? window.scrollY : scrollHost.scrollTop;
      const scrolled = scrollTop > showAfter;
      let footerInView = false;
      if (target) {
        const rect = target.getBoundingClientRect();
        footerInView = rect.top < window.innerHeight && rect.bottom > 0;
      }
      setVisible(scrolled && !footerInView);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        compute();
      });
    };

    scrollHost.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const mountRaf = requestAnimationFrame(() => {
      requestAnimationFrame(() => compute());
    });

    return () => {
      scrollHost.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(mountRaf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const shown = visible && !dismissed;

  return (
    <div
      ref={rootRef}
      className={`fp-floating-cta ${shown ? 'is-visible' : ''} ${leaving && !dismissing ? 'is-leaving' : ''} ${dismissing ? 'is-dismissing' : ''}`}
      aria-hidden={!shown}
    >
      <button
        type="button"
        className="fp-floating-cta-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <img className="fp-floating-cta-icon" src="/icons/roam-gold-icon.png" alt="" />
      <div className="fp-floating-cta-text">
        <h3 className="fp-floating-cta-title">{title}</h3>
        <p className="fp-floating-cta-sub">{sub}</p>
      </div>
      <div className="fp-floating-cta-actions">
        <button className="sc-promo-btn fp-floating-cta-btn">Book Demo</button>
        <button className="sc-promo-btn fp-floating-cta-btn">Free Trial</button>
      </div>
    </div>
  );
}
