import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ShowcaseMap from './ShowcaseMap';
import {
  AwardBalanceButton,
  AwardBursts,
  AwardDialog,
  AwardGhost,
  useAwardDrag,
} from './awardKit';
import './AwardsPage.css';

const DIALOG_GAP = 10;
const DIALOG_WIDTH = 375;

function measureDialogAnchor() {
  const button = document.querySelector('.awards-page .awards-balance');
  if (!button) return null;
  const buttonRect = button.getBoundingClientRect();
  const toolbar = button.closest('.sc-toolbar');
  const frame = document.querySelector('.awards-page .miniRoamOS') || button.closest('.sc-window');
  const frameRect = frame?.getBoundingClientRect();
  const toolbarRect = toolbar?.getBoundingClientRect();
  const toolbarStyle = toolbar ? getComputedStyle(toolbar) : null;
  const padLeft = toolbarStyle ? parseFloat(toolbarStyle.paddingLeft) || 0 : 0;
  const padRight = toolbarStyle ? parseFloat(toolbarStyle.paddingRight) || 0 : 0;
  let left = (toolbarRect?.left ?? frameRect?.left ?? buttonRect.left) + padLeft;
  if (frameRect) {
    const rightLimit = frameRect.right - padRight;
    if (left + DIALOG_WIDTH > rightLimit) {
      left = Math.max(frameRect.left + padLeft, rightLimit - DIALOG_WIDTH);
    }
  }
  return {
    left: Math.round(left),
    bottom: Math.round(window.innerHeight - buttonRect.top + DIALOG_GAP),
  };
}

const HEAD_SELECTOR = [
  '.sc-window img.seat-avatar',
  '.sc-window .meeting-room-person img.avatar',
  '.sc-window img.sc-theater-speaker-img',
  '.sc-window img.game-hex-avatar',
].join(', ');

function measureHeads() {
  const nodes = document.querySelectorAll(HEAD_SELECTOR);
  const heads = [];
  const seen = new Set();
  nodes.forEach((img) => {
    const rect = img.getBoundingClientRect();
    if (rect.width < 18 || rect.height < 18 || rect.width > 96) return;
    if (rect.bottom < 0 || rect.right < 0) return;
    if (rect.top > window.innerHeight || rect.left > window.innerWidth) return;
    const src = img.currentSrc || img.src;
    if (!src) return;
    const key = `${Math.round(rect.left)}:${Math.round(rect.top)}:${Math.round(rect.width)}`;
    if (seen.has(key)) return;
    seen.add(key);
    heads.push({
      key,
      src,
      alt: img.alt || '',
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  });
  return heads;
}

function headAt(heads, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const head of heads) {
    const cx = head.left + head.width / 2;
    const cy = head.top + head.height / 2;
    const reach = Math.max(head.width, head.height) * 0.72;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist <= reach && dist < bestDist) {
      best = head;
      bestDist = dist;
    }
  }
  return best;
}

export default function AwardsPage() {
  const [anchor, setAnchor] = useState(null);
  const [message, setMessage] = useState('');
  const {
    balance,
    open,
    setOpen,
    close,
    drag,
    bursts,
    dismissBurst,
    onTierPointerDown,
  } = useAwardDrag(measureHeads, headAt);

  useLayoutEffect(() => {
    if (!open) {
      setAnchor(null);
      return undefined;
    }
    const measure = () => setAnchor(measureDialogAnchor());
    measure();
    window.addEventListener('resize', measure);
    const frame = document.querySelector('.awards-page .miniRoamOS');
    const observer = frame ? new ResizeObserver(measure) : null;
    if (frame) observer.observe(frame);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [open]);

  const [toolbarHost, setToolbarHost] = useState(null);
  useEffect(() => {
    let raf = 0;
    const find = () => {
      const el = document.querySelector('.awards-page .sc-toolbar > .sc-toolbar-group');
      if (el) setToolbarHost(el);
      else raf = requestAnimationFrame(find);
    };
    find();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`awards-page${drag ? ' is-dragging' : ''}`}>
      <ShowcaseMap
        embedded
        theme="dark"
        showTicker={false}
        hideOnIt
        birthdayEnabled={false}
      />

      {toolbarHost && createPortal(
        <AwardBalanceButton balance={balance} onClick={() => setOpen(true)} />,
        toolbarHost,
      )}

      {open && !drag && (
        <div className="awards-modal-layer">
          <button type="button" className="awards-modal-scrim" aria-label="Close" onClick={close} />
          <AwardDialog
            style={anchor ? { left: anchor.left, bottom: anchor.bottom } : { visibility: 'hidden' }}
            message={message}
            onMessage={setMessage}
            balance={balance}
            onClose={close}
            onTierPointerDown={onTierPointerDown}
          />
        </div>
      )}

      {drag && (
        <>
          <div className="awards-drag-scrim" />
          {drag.targets.map((head) => (
            <img
              key={head.key}
              className={`awards-head${head.key === drag.hotKey ? ' is-hot' : ''}`}
              src={head.src}
              alt=""
              draggable="false"
              style={{
                left: head.left,
                top: head.top,
                width: head.width,
                height: head.height,
              }}
            />
          ))}
          <AwardGhost x={drag.x} y={drag.y} count={drag.count} />
        </>
      )}

      <AwardBursts bursts={bursts} onDone={dismissBurst} />
    </div>
  );
}
