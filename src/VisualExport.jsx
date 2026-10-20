import React, { useEffect, useMemo, useRef } from 'react';
import { HomepageExportVisual, HOMEPAGE_EXPORT_VISUALS } from './ShowcaseMap';
import {
  EXPORT_FEATURE_FOLDERS,
  OnAirEventContext,
  ONAIR_EVENTS,
  getFeatureExportVisual,
  getVisualExportCatalog,
} from './FeaturePage';
import { WindowManagerProvider } from './WindowManager';
import { ChatProvider } from './ChatContext';
import './FeaturePage.css';

const EXPORT_WINDOWS = [
  { id: 'ainbox', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'meeting', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'theater', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'magicminutes', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'lobby', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'pizza', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'onair', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'map', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
];

function buildCatalog() {
  const homepageFolder = EXPORT_FEATURE_FOLDERS.find((f) => f.slug === 'homepage')?.folder || '00 Homepage';
  const homepage = HOMEPAGE_EXPORT_VISUALS.map((v, index) => ({
    feature: 'homepage',
    section: v.id,
    folder: homepageFolder,
    index,
    title: v.title,
    hash: `#/export/homepage/${v.id}`,
  }));
  return [...homepage, ...getVisualExportCatalog()];
}

function parseExportPath(path) {
  const parts = String(path || '').split('/').filter(Boolean);
  return { feature: parts[0] || '', section: parts[1] || '' };
}

function padIndex(n) {
  return String(n).padStart(2, '0');
}

function fileNameFor(item) {
  const safe = String(item.title || item.section)
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${padIndex(item.index)} ${safe}.mp4`;
}

async function waitForExportPaint() {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const videos = [...document.querySelectorAll('video')];
  await Promise.all(videos.map((v) => {
    if (v.readyState >= 2) return null;
    return new Promise((resolve) => {
      const done = () => resolve();
      v.addEventListener('loadeddata', done, { once: true });
      v.addEventListener('error', done, { once: true });
      setTimeout(done, 4000);
    });
  }));
  await new Promise((r) => setTimeout(r, 250));
}

const CLIP_SELECTORS = [
  '.fp-mobile-preview .mw-win',
  '.mw-win',
  '.fp-map-preview .sc-window',
  '.fp-knock-preview',
  '.fp-whisper-preview',
  '.fp-vbg-compare',
  '.fp-onair-rsvp-wp',
  '.fp-emb-stage',
  '.fp-lobby-shelf',
  '.sc-window',
  '.ainbox-window',
  '.meeting-win',
  '.theater-win',
  '.mm-win',
  '.lb-win',
  '.pz-win',
  '.mc-win',
  '.mc-window',
  '.onair-window',
  '.sc-onit-window',
  '.rec-win',
  '.cal-win',
  '.fp-rv-window',
  '.fp-wb-window',
  '.fp-mb-window',
  '.sc-feature-visual',
];

const CLIP_EXTRAS = '.mc-bubble, .shelf-win, .fp-lock-magnify, .fp-magnify, .fp-hands-popover, .fp-krisp-popover, .fp-tags-magnify';

function findExportClipTarget(root) {
  const selectors = root.classList?.contains('fp-export-stage-homepage')
    ? ['.sc-feature-visual', ...CLIP_SELECTORS]
    : CLIP_SELECTORS;
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= 80 && r.height >= 80) return el;
  }
  return root;
}

function applyExportFit(clip, layout) {
  const scale = window.__EXPORT_FIT__?.scale || 4;
  const stage = document.querySelector('.fp-export-stage');
  if (!stage) return;
  let wrap = document.getElementById('fp-export-clip-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'fp-export-clip-wrap';
    wrap.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'right:auto',
      'bottom:auto',
      `--export-clip-w:${clip.width}px`,
      `--export-clip-h:${clip.height}px`,
      `--export-clip-scale:${scale}`,
      `width:${clip.width}px`,
      `height:${clip.height}px`,
      'overflow:hidden',
      `transform:scale(${scale})`,
      'transform-origin:top left',
      'z-index:999999',
      'background:#000',
    ].join(';');
    document.body.appendChild(wrap);
  }
  if (stage.parentElement !== wrap) wrap.appendChild(stage);
  stage.style.setProperty('position', 'absolute', 'important');
  stage.style.setProperty('left', `${-clip.x}px`, 'important');
  stage.style.setProperty('top', `${-clip.y}px`, 'important');
  stage.style.setProperty('width', `${layout.width}px`, 'important');
  stage.style.setProperty('height', `${layout.height}px`, 'important');
  stage.style.setProperty('margin', '0', 'important');
  stage.style.setProperty('padding', '0', 'important');
  stage.style.setProperty('transform', 'none', 'important');
  stage.style.setProperty('background', 'none', 'important');
  document.documentElement.style.background = '#000';
  document.body.style.background = '#000';
  const pageEl = document.querySelector('.fp-export-page');
  if (pageEl) {
    pageEl.style.setProperty('background', 'none', 'important');
    pageEl.style.setProperty('min-height', '0', 'important');
    pageEl.style.setProperty('height', '0', 'important');
    pageEl.style.setProperty('overflow', 'hidden', 'important');
  }
}

function measureExportClip() {
  const root = document.querySelector('.fp-export-stage') || document.body;
  const target = findExportClipTarget(root);
  const add = (el, acc) => {
    if (!el || el === acc.target) return acc;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return acc;
    acc.left = Math.min(acc.left, r.left);
    acc.top = Math.min(acc.top, r.top);
    acc.right = Math.max(acc.right, r.right);
    acc.bottom = Math.max(acc.bottom, r.bottom);
    return acc;
  };
  const seed = target.getBoundingClientRect();
  const acc = {
    target,
    left: seed.left,
    top: seed.top,
    right: seed.right,
    bottom: seed.bottom,
  };
  root.querySelectorAll(CLIP_EXTRAS).forEach((el) => add(el, acc));
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.max(0, acc.left);
  const top = Math.max(0, acc.top);
  const right = Math.min(vw, acc.right);
  const bottom = Math.min(vh, acc.bottom);
  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.max(1, Math.round(right - left)),
    height: Math.max(1, Math.round(bottom - top)),
  };
}

function ExportInner({ path }) {
  const { feature, section } = parseExportPath(path);
  const catalog = useMemo(() => buildCatalog(), []);
  const stageRef = useRef(null);

  const item = catalog.find((c) => c.feature === feature && c.section === section) || null;
  const resolved = feature && feature !== 'homepage' && section
    ? getFeatureExportVisual(feature, section)
    : null;
  const homepageVisual = feature === 'homepage' && section
    ? <HomepageExportVisual id={section} theme="dark" />
    : null;
  const visual = homepageVisual || resolved?.visual || null;
  const mapAlign = resolved?.mapAlign;
  const interactive = resolved?.interactive;
  const kind = resolved?.kind || (homepageVisual ? 'section' : null);
  const stageClass = kind === 'hero' ? 'fp-hero-stage' : 'fp-section-visual';

  useEffect(() => {
    window.__EXPORT_CATALOG__ = catalog.map((c) => ({
      ...c,
      fileName: fileNameFor(c),
    }));
    window.__EXPORT_READY__ = false;
    window.__EXPORT_CLIP__ = measureExportClip;
    window.__EXPORT_APPLY_FIT__ = applyExportFit;
    let cancelled = false;
    waitForExportPaint().then(() => {
      if (cancelled) return;
      const fit = window.__EXPORT_FIT__;
      if (fit?.clip && fit?.layout && !document.getElementById('fp-export-clip-wrap')) {
        applyExportFit(fit.clip, fit.layout);
      }
      window.__EXPORT_READY__ = true;
    });
    return () => { cancelled = true; };
  }, [catalog, feature, section, visual]);

  if (!feature) {
    return (
      <div className="fp-export-index">
        <h1>Visual export</h1>
        <p>{catalog.length} clips</p>
        <ol>
          {catalog.map((c) => (
            <li key={c.hash}>
              <a href={c.hash}>{c.folder} / {fileNameFor(c)}</a>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!visual) {
    return (
      <div className="fp-export-index">
        <p>No visual for <code>{feature}/{section}</code></p>
      </div>
    );
  }

  const isHomepage = feature === 'homepage';
  const fit = typeof window !== 'undefined' ? window.__EXPORT_FIT__ : null;
  const clip = fit?.clip;
  const layout = fit?.layout;
  const scale = fit?.scale || 4;

  const stage = (
    <div
      ref={stageRef}
      className={`fp-export-stage ${isHomepage ? 'fp-export-stage-homepage' : stageClass}`}
      data-map-align={mapAlign || undefined}
      data-interactive={interactive ? 'true' : undefined}
      style={clip && layout ? {
        position: 'absolute',
        left: -clip.x,
        top: -clip.y,
        width: layout.width,
        height: layout.height,
        margin: 0,
        padding: 0,
        background: 'none',
      } : undefined}
    >
      {visual}
    </div>
  );

  if (clip && layout) {
    return (
      <div
        id="fp-export-clip-wrap"
        className="sc-viewport fp-page"
        data-theme="dark"
        data-slug={isHomepage ? undefined : feature}
        data-export="true"
        style={{
          '--export-clip-w': `${clip.width}px`,
          '--export-clip-h': `${clip.height}px`,
          '--export-clip-scale': scale,
          zIndex: 999999,
          background: '#000',
          margin: 0,
          padding: 0,
        }}
      >
        {stage}
      </div>
    );
  }

  return (
    <div
      className="sc-viewport fp-page fp-export-page"
      data-theme="dark"
      data-slug={isHomepage ? undefined : feature}
      data-export="true"
    >
      {stage}
    </div>
  );
}

export default function VisualExportPage({ path = '' }) {
  const onAirEvent = ONAIR_EVENTS[0];
  return (
    <OnAirEventContext.Provider value={onAirEvent}>
      <ChatProvider>
        <WindowManagerProvider initialWindows={EXPORT_WINDOWS}>
          <ExportInner path={path} />
        </WindowManagerProvider>
      </ChatProvider>
    </OnAirEventContext.Provider>
  );
}
