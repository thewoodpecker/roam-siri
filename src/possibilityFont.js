/** Single source for loading Possibility Bold so canvas and CSS never fall back. */

export const POSSIBILITY_FAMILY = 'Possibility';
export const POSSIBILITY_URL = '/fonts/Possibility-Bold.otf';
export const POSSIBILITY_FACE = '700 32px "Possibility"';

let pending = null;

function familyName(face) {
  return String(face.family || '').replace(/^['"]|['"]$/g, '');
}

/** True only when a loaded FontFace named Possibility is in the document set. */
export function isPossibilityReady() {
  const fonts = typeof document !== 'undefined' ? document.fonts : null;
  if (!fonts) return false;
  for (const face of fonts) {
    if (familyName(face) === POSSIBILITY_FAMILY && face.status === 'loaded') return true;
  }
  return false;
}

/**
 * `document.fonts.check('… Possibility')` is true when the family is missing,
 * because an empty matching list is treated as “can render with fallback”.
 * Never use check() as proof the face is installed.
 */
async function loadOnce() {
  const fonts = document.fonts;
  if (!fonts) return;
  if (isPossibilityReady()) return;

  const face = new FontFace(POSSIBILITY_FAMILY, `url("${POSSIBILITY_URL}") format("opentype")`, {
    weight: '700',
    style: 'normal',
    display: 'block',
  });
  const loaded = await face.load();
  fonts.add(loaded);
  if (!isPossibilityReady()) {
    throw new Error('Possibility did not register after load');
  }
}

/** Resolves only after Possibility is in `document.fonts` with status `loaded`. Retries on failure. */
export function loadPossibilityFont() {
  if (typeof document === 'undefined') return Promise.resolve();
  if (isPossibilityReady()) return Promise.resolve();
  if (pending) return pending;

  pending = (async () => {
    let delay = 120;
    for (;;) {
      try {
        await loadOnce();
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 2000);
      }
    }
  })();

  return pending;
}

if (typeof document !== 'undefined') {
  loadPossibilityFont();
}
