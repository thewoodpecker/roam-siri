import React, { useId } from 'react';
import { initialsFor, darkerTint } from './agentOrb.utils';

// React component — renders inline SVG. Pixel-matched to the data-URI form
// in agentOrb.utils.js so the avatars look identical in both contexts.
export default function AgentOrb({ color, name, size = 24, className, style, ariaLabel }) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const hlId = `orb-hl-${id}`;
  const text = initialsFor(name);
  const textColor = darkerTint(color, 0.45);
  return (
    <svg
      className={className}
      style={{ width: size, height: size, flexShrink: 0, display: 'inline-block', ...style }}
      viewBox="0 0 64 64"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <defs>
        <radialGradient id={hlId} cx="34%" cy="28%" r="62%">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="55%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={color} />
      <circle cx="32" cy="32" r="32" fill={`url(#${hlId})`} />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fill={textColor}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="600"
        fontSize="22"
        letterSpacing="-0.5"
      >
        {text}
      </text>
    </svg>
  );
}
