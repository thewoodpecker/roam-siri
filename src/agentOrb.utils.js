// Helpers shared by the AgentOrb React component and its data-URI variant.
// Lives in a non-React file so AgentOrb.jsx can export only its component
// (and play nicely with React Fast Refresh).

export function initialsFor(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function darkerTint(hex, factor = 0.45) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const dr = Math.max(0, Math.min(255, Math.round(r * factor)));
  const dg = Math.max(0, Math.min(255, Math.round(g * factor)));
  const db = Math.max(0, Math.min(255, Math.round(b * factor)));
  // Return hex (not rgb()) so the value is safe to embed in a data URI
  // used inside CSS `background-image: url(...)` — `rgb(…)` contains
  // unescaped parens that would terminate the url() value early.
  return '#' + [dr, dg, db].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Inline SVG markup for use in a data URI (background-image, <img>).
// Uses a soft radial gradient for the highlight (defs/url() refs work fine
// inside an SVG document — the gotcha is only at the CSS url() boundary).
export function getAgentOrbSvg({ color, name }) {
  const text = initialsFor(name);
  const textColor = darkerTint(color, 0.45);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="hl" cx="34%" cy="28%" r="62%">
        <stop offset="0%" stop-color="white" stop-opacity="0.45"/>
        <stop offset="55%" stop-color="white" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="${color}"/>
    <circle cx="32" cy="32" r="32" fill="url(#hl)"/>
    <text x="32" y="40" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui, sans-serif" font-weight="600" font-size="22" letter-spacing="-0.5">${text}</text>
  </svg>`;
}

// Encode the SVG, then also percent-encode parens. CSS `url(…)` (unquoted)
// breaks on raw `(`/`)` — `encodeURIComponent` leaves them untouched, but
// our SVG contains `url(#hl)` which would terminate the outer CSS url()
// value early.
export function getAgentOrbDataUri(opts) {
  const encoded = encodeURIComponent(getAgentOrbSvg(opts))
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
