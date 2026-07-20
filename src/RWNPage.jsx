import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import './RWNPage.css';

// ————————————————————————————————————————————————————————————————
// RWN — Remote Work News. A news hub owned by Roam.
// Sits on the site's 12-column grid and Woodward tokens; the branded
// Michroma face (same as the ticker) is reserved for headlines and
// section headers. Orange appears only as a small accent.
// ————————————————————————————————————————————————————————————————

const NYT_SMALL_BIZ =
  'https://www.nytimes.com/2026/07/17/business/economy/american-small-business-boom.html';

const LEAD_STORY = {
  headline: 'More than one-third of U.S. employees still work from home, new research shows',
  dek: 'Remote work is holding at its highest non-pandemic levels on record. Despite stricter office policies, more than a third of employees still work from home — and the companies that embrace it are seeing the payoff in retention and productivity.',
  byline: 'Shelby Leimgruber',
  avatar: '/headshots/shelby.jpg',
  time: 'via CNBC',
  url: 'https://www.cnbc.com/2026/07/01/employees-work-from-home-despite-stricter-policies.html',
  // Hero image from the CNBC article (og:image).
  image: 'https://image.cnbcfm.com/api/v1/image/107412245-1715188873661-gettyimages-1355125382-amv-2021bcnaticflataa0896.jpeg?v=1747322963&w=1920&h=1080',
};

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

export default function RWNPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const newsletterRef = useRef(null);
  const videoRef = useRef(null);

  // YouTube force-enables captions on muted autoplay (cc_load_policy=3 alone
  // doesn't stop it). Unload the captions module via the iframe API — and keep
  // nudging, since the player re-enables it every time the loop restarts.
  useEffect(() => {
    const killCaptions = () => {
      const win = videoRef.current?.contentWindow;
      if (!win) return;
      ['captions', 'cc'].forEach((module) => {
        win.postMessage(JSON.stringify({ event: 'command', func: 'unloadModule', args: [module] }), '*');
      });
    };
    const timer = setInterval(() => {
      if (!document.hidden) killCaptions();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hash anchors would clobber the app's hash routing — scroll imperatively.
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="rwn-page">
      {/* ——— Site nav (same fixed navbar as the rest of the site) ——— */}
      <div className="sc-navbar-wrap">
        <Navbar />
      </div>

      {/* ——— Masthead ——— */}
      <header className="rwn-masthead">
        <div className="rwn-grid">
          <div className="rwn-masthead-inner">
            <div className="rwn-brand">
              <img src="/rwn-logo.svg" alt="RWN" className="rwn-brand-logo" />
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
              <a className="rwn-lead-link" href={LEAD_STORY.url} target="_blank" rel="noopener noreferrer">
                <img className="rwn-lead-image" src={LEAD_STORY.image} alt="" />
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
              <h2 className="rwn-section-header">Top Stories</h2>
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
            </aside>
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

        {/* ——— Broadcast / anchor desk ——— */}
        <section className="rwn-broadcast-band">
          <div className="rwn-grid">
            <div className="rwn-broadcast-stage">
              <div className="rwn-broadcast-screen">
                {/* Placeholder broadcast — muted so autoplay is allowed. */}
                <iframe
                  ref={videoRef}
                  className="rwn-broadcast-video"
                  src="https://www.youtube-nocookie.com/embed/ypQGF63SdpM?autoplay=1&mute=1&loop=1&playlist=ypQGF63SdpM&controls=0&playsinline=1&rel=0&cc_load_policy=3&iv_load_policy=3&enablejsapi=1"
                  title="RWN Weekly broadcast"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
                <div className="rwn-broadcast-lowerthird">
                  <img src="/rwn-logo.svg" alt="RWN" className="rwn-broadcast-lt-logo" />
                </div>
              </div>
            </div>
            <div className="rwn-broadcast-copy">
              <div className="rwn-kicker text-caption-strong">
                <span className="rwn-kicker-logo" aria-hidden="true" />
                Broadcast
              </div>
              <h2 className="rwn-broadcast-title">The anchor desk is warming up</h2>
              <p className="rwn-broadcast-sub text-subheadline">
                A weekly video edition of Remote Work News — headlines, data, and one big
                story, presented from the RWN desk every Friday. Until then, the Brief has
                you covered.
              </p>
              <button className="rwn-broadcast-cta text-subheadline-strong" onClick={() => scrollTo(newsletterRef)}>
                Get notified → subscribe to the Brief
              </button>
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
