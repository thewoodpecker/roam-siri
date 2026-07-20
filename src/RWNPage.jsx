import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import './RWNPage.css';

// ————————————————————————————————————————————————————————————————
// RWN — Remote Work News. A news hub owned by Roam.
// Sits on the site's 12-column grid and Woodward tokens; the branded
// Michroma face (same as the ticker) is reserved for headlines and
// section headers. The green accent appears only sparingly.
// ————————————————————————————————————————————————————————————————

const NYT_SMALL_BIZ =
  'https://www.nytimes.com/2026/07/17/business/economy/american-small-business-boom.html';

const LEAD_STORY = {
  headline: 'Remote work drives record productivity gains in Q1',
  dek: 'New data shows remote work — not AI alone — helped drive record U.S. labor productivity growth in Q1, and why remote work is becoming a competitive advantage.',
  byline: 'Shelby Leimgruber',
  avatar: '/headshots/shelby.jpg',
  time: 'via Roam Ideas',
  url: 'https://ro.am/ideas/remote-work-drives-record-productivity-gains-in-q1',
};

// ——— Lead chart data ———
// U.S. nonfarm business sector, indexed 2019 Q1 = 100, quarterly through
// 2026 Q1 (mirrors the chart in the Roam Ideas article). Output is derived:
// output = productivity × hours.
const CHART_PROD = [
  100, 100.4, 100.6, 101.1, 101.9, 104.2, 105.6, 106.4,
  108.3, 110.6, 111.7, 112.0, 111.4, 111.1, 111.5, 110.8,
  110.5, 111.4, 112.4, 113.7, 114.4, 114.1, 115.4, 116.4,
  116.9, 117.7, 118.5, 119.4, 120.3,
];
const CHART_HOURS = [
  100, 100.3, 100.5, 100.7, 99.4, 90.6, 95.6, 97.4,
  98.4, 99.7, 100.8, 101.6, 102.6, 103.5, 104.2, 104.8,
  105.2, 105.5, 105.7, 105.8, 105.9, 106.0, 106.0, 106.1,
  106.0, 106.1, 106.2, 106.1, 106.2,
];
const CHART_N = CHART_PROD.length;

// ——— Broadcast reels ———
// Real portrait YouTube Shorts (verified via the /shorts/ URL check);
// thumbnails come straight from YouTube, durations verified per video.
const BROADCAST_VIDEOS = [
  { id: 'i-xUS4Lfw3o', title: 'The Market of One', channel: 'Kleiner Perkins', duration: '0:32' },
  { id: 'TbZoqGkq_Ao', title: 'Is hybrid work the most profitable? Stanford’s Nick Bloom explains', channel: 'Live+Work More Human', duration: '0:45' },
  { id: 'Piloy5ngQ94', title: 'How Fast Work Has Changed', channel: 'Kleiner Perkins', duration: '0:55' },
  { id: 'w0Xl_PVPyj4', title: 'Remote Work Secrets: How Nick Bloom Sees the Future of Work', channel: 'HerMoney', duration: '0:59' },
  { id: 'o3TrlHGRbFo', title: 'Remote employees are happier, according to a Gallup study', channel: 'Gallup study', duration: '0:41' },
];

// Dev-only accent override swatches (stacked on the right edge).
// `value` must be a solid color (SVG strokes and text can't take gradients);
// `bg` is an optional gradient used wherever the accent paints a background
// (logo marks, chips). Gradient entries use a midpoint solid as `value`.
const ACCENT_SWATCHES = [
  { name: 'Green (default)', value: 'var(--green-300)', swatch: '#46D08F' },
  { name: 'Orange', value: '#EB6139', swatch: '#EB6139' },
  { name: 'Red', value: 'var(--red-400)', swatch: '#EF5350' },
  { name: 'Amber', value: 'var(--amber-500)', swatch: '#FFC107' },
  { name: 'Blue', value: 'var(--blue-500)', swatch: '#2C80FF' },
  { name: 'Indigo', value: 'var(--indigo-500)', swatch: '#835CE9' },
  { name: 'Pink', value: 'var(--pink-400)', swatch: '#EC407A' },
  {
    name: 'Sunset (gradient)',
    value: '#F0645F',
    bg: 'linear-gradient(135deg, #FF8A5C, #EC407A)',
    swatch: 'linear-gradient(135deg, #FF8A5C, #EC407A)',
  },
  {
    name: 'Aurora (gradient)',
    value: '#3FA8C4',
    bg: 'linear-gradient(135deg, #46D08F, #2C80FF)',
    swatch: 'linear-gradient(135deg, #46D08F, #2C80FF)',
  },
  {
    name: 'Iris (gradient)',
    value: '#B14FB9',
    bg: 'linear-gradient(135deg, #835CE9, #EC407A)',
    swatch: 'linear-gradient(135deg, #835CE9, #EC407A)',
  },
];

