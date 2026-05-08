import React from 'react';
import AgentGlyph from './AgentGlyph';

// Agent avatar — squircle (rounded square w/ superellipse corners) instead of
// the circular orb humans use, with a hairline outer ring so it reads as
// "agent" at a glance. Renders, in priority order:
//   - AgentGlyph(iconIndex) when iconIndex is set (control-room family)
//   - mask-tinted icon when icon is a URL
//   - letter monogram fallback
export default function AgentSquircle({
  color,
  letter,
  icon,
  iconIndex,
  name,
  size = 24,
  working = false,
  className = '',
  onClick,
  onMouseEnter,
  onMouseLeave,
  title,
}) {
  const usingGlyph = typeof iconIndex === 'number';
  const style = {
    width: size,
    height: size,
    // When rendering the cog-glyph variant, the badge surface is the
    // graphite gradient (matching the AI Control Room tiles) and the
    // glyph picks up the dept color via the element's CSS color (which
    // SVG `currentColor` inherits).
    background: usingGlyph
      ? 'linear-gradient(180deg, var(--graphite-600) 0%, var(--graphite-700) 100%)'
      : color,
    color: usingGlyph ? color : undefined,
    borderRadius: Math.max(4, Math.round(size * 0.26)),
    fontSize: Math.max(9, Math.round(size * 0.42)),
  };
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`sc-agent-squircle ${working ? 'sc-agent-squircle-working' : ''} ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={title || name}
      aria-label={name}
    >
      {typeof iconIndex === 'number' ? (
        <span className="sc-agent-squircle-glyph" aria-hidden="true">
          <AgentGlyph index={iconIndex} size={Math.round(size * 0.7)} />
        </span>
      ) : icon ? (
        <span
          className="sc-agent-squircle-icon"
          style={{ WebkitMaskImage: `url(${icon})`, maskImage: `url(${icon})` }}
          aria-hidden="true"
        />
      ) : (
        <span className="sc-agent-squircle-letter" aria-hidden="true">{letter}</span>
      )}
    </Tag>
  );
}
