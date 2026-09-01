import { useCallback, useEffect, useRef, useState } from 'react';
import BirthdayGlow from './BirthdayGlow';
import BirthdayCard3D, { CardPageNav, CardSignPop, CardWindowClose, cardSeedNotesFor } from './rgl/BirthdayCard3D';
import RGLStage from './rgl/RGLStage';
import { paletteColorsFor } from './rgl/materials';
import { CARD_OPEN_SETTLE_MS } from './rgl/cardMotion';
import { randomCardLook } from './rgl/cardLook';
import './BirthdayGiftOverlay.css';

/** Must match `.rgl-gift-bounce-in` duration. */
const ENTER_MS = 1100;
const DISMISS_MS = 420;
const APPEAR_TURNS = 1;
const ARRIVE_AT = 0.35;
const LABEL_AT = 0.45;
const SPARK_COUNT = 28;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function GiftArriveFX({ accent, burstKey }) {
  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = (360 / SPARK_COUNT) * i + (i % 4) * 5;
    const dist = 160 + (i % 6) * 36;
    const size = 7 + (i % 5) * 2;
    const delay = (i % 7) * 18;
    return { angle, dist, size, delay, i };
  });

  return (
    <div
      className="rgl-gift-arrive rgl-gift-arrive-sparks"
      style={{ '--rgl-glow': accent }}
      aria-hidden="true"
    >
      <BirthdayGlow
        variant="radial"
        interactive
        active
        color={accent}
        className="rgl-gift-sparkle-field"
      />
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
  );
}

/**
 * Birthday gift celebration overlay — same appear/spin/sparks/dismiss
 * experience as the RGL playground, clipped to a relative host (e.g. .sc-window).
 *
 * `playKey` increments replay the enter while `open` stays true.
 * Each enter picks a new cover. Color stays on the current palette.
 * Pass `name` to keep the recipient; otherwise a person is chosen at random.
 */
