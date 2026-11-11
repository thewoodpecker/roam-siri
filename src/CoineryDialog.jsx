import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { COIN_MARKS } from './coin/coinMarks.ts';
import { CoinStage } from './coin/CoinStage.tsx';
import { COIN_SOUNDS, playCoinSound, playSpinSound, preloadCoinSounds } from './coin/coinSound.ts';
import './CoineryDialog.css';

const COLORS = [
  { id: 'red', label: 'Red', body: '#F44336' },
  { id: 'orange', label: 'Orange', body: '#FFA000' },
  { id: 'yellow', label: 'Yellow', body: '#FFCA28' },
  { id: 'lime', label: 'Lime', body: '#BEFA00' },
  { id: 'green', label: 'Green', body: '#26BA7B' },
  { id: 'teal', label: 'Teal', body: '#00ACC1' },
  { id: 'cyan', label: 'Cyan', body: '#26C6DA' },
  { id: 'blue', label: 'Blue', body: '#5394FF' },
  { id: 'indigo', label: 'Indigo', body: '#006CF4' },
  { id: 'violet', label: 'Violet', body: '#835CE9' },
  { id: 'purple', label: 'Purple', body: '#B2A0F0' },
  { id: 'pink', label: 'Pink', body: '#E91E63' },
  { id: 'white', label: 'White', body: '#FFFFFF' },
  { id: 'black', label: 'Black', body: '#000000' },
];

const SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'squircle', label: 'Square' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'star', label: 'Star' },
  { id: 'scallop', label: 'Scallop' },
  { id: 'trefoil', label: 'Trefoil' },
  { id: 'heart', label: 'Heart' },
  { id: 'quatrefoil', label: 'Quatrefoil' },
  { id: 'cross', label: 'Cross' },
  { id: 'kite', label: 'Kite' },
  { id: 'frame', label: 'Frame' },
  { id: 'sparkle', label: 'Sparkle' },
];

const COIN_CHANGE_MS = 250;
const SWAP_SCALE = 0.82;
const easeInCubic = (t) => t * t * t;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const EMOJIS = [
  ['😀', 'grinning'], ['😃', 'smiley'], ['😄', 'smile'], ['😁', 'beaming'], ['😆', 'laughing'],
  ['😅', 'sweat'], ['😂', 'joy'], ['🤣', 'rofl'], ['😊', 'blush'], ['😇', 'innocent'],
  ['🙂', 'slight'], ['😉', 'wink'], ['😍', 'heart eyes'], ['🥰', 'love'], ['😘', 'kiss'],
  ['😋', 'yum'], ['😜', 'wink tongue'], ['🤪', 'zany'], ['🤗', 'hug'], ['🤔', 'thinking'],
  ['😐', 'neutral'], ['😏', 'smirk'], ['😒', 'unamused'], ['😬', 'grimace'], ['😮', 'open'],
  ['🥺', 'pleading'], ['😢', 'cry'], ['😭', 'sob'], ['😱', 'scream'], ['😡', 'rage'],
  ['👍', 'thumbs up'], ['👎', 'thumbs down'], ['👏', 'clap'], ['🙌', 'raised hands'], ['🙏', 'pray'],
  ['💪', 'muscle'], ['👋', 'wave'], ['✊', 'fist'], ['👊', 'punch'], ['👌', 'ok'],
  ['🎉', 'party'], ['🏆', 'trophy'], ['⭐', 'star'], ['🔥', 'fire'], ['💎', 'gem'],
  ['🎁', 'gift'], ['🎂', 'cake'], ['🚀', 'rocket'], ['⚡', 'bolt'], ['💡', 'light bulb'],
  ['🌟', 'glow'], ['🪙', 'coin'], ['💰', 'money'], ['🎯', 'target'], ['👑', 'crown'],
  ['🦄', 'unicorn'], ['🐱', 'cat'], ['🐶', 'dog'], ['🌸', 'flower'], ['🍀', 'clover'],
  ['🍕', 'pizza'], ['🌮', 'taco'], ['🍩', 'donut'], ['☕', 'coffee'], ['🍺', 'beer'],
];

