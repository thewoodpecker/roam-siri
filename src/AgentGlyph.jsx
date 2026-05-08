import React, { useId } from 'react';

// Family of 24 hex-bezel glyphs — one per agent. The outer hexagon is
// FILLED with the current color and the inner detail is cut out using an
// SVG mask, so the shape reads as a sticker/badge with negative space
// in the middle. Color comes from `currentColor`, so the caller controls
// it via CSS `color:`.

const OUTER_HEX_PATH = "M 8 1.5 L 13.629 4.75 L 13.629 11.25 L 8 14.5 L 2.371 11.25 L 2.371 4.75 Z";

const GLYPHS = [
  // 0 — original cog: ring + center dot
  (
    <g>
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="0.7" fill="currentColor" />
    </g>
  ),
  // 1 — single dot
  <circle cx="8" cy="8" r="1.6" fill="currentColor" />,
  // 2 — outline ring
  <circle cx="8" cy="8" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />,
  // 3 — two horizontal bars
  (
    <g>
      <rect x="6" y="6.6" width="4" height="0.9" rx="0.4" fill="currentColor" />
      <rect x="6" y="8.5" width="4" height="0.9" rx="0.4" fill="currentColor" />
    </g>
  ),
  // 4 — two vertical bars
  (
    <g>
      <rect x="6.6" y="6" width="0.9" height="4" rx="0.4" fill="currentColor" />
      <rect x="8.5" y="6" width="0.9" height="4" rx="0.4" fill="currentColor" />
    </g>
  ),
  // 5 — plus
  <path d="M8 5.8v4.4M5.8 8h4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />,
  // 6 — x cross
  <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />,
  // 7 — triangle up
  <path d="M8 5.8l2.3 4.4h-4.6z" fill="currentColor" />,
  // 8 — triangle down
  <path d="M8 10.2l-2.3-4.4h4.6z" fill="currentColor" />,
  // 9 — square outline
  <rect x="6" y="6" width="4" height="4" rx="0.6" fill="none" stroke="currentColor" strokeWidth="1.2" />,
  // 10 — square filled
  <rect x="6.4" y="6.4" width="3.2" height="3.2" rx="0.5" fill="currentColor" />,
  // 11 — diamond outline
  <path d="M8 5.6l2.4 2.4-2.4 2.4-2.4-2.4z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  // 12 — diamond filled
  <path d="M8 6l2 2-2 2-2-2z" fill="currentColor" />,
  // 13 — bullseye
  (
    <g>
      <circle cx="8" cy="8" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="8" r="0.9" fill="currentColor" />
    </g>
  ),
  // 14 — 3 dots horizontal
  (
    <g>
      <circle cx="5.6" cy="8" r="0.7" fill="currentColor" />
      <circle cx="8"   cy="8" r="0.7" fill="currentColor" />
      <circle cx="10.4" cy="8" r="0.7" fill="currentColor" />
    </g>
  ),
  // 15 — 3 dots vertical
  (
    <g>
      <circle cx="8" cy="5.6" r="0.7" fill="currentColor" />
      <circle cx="8" cy="8"   r="0.7" fill="currentColor" />
      <circle cx="8" cy="10.4" r="0.7" fill="currentColor" />
    </g>
  ),
  // 16 — asterisk (3-line)
  <path d="M8 5.6v4.8M5.9 6.8l4.2 2.4M5.9 9.2l4.2-2.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />,
  // 17 — star (5-point, compact)
  <path d="M8 5.4l0.7 1.5 1.6 0.2-1.15 1.1 0.28 1.6L8 9 6.55 9.8l0.28-1.6L5.68 7.1l1.6-0.2z" fill="currentColor" />,
  // 18 — bold plus
  (
    <g>
      <rect x="7.4" y="5.6" width="1.2" height="4.8" rx="0.4" fill="currentColor" />
      <rect x="5.6" y="7.4" width="4.8" height="1.2" rx="0.4" fill="currentColor" />
    </g>
  ),
  // 19 — T-bar
  <path d="M5.8 6h4.4M8 6v4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />,
  // 20 — lightning bolt
  <path d="M9.1 5.5l-2.6 3h1.6l-1 2 2.6-3h-1.6l1-2z" fill="currentColor" />,
  // 21 — inner hex
  <path d="M8 5.5l2 1.25v2.5l-2 1.25-2-1.25v-2.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />,
  // 22 — toggle chevrons (up + down)
  <path d="M6 7l2-1.5 2 1.5M6 9l2 1.5 2-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  // 23 — diagonal slash
  <path d="M5.7 10.3l4.6-4.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
];

export const AGENT_GLYPH_COUNT = GLYPHS.length;

export default function AgentGlyph({ index = 0, size = 16, className }) {
  const rawId = useId();
  const id = `agent-glyph-mask-${rawId.replace(/:/g, '')}-${index}`;
  const inner = GLYPHS[((index % GLYPHS.length) + GLYPHS.length) % GLYPHS.length];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
          {/* The hex shape is "visible" (white). The inner glyph is drawn
              in black inside the mask so it cuts out from the filled hex. */}
          <path d={OUTER_HEX_PATH} fill="white" />
          <g style={{ color: 'black' }}>{inner}</g>
        </mask>
      </defs>
      <path d={OUTER_HEX_PATH} fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}
