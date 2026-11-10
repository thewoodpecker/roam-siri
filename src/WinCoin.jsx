import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AwardCoinCanvas } from './awardCoin/AwardCoinCanvas';
import { metalForAwardAmount } from './awardCoin/types';

const COIN = '/win/coin.webp';
/** Product default until a roam sets its own: 100 per month. */
const ALLOWANCE = 100;
const TIERS = [1, 5, 10];
/** Custom stacks fade at this many coins, the same cap as the product tray. */
const SHOWN_COINS = 17;
const SELF = 'Joe W.';

function formatPoints(n) {
  const name = Math.abs(n) === 1 ? 'Roamcoin' : 'Roamcoins';
  return `${n.toLocaleString()} ${name}`;
}

function personAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const node = el?.closest?.('[data-win-person]');
  if (!node) return null;
  return {
    name: node.dataset.winPerson,
    avatar: node.dataset.winAvatar || '',
    node,
  };
}

function CoinRow({ count }) {
  const shown = Math.min(Math.max(count, 1), SHOWN_COINS);
  return (
    <span className="sc-win-stack-art" aria-hidden="true">
      {Array.from({ length: shown }, (_, i) => (
        <img key={i} src={COIN} alt="" draggable="false" />
      ))}
    </span>
  );
}

/**
 * Toolbar coin for W!N. Click opens the giving panel. Drag the coin, or a
 * stack from the panel, onto someone on the map.
 */