// Portrait thumb for Shorts; some don't have one — fall back to hqdefault.
const reelThumb = (id) => `https://i.ytimg.com/vi/${id}/oardefault.jpg`;
const reelThumbFallback = (e, id) => {
  if (!e.currentTarget.src.includes('hqdefault')) {
    e.currentTarget.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
};
const chartLabel = (i) => `Q${(i % 4) + 1} ${2019 + Math.floor(i / 4)}`;

function LeadChart() {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  // Plot is flush with the panel's left padding edge — tick labels sit
  // ABOVE the grid lines (news-graphic style) so everything left-aligns
  // with the title and source line.
  const W = 560;
  const H = 560;
  const PL = 0;
  const PR = 104;
  const PT = 64;
  const PB = 44;
  const MIN = 88;
  const MAX = 130;

  const output = CHART_PROD.map((p, i) => (p * CHART_HOURS[i]) / 100);
  const x = (i) => PL + (i * (W - PL - PR)) / (CHART_N - 1);
  const y = (v) => PT + (H - PT - PB) * (1 - (v - MIN) / (MAX - MIN));
  const linePath = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const series = [
    { name: 'Output', data: output, accent: false },
    { name: 'Hours worked', data: CHART_HOURS, accent: false },
    { name: 'Productivity', data: CHART_PROD, accent: true },
  ];

  const onMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fx = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((fx - PL) / (W - PL - PR)) * (CHART_N - 1));
    setHover(Math.max(0, Math.min(CHART_N - 1, idx)));
  };

  const ticks = [90, 100, 110, 120, 130];
  const yearIdxs = [0, 4, 8, 12, 16, 20, 24, 28];
  const tooltipLeft = hover !== null ? (x(hover) / W) * 100 : 0;
  const flip = hover !== null && hover > CHART_N * 0.55;

  return (
    <div className="rwn-lead-chartwrap">
      <div className="rwn-lead-chart-title text-caption-strong">U.S. labor productivity · index, 2019 = 100</div>
      <svg
        ref={svgRef}
        className="rwn-lead-chartsvg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Productivity rising to 120 by Q1 2026 while hours worked stay flat"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} className="rwn-ch-grid" />
            <text x={PL} y={y(v) - 7} textAnchor="start" className="rwn-ch-tick">{v}</text>
          </g>
        ))}
        {yearIdxs.map((i) => (
          <text key={i} x={x(i)} y={H - 18} textAnchor={i === 0 ? 'start' : 'middle'} className="rwn-ch-tick">{'’' + String(2019 + i / 4).slice(2)}</text>
        ))}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PT - 8} y2={H - PB} className="rwn-ch-guide" />
        )}

        {series.map((s) => (
          <g key={s.name}>
            <path d={linePath(s.data)} className={`rwn-ch-line ${s.accent ? 'rwn-ch-line-accent' : 'rwn-ch-line-dim'}`} />
            <text
              x={x(CHART_N - 1) + 10}
              y={y(s.data[CHART_N - 1]) + 3}
              className={`rwn-ch-label ${s.accent ? 'rwn-ch-label-accent' : ''}`}
            >
              {s.name}
            </text>
            {hover !== null && (
              <circle cx={x(hover)} cy={y(s.data[hover])} r="4" className={`rwn-ch-dot ${s.accent ? 'rwn-ch-dot-accent' : ''}`} />
            )}
          </g>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="rwn-ch-tooltip"
          style={{ left: `${tooltipLeft}%`, transform: flip ? 'translate(calc(-100% - 14px), 0)' : 'translate(14px, 0)' }}
        >
          <div className="rwn-ch-tooltip-q text-caption-strong">{chartLabel(hover)}</div>
          {[...series].reverse().map((s) => (
            <div className="rwn-ch-tooltip-row text-caption" key={s.name}>
              <span className={`rwn-ch-tooltip-swatch ${s.accent ? 'rwn-ch-tooltip-swatch-accent' : ''}`} />
              <span className="rwn-ch-tooltip-name">{s.name}</span>
              <span className="rwn-ch-tooltip-val">{s.data[hover].toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="rwn-lead-chart-source text-caption">Source: BLS · Roam Ideas</div>
    </div>
  );
}

const TOP_STORIES = [
  {
    tag: 'PRODUCTIVITY',
    headline: 'Working from home is powering productivity, argues Stanford economist Nicholas Bloom',
    source: 'IMF Finance & Development',
    url: 'https://www.imf.org/en/publications/fandd/issues/2024/09/working-from-home-is-powering-productivity-bloom',
  },
  {
    tag: 'RESEARCH',
    headline: 'Hybrid working from home improves retention without damaging performance',
    source: 'Nature',
    url: 'https://www.nature.com/articles/s41586-024-07500-2',
  },
  {
    tag: 'TRENDING',
    headline: 'American small business boom fueled by a new generation of remote founders',
    source: 'The New York Times',
    url: NYT_SMALL_BIZ,
  },
  {
    tag: 'ECONOMY',
    headline: 'Working from home saves commuters 72 minutes a day, global study finds',
    source: 'NBER',
    url: 'https://www.nber.org/papers/w30866',
  },
  {
    tag: 'IMPACT',
    headline: 'Remote work helps push disabled employment to a record high',
    source: 'Fortune',
    url: 'https://fortune.com/2023/02/24/remote-work-disabled-employment-record-high-remote-work-office-mandates/',
  },
  {
    tag: 'DATA',
    headline: 'More than one-third of U.S. employees still work from home, new research shows',
    source: 'CNBC',
    url: 'https://www.cnbc.com/2026/07/01/employees-work-from-home-despite-stricter-policies.html',
  },
];

const SECTIONS = [
  {
    title: 'Data & Trends',
    stories: [
      {
        headline: 'Remote and hybrid workers report the highest rates of thriving at work',
        source: 'Gallup',
        url: 'https://www.gallup.com/topic/remote-work.aspx',
      },
      {
        headline: 'Remote and hybrid work stabilize at their highest non-pandemic levels on record',
        source: 'Robert Half',
        url: 'https://www.roberthalf.com/us/en/insights/research/remote-work-statistics-and-trends',
      },
      {
        headline: 'The remote work economy keeps growing — tracking a rising remote job market',
        source: 'FlexJobs',
        url: 'https://www.flexjobs.com/blog/post/flexjobs-remote-work-economy-index',
      },
    ],
  },
  {
    title: 'Companies',
    stories: [
      {
        headline: 'Atlassian and Airbnb double down on remote work as peers order office returns',
        source: 'Bloomberg Law',
        url: 'https://news.bloomberglaw.com/daily-labor-report/atlassian-airbnb-boost-remote-work-as-peers-order-office-return',
      },
      {
        headline: 'Hybrid work cuts attrition by a third — with no hit to promotions or performance',
        source: 'Fortune',
        url: 'https://fortune.com/2024/06/18/stanford-nick-bloom-hybrid-work-cuts-attrition-no-negative-impact-promoted/',
      },
      {
        headline: 'Hybrid work is a “win-win-win” for companies and workers, Stanford study finds',
        source: 'Stanford Report',
        url: 'https://news.stanford.edu/stories/2024/06/hybrid-work-is-a-win-win-win-for-companies-workers',
      },
    ],
  },
  {
    title: 'Economy & Policy',
    stories: [
      {
        headline: 'Remote work is enabling record employment among workers with disabilities',
        source: 'Economic Innovation Group',
        url: 'https://eig.org/remote-work-is-enabling-higher-employment-among-disabled-workers/',
      },
      {
        headline: 'Commute time savings — work from home hands hours back to the global workforce',
        source: 'CEPR / VoxEU',
        url: 'https://cepr.org/voxeu/columns/commute-time-savings-when-working-home',
      },
      {
        headline: 'Work from home settles into a durable, decades-defining shift, economists find',
        source: 'Journal of Economic Perspectives',
        url: 'https://www.aeaweb.org/articles?id=10.1257/jep.37.4.23',
      },
    ],
  },
];

// Bloomberg-style "Today's Videos" card for the rail: one portrait reel at a
// time, autoplaying muted, with dot pagination + prev/next arrows.
function RailVideos() {
  const [idx, setIdx] = useState(0);
  const frameRef = useRef(null);
  const v = BROADCAST_VIDEOS[idx];

  const go = (i) => setIdx((i + BROADCAST_VIDEOS.length) % BROADCAST_VIDEOS.length);

  // YouTube force-enables captions on muted autoplay — keep unloading the
  // captions module (it re-arms on loop restarts and video changes).
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      const win = frameRef.current?.contentWindow;
      if (!win) return;
      ['captions', 'cc'].forEach((module) => {
        win.postMessage(JSON.stringify({ event: 'command', func: 'unloadModule', args: [module] }), '*');
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rwn-rail-videos">
      <div className="rwn-rail-video-card">
        <div className="rwn-rail-video-media">
          <iframe
            ref={frameRef}
            key={v.id}
            className="rwn-reel-player"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&mute=1&loop=1&playlist=${v.id}&controls=0&playsinline=1&rel=0&cc_load_policy=3&iv_load_policy=3&enablejsapi=1`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
          <span className="rwn-reel-shade" aria-hidden="true" />
          <span className="rwn-reel-bottom">
            <span className="rwn-reel-title text-headline">{v.title}</span>
            <span className="rwn-reel-channel text-caption">{v.channel}</span>
          </span>
        </div>
      </div>
      <div className="rwn-rail-videos-foot">
        <div className="rwn-rail-video-dots">
          {BROADCAST_VIDEOS.map((b, i) => (
            <button
              key={b.id}
              className={`rwn-rail-video-dot ${i === idx ? 'rwn-rail-video-dot-active' : ''}`}
              onClick={() => go(i)}
              aria-label={`Video ${i + 1} of ${BROADCAST_VIDEOS.length}`}
            />
          ))}
        </div>
        <div className="rwn-reels-nav">
          <button className="rwn-reels-arrow" aria-label="Previous video" onClick={() => go(idx - 1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M8.5 3 L4.5 7 L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="rwn-reels-arrow" aria-label="Next video" onClick={() => go(idx + 1)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5.5 3 L9.5 7 L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RWNPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const newsletterRef = useRef(null);
  const reelsRef = useRef(null);
  const [playingReel, setPlayingReel] = useState(null);
  const [accentIdx, setAccentIdx] = useState(0);

  const scrollReels = (dir) => {
    const el = reelsRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // The accent swatch also recolors the ticker labels. The ticker lives
  // outside this component, so publish the override on <html> and clear
  // it when leaving the page.
  useEffect(() => {
    document.documentElement.style.setProperty('--rw-label-override', ACCENT_SWATCHES[accentIdx].value);
    return () => document.documentElement.style.removeProperty('--rw-label-override');
  }, [accentIdx]);

  // Hash anchors would clobber the app's hash routing — scroll imperatively.
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div
      className="rwn-page"
      style={{
        '--rwn-accent': ACCENT_SWATCHES[accentIdx].value,
        '--rwn-accent-bg': ACCENT_SWATCHES[accentIdx].bg || ACCENT_SWATCHES[accentIdx].value,
      }}
    >
      {/* ——— Site nav (same fixed navbar as the rest of the site) ——— */}
      <div className="sc-navbar-wrap">
        <Navbar />
      </div>

      {/* ——— Dev setting: accent color override swatches ——— */}
      <div className="rwn-accent-swatches" role="group" aria-label="Accent color override (dev)">
        {ACCENT_SWATCHES.map((s, i) => (
          <button
            key={s.name}
            className={`rwn-accent-swatch ${i === accentIdx ? 'rwn-accent-swatch-active' : ''}`}
            style={{ background: s.swatch }}
            onClick={() => setAccentIdx(i)}
            title={s.name}
            aria-label={s.name}
          />
        ))}
      </div>

      {/* ——— Masthead ——— */}
      <header className="rwn-masthead">
        <div className="rwn-grid">
          <div className="rwn-masthead-inner">
            <div className="rwn-brand">
              <span className="rwn-brand-logo" role="img" aria-label="RWN" />
              <div className="rwn-brand-words">
                <span className="rwn-brand-name text-caption-strong">Remote Work News</span>
                <span className="rwn-brand-owner text-caption">by <strong>Roam</strong></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ——— Lead story + rail ——— */}
        <section className="rwn-lead-band">
          <div className="rwn-grid">
            <article className="rwn-lead-story">
              <div className="rwn-lead-visual">
                <LeadChart />
              </div>
              <a className="rwn-lead-link" href={LEAD_STORY.url} target="_blank" rel="noopener noreferrer">
                <h1 className="rwn-lead-headline">{LEAD_STORY.headline}</h1>
                <p className="rwn-lead-dek text-body">{LEAD_STORY.dek}</p>
              </a>
              <div className="rwn-byline text-caption">
                <img src={LEAD_STORY.avatar} alt="" className="rwn-byline-avatar" />
                <span className="rwn-byline-name text-caption-strong">{LEAD_STORY.byline}</span>
                <span className="rwn-byline-sep">·</span>
                <span className="rwn-byline-time">{LEAD_STORY.time}</span>
              </div>
            </article>

            <aside className="rwn-rail">
              <RailVideos />
            </aside>

            <div className="rwn-lead-topstories">
              <h2 className="rwn-kicker rwn-topstories-kicker text-caption-strong">
                <span className="rwn-kicker-logo" aria-hidden="true" />
                Top Stories
              </h2>
              <ol className="rwn-rail-list">
                {TOP_STORIES.map((s, i) => {
                  const Tag = s.url ? 'a' : 'div';
                  return (
                    <li key={i}>
                      <Tag
                        className="rwn-rail-item"
                        {...(s.url && { href: s.url, target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        <span className="rwn-rail-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="rwn-rail-body">
                          <span className="rwn-rail-tag text-caption-2-strong">{s.tag}</span>
                          <span className="rwn-rail-headline text-subheadline-strong">{s.headline}</span>
                          <span className="rwn-rail-source text-caption">{s.source}</span>
                        </span>
                      </Tag>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* ——— Broadcast — portrait reels row ——— */}
        <section className="rwn-broadcast-band">
          <div className="rwn-grid">
            <div className="rwn-broadcast-head">
              <div className="rwn-kicker text-caption-strong">
                <span className="rwn-kicker-logo" aria-hidden="true" />
                Video
              </div>
              <div className="rwn-reels-nav">
                <button className="rwn-reels-arrow" aria-label="Previous videos" onClick={() => scrollReels(-1)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M8.5 3 L4.5 7 L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="rwn-reels-arrow" aria-label="Next videos" onClick={() => scrollReels(1)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5.5 3 L9.5 7 L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="rwn-reels" ref={reelsRef}>
              {BROADCAST_VIDEOS.map((v) => (
                <div className="rwn-reel" key={v.id}>
                  {playingReel === v.id ? (
                    <iframe
                      className="rwn-reel-player"
                      src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&rel=0&cc_load_policy=3&iv_load_policy=3`}
                      title={v.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button className="rwn-reel-cover" onClick={() => setPlayingReel(v.id)} aria-label={`Play: ${v.title}`}>
                      <img
                        className="rwn-reel-thumb"
                        src={reelThumb(v.id)}
                        onError={(e) => reelThumbFallback(e, v.id)}
                        alt=""
                        loading="lazy"
                      />
                      <span className="rwn-reel-shade" aria-hidden="true" />
                      <span className="rwn-reel-play rwn-reel-play-center" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M4.5 2.8 L11 7 L4.5 11.2 Z" fill="currentColor" />
                        </svg>
                      </span>
                      <span className="rwn-reel-bottom">
                        <span className="rwn-reel-title text-headline">{v.title}</span>
                        <span className="rwn-reel-channel text-caption">{v.channel}</span>
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— Newsletter ——— */}
        <section className="rwn-newsletter-band" ref={newsletterRef}>
          <div className="rwn-grid">
            <div className="rwn-newsletter">
              <div className="rwn-newsletter-text">
                <div className="rwn-kicker text-caption-strong">
                  <span className="rwn-kicker-logo" aria-hidden="true" />
                  Newsletter
                </div>
                <h2 className="rwn-newsletter-title">The Friday Brief</h2>
                <p className="rwn-newsletter-sub text-body">
                  The week in remote work — the stories, the data, and what they mean.
                  Every Friday morning. Read in five minutes.
                </p>
              </div>
              {subscribed ? (
                <div className="rwn-newsletter-done text-body-strong">
                  <span className="rwn-newsletter-check" aria-hidden="true">✓</span>
                  You&rsquo;re on the list. See you Friday.
                </div>
              ) : (
                <form className="rwn-newsletter-form" onSubmit={subscribe}>
                  <input
                    type="email"
                    required
                    className="rwn-newsletter-input text-subheadline"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address"
                  />
                  <button type="submit" className="rwn-newsletter-btn">Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ——— Section grid ——— */}
        <section className="rwn-sections-band">
          <div className="rwn-grid">
            {SECTIONS.map((sec) => (
              <div className="rwn-section-col" key={sec.title}>
                <h3 className="rwn-section-header">{sec.title}</h3>
                <ul className="rwn-section-list">
                  {sec.stories.map((s, i) => {
                    const Tag = s.url ? 'a' : 'div';
                    return (
                      <li key={i}>
                        <Tag
                          className="rwn-section-item"
                          {...(s.url && { href: s.url, target: '_blank', rel: 'noopener noreferrer' })}
                        >
                          <span className="rwn-section-headline text-subheadline-strong">{s.headline}</span>
                          <span className="rwn-section-meta text-caption">{s.source}</span>
                        </Tag>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
}
