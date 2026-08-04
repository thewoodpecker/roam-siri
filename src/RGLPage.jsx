import { useCallback, useEffect, useState } from 'react';
import PackGift3D from './rgl/PackGift3D';
import RGLStage from './rgl/RGLStage';
import SoftBlurText from './SoftBlurText';
import RoamIcon3D from './RoamIcon3D';
import ShowcaseMap from './ShowcaseMap';
import { PACK_GIFTS } from './rgl/giftCatalog';
import {
  GIFT_PALETTES,
  getGiftPalette,
  paletteColorsFor,
} from './rgl/materials';
import './RGLPage.css';
/**
 * RGL — Roam GL sandbox.
 * Design page for iterating on WebGL map overlays / celebration objects
 * before they land on the office map.
 */

const ITEMS = [
  ...PACK_GIFTS.map((g) => ({
    id: g.id,
    name: g.name,
    blurb: g.blurb,
    status: g.status,
    kind: 'pack',
  })),
  {
    id: 'app-icon',
    name: 'App Icon',
    blurb: 'Reference — the RoamGL squircle + gold rings.',
    status: 'ref',
    kind: 'icon',
  },
];

const DISMISS_MS = 420;
/** Must match `.rgl-gift-bounce-in` duration in RGLPage.css. */
const ENTER_MS = 1100;
/** Start glow/sparks while the gift is still rising into frame. */
const ARRIVE_AT = 0.35;
/** Birthday label — shortly after glow, while the gift is still settling. */
const LABEL_AT = 0.45;
const SPARK_COUNT = 28;

/** Placeholder birthday names — in product this is the celebrant's name. */
const BIRTHDAY_NAMES = [
  'Joe',
  'Chelsea',
  'Howard',
  'Mattias',
  'Ava',
  'Garima',
  'Sean',
  'Rob',
  'Lexi',
  'Will',
  'Derek',
  'Grace',
  'Klas',
  'Arnav',
  'Peter',
  'Jeff',
  'Thomas',
];