export default function WinCoin({ defaultOpen = false }) {
  const anchorRef = useRef(null);
  const dragRef = useRef(null);
  const [balance, setBalance] = useState(ALLOWANCE);
  const [open, setOpen] = useState(defaultOpen);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [award, setAward] = useState(null);
  const [drag, setDrag] = useState(null);
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!award) return undefined;
    const t = setTimeout(() => setAward(null), 3600);
    return () => clearTimeout(t);
  }, [award]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (anchorRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const clearHot = () => {
    document.querySelectorAll('.sc-win-hot').forEach((node) => node.classList.remove('sc-win-hot'));
  };

  const finishDrag = (event) => {
    const session = dragRef.current;
    dragRef.current = null;
    window.removeEventListener('pointermove', session?.move);
    window.removeEventListener('pointerup', session?.up);
    clearHot();
    session?.viewport?.classList.remove('sc-win-dragging');
    setDrag(null);
    setDragging(false);
    if (!session?.moved) {
      if (session?.toggle) setOpen((value) => !value);
      else if (session?.select != null) setSelected(session.select);
      return;
    }
    const person = personAt(event.clientX, event.clientY);
    if (!person) return;
    if (person.name === SELF) {
      setStatus('Give Roamcoins to a teammate.');
      setToast({ id: Date.now(), text: 'Give Roamcoins to a teammate.', x: event.clientX, y: event.clientY });
      return;
    }
    const amount = session.amount;
    setBalance((value) => Math.max(0, value - amount));
    setStatus(`${person.name} received ${formatPoints(amount)}.`);
    setOpen(false);
    const rect = person.node.getBoundingClientRect();
    const win = person.node.closest('.sc-window') || document.body;
    const winRect = win.getBoundingClientRect();
    const scale = win.offsetWidth ? winRect.width / win.offsetWidth : 1;
    setAward({
      id: Date.now(),
      amount,
      x: (rect.left + rect.width / 2 - winRect.left) / scale,
      y: (rect.top + rect.height / 2 - winRect.top) / scale,
      root: win,
    });
  };

  const startPointer = (event, amount, { toggle = false, select = null } = {}) => {
    if (event.button != null && event.button !== 0) return;
    if (balance < amount) {
      if (toggle) setOpen((value) => !value);
      return;
    }
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const viewport = event.currentTarget.closest('.sc-viewport');
    const session = {
      amount,
      toggle,
      select,
      moved: false,
      viewport,
      move: (ev) => {
        const current = dragRef.current;
        if (!current) return;
        if (!current.moved) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
          current.moved = true;
          if (current.toggle) setOpen(false);
          else setDragging(true);
          viewport?.classList.add('sc-win-dragging');
        }
        setDrag({ amount, x: ev.clientX, y: ev.clientY });
        clearHot();
        const person = personAt(ev.clientX, ev.clientY);
        if (person && person.name !== SELF) person.node.classList.add('sc-win-hot');
      },
      up: (ev) => finishDrag(ev),
    };
    dragRef.current = session;
    window.addEventListener('pointermove', session.move);
    window.addEventListener('pointerup', session.up);
  };

  useEffect(() => () => {
    const session = dragRef.current;
    if (!session) return;
    window.removeEventListener('pointermove', session.move);
    window.removeEventListener('pointerup', session.up);
    session.viewport?.classList.remove('sc-win-dragging');
  }, []);

  // Pin the tray to the app window's right edge, 8px in. The coin sits
  // further left inside the toolbar, so the offset is measured from there.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const anchor = anchorRef.current;
    const win = anchor?.closest('.sc-window');
    const panel = anchor?.querySelector('.sc-win-panel');
    if (!anchor || !win || !panel) return undefined;

    const place = () => {
      const scale = win.offsetWidth ? win.getBoundingClientRect().width / win.offsetWidth : 1;
      const winRect = win.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const right = 8 - (winRect.right - anchorRect.right) / scale;
      panel.style.setProperty('--sc-win-panel-right', `${right}px`);
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(win);
    window.addEventListener('resize', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const stackLabel = (tier, enabled) => (
    enabled
      ? `Give ${formatPoints(tier)}: drag onto a teammate or click to select`
      : balance === 0
        ? 'No Roamcoins left to give'
        : `${formatPoints(tier)}, more than you have left`
  );

  return (
    <div className="sc-win-anchor" ref={anchorRef}>
      <button
        type="button"
        className={`sc-win-coin${balance === 0 ? ' is-empty' : ''}${open ? ' is-open' : ''}`}
        aria-pressed={open}
        aria-label={`Give Roamcoins, ${balance} left`}
        data-tooltip={open ? undefined : 'Give Roamcoins'}
        onPointerDown={(event) => startPointer(event, 1, { toggle: true })}
      >
        <img src={COIN} alt="" draggable="false" />
        <span>{balance.toLocaleString()}</span>
      </button>
      {open && (
        <div
          className={`sc-win-panel${dragging ? ' is-hidden' : ''}`}
          role="dialog"
          aria-label="Give Roamcoins"
        >
          <div className="sc-win-panel-head">
            <button type="button" className="unbutton sc-win-close" aria-label="Close" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="m3.3536 2.64632c-.19526-.19526-.51184-.19526-.70711 0-.19526.19527-.19526.51185 0 .70711l4.64651 4.64651-4.64655 4.64656c-.19527.1953-.19527.5118 0 .7071.19526.1953.51184.1953.7071 0l4.64656-4.64655 4.64639 4.64635c.1953.1953.5118.1953.7071 0 .1953-.1952.1953-.5118 0-.7071l-4.64639-4.64636 4.64639-4.64634c.1952-.19526.1952-.51184 0-.70711-.1953-.19526-.5119-.19526-.7072 0l-4.64629 4.64634z" fill="currentColor" />
              </svg>
            </button>
            <div className="sc-win-panel-titles">
              <div className="sc-win-panel-title">Give Roamcoins</div>
            </div>
          </div>
          <div className="sc-win-panel-content">
            <div className="sc-win-panel-body">
              <div className="sc-win-tiers">
                {TIERS.filter((tier) => tier <= ALLOWANCE).map((tier) => {
                  const enabled = tier <= balance;
                  return (
                    <button
                      key={tier}
                      type="button"
                      className={`unbutton sc-win-stack${enabled ? '' : ' is-disabled'}${selected === tier ? ' is-selected' : ''}`}
                      disabled={!enabled}
                      aria-disabled={!enabled}
                      aria-pressed={selected === tier}
                      aria-label={stackLabel(tier, enabled)}
                      onPointerDown={(event) => { if (enabled) startPointer(event, tier, { select: tier }); }}
                    >
                      <CoinRow count={tier} />
                      <span className="sc-win-count">×{tier}</span>
                    </button>
                  );
                })}
              </div>
              <div className="sc-win-composer">
                <textarea
                  className="sc-win-field sc-win-message"
                  rows={1}
                  maxLength={280}
                  placeholder="Add a Message…"
                  aria-label="Message (optional)"
                  disabled={balance === 0}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    event.target.style.height = 'inherit';
                    event.target.style.height = `${event.target.scrollHeight}px`;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <span className="sr-only" role="status">{status}</span>
      {drag && ReactDOM.createPortal(
        <div className="sc-win-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <CoinRow count={drag.amount} />
        </div>,
        document.body,
      )}
      {award && ReactDOM.createPortal(
        <div className="sc-win-award" aria-hidden="true">
          <div
            key={award.id}
            className="sc-win-award-stage"
            style={{ left: award.x, top: award.y }}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.animationName !== 'award-success-coin') return;
              setAward(null);
            }}
          >
            <AwardCoinCanvas
              value={award.amount}
              metal={metalForAwardAmount(award.amount)}
              hovered
              sending
              index={0}
            />
          </div>
        </div>,
        award.root || document.body,
      )}
      {toast && ReactDOM.createPortal(
        <div className="sc-win-toast" style={{ left: toast.x, top: toast.y }} role="status">
          {toast.avatar && <img src={toast.avatar} alt="" />}
          <img src={COIN} alt="" />
          <span>{toast.name ? `${toast.name} got ${toast.amount === 1 ? 'a Roamcoin' : `${toast.amount} Roamcoins`}` : toast.text}</span>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function winPersonAttrs(person) {
  if (!person?.name) return {};
  return {
    'data-win-person': person.name,
    'data-win-avatar': person.avatar || '',
  };
}