const WIN_MARK = COIN_MARKS.find((mark) => mark.id === 'win');
const ROAM_MARK = COIN_MARKS.find((mark) => mark.id === 'roam');

const swatchNeedsDarkCheck = (hex) => {
  const raw = hex.replace('#', '');
  const expanded = raw.length === 3 ? raw.replace(/./g, '$&$&') : raw;
  const n = Number.parseInt(expanded, 16);
  if (!Number.isFinite(n)) return false;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 186;
};

const polygonPoints = (sides, rotation) => {
  const radius = 5.6;
  return Array.from({ length: sides }, (_, i) => {
    const angle = rotation + (i / sides) * Math.PI * 2;
    return `${(8 + Math.cos(angle) * radius).toFixed(2)},${(8 + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
};

const starPoints = () => {
  const outer = 5.7;
  const inner = outer * 0.46;
  return Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const radius = i % 2 === 0 ? outer : inner;
    return `${(8 + Math.cos(angle) * radius).toFixed(2)},${(8 + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');
};

const heartIcon = (() => {
  const count = 64;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    pts.push({
      x: 16 * Math.sin(t) ** 3,
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
    });
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = 11.2 / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return `${pts.map((p, i) => {
    const x = (8 + (p.x - cx) * scale).toFixed(2);
    const y = (8 - (p.y - cy) * scale).toFixed(2);
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join('')}Z`;
})();

const scallopIcon = (() => {
  const lobes = 12;
  const radius = 5.5;
  const amplitude = 0.12;
  const segments = lobes * 8;
  let d = '';
  for (let i = 0; i <= segments; i++) {
    const theta = -Math.PI / 2 + (i / segments) * Math.PI * 2;
    const notch = (1 - Math.cos(lobes * (theta + Math.PI / 2))) / 2;
    const wave = 1 - 2 * Math.pow(notch, 1.75);
    const r = radius * (1 - amplitude * (1 - wave));
    const x = (8 + Math.cos(theta) * r).toFixed(2);
    const y = (8 + Math.sin(theta) * r).toFixed(2);
    d += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
  }
  return `${d}Z`;
})();

const clusterIcon = (centers) => {
  const placed = centers.map((center) => ({ x: center.x, y: center.y, r: 1 }));
  const samples = 48;
  const bins = 96;
  const best = Array.from({ length: bins }, () => ({ x: 0, y: 0, rad: -1 }));
  for (const circle of placed) {
    for (let i = 0; i < samples; i++) {
      const angle = (i / samples) * Math.PI * 2;
      const x = circle.x + Math.cos(angle) * circle.r;
      const y = circle.y + Math.sin(angle) * circle.r;
      const inside = placed.some(
        (other) => other !== circle && (x - other.x) ** 2 + (y - other.y) ** 2 < other.r * other.r * 0.992
      );
      if (inside) continue;
      const rad = Math.hypot(x, y);
      const bin = Math.round(((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * bins) % bins;
      const current = best[bin];
      if (current && rad > current.rad) best[bin] = { x, y, rad };
    }
  }
  const points = best.filter((point) => point.rad > 0);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = 11 / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return `${points.map((point, i) => {
    const x = (8 + (point.x - cx) * scale).toFixed(2);
    const y = (8 - (point.y - cy) * scale).toFixed(2);
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join('')}Z`;
};

const trefoilIcon = clusterIcon([
  { x: 0, y: 1.58 / Math.sqrt(3) },
  { x: 1.58 / 2, y: -(1.58 / Math.sqrt(3)) / 2 },
  { x: -1.58 / 2, y: -(1.58 / Math.sqrt(3)) / 2 },
]);

const quatrefoilIcon = clusterIcon([
  { x: 0, y: 1.08 },
  { x: 1.08, y: 0 },
  { x: 0, y: -1.08 },
  { x: -1.08, y: 0 },
]);

function ShapeIcon({ id }) {
  const svg = (children) => (
    <svg viewBox="0 0 16 16" aria-hidden="true">{children}</svg>
  );
  switch (id) {
    case 'squircle':
      return svg(<rect x="2.75" y="2.75" width="10.5" height="10.5" rx="3.4" />);
    case 'circle':
      return svg(<circle cx="8" cy="8" r="5.5" />);
    case 'hexagon':
      return svg(<polygon points={polygonPoints(6, -Math.PI / 6)} />);
    case 'star':
      return svg(<polygon points={starPoints()} />);
    case 'scallop':
      return svg(<path d={scallopIcon} />);
    case 'trefoil':
      return svg(<path d={trefoilIcon} />);
    case 'heart':
      return svg(<path d={heartIcon} />);
    case 'quatrefoil':
      return svg(<path d={quatrefoilIcon} />);
    case 'cross':
      return svg(<path d="M6.4 2.4h3.2v4h4v3.2h-4v4H6.4v-4h-4V6.4h4z" />);
    case 'kite':
      return svg(<polygon points="8,2.2 12.6,7.1 8,13.8 3.4,7.1" />);
    case 'frame':
      return svg(<path d="M2.15 2.15H5.29V3.2H3.2V5.29H2.15ZM10.71 2.15H13.85V5.29H12.8V3.2H10.71ZM13.85 10.71V13.85H10.71V12.8H12.8V10.71ZM2.15 13.85V10.71H3.2V12.8H5.29V13.85ZM5.43 5.43H10.57V10.57H5.43Z" />);
    case 'sparkle':
      return svg(<path d="M8 1.9 8.51 4.16 8.85 4.85 9.12 5.29 9.37 5.62 9.61 5.9 9.85 6.15 10.1 6.39 10.38 6.63 10.71 6.88 11.15 7.15 11.84 7.49 14.1 8 11.84 8.51 11.15 8.85 10.71 9.12 10.38 9.37 10.1 9.61 9.85 9.85 9.61 10.1 9.37 10.38 9.12 10.71 8.85 11.15 8.51 11.84 8 14.1 7.49 11.84 7.15 11.15 6.88 10.71 6.63 10.38 6.39 10.1 6.15 9.85 5.9 9.61 5.62 9.37 5.29 9.12 4.85 8.85 4.16 8.51 1.9 8 4.16 7.49 4.85 7.15 5.29 6.88 5.62 6.63 5.9 6.39 6.15 6.15 6.39 5.9 6.63 5.62 6.88 5.29 7.15 4.85 7.49 4.16Z" />);
    default:
      return null;
  }
}

function markClass(id) {
  if (id === 'win') return 'coinery-mark coinery-mark-word';
  if (id === 'question' || id === 'exclamation') return 'coinery-mark coinery-mark-compact';
  return 'coinery-mark coinery-mark-default';
}

function nextCoinVariation({ shape, markId, emoji, color }) {
  const shapeIndex = Math.max(0, SHAPES.findIndex((entry) => entry.id === shape));
  const markIndex = Math.max(0, COIN_MARKS.findIndex((entry) => entry.id === markId));
  const colorIndex = Math.max(0, COLORS.findIndex((entry) => entry.body.toUpperCase() === String(color).toUpperCase()));
  const limit = Math.max(SHAPES.length, COIN_MARKS.length, COLORS.length);

  for (let step = 1; step <= limit; step += 1) {
    const nextShape = SHAPES[(shapeIndex + step) % SHAPES.length];
    const nextMark = COIN_MARKS[(markIndex + step) % COIN_MARKS.length];
    const nextColor = COLORS[(colorIndex + step) % COLORS.length];
    const sameLook = nextShape.id === shape
      && !emoji
      && nextMark.id === markId
      && nextColor.body.toUpperCase() === String(color).toUpperCase();
    if (!sameLook) {
      return { shape: nextShape.id, mark: nextMark, color: nextColor.body };
    }
  }

  return {
    shape: SHAPES[(shapeIndex + 1) % SHAPES.length].id,
    mark: COIN_MARKS[(markIndex + 1) % COIN_MARKS.length],
    color: COLORS[(colorIndex + 1) % COLORS.length].body,
  };
}

const variationKey = ({ shape: shapeId, mark: markEntry, emoji: emojiGlyph, color: colorHex }) =>
  `${shapeId}|${markEntry?.id ?? ''}|${emojiGlyph}|${String(colorHex).toUpperCase()}`;

export function CoineryDialog() {
  const [name, setName] = useState('Roam Coin');
  const [shape, setShape] = useState('circle');
  const [mark, setMark] = useState(ROAM_MARK);
  const [emoji, setEmoji] = useState('');
  const [sound, setSound] = useState('win');
  const [color, setColor] = useState('#FFCA28');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState('');
  const [emojiBox, setEmojiBox] = useState(null);
  const [preview, setPreview] = useState({
    shape: 'circle',
    mark: ROAM_MARK,
    emoji: '',
    color: '#FFCA28',
  });
  const [near, setNear] = useState(true);
  const emojiButtonRef = useRef(null);
  const pickerRef = useRef(null);
  const sizerRef = useRef(null);
  const previewRef = useRef(preview);
  const previewBoxRef = useRef(null);
  const presentationScaleRef = useRef(1);
  const rootRef = useRef(null);

  useEffect(() => {
    preloadCoinSounds();
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(([entry]) => {
      setNear((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting));
    }, { rootMargin: '180px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return undefined;
    const timer = window.setTimeout(() => {
      const next = nextCoinVariation({
        shape,
        markId: mark?.id,
        emoji,
        color,
      });
      setShape(next.shape);
      setMark(next.mark);
      setEmoji('');
      setEmojiOpen(false);
      setColor(next.color);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [color, emoji, mark, near, shape]);

  useEffect(() => {
    const next = { shape, mark, emoji, color };
    if (variationKey(next) === variationKey(previewRef.current)) return undefined;

    const box = previewBoxRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !box) {
      presentationScaleRef.current = 1;
      previewRef.current = next;
      setPreview(next);
      return undefined;
    }

    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    let scaleRaf = 0;
    const animateScale = (from, to, ms, ease) => {
      window.cancelAnimationFrame(scaleRaf);
      const start = performance.now();
      presentationScaleRef.current = from;
      const step = (now) => {
        const t = Math.min(1, (now - start) / ms);
        presentationScaleRef.current = from + (to - from) * ease(t);
        if (t < 1 && !cancelled) scaleRaf = window.requestAnimationFrame(step);
      };
      scaleRaf = window.requestAnimationFrame(step);
    };
    const paint = (phase) => {
      if (phase === 'out') {
        box.style.transitionDuration = '250ms';
        box.style.transitionTimingFunction = 'ease-in';
        box.style.opacity = '0';
        box.style.transform = 'none';
        animateScale(presentationScaleRef.current, SWAP_SCALE, COIN_CHANGE_MS, easeInCubic);
        return;
      }
      if (phase === 'enter') {
        box.style.transition = 'none';
        box.style.opacity = '0';
        box.style.transform = 'none';
        window.cancelAnimationFrame(scaleRaf);
        presentationScaleRef.current = SWAP_SCALE;
        return;
      }
      box.style.transition = '';
      box.style.transitionDuration = '';
      box.style.transitionTimingFunction = '';
      box.style.opacity = '';
      box.style.transform = '';
      animateScale(presentationScaleRef.current, 1, COIN_CHANGE_MS, easeOutCubic);
    };

    paint('out');
    const swap = window.setTimeout(() => {
      if (cancelled) return;
      previewRef.current = next;
      setPreview(next);
      paint('enter');
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          if (!cancelled) paint('idle');
        });
      });
    }, COIN_CHANGE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(swap);
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.cancelAnimationFrame(scaleRaf);
    };
  }, [color, emoji, mark, shape]);

  useEffect(() => {
    const select = pickerRef.current;
    const sizer = sizerRef.current;
    if (!select || !sizer) return;
    select.style.width = `${Math.max(sizer.offsetWidth, 64)}px`;
  }, [sound]);

  useEffect(() => {
    if (!emojiOpen) return undefined;
    const place = () => {
      const rect = emojiButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const width = Math.min(20.875 * rootPx, window.innerWidth - margin * 2);
      const preferred = Math.min(30 * rootPx, window.innerHeight * 0.75);
      const height = Math.max(160, Math.min(preferred, rect.top - margin * 2));
      const top = rect.top - margin - height;
      const left = Math.max(margin, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - margin));
      setEmojiBox({ top, left, height, width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { capture: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, { capture: true });
    };
  }, [emojiOpen]);

  const playTapSound = useCallback(async (delay) => {
    await playCoinSound(sound, delay);
  }, [sound]);

  const playFlingSound = useCallback(async () => {
    await playSpinSound();
  }, []);

  const shownEmoji = EMOJIS.filter(([, label]) => label.includes(emojiQuery.trim().toLowerCase()));

  return (
    <div className="coinery-dialog" role="dialog" aria-label="Coinery" ref={rootRef}>
      <div className="coinery-stage">
        <div className="coinery-header">
          <div className="coinery-header-slot">
            <button type="button" className="coinery-dismiss" aria-label="Close" tabIndex={0}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m3.3536 2.64632c-.19526-.19526-.51184-.19526-.70711 0-.19526.19527-.19526.51185 0 .70711l4.64651 4.64651-4.64655 4.64656c-.19527.1953-.19527.5118 0 .7071.19526.1953.51184.1953.7071 0l4.64656-4.64655 4.64639 4.64635c.1953.1953.5118.1953.7071 0 .1953-.1952.1953-.5118 0-.7071l-4.64639-4.64636 4.64639-4.64634c.1952-.19526.1952-.51184 0-.70711-.1953-.19526-.5119-.19526-.7072 0l-4.64629 4.64634z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <div className="coinery-brand">
            <span className="coinery-brand-mark-wrap">
              <svg className="coinery-brand-mark" viewBox="0 0 34 17" aria-hidden="true" dangerouslySetInnerHTML={{ __html: WIN_MARK?.body ?? '' }} />
            </span>
            <p className="coinery-title">Coinery</p>
          </div>
          <div className="coinery-header-slot" />
        </div>
        <div className="coinery-preview" ref={previewBoxRef}>
          <CoinStage
            shape={preview.shape}
            color={preview.color}
            mark={preview.emoji ? undefined : preview.mark}
            emoji={preview.emoji}
            name={name}
            onTap={playTapSound}
            onFling={playFlingSound}
            presentationScaleRef={presentationScaleRef}
          />
        </div>
      </div>

      <label className="coinery-name">
        <input
          type="text"
          value={name}
          placeholder="Coin Name"
          aria-label="Coin Name"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="coinery-settings">
        <div className="coinery-field">
          <span className="coinery-label" id="coin-shape-label">Shape</span>
          <div className="coinery-chips" role="radiogroup" aria-labelledby="coin-shape-label">
            {SHAPES.map((entry) => {
              const selected = shape === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`coinery-option coinery-chip${selected ? ' is-selected' : ''}`}
                  role="radio"
                  aria-checked={selected}
                  aria-label={entry.label}
                  title={entry.label}
                  onClick={() => setShape(entry.id)}
                >
                  <ShapeIcon id={entry.id} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="coinery-field">
          <span className="coinery-label" id="coin-icon-label">Icon</span>
          <div className="coinery-icons" role="radiogroup" aria-labelledby="coin-icon-label">
            {COIN_MARKS.map((entry) => {
              const selected = !emoji && mark?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`coinery-option coinery-icon${selected ? ' is-selected' : ''}`}
                  role="radio"
                  aria-checked={selected}
                  aria-label={entry.label}
                  title={entry.label}
                  onClick={() => {
                    setEmoji('');
                    setEmojiOpen(false);
                    setMark(entry);
                  }}
                >
                  <svg
                    className={markClass(entry.id)}
                    viewBox={entry.viewBox}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: entry.body }}
                  />
                </button>
              );
            })}
            <button
              ref={emojiButtonRef}
              type="button"
              className={`coinery-option coinery-icon${emoji ? ' is-selected' : ''}`}
              role="radio"
              aria-checked={Boolean(emoji)}
              aria-expanded={emojiOpen}
              aria-label="Emoji"
              title="Emoji"
              onClick={() => setEmojiOpen((open) => !open)}
            >
              <span className="coinery-emoji-glyph">{emoji || '😀'}</span>
            </button>
          </div>
        </div>

        <div className="coinery-sound">
          <span className="coinery-sound-label">
            <span className="coinery-label" id="coin-sound-label">Sound</span>
            <button
              type="button"
              className="coinery-play"
              aria-label="Play sound"
              disabled={sound === 'none'}
              onClick={() => { playCoinSound(sound); }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path clipRule="evenodd" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm7.38 3.653A.75.75 0 0 1 9.25 15V9a.75.75 0 0 1 1.136-.643l5 3a.75.75 0 0 1 0 1.286l-5 3a.75.75 0 0 1-.756.01z" fill="currentColor" />
              </svg>
            </button>
          </span>
          <span className="coinery-picker-sizer" ref={sizerRef} aria-hidden="true">
            {COIN_SOUNDS.find((entry) => entry.id === sound)?.label}
          </span>
          <select
            ref={pickerRef}
            className="coinery-picker"
            aria-labelledby="coin-sound-label"
            value={sound}
            onChange={(event) => {
              const next = COIN_SOUNDS.find((entry) => entry.id === event.target.value);
              if (next) setSound(next.id);
            }}
          >
            {COIN_SOUNDS.map((entry) => (
              <option key={entry.id} value={entry.id}>{entry.label}</option>
            ))}
          </select>
        </div>

        <div className="coinery-swatches" role="radiogroup" aria-label="Color">
          {COLORS.map((entry) => {
            const selected = color.toUpperCase() === entry.body.toUpperCase();
            const dark = swatchNeedsDarkCheck(entry.body);
            return (
              <button
                key={entry.id}
                type="button"
                className="coinery-swatch"
                role="radio"
                aria-checked={selected}
                aria-label={entry.label}
                title={entry.label}
                style={{ background: entry.body, color: dark ? '#000' : '#fff' }}
                onClick={() => setColor(entry.body)}
              >
                {selected ? (
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0408 1.65894C10.5054 1.9576 10.6399 2.57631 10.3412 3.04088L5.8412 10.0409C5.669 10.3087 5.37952 10.4786 5.06169 10.4982C4.74385 10.5179 4.43567 10.3849 4.2318 10.1403L1.7318 7.14031C1.37824 6.71603 1.43556 6.08546 1.85984 5.7319C2.28412 5.37834 2.91468 5.43566 3.26825 5.85994L4.8958 7.813L8.65885 1.95936C8.9575 1.49479 9.57621 1.36029 10.0408 1.65894Z" fill="currentColor" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="coinery-create">
        <button type="button" className="coinery-mint">Mint Coin</button>
      </div>

      {emojiOpen && emojiBox
        ? createPortal(
          <div
            className="coinery-emoji"
            style={{ top: emojiBox.top, left: emojiBox.left, height: emojiBox.height, width: emojiBox.width }}
          >
            <label className={`coinery-emoji-search${emojiQuery ? ' is-bordered' : ''}`}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <g transform="translate(2 2)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.30884 8.01595C6.53901 8.63176 5.56251 9 4.5 9C2.01472 9 0 6.98528 0 4.5C0 2.01472 2.01472 0 4.5 0C6.98528 0 9 2.01472 9 4.5C9 5.56251 8.63176 6.53901 8.01595 7.30884L11.8536 11.1464C12.0488 11.3417 12.0488 11.6583 11.8536 11.8536C11.6583 12.0488 11.3417 12.0488 11.1464 11.8536L7.30884 8.01595ZM8 4.5C8 6.433 6.433 8 4.5 8C2.567 8 1 6.433 1 4.5C1 2.567 2.567 1 4.5 1C6.433 1 8 2.567 8 4.5Z" fill="currentColor" />
                </g>
              </svg>
              <input
                type="search"
                value={emojiQuery}
                placeholder="Search Emoji"
                aria-label="Search Emoji"
                onChange={(event) => setEmojiQuery(event.target.value)}
              />
            </label>
            <div className="coinery-emoji-grid">
              {shownEmoji.map(([glyph, label]) => (
                <button
                  key={label}
                  type="button"
                  className={`coinery-emoji-cell${emoji === glyph ? ' is-selected' : ''}`}
                  aria-label={label}
                  onClick={() => {
                    setEmoji(glyph);
                    setMark(undefined);
                    setEmojiOpen(false);
                  }}
                >
                  {glyph}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
        : null}
    </div>
  );
}
