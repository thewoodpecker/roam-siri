import { useCallback, useEffect, useRef, useState } from 'react';
import AwardCoinBurst, { preloadAwardSound } from './AwardCoinBurst';

export const TIERS = [
  { id: 'x1', count: 1, label: 'x1' },
  { id: 'x5', count: 5, label: 'x5' },
  { id: 'x10', count: 10, label: 'x10' },
  { id: 'x15', count: 15, label: 'x15' },
];

const DRAG_SLOP = 6;

export function CoinGlyph({ width, height }) {
  return (
    <span className="awards-coin" style={{ width, height }} aria-hidden="true">
      <img src="/awards/coin.png" alt="" draggable="false" />
    </span>
  );
}

export function CoinStack({ count, width, height, fade }) {
  const shown = Math.max(1, count);
  return (
    <span className={`awards-stack${fade ? ' is-faded' : ''}`}>
      {Array.from({ length: shown }, (_, i) => (
        <CoinGlyph key={i} width={width} height={height} />
      ))}
    </span>
  );
}

export function AwardBalanceButton({ balance, onClick, className }) {
  return (
    <button
      type="button"
      className={className ? `awards-balance ${className}` : 'awards-balance'}
      onClick={onClick}
      aria-label={`Give an award, ${balance} coins`}
    >
      <CoinGlyph width={16} height={22} />
      <span>{balance}</span>
    </button>
  );
}

export function AwardDialog({ style, message, onMessage, balance, onClose, onTierPointerDown }) {
  return (
    <div
      className="awards-dialog"
      role="dialog"
      aria-labelledby="awards-title"
      style={style}
    >
      <button type="button" className="awards-dismiss" onClick={onClose} aria-label="Close">
        <img src="/awards/dismiss.svg" alt="" width="16" height="16" />
      </button>
      <div className="awards-dialog-copy">
        <p id="awards-title" className="awards-dialog-title">Give an Award</p>
        <p className="awards-dialog-sub">Drag and drop on someone's head</p>
      </div>
      <div className="awards-tiers">
        {TIERS.map((tier) => {
          const enabled = balance >= tier.count;
          return (
            <div
              key={tier.id}
              className={`awards-tier${enabled ? '' : ' is-disabled'}`}
              onPointerDown={enabled ? (event) => onTierPointerDown(event, tier.count) : undefined}
              role="button"
              aria-disabled={!enabled}
              tabIndex={enabled ? 0 : -1}
            >
              <CoinStack count={tier.count} width={39} height={54} />
              <span className="awards-tier-count">{tier.label}</span>
            </div>
          );
        })}
        <div className="awards-tier is-disabled" aria-disabled="true">
          <CoinStack count={15} width={39} height={54} fade />
          <span className="awards-tier-count is-custom">Custom</span>
        </div>
      </div>
      <label className="awards-message">
        <span className="awards-sr">Add message</span>
        <input
          value={message}
          onChange={(event) => onMessage(event.target.value)}
          placeholder="Add Message"
        />
      </label>
    </div>
  );
}

export function AwardGhost({ x, y, count }) {
  return (
    <div className="awards-ghost" style={{ left: x, top: y }}>
      <div className="awards-ghost-cursor">
        <img src="/awards/cursor.svg" alt="" width="17.7549" height="19.2271" draggable="false" />
      </div>
      <div className="awards-ghost-pill">
        <CoinStack count={count} width={25.375} height={35.135} />
      </div>
    </div>
  );
}

export function AwardBursts({ bursts, onDone }) {
  return bursts.map((burst) => (
    <AwardCoinBurst
      key={burst.id}
      x={burst.x}
      y={burst.y}
      count={burst.count}
      onDone={() => onDone(burst.id)}
    />
  ));
}

/**
 * Shared drag session for both award pages. `getTargets` / `targetAt`
 * decide what can receive a drop (map heads, meeting tiles). The balance,
 * ghost count, and coin burst stay one system.
 */
export function useAwardDrag(getTargets, targetAt) {
  const getTargetsRef = useRef(getTargets);
  const targetAtRef = useRef(targetAt);
  getTargetsRef.current = getTargets;
  targetAtRef.current = targetAt;

  const [balance, setBalance] = useState(100);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(null);
  const [bursts, setBursts] = useState([]);
  const burstId = useRef(0);

  useEffect(() => {
    preloadAwardSound();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setDrag(null);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = useCallback(() => {
    setDrag(null);
    setOpen(false);
  }, []);

  const onTierPointerDown = (event, count) => {
    if (event.button !== 0 || balance < count) return;
    event.preventDefault();
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let active = false;

    const move = (ev) => {
      if (ev.pointerId !== pointerId) return;
      if (!active) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_SLOP) return;
        active = true;
      }
      const targets = getTargetsRef.current();
      const hot = targetAtRef.current(targets, ev.clientX, ev.clientY);
      setDrag({
        count,
        x: ev.clientX,
        y: ev.clientY,
        targets,
        hotKey: hot?.key || null,
      });
    };

    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (!active) return;
      const targets = getTargetsRef.current();
      const hot = targetAtRef.current(targets, ev.clientX, ev.clientY);
      setDrag(null);
      if (!hot || ev.type === 'pointercancel') return;
      const id = ++burstId.current;
      setBalance((value) => Math.max(0, value - count));
      setOpen(false);
      setBursts((list) => [...list, {
        id,
        x: hot.left + hot.width / 2,
        y: hot.top + hot.height / 2,
        count,
      }]);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const dismissBurst = (id) => {
    setBursts((list) => list.filter((burst) => burst.id !== id));
  };

  return {
    balance,
    open,
    setOpen,
    close,
    drag,
    bursts,
    dismissBurst,
    onTierPointerDown,
  };
}
