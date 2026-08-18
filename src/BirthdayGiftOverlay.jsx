import { useCallback, useEffect, useRef, useState } from 'react';
import BirthdayCard3D, { CARD_SEED_NOTES, CardOpenButton, CardSignPop, CardWindowClose } from './rgl/BirthdayCard3D';
import RGLStage from './rgl/RGLStage';
import SoftBlurText from './SoftBlurText';
import BirthdayGlow from './BirthdayGlow';
import { paletteColorsFor } from './rgl/materials';
import { CARD_OPEN_SETTLE_MS } from './rgl/cardMotion';
import './BirthdayGiftOverlay.css';

/** Must match `.rgl-gift-bounce-in` duration. */
const ENTER_MS = 1100;
const DISMISS_MS = 420;
const APPEAR_TURNS = 1;
const ARRIVE_AT = 0.35;
const LABEL_AT = 0.45;
const SPARK_COUNT = 28;

function dayOrdinal(n) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function formatGiftDate(d = new Date()) {
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} ${dayOrdinal(d.getDate())} ${month}`;
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

/**
 * Birthday gift celebration overlay — same appear/spin/sparks/dismiss
 * experience as the RGL playground, clipped to a relative host (e.g. .sc-window).
 *
 * `playKey` increments replay the enter while `open` stays true.
 */
export default function BirthdayGiftOverlay({
  open,
  playKey = 0,
  onDismissed,
  theme = 'dark',
  paletteId = 'gold',
  name = 'Klas',
  signerName = 'Joe',
  showScrim = true,
}) {
  const hostRef = useRef(null);
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
  const dismissedRef = useRef(false);
  const skipTapRef = useRef(false);
  const paletteColors = paletteColorsFor(theme, paletteId);

  useEffect(() => {
    if (cardOpen) {
      setFacing(true);
      return undefined;
    }
    const id = window.setTimeout(() => setFacing(false), CARD_OPEN_SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [cardOpen]);

  const finishDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setDismissing(false);
    setArriveFx(false);
    onDismissed?.();
  }, [onDismissed]);

  const runEnter = useCallback(() => {
    dismissedRef.current = false;
    setDismissing(false);
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

  useEffect(() => {
    if (!open) return undefined;
    return runEnter();
    // Replay whenever playKey changes while open.
  }, [open, playKey, runEnter]);

  const dismiss = useCallback(() => {
    if (!open || dismissing || dismissedRef.current) return;
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
    if (!cardReady || dismissing) return;
    if (skipTapRef.current) {
      skipTapRef.current = false;
      return;
    }
    setDraft(null);
    setDraftText('');
    setCardOpen((open) => !open);
  }, [cardReady, dismissing]);

  const commitSign = useCallback(() => {
    const text = draftText.trim();
    if (!draft || !text) return;
    setNotes((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        page: draft.page,
        u: draft.u,
        v: draft.v,
        rotate: (Math.random() * 14) - 7,
        name: signerName,
        text,
        ink: 4,
      },
    ]);
    setDraft(null);
    setDraftText('');
  }, [draft, draftText, signerName]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (draft) {
        cancelDraft();
        return;
      }
      if (cardOpen) {
        setCardOpen(false);
        return;
      }
      dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, draft, cardOpen, cancelDraft, dismiss]);

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

  const giftDate = formatGiftDate();

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
          aria-label="Dismiss card"
          onClick={dismiss}
        />
      )}
      <CardWindowClose disabled={dismissing} dismissing={dismissing} onClick={dismiss} />
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
          <div className={`rgl-gift-caption${labelPlay ? ' is-visible' : ''}`}>
            <div className="rgl-gift-chip rgl-gift-date-tag">
              <SoftBlurText
                key={`date-${arriveBurst}-${labelPlay}-${playKey}`}
                as="p"
                className="rgl-date-label"
                text={giftDate}
                play={labelPlay}
                delay={0}
                stagger={0.02}
                duration={0.9}
              />
            </div>
          </div>
          <div className="rgl-gift-slide">
            <div className={`rgl-gift-zoom${cardOpen ? ' is-open' : ''}`}>
              <RGLStage
                className="rgl-canvas rgl-canvas-card"
                key={`${theme}-${paletteId}-${playKey}`}
                appearSpinKey={appearSpinKey}
                appearTurns={APPEAR_TURNS}
                appearDuration={ENTER_MS / 1000}
                idleSpin={!facing}
                holdYaw={facing ? 0 : null}
                tapSpin={!facing}
                allowDrag={!facing}
                onTap={cardReady && !dismissing ? toggleCard : undefined}
              >
                <BirthdayCard3D
                  open={cardOpen}
                  followPointer={cardOpen && !draft}
                  name={name}
                  notes={notes}
                  theme={theme}
                  paletteId={paletteId}
                  onInsidePick={pickInside}
                />
              </RGLStage>
            </div>
          </div>
          <CardOpenButton
            open={cardOpen}
            visible={labelPlay}
            disabled={!cardReady || dismissing}
            onClick={toggleCard}
          />
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
  );
}
