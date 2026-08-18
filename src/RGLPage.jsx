import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import BirthdayCard3D, { CARD_SEED_NOTES, CardOpenButton, CardSignPop, CardWindowClose } from './rgl/BirthdayCard3D';
import RGLStage from './rgl/RGLStage';
import RoamIcon3D from './RoamIcon3D';
import BirthdayGlow from './BirthdayGlow';
import {
  GIFT_PALETTES,
  birthdayCssVars,
  getGiftPalette,
  paletteColorsFor,
} from './rgl/materials';
import { CARD_OPEN_SETTLE_MS } from './rgl/cardMotion';
import './RGLPage.css';

const ShowcaseMap = lazy(() => import('./ShowcaseMap'));
/**
 * RGL — Roam GL sandbox.
 * Design page for iterating on WebGL map overlays / celebration objects
 * before they land on the office map.
 */

const ITEMS = [
  {
    id: 'birthday-card',
    name: 'Birthday Card',
    blurb: 'Greeting card — same lighting & materials as the gifts. Click to open.',
    status: 'wip',
    kind: 'card',
  },
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
/** Full Y turns during the appear bounce. */
const APPEAR_TURNS = 1;
/** Start glow/sparks while the gift is still rising into frame. */
const ARRIVE_AT = 0.35;
/** Birthday label — shortly after glow, while the gift is still settling. */
const LABEL_AT = 0.45;
const SPARK_COUNT = 28;

/** Placeholder birthday names — in product this is the celebrant's name. */
const BIRTHDAY_NAME = 'Klas';

function pickPaletteId(exclude) {
  const ids = GIFT_PALETTES.map((p) => p.id);
  if (ids.length === 0) return exclude ?? 'gold';
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
    const dist = 160 + (i % 6) * 36;
    const size = 7 + (i % 5) * 2;
    const delay = (i % 7) * 18;
    return { angle, dist, size, delay, i };
  });

  return (
    <>
      {/* Radial sparkles behind the gift — same FX as the office floor. */}
      <div
        className="rgl-gift-arrive rgl-gift-arrive-glow"
        style={{ '--rgl-glow': accent }}
        aria-hidden="true"
      >
        <div className="rgl-gift-sparkle-field">
          <BirthdayGlow
            variant="radial"
            color={accent}
            className="rgl-gift-sparkle-canvas"
            interactive
          />
        </div>
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
  const [itemId, setItemId] = useState('birthday-card');
  const [theme, setTheme] = useState('dark');
  const [paletteId, setPaletteId] = useState(() => pickPaletteId());
  const [showMap, setShowMap] = useState(true);
  const [mapBirthday, setMapBirthday] = useState(true);
  const [tickerEmpty, setTickerEmpty] = useState(false);
  const [giftOpen, setGiftOpen] = useState(true);
  const [entering, setEntering] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [arriveFx, setArriveFx] = useState(false);
  const [arriveBurst, setArriveBurst] = useState(0);
  const [appearSpinKey, setAppearSpinKey] = useState(0);
  const [labelPlay, setLabelPlay] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [facing, setFacing] = useState(false);
  const [notes, setNotes] = useState(CARD_SEED_NOTES);
  const [draft, setDraft] = useState(null);
  const [draftText, setDraftText] = useState('');
  const hostRef = useRef(null);
  const skipTapRef = useRef(false);
  const [birthdayName, setBirthdayName] = useState(BIRTHDAY_NAME);
  const item = ITEMS.find((i) => i.id === itemId) ?? ITEMS[0];
  const isCard = item.kind === 'card';
  const showMapStage = isCard && showMap;
  const giftVisible = giftOpen || dismissing;
  const palette = getGiftPalette(paletteId);
  const paletteColors = paletteColorsFor(theme, paletteId);

  useEffect(() => {
    if (cardOpen) {
      setFacing(true);
      return undefined;
    }
    const id = window.setTimeout(() => setFacing(false), CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [cardOpen]);

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
    setAppearSpinKey(0);
    setCardOpen(false);
    setCardReady(false);
    setFacing(false);
    setNotes(CARD_SEED_NOTES);
    setDraft(null);
    setDraftText('');
    if (prefersReducedMotion()) {
      setEntering(false);
      setArriveFx(true);
      setLabelPlay(true);
      setCardReady(true);
      return undefined;
    }
    setEntering(true);
    let raf2 = 0;
    let arriveTimer = 0;
    let labelTimer = 0;
    let readyTimer = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setEntering(false);
        setAppearSpinKey((n) => n + 1);
        arriveTimer = window.setTimeout(() => {
          setArriveBurst((n) => n + 1);
          setArriveFx(true);
        }, ENTER_MS * ARRIVE_AT);
        labelTimer = window.setTimeout(() => {
          setLabelPlay(true);
        }, ENTER_MS * LABEL_AT);
        readyTimer = window.setTimeout(() => {
          setCardReady(true);
        }, ENTER_MS);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(arriveTimer);
      window.clearTimeout(labelTimer);
      window.clearTimeout(readyTimer);
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
    // Keep arriveFx so the radial sparkles can fade out with the layer.
    setLabelPlay(false);
    setDismissing(true);
  }, [giftOpen, dismissing]);

  const showGift = useCallback(() => {
    setPaletteId((prev) => pickPaletteId(prev));
    setBirthdayName(BIRTHDAY_NAME);
    runEnter();
  }, [runEnter]);

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
      setArriveFx(false);
    },
    [dismissing],
  );

  useEffect(() => {
    if (!dismissing) return undefined;
    const t = window.setTimeout(() => {
      setGiftOpen(false);
      setDismissing(false);
      setArriveFx(false);
    }, DISMISS_MS + 40);
    return () => window.clearTimeout(t);
  }, [dismissing]);

  const giftClass = [
    'rgl-gift-layer',
    entering && 'is-entering',
    dismissing && 'is-dismissing',
    cardOpen && 'is-card-open',
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

  const pickInside = useCallback((hit) => {
    if (!cardOpen) return;
    skipTapRef.current = true;
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    setDraft({
      page: hit.page,
      u: hit.u,
      v: hit.v,
      x: hit.clientX - rect.left,
      y: hit.clientY - rect.top,
    });
    setDraftText('');
  }, [cardOpen]);

  const cancelDraft = useCallback(() => {
    setDraft(null);
    setDraftText('');
  }, []);

  const toggleCard = useCallback(() => {
    if (!cardReady || dismissing || draft) return;
    if (skipTapRef.current) {
      skipTapRef.current = false;
      return;
    }
    setDraft(null);
    setDraftText('');
    setCardOpen((open) => !open);
  }, [cardReady, dismissing, draft]);

  const commitSign = useCallback(() => {
    const text = draftText.trim();
    if (!draft || !text) return;
    skipTapRef.current = true;
    setNotes((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        page: draft.page,
        u: draft.u,
        v: draft.v,
        rotate: (Math.random() * 14) - 7,
        name: 'Joe',
        text,
        ink: 4,
      },
    ]);
    setDraft(null);
    setDraftText('');
  }, [draft, draftText]);

  useEffect(() => {
    if (!giftVisible) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (draft) {
        cancelDraft();
        return;
      }
      if (cardOpen) setCardOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [giftVisible, draft, cardOpen, cancelDraft]);

  const giftContent = (
    <>
      {item.kind === 'card' && (
        <RGLStage
          className="rgl-canvas rgl-canvas-card"
          key={`${item.id}-${theme}-${paletteId}`}
          appearSpinKey={appearSpinKey}
          appearTurns={APPEAR_TURNS}
          appearDuration={ENTER_MS / 1000}
          idleSpin={!facing}
          holdYaw={facing ? 0 : null}
          tapSpin={!facing}
          allowDrag={!facing}
          onTap={cardReady && !dismissing && !draft ? toggleCard : undefined}
        >
          <BirthdayCard3D
            open={cardOpen}
            followPointer={cardOpen && !draft}
            name={birthdayName}
            notes={notes}
            draft={draft ? { ...draft, text: draftText, name: 'Joe' } : null}
            theme={theme}
            paletteId={paletteId}
            onInsidePick={pickInside}
          />
        </RGLStage>
      )}
      {item.kind === 'icon' && (
        <div className="rgl-icon-ref">
          <RoamIcon3D size={180} fadeDelay={0} reveal />
        </div>
      )}
    </>
  );

  const cardToggle = isCard && (
    <CardOpenButton
      open={cardOpen}
      visible={labelPlay}
      disabled={!cardReady || dismissing}
      onClick={toggleCard}
    />
  );

  return (
    <div
      className="rgl-page"
      data-theme={theme}
      style={birthdayCssVars(theme, paletteId)}
    >
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
          {(isCard || item.kind === 'icon') && (
            <button
              type="button"
              className="rgl-theme-toggle"
              onClick={toggleGift}
            >
              {giftOpen || dismissing ? 'Hide card' : 'Show card'}
            </button>
          )}
          {isCard && (
            <button
              type="button"
              className="rgl-theme-toggle"
              onClick={() => setShowMap((v) => !v)}
            >
              {showMap ? 'Hide map backdrop' : 'Show map backdrop'}
            </button>
          )}
          {isCard && showMap && (
            <button
              type="button"
              className="rgl-theme-toggle"
              onClick={() => setMapBirthday((v) => !v)}
            >
              {mapBirthday ? 'Hide birthday on map' : 'Show birthday on map'}
            </button>
          )}
          {isCard && showMap && (
            <button
              type="button"
              className="rgl-theme-toggle"
              onClick={() => setTickerEmpty((v) => !v)}
            >
              {tickerEmpty ? 'Show ticker items' : 'Ticker empty state'}
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
                    <Suspense fallback={null}>
                      <ShowcaseMap
                        embedded
                        theme={theme}
                        initialFloor="Homepage"
                        showTicker
                        birthdayPaletteId={paletteId}
                        birthdayEnabled={mapBirthday}
                        tickerEmpty={tickerEmpty}
                      />
                    </Suspense>
                  </div>
                  {giftVisible && (
                    <button
                      type="button"
                      className={scrimClass}
                      aria-label="Dismiss card"
                      onClick={dismissGift}
                    />
                  )}
                  {giftVisible && (
                    <CardWindowClose
                      disabled={dismissing}
                      dismissing={dismissing}
                      onClick={dismissGift}
                    />
                  )}
                  {giftVisible && (
                    <div
                      ref={hostRef}
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
                        {cardToggle}
                        <div className="rgl-gift-slide">
                          <div className={`rgl-gift-zoom${cardOpen ? ' is-open' : ''}`}>
                            {giftContent}
                          </div>
                        </div>
                      </div>
                      <CardSignPop
                        draft={draft}
                        value={draftText}
                        onChange={setDraftText}
                        onSign={commitSign}
                        onCancel={cancelDraft}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            giftVisible && (
              <div
                ref={hostRef}
                className={giftClass}
                onAnimationEnd={onGiftMotionEnd}
                onTransitionEnd={onGiftMotionEnd}
              >
                <CardWindowClose
                  disabled={dismissing}
                  dismissing={dismissing}
                  onClick={dismissGift}
                />
                {arriveFx && (
                  <GiftArriveFX
                    accent={paletteColors.accent}
                    burstKey={arriveBurst}
                  />
                )}
                <div className="rgl-gift-anchor">
                  {cardToggle}
                  <div className="rgl-gift-slide">
                    <div className={`rgl-gift-zoom${cardOpen ? ' is-open' : ''}`}>
                      {giftContent}
                    </div>
                  </div>
                </div>
                <CardSignPop
                  draft={draft}
                  value={draftText}
                  onChange={setDraftText}
                  onSign={commitSign}
                  onCancel={cancelDraft}
                />
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
