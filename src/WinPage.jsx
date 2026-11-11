import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StoryViewer from './StoryViewer';
import './WinPage.css';

const BirthdayCardVisual = lazy(() => import('./BirthdayCardVisual'));
const OfficeMap = lazy(() => import('./ShowcaseMap'));

const CASE_AWARDS = [
  "President's Club",
  'The House Cup',
  'Computer Cup',
  'Tour De NYC',
  'Computer Vision Award',
  'Employee of the Month',
];

const crop = (width, height, left, top) => ({ width, height, left, top });

const AWARD_FACES = [
  '/win/trophy/avatar-joe.png',
  '/win/trophy/face-1.png',
  '/win/trophy/face-2.png',
  '/win/trophy/face-3.png',
  '/win/trophy/face-4.png',
  '/win/trophy/face-5.png',
  '/win/trophy/face-6.png',
];

const CASE_SHELVES = [
  [
    { src: '/win/trophy/cup.png', w: 53, h: 76, who: 'Joe Woodward', award: 'Employee of the Month', when: 'March 2026', crop: crop('210.98%', '142.79%', '-56.71%', '-21.02%') },
    { src: '/win/trophy/handled.png', w: 67, h: 78, who: 'Marco Bell', award: 'Closed the Impossible Deal', when: 'February 2026', crop: crop('151.72%', '129.64%', '-28.5%', '-13.95%') },
    { src: '/win/trophy/small.png', w: 43, h: 61, who: 'Nia Okonkwo', award: 'Bug Whisperer', when: 'January 2026', crop: crop('241.62%', '124.96%', '-70.45%', '-13.33%') },
    { src: '/win/trophy/orb.png', w: 51, h: 82, who: 'Theo Marsh', award: 'Demo That Sold Itself', when: 'May 2026', crop: crop('196.87%', '122.64%', '-51%', '-11.32%') },
    { src: '/win/trophy/chalice.png', w: 51, h: 85, who: 'June Harlow', award: 'Fastest Yes in the West', when: 'March 2026', crop: crop('225.88%', '135.21%', '-62.35%', '-18.31%') },
    { src: '/win/trophy/urn.png', w: 69, h: 91, who: 'Omar Shah', award: 'Midnight Shipper', when: 'December 2025', crop: crop('179.35%', '136.36%', '-40.76%', '-20.25%') },
  ],
  [
    { src: '/win/trophy/chalice.png', w: 51, h: 85, who: 'Petra Lang', award: 'Calm During the Incident', when: 'June 2026', crop: crop('225.88%', '135.21%', '-62.35%', '-18.31%') },
    { src: '/win/trophy/plate.png', w: 67, h: 74, who: 'Felix Cho', award: 'Slide Deck Sorcerer', when: 'November 2025', crop: crop('151.35%', '136.59%', '-26.35%', '-21.34%') },
    { src: '/win/trophy/small.png', w: 43, h: 61, who: 'Amira Sol', award: 'Customer Love Letter', when: 'August 2026', crop: crop('241.62%', '124.96%', '-70.45%', '-13.33%') },
    { src: '/win/trophy/globe-cup.png', w: 50, h: 90, who: 'Jonah Peck', award: 'Found the Leak', when: 'July 2026', crop: crop('207.69%', '116.67%', '-53.85%', '-9.88%') },
    { src: '/win/trophy/handled.png', w: 67, h: 78, who: 'Sable Quinn', award: 'On Time, Somehow', when: 'September 2025', crop: crop('151.72%', '129.64%', '-28.5%', '-13.95%') },
    { src: '/win/trophy/orb.png', w: 51, h: 82, who: 'Wes Adler', award: 'Best Out-of-Office', when: 'October 2025', crop: crop('196.87%', '122.64%', '-51%', '-11.32%') },
  ],
  [
    { src: '/win/trophy/globe-cup.png', w: 50, h: 90, who: 'Imani Brooks', award: 'Quietly Heroic', when: 'April 2026', crop: crop('207.69%', '116.67%', '-53.85%', '-9.88%') },
    { src: '/win/trophy/sphere.png', w: 55, h: 83, who: 'Leo Park', award: 'Named the Thing', when: 'January 2026', crop: crop('185%', '123.33%', '-43.75%', '-11.67%') },
    { src: '/win/trophy/plate.png', w: 67, h: 74, who: 'Cleo Hart', award: 'First to Laugh', when: 'May 2026', crop: crop('151.35%', '136.59%', '-26.35%', '-21.34%') },
    { src: '/win/trophy/gold-cup.png', w: 51, h: 82, who: 'Rafael Diaz', award: 'Saved the Launch', when: 'February 2026', crop: crop('212.43%', '131.58%', '-57.64%', '-18.45%') },
    { src: '/win/trophy/globe.png', w: 51, h: 85, who: 'Mina Cho', award: 'Fewest Meetings', when: 'March 2026', crop: crop('217.65%', '130.59%', '-58.82%', '-16.47%') },
    { src: '/win/trophy/cup-right.png', w: 60, h: 75, who: 'Lila Voss', award: 'Ship of the Week', when: 'April 2026', crop: crop('160.83%', '129.24%', '-29.86%', '-16.74%') },
  ],
];

