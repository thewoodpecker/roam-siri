import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MeetingWindow from './MeetingWindow';
import AwardCoinBurst from './AwardCoinBurst';
import {
  AwardBalanceButton,
  AwardDialog,
  AwardGhost,
  useAwardDrag,
} from './awardKit';
import './AwardsPage.css';
import './AwardsMeetingPage.css';

/** Slightly under the map's 1.28 head scale — tiles are much larger. */
const TILE_SCALE = 1.02;

const DIALOG_WIDTH = 375;
const DIALOG_GAP = 16;

const PEOPLE = [
  { name: 'Emily Carter', avatar: '/videos/Female/emily_carter.png', video: '/videos/Female/emily_carter.mp4' },
  { name: 'Hannah Bennett', avatar: '/videos/Female/hannah_bennett.png', video: '/videos/Female/hannah_bennett.mp4' },
  { name: 'Daniel Russell', avatar: '/videos/Male/daniel_russell.png', video: '/videos/Male/daniel_russell.mp4' },
  { name: 'Ethan Bishop', avatar: '/videos/Male/ethan_bishop.png', video: '/videos/Male/ethan_bishop.mp4' },
];

const TILE_SELECTOR = '.awards-meeting-page .meeting-win-tile';
const ETHAN_VIDEO = '/videos/Male/ethan_bishop.mp4';
/** Emily's gift plays on its own so the receiver view is visible without a drag. */
const INCOMING_COUNT = 15;
const INCOMING_DELAY = 1200;
const INCOMING_EVERY = 8000;

function ethanTile() {
  const video = document.querySelector(
    `.awards-meeting-page video[src="${ETHAN_VIDEO}"]`,
  );
  return video?.closest('.meeting-win-tile') || null;
}

function ethanCenter() {
  const tile = ethanTile();
  if (!tile) return null;
  const rect = tile.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return null;
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function burstHitsEthan(burst) {
  const tile = ethanTile();
  if (!tile) return false;
  const rect = tile.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.hypot(burst.x - cx, burst.y - cy) < Math.min(rect.width, rect.height) / 2;
}

function MeetingBurst({ burst, onDone }) {
  const receiveRef = useRef(null);
  if (receiveRef.current == null && ethanTile()) {
    receiveRef.current = burstHitsEthan(burst);
  }
  const receive = receiveRef.current === true;
  return (
    <AwardCoinBurst
      x={burst.x}
      y={burst.y}
      count={burst.count}
      onDone={onDone}
      receive={receive}
      caption={receive ? `Emily sent you ${burst.count} Roam Coins` : ''}
      captionHost={receive ? ethanTile() : null}
    />
  );
}

function measureTiles() {
  const tiles = [];
  document.querySelectorAll(TILE_SELECTOR).forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    const hot = el.classList.contains('is-award-hot');
    const scale = hot ? TILE_SCALE : 1;
    const width = rect.width / scale;
    const height = rect.height / scale;
    tiles.push({
      key: el.getAttribute('data-tile-id'),
      left: rect.left + (rect.width - width) / 2,
      top: rect.top + (rect.height - height) / 2,
      width,
      height,
    });
  });
  return tiles;
}

function tileAt(tiles, x, y) {
  for (const tile of tiles) {
    if (
      x >= tile.left
      && x <= tile.left + tile.width
      && y >= tile.top
      && y <= tile.top + tile.height
    ) {
      return tile;
    }
  }
  return null;
}

function measureDialogAnchor() {
  const win = document.querySelector('.awards-meeting-page .meeting-win');
  const dialog = document.querySelector('.awards-meeting-page .awards-dialog');
  if (!win) return null;
  const winRect = win.getBoundingClientRect();
  // scrollHeight stays stable if we later clip a dialog taller than the window.
  const dialogHeight = dialog?.scrollHeight || dialog?.offsetHeight || 0;
  const dialogWidth = dialog?.offsetWidth || DIALOG_WIDTH;

  let left = winRect.left + DIALOG_GAP;
  if (left + dialogWidth > winRect.right) {
    left = Math.max(winRect.left, winRect.right - dialogWidth);
  }

  // Prefer sitting just above the coin button when the dialog still fits
  // inside the meeting window. Otherwise pin to the top inset. The map
  // page measures its own anchor and is not affected.
  const button = document.querySelector('.awards-meeting-page .awards-balance');
  const buttonTop = button?.getBoundingClientRect().top;
  const aboveButton = buttonTop == null ? null : buttonTop - DIALOG_GAP - dialogHeight;
  const aboveFits = aboveButton != null
    && dialogHeight > 0
    && aboveButton >= winRect.top
    && aboveButton + dialogHeight <= winRect.bottom;

  let top = aboveFits ? aboveButton : winRect.top + DIALOG_GAP;
  if (top < winRect.top) top = winRect.top;

  let maxHeight;
  if (dialogHeight > 0 && top + dialogHeight > winRect.bottom) {
    top = winRect.top;
    maxHeight = Math.round(winRect.height);
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    maxHeight,
  };
}

