import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Take browser scroll-restoration off auto. On reload, the browser was
// putting the page back where it left off; we want every reload to land
// at the top of the document. Setting this *before* React mounts ensures
// the initial paint happens at scroll 0.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
if (typeof window !== 'undefined') {
  window.scrollTo(0, 0);
}

// Global mute guard — every <video> on the site is decorative.
// Even with `muted` JSX props on every tag, iOS Safari can briefly
// grab AVAudioSession before React sets the muted property, which
// pauses any music the user has playing in another app. Catch every
// video element the moment it joins the DOM and force the `muted`
// property + `volume: 0` directly. Stories opt back in via their
// own UI by setting `videoRef.muted = false` on user click.
if (typeof window !== 'undefined') {
  const forceMute = (v) => {
    if (!(v instanceof HTMLMediaElement)) return;
    try {
      v.muted = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
    } catch {}
  };
  // Catch any media element already in the DOM at startup.
  document.querySelectorAll('video, audio').forEach(forceMute);
  // Watch the rest of the lifecycle.
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'VIDEO' || n.tagName === 'AUDIO') forceMute(n);
        n.querySelectorAll?.('video, audio').forEach(forceMute);
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