// shelf-room.svg is 486 wide. The flat standing surface runs from x=25.5524 to
// x=460.448; the tapered ends are not part of the shelf trophies can sit on.
const SHELF_TOP_INSET = 25.5524 / 486;

const trophyRunWidth = (widths, start, count, gap) => {
  let total = 0;
  for (let i = 0; i < count; i += 1) total += widths[start + i];
  if (count > 1) total += gap * (count - 1);
  return total;
};

// Largest centered run that fits `available`. Ends are dropped first, and a
// shelf never shifts sideways to keep an end piece over a middle one.
const centeredTrophyRange = (widths, available, gap) => {
  const total = widths.length;
  if (total === 0 || !(available > 0)) return [0, 0];
  const ideal = (total - 1) / 2;
  for (let count = total; count >= 1; count -= 1) {
    let bestDist = Infinity;
    const starts = [];
    for (let start = 0; start <= total - count; start += 1) {
      const dist = Math.abs(start + (count - 1) / 2 - ideal);
      if (dist < bestDist - 1e-6) {
        bestDist = dist;
        starts.length = 0;
        starts.push(start);
      } else if (dist <= bestDist + 1e-6) {
        starts.push(start);
      }
    }
    const fit = starts.find((start) => trophyRunWidth(widths, start, count, gap) <= available + 0.5);
    if (fit !== undefined) return [fit, fit + count];
  }
  return [0, 0];
};