export default function AwardsMeetingPage() {
  const [anchor, setAnchor] = useState(null);
  const [message, setMessage] = useState('');
  const win = useMemo(() => ({
    id: 'meeting',
    isOpen: true,
    isFocused: true,
    position: { x: 0, y: 0 },
    zIndex: 1,
    open: () => {},
    close: () => {},
    requestClose: () => {},
    focus: () => {},
    move: () => {},
  }), []);

  const {
    balance,
    open,
    setOpen,
    close,
    drag,
    bursts,
    dismissBurst,
    onTierPointerDown,
  } = useAwardDrag(measureTiles, tileAt);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('theme-switching');
    html.setAttribute('data-theme', 'dark');
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => html.classList.remove('theme-switching'));
    });
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('theme-switching');
      html.removeAttribute('data-theme');
    };
  }, []);

  const [incoming, setIncoming] = useState(null);
  const incomingId = useRef(0);

  useEffect(() => {
    let timer = 0;
    let stopped = false;

    const play = () => {
      if (stopped) return;
      if (document.hidden) {
        timer = window.setTimeout(play, INCOMING_EVERY);
        return;
      }
      const center = ethanCenter();
      if (!center) {
        timer = window.setTimeout(play, 200);
        return;
      }
      const id = ++incomingId.current;
      setIncoming({ id, count: INCOMING_COUNT, ...center });
      timer = window.setTimeout(play, INCOMING_EVERY);
    };

    timer = window.setTimeout(play, INCOMING_DELAY);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, []);

  const [chatHost, setChatHost] = useState(null);
  useEffect(() => {
    let raf = 0;
    const find = () => {
      const el = document.querySelector(
        '.awards-meeting-page .meeting-win-toolbar > .meeting-win-pill-group',
      );
      if (el) setChatHost(el);
      else raf = requestAnimationFrame(find);
    };
    find();
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setAnchor(null);
      return undefined;
    }
    const measure = () => setAnchor(measureDialogAnchor());
    measure();
    window.addEventListener('resize', measure);
    const winEl = document.querySelector('.awards-meeting-page .meeting-win');
    const button = document.querySelector('.awards-meeting-page .awards-balance');
    const observer = new ResizeObserver(measure);
    if (winEl) observer.observe(winEl);
    if (button) observer.observe(button);
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [open]);

  return (
    <div
      className={`awards-meeting-page${drag ? ' is-dragging' : ''}`}
      style={{ '--award-tile-scale': String(TILE_SCALE) }}
    >
      <div className="awards-meeting-stage">
        <MeetingWindow
          win={win}
          onDrag={() => {}}
          roomName="Design Sync"
          people={PEOPLE}
          onOpenChat={() => {}}
          onOpenOnAir={() => {}}
          autoReactions={false}
          roamojiOpen={false}
          gesturesEnabled={false}
          lockViewMode
          initialViewMode="gallery"
          awardHotId={drag?.hotKey || null}
        />
      </div>

      {chatHost && createPortal(
        <AwardBalanceButton balance={balance} onClick={() => setOpen(true)} />,
        chatHost,
      )}

      {open && !drag && (
        <div className="awards-modal-layer">
          <button type="button" className="awards-modal-scrim" aria-label="Close" onClick={close} />
          <AwardDialog
            style={anchor
              ? {
                  left: anchor.left,
                  top: anchor.top,
                  bottom: 'auto',
                  ...(anchor.maxHeight
                    ? { maxHeight: anchor.maxHeight, overflow: 'hidden' }
                    : null),
                }
              : { visibility: 'hidden' }}
            message={message}
            onMessage={setMessage}
            balance={balance}
            onClose={close}
            onTierPointerDown={onTierPointerDown}
          />
        </div>
      )}

      {drag && <AwardGhost x={drag.x} y={drag.y} count={drag.count} />}

      {bursts.map((burst) => (
        <MeetingBurst
          key={burst.id}
          burst={burst}
          onDone={() => dismissBurst(burst.id)}
        />
      ))}

      {incoming && (
        <AwardCoinBurst
          key={incoming.id}
          x={incoming.x}
          y={incoming.y}
          count={incoming.count}
          receive
          caption={`Emily sent you ${incoming.count} Roam Coins`}
          captionHost={ethanTile()}
          onDone={() => {
            setIncoming((current) => (current?.id === incoming.id ? null : current));
          }}
        />
      )}
    </div>
  );
}
