import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import BirthdayCard3D, {
  COVER_DESIGNS,
  DEFAULT_BACK_TEXT,
  CardPageNav,
  CardSignPop,
  CardWindowClose,
  cardSeedNotesFor,
  useDockFade,
} from './rgl/BirthdayCard3D';
import RGLStage from './rgl/RGLStage';
import { GiftArriveFX } from './BirthdayGiftOverlay';
import LightingPlot from './rgl/LightingPlot';
import { CARD_ENVIRONMENTS } from './rgl/StudioEnvironment';
import {
  GIFT_PALETTES,
  birthdayCssVars,
  paletteColorsFor,
} from './rgl/materials';
import { CARD_OPEN_SETTLE_MS, COVER_SNAP_MS } from './rgl/cardMotion';
import { CARD_PEOPLE, personById, personName, randomCardLook } from './rgl/cardLook';
import './RGLPage.css';

function PanelSection({ title, children }) {
  return (
    <section className="rgl-panel">
      <h2 className="rgl-panel-title">{title}</h2>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children, title, ...rest }) {
  return (
    <button
      type="button"
      title={title}
      className={`rgl-chip${active ? ' is-active' : ''}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

function PaletteSwatches({ theme, paletteId, onSelect, className }) {
  return (
    <div
      className={['rgl-chip-row', className].filter(Boolean).join(' ')}
      role="listbox"
      aria-label="Color"
    >
      {GIFT_PALETTES.map((p) => {
        const colors = theme === 'light' ? p.light : p.dark;
        const blackBody = colors.body === '#000000';
        const fill = blackBody ? '#1A1A1D' : colors.accent;
        return (
          <button
            key={p.id}
            type="button"
            role="option"
            aria-selected={p.id === paletteId}
            aria-label={p.name}
            title={p.name}
            className={`rgl-swatch${p.id === paletteId ? ' is-active' : ''}`}
            style={{
              background: fill,
              boxShadow: blackBody ? `inset 0 0 0 1.5px ${colors.accent}` : undefined,
            }}
            onClick={() => onSelect(p.id)}
          >
            {p.id === paletteId && <SwatchCheck color={swatchMarkColor(fill)} />}
          </button>
        );
      })}
    </div>
  );
}

function FaceDock({
  side,
  visible,
  coverId,
  backText,
  theme,
  paletteId,
  onSelectCover,
  onBackText,
  onSelectPalette,
}) {
  const shown = side === 'back' ? 'back' : 'cover';
  const exiting = useDockFade(visible);
  return (
    <div
      className={`rgl-face-dock${visible ? ' is-on' : ''}${exiting ? ' is-exit' : ''}`}
      aria-hidden={!visible}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="rgl-face-dock-panel">
        <p className="rgl-face-dock-label">{shown === 'back' ? 'Back Cover' : 'Cover'}</p>
        {shown === 'back' ? (
          <input
            className="rgl-field rgl-face-dock-field"
            type="text"
            value={backText}
            maxLength={48}
            spellCheck={false}
            aria-label="Back text"
            placeholder={DEFAULT_BACK_TEXT}
            onChange={(e) => onBackText(e.target.value)}
          />
        ) : (
          <>
            <div className="rgl-chip-row" role="listbox" aria-label="Cover">
              {COVER_DESIGNS.map((cover) => (
                <Chip
                  key={cover.id}
                  role="option"
                  aria-selected={cover.id === coverId}
                  active={cover.id === coverId}
                  onClick={() => onSelectCover(cover.id)}
                >
                  {cover.name}
                </Chip>
              ))}
            </div>
            <p className="rgl-face-dock-label">Color</p>
            <PaletteSwatches
              className="rgl-face-dock-swatches"
              theme={theme}
              paletteId={paletteId}
              onSelect={onSelectPalette}
            />
          </>
        )}
      </div>
      <svg className="rgl-face-dock-lead" viewBox="0 0 72 24" aria-hidden="true">
        <line x1="0" y1="12" x2="58" y2="12" />
        <circle cx="64" cy="12" r="3" />
      </svg>
    </div>
  );
}

function swatchMarkColor(hex) {
  const n = String(hex || '').replace('#', '');
  if (n.length < 6) return '#1a1a1a';
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.62 ? '#1a1a1a' : '#fff';
}

function SwatchCheck({ color }) {
  return (
    <svg
      className="rgl-swatch-check"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.4 6.2 4.7 8.6 9.6 3.4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ShowcaseMap = lazy(() => import('./ShowcaseMap'));
/**
 * RGL — Roam GL sandbox.
 * Design page for iterating on WebGL map overlays / celebration objects
 * before they land on the office map.
 */

const DISMISS_MS = 420;
/** Must match `.rgl-gift-bounce-in` duration in RGLPage.css. */
const ENTER_MS = 1100;
/** Full Y turns during the appear bounce. */
const APPEAR_TURNS = 1;
const ARRIVE_AT = 0.35;
/** Birthday label — shortly after glow, while the gift is still settling. */
const LABEL_AT = 0.45;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function RGLPage() {
  const [theme, setTheme] = useState('dark');
  const [paletteId, setPaletteId] = useState('crimson');
  const [coverId, setCoverId] = useState('classic');
  const [backText, setBackText] = useState(DEFAULT_BACK_TEXT);
  const lastLook = useRef({ paletteId: '', coverId: '', backId: '', personId: '' });
  const [showMap, setShowMap] = useState(true);
  const [mapBirthday, setMapBirthday] = useState(true);
  const [birthdayCta, setBirthdayCta] = useState('toolbar');
  const [tickerEmpty, setTickerEmpty] = useState(false);
  const [giftOpen, setGiftOpen] = useState(true);
  const [entering, setEntering] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [appearSpinKey, setAppearSpinKey] = useState(0);
  const [arriveFx, setArriveFx] = useState(false);
  const [arriveBurst, setArriveBurst] = useState(0);
  const [labelPlay, setLabelPlay] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [facing, setFacing] = useState(false);
  const [inspect, setInspect] = useState(null);
  const [coverSnapKey, setCoverSnapKey] = useState(0);
  const [previewYaw, setPreviewYaw] = useState(0);
  const [previewAfterClose, setPreviewAfterClose] = useState(null);
  const [notes, setNotes] = useState(() => cardSeedNotesFor('Klas'));
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [pages, setPages] = useState({ spread: 0, count: 1 });
  const [leaving, setLeaving] = useState(false);
  const hostRef = useRef(null);
  const zoneAimRef = useRef(null);
  const leavingRef = useRef(false);
  const pageTurnRef = useRef({ next() {}, prev() {} });
  const skipTapRef = useRef(false);
  const skipPickUntil = useRef(0);
  const autoOpenedRef = useRef(false);
  const skipTapTimer = useRef(0);
  const armSkipTap = useCallback(() => {
    skipTapRef.current = true;
    window.clearTimeout(skipTapTimer.current);
    skipTapTimer.current = window.setTimeout(() => {
      skipTapRef.current = false;
    }, 0);
  }, []);
  const [personId, setPersonId] = useState('20');
  const personIdRef = useRef(personId);
  personIdRef.current = personId;
  const [environment, setEnvironment] = useState('studio');
  const lastInspect = useRef('cover');
  if (inspect) lastInspect.current = inspect;
  const presentingCover = inspect != null || previewAfterClose != null;
  const showMapStage = showMap;
  const giftVisible = giftOpen || dismissing;
  const birthdayName = personName(personId);
  const birthdayPerson = personById(personId);

  useEffect(() => {
    if (cardOpen) {
      setFacing(true);
      return undefined;
    }
    if (leaving || dismissing) return undefined;
    const id = window.setTimeout(() => setFacing(false), CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [cardOpen, leaving, dismissing]);

  useEffect(() => {
    if (cardOpen) {
      setPreviewAfterClose(null);
      setInspect(null);
      return undefined;
    }
    if (previewAfterClose == null || leaving || dismissing) return undefined;
    const yaw = previewAfterClose;
    const id = window.setTimeout(() => {
      setPreviewAfterClose(null);
      setInspect(yaw === Math.PI ? 'back' : 'cover');
      setPreviewYaw(yaw);
      setCoverSnapKey((n) => n + 1);
    }, CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [cardOpen, previewAfterClose, leaving, dismissing]);

  const inspectFace = useCallback((side, snap = true) => {
    if (cardOpen || leaving || dismissing) return;
    const yaw = side === 'back' ? Math.PI : 0;
    setInspect(side);
    setPreviewAfterClose(null);
    setPreviewYaw(yaw);
    if (snap) setCoverSnapKey((n) => n + 1);
  }, [cardOpen, leaving, dismissing]);

  const selectCover = useCallback((id) => {
    setCoverId(id);
    if (leaving || dismissing) return;
    if (cardOpen) {
      setDraft(null);
      setDraftText('');
      setCardOpen(false);
      setPreviewAfterClose(0);
      return;
    }
    inspectFace('cover');
  }, [cardOpen, leaving, dismissing, inspectFace]);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    return () => {
      html.removeAttribute('data-theme');
    };
  }, [theme]);

  const runEnter = useCallback(() => {
    const next = randomCardLook(lastLook.current, { lockPersonId: personIdRef.current });
    lastLook.current = next;
    setCoverId(next.coverId);
    setNotes(cardSeedNotesFor(next.name));
    setDismissing(false);
    setGiftOpen(true);
    setLabelPlay(false);
    setAppearSpinKey(0);
    setArriveFx(false);
    setCardOpen(false);
    setCardReady(false);
    leavingRef.current = false;
    setLeaving(false);
    autoOpenedRef.current = false;
    setFacing(false);
    setInspect(null);
    setSelectedNoteId(null);
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
  }, [runEnter]);

  useEffect(() => {
    if (cardOpen) autoOpenedRef.current = true;
  }, [cardOpen]);

  useEffect(() => {
    if (!giftOpen || dismissing || leaving || !cardReady || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    skipPickUntil.current = performance.now() + 500;
    setInspect(null);
    setCardOpen(true);
  }, [giftOpen, dismissing, leaving, cardReady]);

  const dismissGift = useCallback(() => {
    if (!giftOpen || dismissing) return;
    setDraft(null);
    setDraftText('');
    if (prefersReducedMotion()) {
      setGiftOpen(false);
      setDismissing(false);
      setEntering(false);
      setLabelPlay(false);
      setArriveFx(false);
      return;
    }
    setEntering(false);
    setLabelPlay(false);
    setDismissing(true);
  }, [giftOpen, dismissing]);
  const dismissGiftRef = useRef(dismissGift);
  dismissGiftRef.current = dismissGift;

  const beginLeave = useCallback(() => {
    if (leavingRef.current || !giftOpen || dismissing) return;
    leavingRef.current = true;
    setLeaving(true);
    setCardOpen(false);
  }, [giftOpen, dismissing]);

  useEffect(() => {
    if (!leaving) return undefined;
    if (prefersReducedMotion()) {
      dismissGiftRef.current();
      return undefined;
    }
    const t = window.setTimeout(() => dismissGiftRef.current(), CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  const showGift = useCallback(() => {
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

  const paletteColors = paletteColorsFor(theme, paletteId);
  const gleamColor = paletteColors.body === '#000000' ? '#ffe7a4' : '#eef3ff';
  const giftClass = [
    'rgl-gift-layer',
    entering && 'is-entering',
    dismissing && 'is-dismissing',
    cardOpen && 'is-card-open',
    inspect != null && !cardOpen && 'is-inspecting',
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
    if (!cardOpen || leaving) return;
    if (!hit?.auto && performance.now() < skipPickUntil.current) return;
    armSkipTap();
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    setSelectedNoteId(hit.noteId || null);
    setDraft({
      page: hit.page,
      spread: hit.spread ?? 0,
      col: hit.col,
      row: hit.row,
      u: hit.u,
      v: hit.v,
      x: hit.clientX - rect.left,
      y: hit.clientY - rect.top,
      noteId: hit.noteId || null,
    });
    setDraftText(hit.text || '');
  }, [cardOpen, leaving, armSkipTap]);

  const cancelDraft = useCallback(() => {
    setDraft(null);
    setDraftText('');
  }, []);

  const restCard = useCallback(() => {
    if (dismissing || leaving) return;
    if (draft) cancelDraft();
    setInspect(null);
    if (cardOpen) setCardOpen(false);
  }, [dismissing, leaving, draft, cardOpen, cancelDraft]);

  const onStageTap = useCallback(() => {
    if (!cardReady || dismissing || leaving) return;
    if (skipTapRef.current) {
      skipTapRef.current = false;
      return;
    }
    restCard();
  }, [cardReady, dismissing, leaving, restCard]);

  const commitSign = useCallback(() => {
    const text = draftText.trim();
    if (!draft || !text) return;
    armSkipTap();
    if (draft.noteId) {
      setNotes((prev) => prev.map((n) => (n.id === draft.noteId ? { ...n, text } : n)));
      setSelectedNoteId(draft.noteId);
    } else {
      const already = notes.some((n) => String(n.id).startsWith('me-'));
      if (already) {
        setDraft(null);
        setDraftText('');
        return;
      }
      const id = `me-${Date.now()}`;
      setNotes((prev) => [
        ...prev,
        {
          id,
          page: draft.page,
          spread: draft.spread ?? 0,
          col: draft.col,
          row: draft.row,
          u: draft.u,
          v: draft.v,
          rotate: 0,
          name: 'Joe',
          text,
          ink: 4,
        },
      ]);
      setSelectedNoteId(id);
      setDraft(null);
      setDraftText('');
      beginLeave();
      return;
    }
    setDraft(null);
    setDraftText('');
  }, [draft, draftText, notes, armSkipTap, beginLeave]);

  const changeNote = useCallback((id, patch) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const removeNote = useCallback((id) => {
    armSkipTap();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedNoteId((cur) => (cur === id ? null : cur));
    setDraft((cur) => (cur?.noteId === id ? null : cur));
  }, [armSkipTap]);

  useEffect(() => {
    if (!giftVisible) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (leaving) return;
      if (draft) {
        cancelDraft();
        return;
      }
      if (inspect) {
        setInspect(null);
        return;
      }
      if (cardOpen) setCardOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [giftVisible, leaving, draft, cardOpen, inspect, cancelDraft]);

  const giftContent = (
    <RGLStage
      className="rgl-canvas rgl-canvas-card"
      key={theme}
      environment={environment}
      appearSpinKey={appearSpinKey}
      appearTurns={APPEAR_TURNS}
      appearDuration={ENTER_MS / 1000}
      snapYawKey={coverSnapKey}
      snapYaw={previewYaw}
      snapDuration={COVER_SNAP_MS / 1000}
      idleSpin={!facing && !presentingCover}
      holdYaw={
        facing || previewAfterClose != null
          ? 0
          : inspect === 'back'
            ? Math.PI
            : inspect === 'cover'
              ? 0
              : null
      }
      tapSpin={!facing && !presentingCover}
      allowDrag
      idleCursor={cardOpen ? 'pointer' : 'default'}
      onOrbit={() => setInspect(null)}
      onTap={cardReady && !dismissing ? onStageTap : undefined}
    >
      <BirthdayCard3D
        open={cardOpen}
        name={birthdayName}
        notes={notes}
        draft={draft ? { ...draft, text: draftText, name: 'Joe' } : null}
        theme={theme}
        paletteId={paletteId}
        coverId={coverId}
        backId="text"
        backText={backText}
        appearOpenKey={appearSpinKey}
        selectedNoteId={selectedNoteId}
        onInsidePick={pickInside}
        onSelectNote={setSelectedNoteId}
        onNoteChange={changeNote}
        onRemoveNote={removeNote}
        onClose={() => setCardOpen(false)}
        onGrabStart={() => {
          armSkipTap();
        }}
        onInsideClick={() => {
          if (!cardReady || dismissing || leaving || draft) return;
          armSkipTap();
          skipPickUntil.current = performance.now() + 500;
          setInspect(null);
          setCardOpen(true);
        }}
        onPagesChange={setPages}
        pageTurnRef={pageTurnRef}
        zoneAimRef={zoneAimRef}
      />
    </RGLStage>
  );

  const pageNav = (
    <CardPageNav
      visible={labelPlay && cardOpen && pages.count > 1}
      hasPrev={pages.spread > 0}
      hasNext={pages.spread < pages.count - 1}
      onPrev={() => pageTurnRef.current.prev()}
      onNext={() => pageTurnRef.current.next()}
    />
  );

  const faceDock = (
    <FaceDock
      side={inspect || lastInspect.current}
      visible={inspect != null && !cardOpen && cardReady && !dismissing && !leaving}
      coverId={coverId}
      backText={backText}
      theme={theme}
      paletteId={paletteId}
      onSelectCover={selectCover}
      onSelectPalette={setPaletteId}
      onBackText={(value) => {
        setBackText(value);
        inspectFace('back', false);
      }}
    />
  );

  return (
    <div
      className="rgl-page"
      data-theme={theme}
      style={birthdayCssVars(theme, paletteId)}
    >
      <aside className="rgl-sidebar">
        <header className="rgl-sidebar-head">
          <h1 className="rgl-brand-mark">Birthday Card</h1>
        </header>

        <div className="rgl-sidebar-scroll">
          <PanelSection title="Name">
            <select
              className="rgl-select"
              aria-label="Name"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              {CARD_PEOPLE.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.label}
                </option>
              ))}
            </select>
          </PanelSection>

          <PanelSection title="Sign">
            <div className="rgl-chip-row" role="listbox" aria-label="Sign">
              <Chip
                role="option"
                aria-selected={birthdayCta === 'toolbar'}
                active={birthdayCta === 'toolbar'}
                onClick={() => setBirthdayCta('toolbar')}
              >
                Toolbar
              </Chip>
              <Chip
                role="option"
                aria-selected={birthdayCta === 'office'}
                active={birthdayCta === 'office'}
                onClick={() => setBirthdayCta('office')}
              >
                Office
              </Chip>
            </div>
          </PanelSection>

          <PanelSection title="design">
            <div className="rgl-chip-row" role="listbox" aria-label="design">
              {COVER_DESIGNS.map((cover) => (
                <Chip
                  key={cover.id}
                  role="option"
                  aria-selected={cover.id === coverId}
                  active={cover.id === coverId}
                  onClick={() => selectCover(cover.id)}
                >
                  {cover.name}
                </Chip>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Palette">
            <PaletteSwatches theme={theme} paletteId={paletteId} onSelect={setPaletteId} />
          </PanelSection>

          <PanelSection title="Lights">
            <div className="rgl-chip-row" role="listbox" aria-label="Environment">
              {CARD_ENVIRONMENTS.map((env) => (
                <Chip
                  key={env.id}
                  role="option"
                  title={env.blurb}
                  aria-selected={env.id === environment}
                  active={env.id === environment}
                  onClick={() => setEnvironment(env.id)}
                >
                  {env.name}
                </Chip>
              ))}
            </div>
            <LightingPlot
              open={cardOpen}
              gleamColor={gleamColor}
              canvasHostRef={hostRef}
            />
            <div className="rgl-light-plot-legend" aria-hidden="true">
              <span>
                <i className="rgl-light-plot-swatch is-studio" />
                lights
              </span>
              <span>
                <i className="rgl-light-plot-swatch is-gleam" style={{ background: gleamColor }} />
                gleam
              </span>
            </div>
          </PanelSection>
        </div>

        <div className="rgl-sidebar-foot">
          <PanelSection title="Stage">
            <div className="rgl-chip-row">
              <Chip active={giftOpen || dismissing} onClick={toggleGift}>
                Card
              </Chip>
              <Chip active={showMap} onClick={() => setShowMap((v) => !v)}>
                Map
              </Chip>
              {showMap && (
                <Chip active={mapBirthday} onClick={() => setMapBirthday((v) => !v)}>
                  Map gift
                </Chip>
              )}
              {showMap && (
                <Chip active={!tickerEmpty} onClick={() => setTickerEmpty((v) => !v)}>
                  Ticker
                </Chip>
              )}
              <Chip
                active={theme === 'light'}
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              >
                Light
              </Chip>
            </div>
          </PanelSection>
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
                        birthdayPerson={birthdayPerson}
                        birthdayCta={birthdayCta}
                        tickerEmpty={tickerEmpty}
                      />
                    </Suspense>
                  </div>
                  {giftVisible && (
                    <button
                      type="button"
                      className={scrimClass}
                      aria-label={cardOpen ? 'Close card' : undefined}
                      aria-hidden={!cardOpen}
                      tabIndex={cardOpen ? 0 : -1}
                      onClick={restCard}
                    />
                  )}
                  {giftVisible && (
                    <CardWindowClose
                      disabled={dismissing || leaving}
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
                        {pageNav}
                        {faceDock}
                        <CardSignPop
                          draft={draft}
                          value={draftText}
                          onChange={setDraftText}
                          onSign={commitSign}
                          onCancel={cancelDraft}
                          aimRef={zoneAimRef}
                        />
                        <div className="rgl-gift-slide">
                          <div className={`rgl-gift-zoom${cardOpen ? ' is-open' : ''}`}>
                            {giftContent}
                          </div>
                        </div>
                      </div>
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
                  disabled={dismissing || leaving}
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
                  {pageNav}
                  {faceDock}
                  <CardSignPop
                    draft={draft}
                    value={draftText}
                    onChange={setDraftText}
                    onSign={commitSign}
                    onCancel={cancelDraft}
                    aimRef={zoneAimRef}
                  />
                  <div className="rgl-gift-slide">
                    <div className={`rgl-gift-zoom${cardOpen ? ' is-open' : ''}`}>
                      {giftContent}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