function CaseShelf({ shelf, index }) {
  const shelfRef = useRef(null);
  const [range, setRange] = useState([0, shelf.length]);

  useLayoutEffect(() => {
    const el = shelfRef.current;
    if (!el) return undefined;
    const measure = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      const items = el.querySelector('.win-case-items');
      const gap = items ? parseFloat(getComputedStyle(items).columnGap) : 16;
      const available = width * (1 - 2 * SHELF_TOP_INSET);
      const next = centeredTrophyRange(
        shelf.map((item) => item.w),
        available,
        Number.isFinite(gap) ? gap : 16,
      );
      setRange((current) => (
        current[0] === next[0] && current[1] === next[1] ? current : next
      ));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [shelf]);

  const [start, end] = range;

  return (
    <div className="win-case-shelf" ref={shelfRef}>
      <div className="win-case-items">
        {shelf.slice(start, end).map((item, offset) => {
          const piece = start + offset;
          return (
            <span
              className="win-case-piece"
              key={`${index}-${piece}`}
              tabIndex={0}
              aria-label={`${item.who}, ${item.award}, ${item.when}`}
            >
              <span className="win-case-crop" style={{ width: item.w, height: item.h }}>
                <img src={item.src} alt="" style={item.crop} />
              </span>
              <span className="win-case-tip" aria-hidden="true">
                <img
                  src={AWARD_FACES[(index * 6 + piece) % AWARD_FACES.length]}
                  alt=""
                  width="20"
                  height="20"
                />
                <span className="win-case-tip-copy">
                  <span>{item.who}</span>
                  <span>{item.award}</span>
                  <span>{item.when}</span>
                </span>
              </span>
            </span>
          );
        })}
      </div>
      <img className="win-case-board" src="/win/trophy/shelf-room.svg" alt="" />
    </div>
  );
}

export function CelebrationsVisual() {
  return (
    <Suspense fallback={<div className="win-bday-stage" aria-hidden="true" />}>
      <BirthdayCardVisual />
    </Suspense>
  );
}

const trophyStory = (id, name, avatar, title, when, trophy) => ({
  id,
  image: trophy,
  avatar,
  name,
  award: {
    image: trophy,
    rule: '/win/story/award-rule.svg',
    title,
    who: name,
    when,
  },
});

const cakeStory = (id, name, avatar, image, caption, frames) => ({
  id,
  image: frames?.[0]?.image || image,
  avatar,
  name,
  caption: frames?.[0]?.caption || caption,
  ...(frames?.length ? { frames } : {}),
});

const TROPHY_STORIES = [
  trophyStory('chelsea-presidents-club', 'Chelsea Turbin', '/headshots/chelsea-turbin.jpg', "President's Club", 'March 2026', '/win/trophy/cup.png'),
  cakeStory('michael-walrath-cake', 'Michael Walrath', '/headshots/michael-walrath.jpg', '/win/stories/michael-walrath-cake.jpg', 'Whoooa, Pastryisart just showed up with my name on a note.'),
  {
    id: 'sean-macisaac',
    image: '/win/trophy/handled.png',
    avatar: '/headshots/sean-macisaac.jpg',
    name: 'Sean MacIsaac',
    frames: [
      {
        image: '/win/trophy/handled.png',
        award: {
          image: '/win/trophy/handled.png',
          rule: '/win/story/award-rule.svg',
          title: 'The House Cup',
          who: 'Sean MacIsaac',
          when: 'February 2026',
        },
      },
      { image: '/win/stories/sean-macisaac-cake.jpg', caption: 'Opened the door and they handed me a whole cake. I yelped.' },
      { image: '/win/stories/sean-macisaac-cake-closeup.jpg', caption: 'It says Happy Birthday Sean. I am not playing it cool.' },
    ],
  },
  trophyStory('derek-employee-of-the-month', 'Derek Cicerone', '/headshots/derek-cicerone.jpg', 'Employee of the Month', 'July 2026', '/win/story/employee-trophy.png'),
  cakeStory('thomas-grapperon-cake', 'Thomas Grapperon', '/headshots/thomas-grapperon.jpg', '/win/stories/thomas-grapperon-cake.jpg', 'Happy Birthday Thomas, right on top. I actually gasped.'),
  trophyStory('grace-tour-de-nyc', 'Grace Sutherland', '/headshots/grace-sutherland.jpg', 'Tour De NYC', 'May 2026', '/win/trophy/globe.png'),
  cakeStory('mattias-leino-cake', 'Mattias Leino', '/headshots/mattias-leino.jpg', '/win/stories/mattias-leino-garage.jpg', 'Cake just landed and I am still standing in the garage.', [
    { image: '/win/stories/mattias-leino-garage.jpg', caption: 'Cake just landed and I am still standing in the garage.' },
    { image: '/win/stories/mattias-leino-cake.jpg', caption: 'Opened it. My name, blue icing, way too many sprinkles.' },
  ]),
  trophyStory('lexi-computer-cup', 'Lexi B.', '/headshots/lexi-bohonnon.jpg', 'Computer Cup', 'January 2026', '/win/trophy/chalice.png'),
  cakeStory('grace-sutherland-cake', 'Grace Sutherland', '/headshots/grace-sutherland.jpg', '/win/stories/grace-sutherland-cake.jpg', 'Whoooa, my awesome cake arrived and it says Grace.'),
  trophyStory('ava-computer-vision', 'Ava Lee', '/headshots/ava-lee.jpg', 'Computer Vision Award', 'April 2026', '/win/trophy/gold-cup.png'),
];

const MAP_W = 1120;
const MAP_H = 630;

export function TrophyStoryVisual() {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [theme, setTheme] = useState(() => (
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'dark' : 'dark'
  ));

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const sync = () => setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const next = Math.max(width / MAP_W, height / MAP_H);
      setScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="win-story-frame" ref={frameRef}>
      <div className="win-story-map" style={{ '--win-story-map-scale': scale }} aria-hidden="true">
        <Suspense fallback={null}>
          <OfficeMap embedded initialFloor="R&D" birthdayEnabled={false} theme={theme} />
        </Suspense>
      </div>
      <StoryViewer stories={TROPHY_STORIES} initialIndex={3} embedded />
    </div>
  );
}