function pickBirthdayName(exclude) {
  const pool = BIRTHDAY_NAMES.filter((n) => n !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? 'Joe';
}

function pickPackGiftId(exclude) {
  const ids = PACK_GIFTS.map((g) => g.id);
  if (ids.length === 0) return exclude ?? 'pack-flat';
  let next = ids[Math.floor(Math.random() * ids.length)];
  if (ids.length > 1 && exclude) {
    let guard = 0;
    while (next === exclude && guard++ < 12) {
      next = ids[Math.floor(Math.random() * ids.length)];
    }
  }
  return next;
}

function pickPaletteId(exclude) {
  const ids = GIFT_PALETTES.map((p) => p.id);
  if (ids.length === 0) return exclude ?? 'roam';
  let next = ids[Math.floor(Math.random() * ids.length)];
  if (ids.length > 1 && exclude) {
    let guard = 0;
    while (next === exclude && guard++ < 12) {
      next = ids[Math.floor(Math.random() * ids.length)];
    }
  }
  return next;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function GiftArriveFX({ accent, burstKey }) {
  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = (360 / SPARK_COUNT) * i + (i % 4) * 5;
    const dist = 100 + (i % 6) * 22;
    const size = 7 + (i % 5) * 2;
    const delay = (i % 7) * 18;
    return { angle, dist, size, delay, i };
  });

  return (
    <>
      <div
        className="rgl-gift-arrive rgl-gift-arrive-glow"
        style={{
          '--rgl-glow': accent,
          '--rgl-glow-soft': `${accent}99`,
        }}
        aria-hidden="true"
      >
        <div className="rgl-gift-glow" />
      </div>
      <div
        className="rgl-gift-arrive rgl-gift-arrive-sparks"
        style={{ '--rgl-glow': accent }}
        aria-hidden="true"
      >
        <div className="rgl-gift-sparks" key={burstKey}>
          {sparks.map((s) => (
            <span
              key={s.i}
              className="rgl-spark"
              style={{
                '--a': `${s.angle}deg`,
                '--d': `${s.dist}px`,
                '--s': `${s.size}px`,
                '--delay': `${s.delay}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default function RGLPage() {
  const [itemId, setItemId] = useState(() => pickPackGiftId());
  const [theme, setTheme] = useState('dark');
  const [paletteId, setPaletteId] = useState(() => pickPaletteId());
  const [showMap, setShowMap] = useState(true);
  const [giftOpen, setGiftOpen] = useState(true);
  const [entering, setEntering] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [arriveFx, setArriveFx] = useState(false);
  const [arriveBurst, setArriveBurst] = useState(0);
  const [labelPlay, setLabelPlay] = useState(false);
  const [birthdayName, setBirthdayName] = useState('Joe');
  const item = ITEMS.find((i) => i.id === itemId) ?? ITEMS[0];
  const isGift = item.kind === 'pack';
  const showMapStage = isGift && showMap;
  const giftVisible = giftOpen || dismissing;
  const palette = getGiftPalette(paletteId);
  const paletteColors = paletteColorsFor(theme, paletteId);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    return () => {
      html.removeAttribute('data-theme');
    };
  }, [theme]);

  const runEnter = useCallback(() => {
    setDismissing(false);
    setGiftOpen(true);
    setArriveFx(false);
    setLabelPlay(false);
    setBirthdayName((prev) => pickBirthdayName(prev));
    if (prefersReducedMotion()) {
      setEntering(false);
      setArriveFx(true);
      setLabelPlay(true);
      return undefined;
    }
    setEntering(true);
    let raf2 = 0;
    let arriveTimer = 0;
    let labelTimer = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setEntering(false);
        arriveTimer = window.setTimeout(() => {
          setArriveBurst((n) => n + 1);
          setArriveFx(true);
        }, ENTER_MS * ARRIVE_AT);
        // Soft-blur label while the gift is arriving / settling.
        labelTimer = window.setTimeout(() => {
          setLabelPlay(true);
        }, ENTER_MS * LABEL_AT);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(arriveTimer);
      window.clearTimeout(labelTimer);
    };
  }, []);

  // Reselecting an item (or first mount) plays the slide-up entrance.
  useEffect(() => {
    const cancel = runEnter();
    return typeof cancel === 'function' ? cancel : undefined;
  }, [itemId, runEnter]);

  const selectItem = useCallback((id) => {
    setItemId(id);
  }, []);

  const dismissGift = useCallback(() => {
    if (!giftOpen || dismissing) return;
    if (prefersReducedMotion()) {
      setGiftOpen(false);
      setDismissing(false);
      setEntering(false);
      setArriveFx(false);
      setLabelPlay(false);
      return;
    }
    setEntering(false);
    setArriveFx(false);
    setLabelPlay(false);
    setDismissing(true);
  }, [giftOpen, dismissing]);

  const showGift = useCallback(() => {
    setPaletteId((prev) => pickPaletteId(prev));
    const next = pickPackGiftId(itemId);
    if (next === itemId) runEnter();
    else setItemId(next);
  }, [itemId, runEnter]);

  const toggleGift = useCallback(() => {
    if (giftOpen || dismissing) dismissGift();
    else showGift();
  }, [giftOpen, dismissing, dismissGift, showGift]);

  const onGiftMotionEnd = useCallback(
    (e) => {
      if (!dismissing) return;
      // Exit keyframes run on .rgl-gift-slide; handler is on the layer.
      if (!e.target.classList?.contains('rgl-gift-slide')) return;
      if (e.type === 'animationend' && e.animationName !== 'rgl-gift-slide-out') return;
      if (
        e.type === 'transitionend' &&
        e.propertyName !== 'opacity' &&
        e.propertyName !== 'transform'
      ) {
        return;
      }
      setGiftOpen(false);
      setDismissing(false);
    },
    [dismissing],
  );

  useEffect(() => {
    if (!dismissing) return undefined;
    const t = window.setTimeout(() => {
      setGiftOpen(false);
      setDismissing(false);
    }, DISMISS_MS + 40);
    return () => window.clearTimeout(t);
  }, [dismissing]);

  const giftClass = [
    'rgl-gift-layer',
    entering && 'is-entering',
    dismissing && 'is-dismissing',
  ]
    .filter(Boolean)
    .join(' ');

  const scrimClass = [
    'rgl-gift-scrim',
    entering && 'is-entering',
    dismissing && 'is-dismissing',
  ]
    .filter(Boolean)
    .join(' ');

  const giftContent = (
    <>
      {item.kind === 'pack' && (
        <RGLStage className="rgl-canvas" key={`${item.id}-${theme}-${paletteId}`}>
          <PackGift3D giftId={item.id} scale={1} theme={theme} paletteId={paletteId} />
        </RGLStage>
      )}
      {item.kind === 'icon' && (
        <div className="rgl-icon-ref">
          <RoamIcon3D size={180} fadeDelay={0} reveal />
        </div>
      )}
    </>
  );

  const birthdayLabel = (
    <div className={`rgl-gift-label${labelPlay ? ' is-visible' : ''}`}>
      <SoftBlurText
        key={`${birthdayName}-${arriveBurst}-${labelPlay}`}
        as="p"
        className="rgl-birthday-label"
        text={`Happy Birthday ${birthdayName}`}
        play={labelPlay}
        delay={0}
        stagger={0.025}
        duration={0.9}
      />
    </div>
  );

  return (
    <div className="rgl-page" data-theme={theme}>
      <aside className="rgl-sidebar">
        <div className="rgl-brand">
          <span className="rgl-brand-mark">RGL</span>
        </div>
        <p className="rgl-intro">
          Sandbox for 3D map objects. Same lighting &amp; materials as the
          Roam app icon — iterate here, then drop onto the map.
        </p>

        <div className="rgl-section-label">Items</div>
        <ul className="rgl-item-list">
          {ITEMS.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                className={`rgl-item${i.id === itemId ? ' is-active' : ''}`}
                onClick={() => selectItem(i.id)}
              >
                <span className="rgl-item-name">{i.name}</span>
                <span className={`rgl-item-status rgl-item-status-${i.status}`}>
                  {i.status}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="rgl-swatches">
          <div className="rgl-section-label">Palette</div>
          <div className="rgl-palette-list" role="listbox" aria-label="Gift palette">
            {GIFT_PALETTES.map((p) => {
              const colors = theme === 'light' ? p.light : p.dark;
              const active = p.id === paletteId;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`rgl-palette-btn${active ? ' is-active' : ''}`}
                  onClick={() => setPaletteId(p.id)}
                  title={p.blurb}
                >
                  <span className="rgl-palette-chips" aria-hidden="true">
                    <span
                      className="rgl-palette-chip rgl-palette-chip-body"
                      style={{ background: colors.body }}
                    />
                    <span
                      className="rgl-palette-chip rgl-palette-chip-accent"
                      style={{ background: colors.accent }}
                    />
                  </span>
                  <span className="rgl-palette-meta">
                    <span className="rgl-palette-name">{p.name}</span>
                    <span className="rgl-palette-blurb">{p.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="rgl-swatch-row rgl-swatch-row-active">
            <span
              className="rgl-swatch"
              style={{ background: paletteColors.body }}
              title="Body"
            />
            <span
              className="rgl-swatch"
              style={{ background: paletteColors.accent }}
              title="Accent"
            />
            <span className="rgl-swatch-meta">
              <span className="rgl-swatch-name">{palette.name}</span>
              <span className="rgl-swatch-hex">
                {paletteColors.body} · {paletteColors.accent}
              </span>
            </span>
          </div>
        </div>

        <div className="rgl-sidebar-foot">
          {(isGift || item.kind === 'icon') && (
            <button
              type="button"
              className="rgl-theme-toggle"
              onClick={toggleGift}
            >
              {giftOpen || dismissing ? 'Hide gift' : 'Show gift'}
            </button>
          )}
          {isGift && (
            <button
              type="button"
              className="rgl-theme-toggle"
              onClick={() => setShowMap((v) => !v)}
            >
              {showMap ? 'Hide map backdrop' : 'Show map backdrop'}
            </button>
          )}
          <button
            type="button"
            className="rgl-theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? 'Light stage' : 'Dark stage'}
          </button>
        </div>
      </aside>

      <main className="rgl-stage-wrap">
        <div className={`rgl-stage-floor${showMapStage ? ' rgl-stage-floor-map' : ''}`}>
          {showMapStage ? (
            <div className="rgl-map-backdrop">
              <div
                className="rgl-map-wallpaper"
                style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }}
                aria-hidden="true"
              />
              <div className="rgl-map-window-host">
                <div className="rgl-map-window-frame">
                  <div className="rgl-map-window-live" aria-hidden="true">
                    <ShowcaseMap embedded theme={theme} initialFloor="Homepage" />
                  </div>
                  {giftVisible && (
                    <button
                      type="button"
                      className={scrimClass}
                      aria-label="Dismiss gift"
                      onClick={dismissGift}
                    />
                  )}
                  {giftVisible && (
                    <div
                      className={giftClass}
                      onAnimationEnd={onGiftMotionEnd}
                      onTransitionEnd={onGiftMotionEnd}
                    >
                      {arriveFx && (
                        <GiftArriveFX
                          accent={paletteColors.accent}
                          burstKey={arriveBurst}
                        />
                      )}
                      <div className="rgl-gift-anchor">
                        {birthdayLabel}
                        <div className="rgl-gift-slide">{giftContent}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            giftVisible && (
              <div
                className={giftClass}
                onAnimationEnd={onGiftMotionEnd}
                onTransitionEnd={onGiftMotionEnd}
              >
                {arriveFx && (
                  <GiftArriveFX
                    accent={paletteColors.accent}
                    burstKey={arriveBurst}
                  />
                )}
                <div className="rgl-gift-anchor">
                  {birthdayLabel}
                  <div className="rgl-gift-slide">{giftContent}</div>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
