import React, { lazy, Suspense, useState } from 'react';
import './WinPage.css';

const BirthdayCardVisual = lazy(() => import('./BirthdayCardVisual'));

const CASE_NAV = ['Trophy Case', 'Library', 'Bulletin Board', 'Mission Board', 'Leaderboard'];

const crop = (width, height, left, top) => ({ width, height, left, top });

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

export function CelebrationsVisual() {
  return (
    <Suspense fallback={<div className="win-bday-stage" aria-hidden="true" />}>
      <BirthdayCardVisual />
    </Suspense>
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
          {CASE_NAV.map((item) => (
            <span
              key={item}
              className={`win-case-room-item${item === 'Trophy Case' ? ' is-on' : ''}`}
            >
              {item}
            </span>
          ))}
        </div>
      </aside>
      <section className="win-case-room-main">
        <header className="win-case-room-head">
          <h3>Trophy Room</h3>
        </header>
        <div className="win-case-room-stage">
            {CASE_SHELVES.map((shelf, index) => (
              <div className="win-case-shelf" key={index}>
                <div className="win-case-items">
                  {shelf.map((item, piece) => (
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
                        <span>{item.who}</span>
                        <span>{item.award}</span>
                        <span>{item.when}</span>
                      </span>
                    </span>
                  ))}
                </div>
                <img className="win-case-board" src="/win/trophy/shelf-room.svg" alt="" />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

const TROPHY_NAV = ['Trophy Case', 'Library', 'Bulletin Board', 'Mission Board', 'Leaderboard'];
const TROPHY_TOP = ['cup', 'handled', 'small', 'orb', 'chalice', 'urn', 'globe-cup'];
const TROPHY_BOTTOM = ['tall', 'sphere', 'plate', 'gold-cup', 'globe'];
const TROPHY_FACES = [
  'face-1', null, null, 'face-2', 'face-3', 'face-4',
  null, null, null, null, 'face-5', 'face-6', null, null, null,
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
                  {TROPHY_TOP.map((name) => (
                    <img key={name} src={`/win/trophy/${name}.png`} alt="" />
                  ))}
                </div>
                <img className="win-shelf-board" src="/win/trophy/shelf.svg" alt="" />
              </div>
              <div className="win-shelf">
                <div className="win-shelf-items">
                  {TROPHY_BOTTOM.map((name) => (
                    <img key={name} src={`/win/trophy/${name}.png`} alt="" />
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
      <div className="win-trophy-people" aria-hidden="true">
        {TROPHY_FACES.map((face, index) => (
          face
            ? <img key={face} src={`/win/trophy/${face}.png`} alt="" />
            : <span key={`empty-${index}`} />
        ))}
      </div>
    </div>
  );
}

const GIFT_CATEGORIES = ['All', 'Entertainment', 'Food & Drink', 'Gaming', 'Home', 'Lifestyle', 'Retail', 'Tech', 'Travel'];
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
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const needle = query.trim().toLowerCase();
  const cards = GIFT_CARDS.filter((card) => (
    (category === 'All' || card.category === category)
    && card.name.toLowerCase().includes(needle)
  ));

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
          <button
            type="button"
            className={`unbutton win-gift-nav${pane === 'history' ? ' is-on' : ''}`}
            aria-pressed={pane === 'history'}
            onClick={() => setPane('history')}
          >
            <img src="/win/gifts/clock.svg" alt="" />
            Reward History
          </button>
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
            <label className="win-gift-search">
              <img src="/win/gifts/search.svg" alt="" />
              <span className="sr-only">Search</span>
              <input
                value={query}
                placeholder="Search"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="win-gift-filters" role="group" aria-label="Filter by category">
              {GIFT_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`win-gift-chip${category === item ? ' is-on' : ''}`}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <ul className="win-gift-grid">
              {cards.map((card) => (
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
              {cards.length === 0 && <li className="win-gift-empty">No gift cards match that search.</li>}
            </ul>
            <div className="win-gift-actions">
              <button type="button" className="win-gift-cancel" onClick={() => setSelected(null)}>Cancel</button>
              <button type="button" className="win-gift-give" disabled={!selected}>Give</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