export function AwardsCabinetVisual() {
  return (
    <div className="win-case-room">
      <aside className="win-case-room-side">
        <div className="win-case-room-lights" aria-hidden="true">
          <i /><i /><i />
        </div>
        <div className="win-case-room-list">
          <span className="win-case-room-item is-on">All Awards</span>
          {CASE_AWARDS.map((item) => (
            <span key={item} className="win-case-room-item">
              {item}
            </span>
          ))}
        </div>
        <div className="win-case-room-side-gap" aria-hidden="true" />
        <div className="win-case-room-create">
          <span className="win-case-room-plus" aria-hidden="true">+</span>
          Create New Award
        </div>
      </aside>
      <section className="win-case-room-main">
        <header className="win-case-room-head">
          <h3>Trophy Room</h3>
        </header>
        <div className="win-case-room-stage">
            {CASE_SHELVES.map((shelf, index) => (
              <CaseShelf shelf={shelf} index={index} key={index} />
            ))}
        </div>
      </section>
    </div>
  );
}

const TROPHY_NAV = ['Trophy Case', 'Library', 'Bulletin Board', 'Mission Board', 'Leaderboard'];
const TROPHY_HEIGHT = 76;
const trophy = (name, canvas, x, y, w, h) => ({
  name,
  src: `/win/trophy/${name}.png`,
  width: TROPHY_HEIGHT * (w / h),
  crop: {
    width: `${(canvas / w) * 100}%`,
    height: `${(canvas / h) * 100}%`,
    left: `${(-x / w) * 100}%`,
    top: `${(-y / h) * 100}%`,
  },
});
const TROPHY_TOP = [
  trophy('cup', 1024, 299, 183, 427, 682),
  trophy('handled', 1024, 202, 150, 619, 744),
  trophy('small', 1024, 319, 137, 386, 785),
  trophy('orb', 1024, 284, 96, 457, 830),
  trophy('chalice', 1024, 314, 180, 393, 708),
  trophy('urn', 1024, 254, 171, 521, 721),
  trophy('globe-cup', 1024, 291, 120, 441, 820),
];
const TROPHY_BOTTOM = [
  trophy('tall', 1024, 304, 100, 414, 830),
  trophy('sphere', 1024, 250, 105, 531, 811),
  trophy('plate', 2048, 381, 0, 1667, 1800),
  trophy('gold-cup', 1024, 314, 163, 397, 745),
  trophy('globe', 1024, 283, 144, 449, 760),
];