export default function BirthdayGiftOverlay({
  open,
  playKey = 0,
  onDismissed,
  theme = 'dark',
  name,
  signerName = 'Joe',
  showScrim = true,
  paletteId: paletteIdProp,
}) {
  const hostRef = useRef(null);
  const zoneAimRef = useRef(null);
  const lastLook = useRef({ paletteId: '', coverId: '', backId: '', personId: '' });
  const [look, setLook] = useState(() => randomCardLook({}, { lockName: name }));
  const [entering, setEntering] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [arriveFx, setArriveFx] = useState(false);
  const [arriveBurst, setArriveBurst] = useState(0);
  const [appearSpinKey, setAppearSpinKey] = useState(0);
  const [labelPlay, setLabelPlay] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [facing, setFacing] = useState(false);
  const [notes, setNotes] = useState(() => cardSeedNotesFor(name || look.name));
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [pages, setPages] = useState({ spread: 0, count: 1 });
  const [leaving, setLeaving] = useState(false);
  const dismissedRef = useRef(false);
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
  const paletteId = paletteIdProp || look.paletteId;
  const paletteColors = paletteColorsFor(theme, paletteId);

  useEffect(() => {
    if (cardOpen) {
      setFacing(true);
      return undefined;
    }
    if (leaving || dismissing) return undefined;
    const id = window.setTimeout(() => setFacing(false), CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [cardOpen, leaving, dismissing]);

  const finishDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setDismissing(false);
    setArriveFx(false);
    onDismissed?.();
  }, [onDismissed]);

  const runEnter = useCallback(() => {
    const next = randomCardLook(lastLook.current, { lockName: name, paletteId: paletteIdProp });
    lastLook.current = next;
    setLook(next);
    dismissedRef.current = false;
    setDismissing(false);
    setArriveFx(false);
    setLabelPlay(false);
    setAppearSpinKey(0);
    setCardOpen(false);
    setCardReady(false);
    leavingRef.current = false;
    setLeaving(false);
    autoOpenedRef.current = false;
    setFacing(false);
    setNotes(cardSeedNotesFor(next.name));
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
  }, [name]);

  useEffect(() => {
    if (!open) return undefined;
    return runEnter();
    // Replay whenever playKey changes while open.
  }, [open, playKey, runEnter]);

  useEffect(() => {
    if (cardOpen) autoOpenedRef.current = true;
  }, [cardOpen]);

  useEffect(() => {
    if (!open || dismissing || leaving || !cardReady || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    skipPickUntil.current = performance.now() + 500;
    setCardOpen(true);
  }, [open, dismissing, leaving, cardReady]);

  const dismiss = useCallback(() => {
    if (!open || dismissing || dismissedRef.current) return;
    setDraft(null);
    setDraftText('');
    if (prefersReducedMotion()) {
      setEntering(false);
      setLabelPlay(false);
      finishDismiss();
      return;
    }
    setEntering(false);
    setLabelPlay(false);
    setDismissing(true);
  }, [open, dismissing, finishDismiss]);
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  const beginLeave = useCallback(() => {
    if (leavingRef.current || dismissedRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    setCardOpen(false);
  }, []);

  useEffect(() => {
    if (!leaving) return undefined;
    if (prefersReducedMotion()) {
      dismissRef.current();
      return undefined;
    }
    const t = window.setTimeout(() => dismissRef.current(), CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  const onGiftMotionEnd = useCallback(
    (e) => {
      if (!dismissing) return;
      if (!e.target.classList?.contains('rgl-gift-slide')) return;
      if (e.type === 'animationend' && e.animationName !== 'rgl-gift-slide-out') return;
      if (
        e.type === 'transitionend' &&
        e.propertyName !== 'opacity' &&
        e.propertyName !== 'transform'
      ) {
        return;
      }
      finishDismiss();
    },
    [dismissing, finishDismiss],
  );

  useEffect(() => {
    if (!dismissing) return undefined;
    const t = window.setTimeout(finishDismiss, DISMISS_MS + 40);
    return () => window.clearTimeout(t);
  }, [dismissing, finishDismiss]);

  const pickInside = useCallback((hit) => {
    if (!cardOpen || leaving) return;
    if (!hit?.auto && performance.now() < skipPickUntil.current) return;
    armSkipTap();
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    setSelectedNoteId(null);
    setDraft({
      page: hit.page,
      spread: hit.spread ?? 0,
      col: hit.col,
      row: hit.row,
      u: hit.u,
      v: hit.v,
      x: hit.clientX - rect.left,
      y: hit.clientY - rect.top,
    });
    setDraftText('');
  }, [cardOpen, leaving, armSkipTap]);

  const cancelDraft = useCallback(() => {
    setDraft(null);
    setDraftText('');
  }, []);

  const restCard = useCallback(() => {
    if (dismissing || leaving) return;
    if (draft) cancelDraft();
    if (cardOpen) setCardOpen(false);
  }, [dismissing, leaving, draft, cardOpen, cancelDraft]);

  const commitSign = useCallback(() => {
    const text = draftText.trim();
    if (!draft || !text) return;
    armSkipTap();
    if (notes.some((n) => String(n.id).startsWith('me-'))) {
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
        name: signerName,
        text,
        ink: 4,
      },
    ]);
    setSelectedNoteId(id);
    setDraft(null);
    setDraftText('');
    beginLeave();
  }, [draft, draftText, signerName, notes, armSkipTap, beginLeave]);

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
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (leaving) return;
      if (draft) {
        cancelDraft();
        return;
      }
      if (cardOpen) {
        setCardOpen(false);
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, leaving, draft, cardOpen, cancelDraft]);

  if (!open && !dismissing) return null;

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

  return (
    <div
      ref={hostRef}
      className="birthday-gift-host"
      data-theme={theme}
    >
      {showScrim && (
        <button
          type="button"
          className={scrimClass}
          aria-label={cardOpen ? 'Close card' : undefined}
          aria-hidden={!cardOpen}
          tabIndex={cardOpen ? 0 : -1}
          onClick={restCard}
        />
      )}
      <CardWindowClose disabled={dismissing || leaving} dismissing={dismissing} onClick={dismiss} />
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
              <RGLStage
                className="rgl-canvas rgl-canvas-card"
                key={`${theme}-${playKey}`}
                appearSpinKey={appearSpinKey}
                appearTurns={APPEAR_TURNS}
                appearDuration={ENTER_MS / 1000}
                idleSpin={!facing}
                holdYaw={facing ? 0 : null}
                tapSpin={!facing}
                allowDrag
                idleCursor={cardOpen ? 'pointer' : 'default'}
                onTap={
                  cardReady && !dismissing && !leaving
                    ? () => {
                        if (skipTapRef.current) {
                          skipTapRef.current = false;
                          return;
                        }
                        restCard();
                      }
                    : undefined
                }
              >
                <BirthdayCard3D
                  open={cardOpen}
                  name={name || look.name}
                  notes={notes}
                  draft={draft ? { ...draft, text: draftText, name: signerName } : null}
                  theme={theme}
                  paletteId={paletteId}
                  coverId={look.coverId}
                  backId={look.backId}
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
                    setCardOpen(true);
                  }}
                  onPagesChange={setPages}
                  pageTurnRef={pageTurnRef}
                  zoneAimRef={zoneAimRef}
                />
              </RGLStage>
            </div>
          </div>
          <CardPageNav
            visible={labelPlay && cardOpen && pages.count > 1}
            hasPrev={pages.spread > 0}
            hasNext={pages.spread < pages.count - 1}
            onPrev={() => pageTurnRef.current.prev()}
            onNext={() => pageTurnRef.current.next()}
          />
        </div>
      </div>
    </div>
  );
}
