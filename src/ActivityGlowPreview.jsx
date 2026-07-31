import React, { useEffect, useState } from 'react';
import SiriGlow from './SiriGlow';
import './ShowcaseMap.css';
import './ActivityGlowPreview.css';

/**
 * Draft activity API glow palette — light/dark source hexes for Rob's named colors.
 * Names are the API contract; hexes are provisional until eyeballed on the map.
 */
export const ACTIVITY_GLOW_PALETTE = [
  { name: 'amber', light: '#E59A0F', dark: '#FFC14D', emoji: '📞', title: 'On a call' },
  { name: 'aqua', light: '#0B9E9A', dark: '#3EE0D8', emoji: '🎧', title: 'In support' },
  { name: 'azure', light: '#2C80FF', dark: '#6BA8FF', emoji: '💬', title: 'In chat' },
  { name: 'cobalt', light: '#2554D6', dark: '#5B7FFF', emoji: '📱', title: 'On mobile' },
  { name: 'forest', light: '#0F9B68', dark: '#3DDB9A', emoji: '🗓️', title: 'In meeting' },
  { name: 'gold', light: '#C9920A', dark: '#FFD45C', emoji: '☎️', title: 'Phone system' },
  { name: 'lime', light: '#A8DC00', dark: '#D4FA3C', emoji: '🤖', title: 'Agent running' },
  { name: 'magenta', light: '#D61F7B', dark: '#FF6BB5', emoji: '✉️', title: 'Composing' },
  { name: 'rose', light: '#E85A3C', dark: '#FF8A6B', emoji: '🔔', title: 'Alert' },
  { name: 'ruby', light: '#D32F2F', dark: '#FF6B6B', emoji: '📹', title: 'Recording' },
  { name: 'slate', light: '#6A6D71', dark: '#B0B3B8', emoji: '⏸️', title: 'Away' },
  { name: 'violet', light: '#6155F5', dark: '#8F86FF', emoji: '✨', title: 'Custom' },
];

const PEOPLE = [
  { name: 'Joe W.', avatar: '/headshots/joe-woodward.jpg' },
  { name: 'Rob F.', avatar: '/headshots/rob-figueiredo.jpg' },
  { name: 'Lexi B.', avatar: '/headshots/lexi-bohonnon.jpg' },
  { name: 'Chelsea T.', avatar: '/headshots/chelsea-turbin.jpg' },
  { name: 'Derek C.', avatar: '/headshots/derek-cicerone.jpg' },
  { name: 'Grace S.', avatar: '/headshots/grace-sutherland.jpg' },
  { name: 'Keegan L.', avatar: '/headshots/keegan-lanzillotta.jpg' },
  { name: 'Will H.', avatar: '/headshots/will-hou.jpg' },
  { name: 'Jon B.', avatar: '/headshots/jon-brod.jpg' },
  { name: 'John M.', avatar: '/headshots/john-moffa.jpg' },
  { name: 'Michael W.', avatar: '/headshots/michael-walrath.jpg' },
  { name: 'Jeff G.', avatar: '/headshots/jeff-grossman.jpg' },
];

const CLAUDE = '#EB6139';
const CODEX = '#0000FF';

function EmojiActivityBadge({ emoji, title }) {
  return (
    <div className="sc-ai-icon-wrap" title={title}>
      <span className="agp-emoji-badge" aria-label={title}>
        <span className="agp-emoji-glyph">{emoji}</span>
      </span>
    </div>
  );
}

function ActivityOfficeCard({ person, color, name, emoji, title, extraGlow }) {
  return (
    <div className="sc-room-card agp-office">
      <div className="sc-glow-fade sc-glow-visible">
        <SiriGlow active color={color} intensity={3} borderRadius={12} />
        {extraGlow && <SiriGlow active color={extraGlow} intensity={3} borderRadius={12} />}
      </div>
      <div className="big-meeting-card-inner" style={{ height: '100%' }}>
        <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '0 12px' }}>
            <h3 className="office-name">{person.name}</h3>
            <EmojiActivityBadge emoji={emoji} title={`${name} · ${title}`} />
          </div>
          <div className="private-office-seat">
            <div className="seat-row seat-row-hovered">
              <div className="seat-assigned sc-private-person">
                <img className="seat-avatar" src={person.avatar} alt={person.name} />
                <span className="seat-nametag">{person.name}</span>
              </div>
            </div>
          </div>
          <div className="agp-swatch-meta">
            <span className="agp-swatch-name">{name}</span>
            <span className="agp-swatch-hex">{color}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityGlowPreview() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    return () => {
      html.removeAttribute('data-theme');
    };
  }, [theme]);

  return (
    <div className="sc-viewport agp-viewport" data-theme={theme}>
      {theme === 'dark' && <div className="sc-wallpaper sc-wallpaper-dark is-visible" />}

      <div className="agp-chrome">
        <div className="agp-header">
          <div>
            <h1 className="agp-title">Activity glow palette</h1>
            <p className="agp-subtitle">
              Named API colors → themed hex. Emoji fills the 16px badge (~75%), not nested app-icon chrome.
            </p>
          </div>
          <button
            type="button"
            className="unbutton sc-theme-capsule"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-pressed={theme === 'light'}
          >
            <span className={`sc-theme-capsule-knob ${theme === 'light' ? 'bottom' : ''}`} aria-hidden="true" />
            <span className={`sc-theme-capsule-icon ${theme === 'dark' ? 'active' : ''}`} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 8.5C13.3 12.1 10 14.5 6.5 13.5C3 12.5 1 9.5 2 6C2.8 3.2 5.5 1.5 8.5 2C7 3.5 6.5 6 8 8.5C9 10 11 11 14 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={`sc-theme-capsule-icon ${theme === 'light' ? 'active' : ''}`} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                <path
                  d="M8 2V3.5M8 12.5V14M2 8H3.5M12.5 8H14M3.8 3.8L4.8 4.8M11.2 11.2L12.2 12.2M3.8 12.2L4.8 11.2M11.2 4.8L12.2 3.8"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
        </div>

        <div className="agp-floor">
          <div className="agp-grid">
            {ACTIVITY_GLOW_PALETTE.map((swatch, i) => {
              const color = theme === 'light' ? swatch.light : swatch.dark;
              return (
                <ActivityOfficeCard
                  key={swatch.name}
                  person={PEOPLE[i % PEOPLE.length]}
                  color={color}
                  name={swatch.name}
                  emoji={swatch.emoji}
                  title={swatch.title}
                />
              );
            })}
          </div>

          <div className="agp-section-label">Reference — first-party agent glows (for comparison)</div>
          <div className="agp-grid agp-grid-ref">
            <ActivityOfficeCard
              person={PEOPLE[0]}
              color={CLAUDE}
              name="claude"
              emoji="✦"
              title="Claude Code"
            />
            <ActivityOfficeCard
              person={PEOPLE[1]}
              color={CODEX}
              name="codex"
              emoji="⌘"
              title="OpenAI Codex"
            />
            <ActivityOfficeCard
              person={PEOPLE[2]}
              color={theme === 'light' ? '#E85A3C' : '#FF8A6B'}
              name="rose + azure"
              emoji="📞"
              title="Stacked blend"
              extraGlow={theme === 'light' ? '#2C80FF' : '#6BA8FF'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
