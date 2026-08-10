import { useCallback, useEffect, useRef, useState } from 'react';
import PackGift3D from './rgl/PackGift3D';
import RGLStage from './rgl/RGLStage';
import SoftBlurText from './SoftBlurText';
import BirthdayGlow from './BirthdayGlow';
import { PACK_GIFTS } from './rgl/giftCatalog';
import { paletteColorsFor } from './rgl/materials';
import './BirthdayGiftOverlay.css';

/** Must match `.rgl-gift-bounce-in` duration. */
const ENTER_MS = 1100;
const DISMISS_MS = 420;
const APPEAR_TURNS = 1;
const ARRIVE_AT = 0.35;
const LABEL_AT = 0.45;
const SPARK_COUNT = 28;

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
  showScrim = true,
}) {
  const [giftId, setGiftId] = useState(() => pickPackGiftId());
  const [entering, setEntering] = useState(true);
  const [dismissing, setDismissing] = useState(false);
  const [arriveFx, setArriveFx] = useState(false);
  const [arriveBurst, setArriveBurst] = useState(0);
  const [appearSpinKey, setAppearSpinKey] = useState(0);
  const [labelPlay, setLabelPlay] = useState(false);
  const dismissedRef = useRef(false);
  const paletteColors = paletteColorsFor(theme, paletteId);

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
    setGiftId((prev) => pickPackGiftId(prev));
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
        setAppearSpinKey((n) => n + 1);
        arriveTimer = window.setTimeout(() => {
          setArriveBurst((n) => n + 1);
          setArriveFx(true);
        }, ENTER_MS * ARRIVE_AT);
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

  if (!open && !dismissing) return null;

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

  const giftDate = formatGiftDate();
  const birthdayLead = 'Happy Birthday';
  const nameDelay = 0.06 + birthdayLead.replace(/\s/g, '').length * 0.025;

  return (
    <div
      className="birthday-gift-host"
      data-theme={theme}
      style={{ '--rgl-name-color': paletteColors.accent }}
    >
      {showScrim && (
        <button
          type="button"
          className={scrimClass}
          aria-label="Dismiss gift"
          onClick={dismiss}
        />
      )}
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
          <div
            className={`rgl-gift-caption${labelPlay ? ' is-visible' : ''}`}
            style={{ '--rgl-name-color': paletteColors.accent }}
          >
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
            <div className="rgl-gift-chip rgl-gift-label">
              <p className="rgl-birthday-label">
                <SoftBlurText
                  key={`lead-${name}-${arriveBurst}-${labelPlay}-${playKey}`}
                  as="span"
                  className="rgl-birthday-lead"
                  text={birthdayLead}
                  play={labelPlay}
                  delay={0.06}
                  stagger={0.025}
                  duration={0.9}
                />
                {' '}
                <SoftBlurText
                  key={`name-${name}-${arriveBurst}-${labelPlay}-${playKey}`}
                  as="span"
                  className="rgl-birthday-name"
                  text={name}
                  play={labelPlay}
                  delay={nameDelay}
                  stagger={0.025}
                  duration={0.9}
                />
              </p>
            </div>
          </div>
          <div className="rgl-gift-slide">
            <RGLStage
              className="rgl-canvas"
              key={`${giftId}-${theme}-${paletteId}-${playKey}`}
              appearSpinKey={appearSpinKey}
              appearTurns={APPEAR_TURNS}
              appearDuration={ENTER_MS / 1000}
            >
              <PackGift3D giftId={giftId} scale={1} theme={theme} paletteId={paletteId} />
            </RGLStage>
          </div>
        </div>
      </div>
    </div>
  );
}