export function TrophyRoomVisual() {
  const [section, setSection] = useState('Trophy Case');

  return (
    <div className="win-trophy-room">
      <header className="win-trophy-bar">
        <span className="win-lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="win-trophy-title">Trophy Room</span>
      </header>
      <div className="win-trophy-main">
        <nav className="win-trophy-nav" aria-label="Trophy Room">
          {TROPHY_NAV.map((item) => (
            <button
              key={item}
              type="button"
              className={`unbutton win-trophy-nav-item${section === item ? ' is-on' : ''}`}
              aria-pressed={section === item}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="win-trophy-stage">
          {section === 'Trophy Case' ? (
            <>
              <div className="win-shelf">
                <div className="win-shelf-items">
                  {TROPHY_TOP.map((item) => (
                    <span key={item.name} className="win-shelf-piece" style={{ width: item.width }}>
                      <img src={item.src} alt="" style={item.crop} />
                    </span>
                  ))}
                </div>
                <img className="win-shelf-board" src="/win/trophy/shelf.svg" alt="" />
              </div>
              <div className="win-shelf">
                <div className="win-shelf-items">
                  {TROPHY_BOTTOM.map((item) => (
                    <span key={item.name} className="win-shelf-piece" style={{ width: item.width }}>
                      <img src={item.src} alt="" style={item.crop} />
                    </span>
                  ))}
                </div>
                <img className="win-shelf-board" src="/win/trophy/shelf.svg" alt="" />
              </div>
            </>
          ) : (
            <p className="win-trophy-empty">{section}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const GIFT_CARDS = [
  { id: 'starbucks', name: 'Starbucks', from: 10, color: '#006241', category: 'Food & Drink' },
  { id: 'doordash', name: 'DoorDash', from: 15, color: '#ff3008', category: 'Food & Drink' },
  { id: 'instacart', name: 'Instacart', from: 25, color: '#43b02a', category: 'Food & Drink' },
  { id: 'apple', name: 'Apple', from: 10, color: '#000', category: 'Tech' },
  { id: 'spotify', name: 'Spotify', from: 10, color: '#1ed760', category: 'Entertainment' },
  { id: 'netflix', name: 'Netflix', from: 25, color: '#e50914', category: 'Entertainment' },
  { id: 'steam', name: 'Steam', from: 20, color: '#000', category: 'Gaming' },
  { id: 'playstation', name: 'PlayStation', from: 10, color: '#0070d1', category: 'Gaming' },
  { id: 'target', name: 'Target', from: 10, color: '#c00', category: 'Retail' },
  { id: 'etsy', name: 'Etsy', from: 25, color: '#f16521', category: 'Retail' },
  { id: 'ikea', name: 'IKEA', from: 25, color: '#0058a3', category: 'Home' },
  { id: 'nike', name: 'Nike', from: 25, color: '#111', category: 'Lifestyle' },
  { id: 'adidas', name: 'Adidas', from: 25, color: '#000', category: 'Lifestyle' },
  { id: 'airbnb', name: 'Airbnb', from: 50, color: '#ff5a5f', category: 'Travel' },
  { id: 'uber', name: 'Uber', from: 15, color: '#000', category: 'Travel' },
  { id: 'lyft', name: 'Lyft', from: 10, color: '#ff00bf', category: 'Travel' },
];

export function GiftStoreVisual() {
  const [pane, setPane] = useState('shop');
  const [selected, setSelected] = useState(null);

  return (
    <div className="win-gift-shop">
      <aside className="win-gift-side">
        <div className="win-gift-lights">
          <img src="/win/gifts/lights.svg" alt="" />
        </div>
        <nav aria-label="Gift shop">
          <button
            type="button"
            className={`unbutton win-gift-nav${pane === 'shop' ? ' is-on' : ''}`}
            aria-pressed={pane === 'shop'}
            onClick={() => setPane('shop')}
          >
            <img src="/win/gifts/gift.svg" alt="" />
            Gift Shop
          </button>
          <div className="win-gift-nav">
            <img src="/win/gifts/clock.svg" alt="" />
            Reward History
          </div>
        </nav>
        <div className="win-gift-balance">
          <img src="/win/gifts/coin.svg" alt="" />
          <strong>110</strong>
          <span>Roam Coins</span>
        </div>
      </aside>
      <section className="win-gift-main">
        <header className="win-gift-head">
          <img src="/win/gifts/arrow.svg" alt="" />
          <h3>{pane === 'shop' ? 'Select a Gift Card' : 'Reward History'}</h3>
        </header>
        {pane === 'history' ? (
          <p className="win-gift-empty">No rewards yet.</p>
        ) : (
          <div className="win-gift-body">
            <ul className="win-gift-grid">
              {GIFT_CARDS.map((card) => (
                <li key={card.id}>
                  <button
                    type="button"
                    className={`unbutton win-brand-card${selected === card.id ? ' is-on' : ''}`}
                    aria-pressed={selected === card.id}
                    onClick={() => setSelected(card.id)}
                  >
                    <span className="win-brand-face" style={{ background: card.color }}>
                      <img src={`/win/gifts/${card.id}.svg`} alt="" />
                    </span>
                    <span className="win-brand-name">{card.name}</span>
                    <span className="win-brand-from">from ${card.from}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="win-gift-actions">
              <button type="button" className="win-gift-cancel" onClick={() => setSelected(null)}>Cancel</button>
              <button type="button" className="win-gift-give" disabled={!selected}>Give</button>
            </div>
          </div>
        )}
      </section>
      <div className="win-gift-received-overlay" />
      <GiftReceivedDialog />
    </div>
  );
}

export function GiftReceivedDialog() {
  const card = GIFT_CARDS.find((item) => item.id === 'starbucks');

  return (
    <div className="win-gift-received" role="dialog" aria-labelledby="win-gift-received-title">
      <div className="win-gift-received-copy">
        <p id="win-gift-received-title">Congratulations!</p>
        <p>You received a gift card</p>
      </div>
      <div className="win-gift-received-card" style={{ background: card.color }}>
        <img src={`/win/gifts/${card.id}.svg`} alt={`${card.name} gift card`} />
      </div>
      <button type="button" className="win-gift-received-wallet">Add to Wallet</button>
    </div>
  );
}
