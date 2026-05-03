import React, { useState, useEffect, useRef } from 'react';
import { FLOORS } from './ShowcaseMap';
import './MobileWindow.css';

const ROAMS = [
  {
    id: 'roam-hq',
    name: 'Roam HQ',
    peopleCount: 56,
    logoIcon: 'roam',
    orbitors: [
      '/headshots/keegan-lanzillotta.jpg',
      '/headshots/howard-lerman.jpg',
      '/headshots/ava-lee.jpg',
    ],
  },
  {
    id: 'design-inc',
    name: 'Design Inc.',
    peopleCount: 91,
    logoIcon: 'd',
    orbitors: [
      '/headshots/chelsea-turbin.jpg',
      '/headshots/john-beutner.jpg',
      '/headshots/grace-sutherland.jpg',
    ],
  },
];

const MAP_ROOMS = [
  { id: 'howard', name: 'Howard Lerman', avatars: ['/headshots/howard-lerman.jpg'], size: 'small' },
  { id: 'will', name: 'Will Hou', avatars: ['/headshots/will-hou.jpg'], size: 'small', badge: 'spotify' },
  { id: 'thomas', name: 'Thomas', avatars: ['/headshots/thomas-grapperon.jpg'], size: 'small' },
  { id: 'tim', name: 'Tim McIsaac', avatars: ['/headshots/sean-macisaac.jpg', '/headshots/john-moffa.jpg'], size: 'small', badge: 'github' },
  { id: 'huffy', name: 'Huffy Smith', avatars: ['/headshots/john-huffsmith.jpg', '/headshots/mattias-leino.jpg'], size: 'small' },
  { id: 'tina', name: 'Tina Turner', avatars: ['/headshots/garima-kewlani.jpg', '/headshots/chelsea-turbin.jpg'], size: 'small' },
  { id: 'alan', name: 'Alan Kay', avatars: [], size: 'wide', meeting: true },
  { id: 'walt', name: 'Walt Disney', avatars: ['/headshots/derek-cicerone.jpg', '/headshots/michael-miller.jpg', '/headshots/jeff-grossman.jpg'], size: 'wide' },
  { id: 'tanner', name: 'Tanner Wils…', avatars: ['/headshots/jon-brod.jpg'], size: 'small', badge: 'lock' },
  { id: 'adam', name: 'Adam Akers', avatars: ['/headshots/peter-lerman.jpg', '/headshots/rob-figueiredo.jpg'], size: 'small' },
  { id: 'abraham', name: 'Abraham Rose', avatars: ['/headshots/aaron-wadhwa.jpg', '/headshots/john-beutner.jpg'], size: 'small' },
];

const AINBOX_FEATURED = [
  { id: 'will', name: 'Will', avatar: '/headshots/will-hou.jpg' },
  { id: 'howard', name: 'Howard', avatar: '/headshots/howard-lerman.jpg' },
  { id: 'design', name: 'Design', groupKind: 'design' },
];

const AINBOX_DMS = [
  { id: 'thomas', name: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg' },
  { id: 'jeff', name: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg' },
];

const AINBOX_MEETINGS = [
  { id: 'inbox-design', name: 'Inbox Design Discussion', read: false },
  { id: 'standup', name: 'Meetings Standup', read: true },
  { id: 'roam-project', name: 'Build a Roam Project and Website Updates', read: true },
];

const AINBOX_THREADS = [
  { id: 'figma', text: 'The new figma design can be found', avatar: '/headshots/mattias-leino.jpg', read: false },
  { id: 'computers', text: 'Computers are back online and', avatar: '/headshots/keegan-lanzillotta.jpg', read: true },
  { id: 'android', text: 'There is a new Android release', avatar: '/headshots/john-moffa.jpg', read: true },
];

const AINBOX_GROUPS = [
  { id: 'design', name: 'Design', kind: 'design' },
  { id: 'apple', name: 'Apple', kind: 'apple' },
  { id: 'android', name: 'Android', kind: 'android' },
];

function PodCoreLogo({ kind }) {
  const src = kind === 'roam'
    ? '/icons/mobile-tabs/roam-planet-logo.svg'
    : '/icons/mobile-tabs/design-inc-logo.svg';
  return (
    <span
      className="mw-pod-core-svg"
      aria-hidden="true"
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        backgroundColor: 'var(--icon-primary)',
      }}
    />
  );
}

function PodDots({ count, seed }) {
  const dots = React.useMemo(() => {
    let s = seed * 9301 + 49297;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const arr = [];
    const rMin = 22; // % — inner exclusion around the center logo
    const rMax = 44; // % — outer bound inside pod border
    for (let i = 0; i < count; i++) {
      // Uniform area distribution between rMin and rMax
      const r = Math.sqrt(rMin * rMin + rand() * (rMax * rMax - rMin * rMin));
      const theta = rand() * Math.PI * 2;
      arr.push({
        x: 50 + r * Math.cos(theta),
        y: 50 + r * Math.sin(theta),
        delay: rand() * -14,
        duration: 8 + rand() * 6,
        ax: (rand() - 0.5) * 5,
        ay: (rand() - 0.5) * 5,
        bx: (rand() - 0.5) * 5,
        by: (rand() - 0.5) * 5,
        cx: (rand() - 0.5) * 5,
        cy: (rand() - 0.5) * 5,
      });
    }
    return arr;
  }, [count, seed]);
  return (
    <div className="mw-pod-dots" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="mw-pod-dot"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            '--ax': `${d.ax}px`,
            '--ay': `${d.ay}px`,
            '--bx': `${d.bx}px`,
            '--by': `${d.by}px`,
            '--cx': `${d.cx}px`,
            '--cy': `${d.cy}px`,
          }}
        />
      ))}
    </div>
  );
}

function Pod({ logoIcon, orbitors, peopleCount = 40, seed = 1 }) {
  return (
    <div className="mw-pod">
      <PodDots count={Math.min(peopleCount, 48)} seed={seed} />
      {orbitors[0] && (
        <div className="mw-pod-avatar mw-pod-avatar-left">
          <img src={orbitors[0]} alt="" />
        </div>
      )}
      {orbitors[1] && (
        <div className="mw-pod-avatar mw-pod-avatar-right">
          <img src={orbitors[1]} alt="" />
        </div>
      )}
      {orbitors[2] && (
        <div className="mw-pod-avatar mw-pod-avatar-top">
          <img src={orbitors[2]} alt="" />
        </div>
      )}
      <div className="mw-pod-core">
        <PodCoreLogo kind={logoIcon} />
      </div>
    </div>
  );
}

function RoamCard({ roam, onOpen }) {
  return (
    <button className="mw-roam-card" onClick={onOpen}>
      <div className="mw-roam-info">
        <h3 className="mw-roam-name">{roam.name}</h3>
        <p className="mw-roam-meta">{roam.peopleCount} People Here Now</p>
      </div>
      <div className="mw-roam-pod-wrap">
        <Pod logoIcon={roam.logoIcon} orbitors={roam.orbitors} peopleCount={roam.peopleCount} seed={roam.id === 'roam-hq' ? 7 : 42} />
      </div>
    </button>
  );
}

function ChevronIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Material-style back arrow used on Android: arrowhead + short
// horizontal line. The button still rotates 180° via CSS so the
// arrow that points right by default ends up pointing left.
function MaterialBackArrowIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9H15M11 5L15 9L11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TabIcon({ kind, size = 20 }) {
  if (kind === 'chat') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16.0107 20.1193C15.4254 20.1193 14.9027 20.0185 14.4425 19.8168C13.9851 19.6151 13.6229 19.3352 13.3558 18.9773C13.0916 18.6165 12.9496 18.1989 12.9297 17.7244H14.2678C14.2848 17.983 14.3714 18.2074 14.5277 18.3977C14.6868 18.5852 14.8942 18.7301 15.1499 18.8324C15.4055 18.9347 15.6896 18.9858 16.0021 18.9858C16.3459 18.9858 16.6499 18.9261 16.9141 18.8068C17.1811 18.6875 17.3899 18.5213 17.5405 18.3082C17.6911 18.0923 17.7663 17.8438 17.7663 17.5625C17.7663 17.2699 17.6911 17.0128 17.5405 16.7912C17.3928 16.5668 17.1754 16.3906 16.8885 16.2628C16.6044 16.1349 16.2607 16.071 15.8572 16.071H15.12V14.9972H15.8572C16.1811 14.9972 16.4652 14.9389 16.7095 14.8224C16.9567 14.706 17.1499 14.544 17.2891 14.3366C17.4283 14.1264 17.4979 13.8807 17.4979 13.5994C17.4979 13.3295 17.4368 13.0952 17.3146 12.8963C17.1953 12.6946 17.0249 12.5369 16.8033 12.4233C16.5845 12.3097 16.326 12.2528 16.0277 12.2528C15.7436 12.2528 15.478 12.3054 15.2308 12.4105C14.9865 12.5128 14.7876 12.6605 14.6342 12.8537C14.4808 13.044 14.3984 13.2727 14.3871 13.5398H13.1129C13.1271 13.0682 13.2663 12.6534 13.5305 12.2955C13.7976 11.9375 14.1499 11.6577 14.5874 11.456C15.0249 11.2543 15.5107 11.1534 16.0447 11.1534C16.6044 11.1534 17.0874 11.2628 17.4936 11.4815C17.9027 11.6974 18.218 11.9858 18.4396 12.3466C18.6641 12.7074 18.7749 13.1023 18.772 13.5312C18.7749 14.0199 18.6385 14.4347 18.3629 14.7756C18.0902 15.1165 17.7266 15.3452 17.272 15.4616V15.5298C17.8516 15.6179 18.3004 15.848 18.6186 16.2202C18.9396 16.5923 19.0987 17.054 19.0959 17.6051C19.0987 18.0852 18.9652 18.5156 18.6953 18.8963C18.4283 19.277 18.0632 19.5767 17.6001 19.7955C17.1371 20.0114 16.6072 20.1193 16.0107 20.1193Z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'logo') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M16 4.75C9.7868 4.75 4.75 9.7868 4.75 16C4.75 22.2132 9.7868 27.25 16 27.25C22.2132 27.25 27.25 22.2132 27.25 16C27.25 9.7868 22.2132 4.75 16 4.75ZM3.25 16C3.25 8.95837 8.95837 3.25 16 3.25C23.0416 3.25 28.75 8.95837 28.75 16C28.75 23.0416 23.0416 28.75 16 28.75C8.95837 28.75 3.25 23.0416 3.25 16Z" fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd" d="M24.2466 8.34779C22.9891 7.64839 21.5411 7.25 20 7.25C15.1675 7.25 11.25 11.1675 11.25 16C11.25 20.8325 15.1675 24.75 20 24.75C21.5411 24.75 22.9891 24.3516 24.2467 23.6522C26.1104 21.6446 27.25 18.9554 27.25 16C27.25 13.0446 26.1104 10.3554 24.2466 8.34779ZM27.25 16C27.25 11.9959 24.0041 8.75 20 8.75C15.9959 8.75 12.75 11.9959 12.75 16C12.75 20.0041 15.9959 23.25 20 23.25C24.0041 23.25 27.25 20.0041 27.25 16Z" fill="currentColor" fillOpacity="0.5" />
        <path fillRule="evenodd" clipRule="evenodd" d="M24.7473 10.5203C24.1963 10.3447 23.6092 10.25 23 10.25C19.8244 10.25 17.25 12.8244 17.25 16C17.25 19.1756 19.8244 21.75 23 21.75C23.6092 21.75 24.1963 21.6553 24.7473 21.4797C26.2804 20.1504 27.25 18.1884 27.25 16C27.25 13.8116 26.2804 11.8496 24.7473 10.5203ZM27.25 16C27.25 13.6528 25.3472 11.75 23 11.75C20.6528 11.75 18.75 13.6528 18.75 16C18.75 18.3472 20.6528 20.25 23 20.25C25.3472 20.25 27.25 18.3472 27.25 16Z" fill="currentColor" fillOpacity="0.3" />
      </svg>
    );
  }
  if (kind === 'camera') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 11.25C13.3766 11.25 11.25 13.3766 11.25 16C11.25 18.6234 13.3766 20.75 16 20.75C18.6234 20.75 20.75 18.6234 20.75 16C20.75 13.3766 18.6234 11.25 16 11.25ZM12.75 16C12.75 14.2051 14.2051 12.75 16 12.75C17.7949 12.75 19.25 14.2051 19.25 16C19.25 17.7949 17.7949 19.25 16 19.25C14.2051 19.25 12.75 17.7949 12.75 16Z" fill="currentColor" />
        <path d="M17.3022 4.25H14.6978C14.3796 4.24998 14.175 4.24997 13.9764 4.26663C12.8464 4.36143 11.7877 4.85733 10.9915 5.6647C10.8515 5.80661 10.7205 5.9638 10.5168 6.20827L10.3367 6.42443L10.314 6.4516C9.88977 6.954 9.26701 7.24569 8.60947 7.24996L8.57406 7.25H8.56804C8.50499 7.25 8.4666 7.25 8.43311 7.25039C5.3098 7.28673 2.78673 9.80981 2.75039 12.9331C2.75 12.9666 2.75 13.005 2.75 13.0681V16.7923C2.74999 18.5121 2.74999 19.8602 2.85918 20.9336C2.97055 22.0283 3.20166 22.9202 3.71905 23.6945C4.13856 24.3224 4.67763 24.8614 5.30547 25.281C6.0798 25.7983 6.97168 26.0295 8.06641 26.1408C9.13982 26.25 10.488 26.25 12.2077 26.25H19.7923C21.512 26.25 22.8602 26.25 23.9336 26.1408C25.0283 26.0295 25.9202 25.7983 26.6945 25.281C27.3224 24.8614 27.8614 24.3224 28.281 23.6945C28.7983 22.9202 29.0295 22.0283 29.1408 20.9336C29.25 19.8602 29.25 18.512 29.25 16.7923V13.0678C29.25 13.0049 29.25 12.9666 29.2496 12.9331C29.2133 9.80981 26.6902 7.28673 23.5669 7.25039C23.5334 7.25 23.495 7.25 23.432 7.25H23.4259L23.3905 7.24996C22.733 7.24569 22.1102 6.954 21.686 6.4516L21.6633 6.42443L21.4832 6.20828C21.2795 5.96382 21.1485 5.80661 21.0085 5.6647C20.2123 4.85733 19.1536 4.36143 18.0236 4.26663C17.825 4.24997 17.6204 4.24998 17.3022 4.25ZM14.1018 5.76138C14.2301 5.75062 14.3685 5.75 14.7315 5.75H17.2685C17.6315 5.75 17.7699 5.75062 17.8982 5.76138C18.6713 5.82625 19.3958 6.16554 19.9405 6.71795C20.0309 6.80962 20.12 6.91554 20.3524 7.19443L20.511 7.38471L20.5399 7.41934C21.247 8.25667 22.2849 8.74281 23.3808 8.74993L23.4259 8.75C23.4968 8.75 23.5258 8.75002 23.5494 8.75029C25.858 8.77715 27.7229 10.642 27.7497 12.9506C27.75 12.9742 27.75 13.0032 27.75 13.0741V16.75C27.75 18.5212 27.7491 19.7931 27.6485 20.7818C27.5492 21.7579 27.359 22.3744 27.0337 22.8612C26.7237 23.3252 26.3252 23.7237 25.8612 24.0338C25.3744 24.359 24.7579 24.5492 23.7818 24.6485C22.7931 24.7491 21.5212 24.75 19.75 24.75H12.25C10.4788 24.75 9.20688 24.7491 8.21821 24.6485C7.24209 24.5492 6.62561 24.359 6.13883 24.0338C5.67477 23.7237 5.27633 23.3252 4.96625 22.8612C4.64099 22.3744 4.45078 21.7579 4.35148 20.7818C4.25091 19.7931 4.25 18.5212 4.25 16.75V13.0741C4.25 13.0032 4.25001 12.9742 4.25029 12.9506C4.27715 10.642 6.14203 8.77715 8.45056 8.75029C8.47418 8.75002 8.50319 8.75 8.57406 8.75L8.61921 8.74993C9.7151 8.74281 10.753 8.25667 11.4601 7.41934L11.489 7.38471L11.6476 7.19443C11.88 6.91554 11.9691 6.80962 12.0595 6.71795C12.6042 6.16554 13.3287 5.82625 14.1018 5.76138Z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'eye') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.75C13.3878 3.75 14.6492 4.02422 15.7744 4.47168C15.7135 4.53581 15.6506 4.59832 15.585 4.6582C15.4315 4.7982 15.2564 4.92613 14.7773 5.27051L14.7305 5.30371C14.6611 5.35359 14.5617 5.42484 14.4795 5.49414C14.4533 5.51619 14.4207 5.5448 14.3848 5.58008C13.6454 5.36991 12.8494 5.25 12 5.25C9.24392 5.25 7.05001 6.51053 5.53027 8.03027C4.77032 8.79023 4.19031 9.60481 3.80371 10.335C3.40604 11.0861 3.25 11.6775 3.25 12C3.25 12.3225 3.40604 12.9139 3.80371 13.665C4.19031 14.3952 4.77032 15.2098 5.53027 15.9697C7.05001 17.4895 9.24392 18.75 12 18.75C14.7561 18.75 16.95 17.4895 18.4697 15.9697C19.2297 15.2098 19.8097 14.3952 20.1963 13.665C20.594 12.9139 20.75 12.3225 20.75 12C20.75 11.6775 20.594 11.0861 20.1963 10.335C20.0358 10.0318 19.8406 9.71492 19.6143 9.39258C19.6825 9.25999 19.7334 9.17027 19.7881 9.08496C19.9626 8.81285 20.1734 8.56232 20.415 8.3418C20.4681 8.29339 20.5238 8.2464 20.5938 8.19141C20.9632 8.67851 21.2749 9.16623 21.5225 9.63379C21.9684 10.4763 22.25 11.3226 22.25 12C22.25 12.6774 21.9684 13.5237 21.5225 14.3662C21.0653 15.2297 20.3952 16.1654 19.5303 17.0303C17.8 18.7605 15.2439 20.25 12 20.25C8.75608 20.25 6.19999 18.7605 4.46973 17.0303C3.60481 16.1654 2.93469 15.2297 2.47754 14.3662C2.03157 13.5237 1.75 12.6774 1.75 12C1.75 11.3226 2.03157 10.4763 2.47754 9.63379C2.93469 8.77029 3.60481 7.83465 4.46973 6.96973C6.19999 5.23947 8.75608 3.75 12 3.75ZM12 8.75C13.7949 8.75 15.25 10.2051 15.25 12C15.25 13.7949 13.7949 15.25 12 15.25C10.2051 15.25 8.75 13.7949 8.75 12C8.75 10.2051 10.2051 8.75 12 8.75ZM12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25Z" fill="currentColor" />
        <path d="M21.1421 1.21175C21.1941 1.10157 21.2201 1.04649 21.2526 1.02452C21.301 0.991826 21.3644 0.991826 21.4128 1.02452C21.4453 1.04649 21.4713 1.10157 21.5234 1.21175C21.6321 1.44199 21.6865 1.55712 21.7531 1.66371C21.8516 1.82152 21.9703 1.96584 22.1061 2.09304C22.1978 2.17896 22.3002 2.25457 22.5051 2.40577L22.5259 2.42114C22.5993 2.47527 22.636 2.50234 22.6514 2.53445C22.6701 2.57355 22.6701 2.61905 22.6514 2.65816C22.636 2.69026 22.5993 2.71733 22.5259 2.77147L22.5051 2.78684C22.3002 2.93804 22.1978 3.01364 22.1061 3.09956C21.9703 3.22677 21.8516 3.37109 21.7531 3.5289C21.6865 3.63549 21.6321 3.75061 21.5234 3.98086C21.4713 4.09103 21.4453 4.14612 21.4128 4.16808C21.3644 4.20078 21.301 4.20078 21.2526 4.16808C21.2201 4.14612 21.1941 4.09103 21.1421 3.98086C21.0333 3.75061 20.9789 3.63549 20.9124 3.5289C20.8138 3.37109 20.6951 3.22677 20.5594 3.09956C20.4676 3.01364 20.3652 2.93804 20.1603 2.78684L20.1395 2.77147C20.0661 2.71733 20.0295 2.69026 20.0141 2.65816C19.9953 2.61905 19.9953 2.57355 20.0141 2.53445C20.0295 2.50234 20.0661 2.47527 20.1395 2.42114L20.1603 2.40577C20.3652 2.25457 20.4676 2.17896 20.5594 2.09304C20.6951 1.96584 20.8138 1.82152 20.9124 1.66371C20.9789 1.55712 21.0333 1.44199 21.1421 1.21175Z" fill="url(#mw-tab-eye-spark1)" />
        <path d="M17.5708 3.46427C17.688 3.22271 17.7465 3.10193 17.8197 3.05377C17.9286 2.98208 18.0714 2.98208 18.1803 3.05377C18.2535 3.10193 18.312 3.22271 18.4292 3.46427C18.674 3.9691 18.7964 4.22151 18.9462 4.45522C19.1681 4.80123 19.4352 5.11767 19.7409 5.39657C19.9473 5.58495 20.1779 5.75072 20.6391 6.08225L20.686 6.11594C20.8511 6.23464 20.9337 6.29398 20.9683 6.36437C21.0106 6.45012 21.0106 6.54988 20.9683 6.63563C20.9337 6.70602 20.8511 6.76536 20.686 6.88406L20.6391 6.91775C20.1779 7.24928 19.9473 7.41505 19.7409 7.60343C19.4352 7.88233 19.1681 8.19877 18.9462 8.54478C18.7964 8.77849 18.674 9.0309 18.4292 9.53573C18.312 9.77729 18.2535 9.89807 18.1803 9.94623C18.0714 10.0179 17.9286 10.0179 17.8197 9.94623C17.7465 9.89807 17.688 9.77729 17.5708 9.53573C17.326 9.0309 17.2036 8.77849 17.0538 8.54478C16.8319 8.19877 16.5648 7.88233 16.2591 7.60343C16.0527 7.41505 15.8221 7.24928 15.3609 6.91775L15.314 6.88406C15.1489 6.76536 15.0663 6.70602 15.0317 6.63563C14.9894 6.54988 14.9894 6.45012 15.0317 6.36437C15.0663 6.29398 15.1489 6.23464 15.314 6.11594L15.3609 6.08225C15.8221 5.75072 16.0527 5.58495 16.2591 5.39657C16.5648 5.11767 16.8319 4.80123 17.0538 4.45522C17.2036 4.22151 17.326 3.9691 17.5708 3.46427Z" fill="url(#mw-tab-eye-spark2)" />
        <defs>
          <linearGradient id="mw-tab-eye-spark1" x1="22.6654" y1="4.19261" x2="19.6277" y2="3.78683" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4FC79" />
            <stop offset="1" stopColor="#96E6A1" />
          </linearGradient>
          <linearGradient id="mw-tab-eye-spark2" x1="21" y1="10" x2="14.1685" y2="9.06311" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4FC79" />
            <stop offset="1" stopColor="#96E6A1" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  return null;
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11L11 5M11 5H6.5M11 5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MagicQuillAvatar() {
  return (
    <div className="mw-list-avatar mw-list-avatar-magic" aria-hidden="true">
      <img src="/icons/magic-quill.svg" alt="" width="16" height="16" />
    </div>
  );
}

const GROUP_IMAGES = {
  design: '/groups/Group Design.png',
  apple: '/groups/Group Apple.png',
  android: '/groups/Group Android.png',
};

function GroupAvatar({ kind, size = 24 }) {
  const src = GROUP_IMAGES[kind];
  return (
    <img
      className="mw-group-avatar"
      src={src}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
    />
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 6V4.5C5 3.4 5.9 2.5 7 2.5C8.1 2.5 9 3.4 9 4.5V6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" fill="#1DB954" />
      <path d="M4 6C6 5.2 8.3 5.4 10 6.4M4.3 7.8C6 7.2 7.8 7.4 9.2 8.1M4.6 9.5C5.8 9.1 7.1 9.3 8.2 9.9" stroke="#000" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0.5C5.7 0.5 0.5 5.7 0.5 12c0 5 3.3 9.3 7.9 10.8.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function WindowChromeIcon({ name }) {
  if (name === 'home') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 7L8 3L13 7V13H10V10H6V13H3V7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
  );
  if (name === 'camera') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M6 4.5V3.5H10V4.5" stroke="currentColor" strokeWidth="1.2" /></svg>
  );
  if (name === 'rotate') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M6 7L9 4L12 7M9 4V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  return null;
}

function formatClock(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export default function MobileWindow({ win, onDrag, onOpenStories, initialTab = 'roam', initialView = 'overworld', initialPlatform = 'ios', lockscreen = false, theater = false, mapContent = null, autoKnock = false, elevator = false, magicMinutesChat = false, guestBadge = false, onItChat = false }) {
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewStack, setViewStack] = useState(initialTab === 'roam' && initialView === 'map' ? ['overworld', 'map'] : ['overworld']);
  const currentView = viewStack[viewStack.length - 1];
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [platform, setPlatform] = useState(initialPlatform);
  // Tapping the Theater room on the mobile map opens the full-screen Theater
  // overlay (same as the `theater` prop) without leaving the simulator.
  const [theaterOpen, setTheaterOpen] = useState(theater);

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);

  const openRoam = (roam) => setViewStack(v => [...v, 'map']);
  const goBack = () => {
    setViewStack(v => (v.length > 1 ? v.slice(0, -1) : v));
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'roam') setViewStack(['overworld']);
  };

  return (
    <div
      className={`mw-win mw-win-${platform} ${!win.isFocused ? 'mw-win-unfocused' : ''} ${closing ? 'mw-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <filter id="mw-liquid-glass" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="45" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="mw-chrome" onMouseDown={onDrag}>
        <div className="mw-chrome-lights">
          <button className="mw-light mw-light-close" onMouseDown={(e) => e.stopPropagation()} onClick={handleClose} aria-label="Close" />
          <button className="mw-light mw-light-min" onMouseDown={(e) => e.stopPropagation()} aria-label="Minimize" />
          <button className="mw-light mw-light-max" onMouseDown={(e) => e.stopPropagation()} aria-label="Maximize" />
        </div>
        <div className="mw-chrome-title">
          <span className="mw-chrome-title-primary">{platform === 'ios' ? 'iPhone 16e' : 'Pixel 9'}</span>
          <span className="mw-chrome-title-secondary">{platform === 'ios' ? 'iOS 26.2' : 'Android 15'}</span>
        </div>
        <div className="mw-chrome-platform-toggle" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`mw-chrome-platform-seg ${platform === 'ios' ? 'mw-chrome-platform-seg-active' : ''}`}
            onClick={() => setPlatform('ios')}
            aria-label="iOS"
            aria-pressed={platform === 'ios'}
            title="iOS"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.54 12.94c-.02-2.33 1.9-3.45 1.99-3.5-1.08-1.59-2.77-1.8-3.37-1.83-1.43-.14-2.79.84-3.52.84-.73 0-1.85-.82-3.04-.8-1.56.02-3 .91-3.8 2.31-1.62 2.82-.41 7 1.17 9.27.77 1.12 1.69 2.37 2.9 2.33 1.17-.05 1.61-.75 3.03-.75 1.41 0 1.81.75 3.04.73 1.26-.02 2.05-1.14 2.82-2.26.88-1.3 1.25-2.57 1.27-2.63-.03-.02-2.44-.94-2.46-3.7zm-2.34-6.79c.65-.78 1.09-1.87.96-2.95-.93.04-2.06.62-2.73 1.4-.6.7-1.12 1.81-.98 2.87 1.04.08 2.1-.53 2.75-1.32z"/></svg>
          </button>
          <button
            type="button"
            className={`mw-chrome-platform-seg ${platform === 'android' ? 'mw-chrome-platform-seg-active' : ''}`}
            onClick={() => setPlatform('android')}
            aria-label="Android"
            aria-pressed={platform === 'android'}
            title="Android"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.523 15.341a1.006 1.006 0 1 1 .005-2.01 1.006 1.006 0 0 1-.005 2.01zm-11.046 0a1.006 1.006 0 1 1 .005-2.01 1.006 1.006 0 0 1-.005 2.01zm11.4-6.02 2.004-3.47a.417.417 0 0 0-.722-.417l-2.03 3.513A12.56 12.56 0 0 0 12 7.792c-1.86 0-3.608.405-5.13 1.155L4.843 5.434a.417.417 0 0 0-.722.417L6.124 9.32C2.68 11.19.32 14.67 0 18.79h24c-.32-4.12-2.68-7.6-6.123-9.47z"/></svg>
          </button>
        </div>
        <div className="mw-chrome-spacer" aria-hidden="true" />
      </div>

      <div className="mw-phone">
        <div className={`mw-phone-frame ${lockscreen ? 'mw-phone-frame-lock' : ''}`}>
          <div className="mw-notch" />
          <div className="mw-screen">
            {!lockscreen && !theaterOpen && (activeTab === 'roam' || activeTab === 'ainbox') && <div className="mw-topbar-bg" aria-hidden="true" />}
            <div className={`mw-status ${lockscreen ? 'mw-status-lock' : ''}`}>
              <span className="mw-time">{clock}</span>
              <img className="mw-status-icons" src={platform === 'ios' ? '/icons/mobile-tabs/status.svg' : '/icons/mobile-tabs/android-status.svg'} alt="" />
            </div>

            {lockscreen && <LockScreenView />}
            {theaterOpen && <TheaterView onClose={() => setTheaterOpen(false)} platform={platform} />}
            {magicMinutesChat && <MagicMinutesChatView platform={platform} />}
            {onItChat && <OnItChatView platform={platform} />}
            {guestBadge && <MobileGuestBadgeSheet />}

            {!lockscreen && !theaterOpen && !magicMinutesChat && !onItChat && activeTab === 'roam' && currentView === 'overworld' && (
              <div className="mw-content mw-overworld">
                <div className="mw-top-nav">
                  <img className="mw-top-avatar" src="/headshots/joe-woodward.jpg" alt="" />
                  <img className="mw-top-logo" src="/icons/mobile-tabs/logo-with-wordmark.svg" alt="Roam" />
                </div>
                <div className="mw-overworld-inner">
                  <div className="mw-roam-group">
                    <RoamCard roam={ROAMS[0]} onOpen={() => openRoam(ROAMS[0])} />
                    <button className="mw-stories-bar" onClick={(e) => e.preventDefault()}>
                      <span className="mw-stories-icon" aria-hidden="true" style={{ WebkitMaskImage: 'url(/icons/mobile-tabs/Story.svg)', maskImage: 'url(/icons/mobile-tabs/Story.svg)' }} />
                      <span className="mw-stories-label">Stories</span>
                      <span className="mw-stories-chevron"><ChevronIcon size={12} /></span>
                    </button>
                  </div>
                  <RoamCard roam={ROAMS[1]} onOpen={() => openRoam(ROAMS[1])} />
                </div>
              </div>
            )}

            {!lockscreen && !theaterOpen && !magicMinutesChat && !onItChat && activeTab === 'roam' && currentView === 'map' && (
              <div className="mw-content mw-map">
                <div className="mw-top-nav">
                  <button className="mw-top-avatar mw-top-back" onClick={goBack} aria-label="Back">
                    {platform === 'android' ? <MaterialBackArrowIcon size={16} /> : <ChevronIcon size={14} />}
                  </button>
                  <img className="mw-top-logo" src="/icons/mobile-tabs/logo-with-wordmark.svg" alt="Roam" />
                </div>
                {mapContent ? <div className="mw-map-embed">{mapContent}</div> : <MobileMapGrid onOpenTheater={() => setTheaterOpen(true)} />}
                {autoKnock && <MobileKnockSequence />}
                {elevator && <MobileElevatorOverview />}
              </div>
            )}

            {!lockscreen && !theaterOpen && !magicMinutesChat && !onItChat && activeTab === 'ainbox' && (
              <div className="mw-content mw-ainbox">
                <div className="mw-ainbox-header">
                  <button className="mw-ainbox-profile" type="button" aria-label="Profile" tabIndex={-1}>
                    <img src="/headshots/joe-woodward.jpg" alt="" />
                  </button>
                  <div className="mw-ainbox-title">
                    <span>AInbox</span>
                    <span className="mw-ainbox-title-caret"><ChevronIcon size={10} /></span>
                  </div>
                  <button className="mw-ainbox-compose" aria-label="Compose">
                    <img src="/icons/mobile-tabs/Compose.svg" alt="" width="20" height="20" />
                  </button>
                </div>
                <AinboxScroller>
                  <div className="mw-ainbox-featured">
                    {AINBOX_FEATURED.map((u) => (
                      <div key={u.id} className="mw-featured-user">
                        <div className="mw-featured-avatar-wrap">
                          {u.label && (
                            <div className="mw-featured-label">
                              <span>{u.label}</span>
                            </div>
                          )}
                          {u.groupKind === 'design' ? (
                            <GroupAvatar kind="design" size={60} />
                          ) : (
                            <img className="mw-featured-avatar" src={u.avatar} alt="" />
                          )}
                        </div>
                        <span className="mw-featured-name">{u.name}</span>
                      </div>
                    ))}
                  </div>
                  <AinboxSection title="Direct Messages">
                    {AINBOX_DMS.map((d) => (
                      <div key={d.id} className="mw-list-cell">
                        <img className="mw-list-avatar" src={d.avatar} alt="" />
                        <span className="mw-list-name">{d.name}</span>
                      </div>
                    ))}
                  </AinboxSection>
                  <AinboxSection title="Meetings">
                    {AINBOX_MEETINGS.map((m) => (
                      <div key={m.id} className={`mw-list-cell ${m.read ? 'mw-list-cell-read' : ''}`}>
                        <MagicQuillAvatar />
                        <span className="mw-list-name">{m.name}</span>
                      </div>
                    ))}
                  </AinboxSection>
                  <AinboxSection title="Threads">
                    {AINBOX_THREADS.map((t) => (
                      <div key={t.id} className={`mw-list-cell ${t.read ? 'mw-list-cell-read' : ''}`}>
                        <img className="mw-list-avatar" src={t.avatar} alt="" />
                        <span className="mw-list-name">{t.text}</span>
                      </div>
                    ))}
                  </AinboxSection>
                  <AinboxSection title="My Groups">
                    {AINBOX_GROUPS.map((g) => (
                      <div key={g.id} className="mw-list-cell">
                        <GroupAvatar kind={g.kind} size={24} />
                        <span className="mw-list-name">{g.name}</span>
                      </div>
                    ))}
                  </AinboxSection>
                </AinboxScroller>
              </div>
            )}

            {!lockscreen && !theaterOpen && !magicMinutesChat && !onItChat && activeTab === 'camera' && (
              <div className="mw-content mw-camera">
                <div className="mw-camera-viewfinder">
                  <video
                    className="mw-camera-video"
                    src="/mobile/disney-world.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden="true"
                  />
                </div>
                <div className="mw-camera-controls">
                  <div className="mw-camera-thumb"><img src="/stories/story-2.png" alt="" /></div>
                  <button className="mw-camera-shutter" aria-label="Capture" />
                  <button className="mw-camera-flip" aria-label="Flip">
                    <img src="/icons/mobile-tabs/camera-rotate.svg" alt="" width="22" height="22" />
                  </button>
                </div>
              </div>
            )}

            {!lockscreen && !theaterOpen && !magicMinutesChat && !onItChat && <div className="mw-tabbar">
              <div className="mw-tabbar-main">
                <button className={`mw-tab ${activeTab === 'ainbox' ? 'mw-tab-active' : ''}`} onClick={() => selectTab('ainbox')} aria-label="AInbox">
                  <span className="mw-tab-icon"><TabIcon kind="chat" size={20} /></span>
                </button>
                <button className={`mw-tab ${activeTab === 'roam' ? 'mw-tab-active' : ''}`} onClick={() => selectTab('roam')} aria-label="Roam">
                  <span className="mw-tab-icon"><TabIcon kind="logo" size={20} /></span>
                </button>
                <button className={`mw-tab ${activeTab === 'camera' ? 'mw-tab-active' : ''}`} onClick={() => selectTab('camera')} aria-label="Camera">
                  <span className="mw-tab-icon"><TabIcon kind="camera" size={20} /></span>
                </button>
              </div>
              <button className="mw-tab mw-tab-eye" aria-label="Presence">
                <span className="mw-tab-icon"><TabIcon kind="eye" size={16} /></span>
              </button>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   Lock screen view — single composite image (wallpaper + Roam HQ Live
   Activity widget + bottom controls baked in) with a real-time clock and
   date rendered on top.
   ---------------------------------------------------------------------- */
function formatLockDate(d) {
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${weekday} ${month} ${d.getDate()}`;
}
function formatLockTime(d) {
  const h = ((d.getHours() + 11) % 12) + 1;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function LockScreenView() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mw-lock" aria-hidden="true">
      <img className="mw-lock-image" src="/mobile/lockscreen.png" alt="" />
      <div className="mw-lock-clock">
        <div className="mw-lock-date">{formatLockDate(now)}</div>
        <div className="mw-lock-time">{formatLockTime(now)}</div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   Mobile theater view — adaptation of the website Figma (5061:30883).
   Two video feeds stacked vertically + bottom controls bar.
   ---------------------------------------------------------------------- */
const MW_THEATER_VIDEO_SPEAKERS = [
  { name: 'Camila Torres', video: '/videos/Female/camila_torres.mp4' },
  { name: 'Daniel Russell', video: '/videos/Male/daniel_russell.mp4' },
];
const MW_THEATER_AUDIENCE = [
  '/headshots/grace-sutherland.jpg',
  '/headshots/john-huffsmith.jpg',
  '/headshots/john-beutner.jpg',
  '/headshots/michael-walrath.jpg',
];

function MwIconChevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15.5 6.5L9.5 12L15.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MwIconDoor() {
  return <span className="mw-theater-icon-mask mw-theater-icon-door" aria-hidden="true" />;
}
function MwIconMicTilted() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.5 4.5l-1.4 1.4a3 3 0 0 0-.6 3.5l-1.5 1.5-3.5-3.5L11 5.9a3 3 0 0 0 3.5-.6l1.4-1.4a1.4 1.4 0 0 1 2 2L17.5 7.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function MwIconVolume() {
  return <span className="mw-theater-icon-mask mw-theater-icon-volume" aria-hidden="true" />;
}
function MwIconMicMuted() {
  return <img className="mw-theater-mic-muted-img" src="/icons/microphone.svg" alt="" width="22" height="22" />;
}
function MwIconEmoji() {
  return <span className="mw-theater-icon-mask mw-theater-icon-emoji" aria-hidden="true" />;
}
function MwIconChat() {
  return <span className="mw-theater-icon-mask mw-theater-icon-chat" aria-hidden="true" />;
}
function MwIconStage() {
  return <span className="mw-theater-icon-mask mw-theater-icon-stage" aria-hidden="true" />;
}
function MwIconEllipsis() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
function MwIconMicSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.5 4.5C9.5 3.4 10.4 2.5 11.5 2.5h1c1.1 0 2 .9 2 2v6.5c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2V4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 3l18 18" stroke="#ef5350" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TheaterView({ onClose, platform }) {
  return (
    <div className="mw-theater" aria-hidden={!onClose}>
      {/* Office controls — back / title / leave */}
      <div className="mw-theater-controls">
        <button type="button" className="mw-theater-icon-btn" aria-label="Back" onClick={onClose}>
          {platform === 'android' ? <MaterialBackArrowIcon size={16} /> : <ChevronIcon size={14} />}
        </button>
        <div className="mw-theater-title-stack">
          <span className="mw-theater-title">Theater</span>
        </div>
        <button type="button" className="mw-theater-icon-btn" tabIndex={-1} aria-label="Leave">
          <MwIconDoor />
        </button>
      </div>

      {/* Stage — two video feeds stacked vertically */}
      <div className="mw-theater-stage">
        {MW_THEATER_VIDEO_SPEAKERS.map((s) => (
          <div key={s.name} className="mw-theater-feed">
            <video src={s.video} autoPlay loop muted playsInline />
          </div>
        ))}
      </div>

      {/* Bottom tab — audience pill + ask question + icon row */}
      <div className="mw-theater-tab">
        <div className="mw-theater-row mw-theater-row-top">
          <div className="mw-theater-audience">
            {MW_THEATER_AUDIENCE.map((src, i) => (
              <img key={i} src={src} alt="" />
            ))}
          </div>
          <div className="mw-theater-ask">
            <span>Ask a Question</span>
          </div>
        </div>
        <div className="mw-theater-row mw-theater-row-bottom">
          <button type="button" className="mw-theater-tabicon" tabIndex={-1} aria-label="Volume"><MwIconVolume /></button>
          <button type="button" className="mw-theater-tabicon mw-theater-tabicon-muted" tabIndex={-1} aria-label="Microphone"><MwIconMicMuted /></button>
          <button type="button" className="mw-theater-tabicon" tabIndex={-1} aria-label="Reactions"><MwIconEmoji /></button>
          <button type="button" className="mw-theater-tabicon" tabIndex={-1} aria-label="Chat"><MwIconChat /></button>
          <button type="button" className="mw-theater-tabicon" tabIndex={-1} aria-label="Stage"><MwIconStage /></button>
          <button type="button" className="mw-theater-tabicon" tabIndex={-1} aria-label="More"><MwIconEllipsis /></button>
        </div>
      </div>
    </div>
  );
}

/* Theater & meeting backgrounds — same audience seat layout + diagonal-stripe
   meeting-room-lines pattern as the desktop showcase, just stripped of
   reactions / talking animation so the mobile map preview stays static. */
const MW_THEATER_SPEAKERS = [
  { name: 'Camila T.', avatar: '/videos/Female/camila_torres.png' },
  { name: 'Megan T.', avatar: '/videos/Female/megan_taylor.png' },
  { name: 'Hannah B.', avatar: '/videos/Female/hannah_bennett.png' },
];
const MW_THEATER_AUDIENCE_ROWS = [
  [2, 4, 3, 4],
  [4, 3, 4, 2],
  [3, 4, 2, 3],
  [4, 2, 3, 4],
];

function MapRoomTheater({ room }) {
  return (
    <div className="big-meeting-card-inner" style={{ height: '100%' }}>
      <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header sc-theater-card-header">
          <h3 className="office-name">{room.name}</h3>
        </div>
        <div className="theater-preview">
          <div className="theater-preview-stage sc-theater-stage">
            {MW_THEATER_SPEAKERS.map((s) => (
              <div key={s.name} className="sc-theater-speaker">
                <img className="sc-theater-speaker-img" src={s.avatar} alt="" />
              </div>
            ))}
          </div>
          <div className="theater-preview-audience">
            {MW_THEATER_AUDIENCE_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="theater-preview-row">
                {row.map((count, benchIdx) => (
                  <div key={benchIdx} className="theater-preview-bench">
                    {count > 0 && (
                      <div className="theater-preview-dots">
                        {Array.from({ length: count }).map((_, dotIdx) => (
                          <div key={dotIdx} className="theater-preview-dot" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapRoomMeeting({ room }) {
  const visible = (room.people || []).filter((p) => p && p.avatar).slice(0, 6);
  return (
    <div className="big-meeting-card-inner" style={{ height: '100%' }}>
      <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <h3 className="office-name">{room.name}</h3>
        </div>
        <div className="meeting-room-people">
          {visible.map((person, i) => (
            <div key={person.name + i} className="person meeting-room-person">
              <img className="avatar" src={person.avatar} alt="" />
            </div>
          ))}
        </div>
        <div className="meeting-room-lines" />
      </div>
    </div>
  );
}

function MapRoomGame({ room }) {
  const visible = (room.people || []).filter((p) => p && p.avatar).slice(0, 4);
  return (
    <div className="big-meeting-card-inner" style={{ height: '100%' }}>
      <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className="game-room-lines"><div className="game-room-zigzag" /></div>
        <div className="card-header">
          <h3 className="office-name">{room.name}</h3>
        </div>
        {visible.length > 0 && (
          <div className="game-room-roster mw-game-roster">
            {visible.map((person, i) => (
              <div key={person.name + i} className="mw-game-hex-mini">
                <img src={person.avatar} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapRoomPrivate({ room }) {
  const [talking, setTalking] = useState({});
  const hasTalk = room.people.length > 1;

  useEffect(() => {
    if (!hasTalk) return;
    let timer;
    const tick = () => {
      setTalking(() => {
        const next = {};
        const r = Math.random();
        if (r < 0.4) {
          const idx = Math.floor(Math.random() * room.people.length);
          next[room.people[idx].name] = true;
        } else if (r < 0.55) {
          room.people.forEach(p => { next[p.name] = true; });
        }
        return next;
      });
      timer = setTimeout(tick, 1200 + Math.random() * 2000);
    };
    timer = setTimeout(tick, 400 + Math.random() * 800);
    return () => clearTimeout(timer);
  }, [hasTalk, room.people]);

  return (
    <div className="big-meeting-card-inner" style={{ height: '100%' }}>
      <div className="meeting-room-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header" style={{ padding: '0 12px' }}>
          <h3 className={`office-name ${room.people.length === 0 ? 'sc-office-empty' : ''}`}>{room.name}</h3>
        </div>
        {room.people.length > 0 && (
          <div className="private-office-seat">
            <div className="seat-row seat-row-hovered">
              {room.people.map((person, i) => (
                <div key={person.name + i} className="seat-assigned sc-private-person">
                  <img className="seat-avatar" src={person.avatar} alt={person.name} />
                  {hasTalk && <div className={`sc-private-talk-ring ${talking[person.name] ? 'sc-talking' : ''}`} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MapRoom({ room }) {
  if (room.type === 'theater') return <MapRoomTheater room={room} />;
  if (room.type === 'meeting') return <MapRoomMeeting room={room} />;
  if (room.type === 'game') return <MapRoomGame room={room} />;
  return <MapRoomPrivate room={room} />;
}

// Extra mobile-only rooms — appended below the R&D floor so the phone map
// shows more of the office than the desktop's 5-row layout.
const MW_EXTRA_ROOMS = [
  // Row 5
  { id: 'mwx-r5-0', type: 'private', name: 'Garima K.', people: [{ name: 'Garima K.', avatar: '/headshots/garima-kewlani.jpg' }], pos: { col: 0, row: 5 }, span: 1 },
  { id: 'mwx-r5-1', type: 'private', name: 'Ava L.', people: [{ name: 'Ava L.', avatar: '/headshots/ava-lee.jpg' }], pos: { col: 1, row: 5 }, span: 1 },
  { id: 'mwx-r5-2', type: 'private', name: 'Arnav B.', people: [{ name: 'Arnav B.', avatar: '/headshots/arnav-bansal.jpg' }], pos: { col: 2, row: 5 }, span: 1 },
  { id: 'mwx-r5-3', type: 'private', name: 'Thomas G.', people: [{ name: 'Thomas G.', avatar: '/headshots/thomas-grapperon.jpg' }], pos: { col: 3, row: 5 }, span: 1 },
  { id: 'mwx-r5-4', type: 'private', name: 'John H.', people: [{ name: 'John H.', avatar: '/headshots/john-huffsmith.jpg' }], pos: { col: 4, row: 5 }, span: 1 },
  { id: 'mwx-r5-5', type: 'private', name: 'John B.', people: [{ name: 'John B.', avatar: '/headshots/john-beutner.jpg' }], pos: { col: 5, row: 5 }, span: 1 },
  // Row 6
  { id: 'mwx-r6-0', type: 'private', name: 'Tom D.', people: [{ name: 'Tom D.', avatar: '/headshots/tom-dixon.jpg' }], pos: { col: 0, row: 6 }, span: 1 },
  { id: 'mwx-r6-1', type: 'private', name: 'Chelsea T.', people: [{ name: 'Chelsea T.', avatar: '/headshots/chelsea-turbin.jpg' }], pos: { col: 1, row: 6 }, span: 1 },
  { id: 'mwx-r6-2', type: 'private', name: 'Lexi B.', people: [{ name: 'Lexi B.', avatar: '/headshots/lexi-bohonnon.jpg' }], pos: { col: 2, row: 6 }, span: 1 },
  { id: 'mwx-r6-3', type: 'private', name: 'Will H.', people: [{ name: 'Will H.', avatar: '/headshots/will-hou.jpg' }], pos: { col: 3, row: 6 }, span: 1 },
  { id: 'mwx-r6-4', type: 'private', name: 'Michael M.', people: [{ name: 'Michael M.', avatar: '/headshots/michael-miller.jpg' }], pos: { col: 4, row: 6 }, span: 1 },
  { id: 'mwx-r6-5', type: 'private', name: 'Jack D.', people: [], pos: { col: 5, row: 6 }, span: 1 },
  // Row 7
  { id: 'mwx-r7-0', type: 'private', name: 'Theo O.', people: [], pos: { col: 0, row: 7 }, span: 1 },
  { id: 'mwx-r7-1', type: 'private', name: 'Vincent L.', people: [], pos: { col: 1, row: 7 }, span: 1 },
  { id: 'mwx-r7-2', type: 'private', name: 'Max G.', people: [], pos: { col: 2, row: 7 }, span: 1 },
  { id: 'mwx-r7-3', type: 'private', name: 'Sarah M.', people: [{ name: 'Sarah M.', avatar: '/videos/Female/sarah_mitchell.png' }], pos: { col: 3, row: 7 }, span: 1 },
  { id: 'mwx-r7-4', type: 'private', name: 'Mia C.', people: [{ name: 'Mia C.', avatar: '/videos/Female/mia_chen.png' }], pos: { col: 4, row: 7 }, span: 1 },
  { id: 'mwx-r7-5', type: 'private', name: 'Olivia S.', people: [{ name: 'Olivia S.', avatar: '/videos/Female/olivia_sanders.png' }], pos: { col: 5, row: 7 }, span: 1 },
];

// Room IDs that should render as empty offices on the mobile map — the
// avatar disappears and the name renders in --text-disabled. Gives the floor
// the realistic "some people are out today" feel.
const MW_EMPTY_ROOM_IDS = new Set([
  'r3',          // John M.
  'r5',          // Keegan L.
  'r8',          // Rob F.
  'r17',         // Ethan B.
  'mwx-r5-1',    // Ava L.
  'mwx-r5-3',    // Thomas G.
  'mwx-r6-2',    // Lexi B.
  'mwx-r6-4',    // Michael M.
]);

// Guest Badge sheet rendered inside the mobile simulator. Sits over
// a dim scrim covering the whole screen so the underlying view (the
// AInbox) reads as a backdrop. Mirrors the Figma spec — white sheet
// with a dark drag handle, dismiss X, person avatar with a Roam-mark
// badge, email field, list cells (toggle on Visitor Access), purple
// Send Badge CTA, gradient slogan footer.
function MobileGuestBadgeSheet() {
  return (
    <>
      <div className="mw-gb-scrim" aria-hidden="true" />
      <div className="mw-gb-sheet">
        <div className="mw-gb-handle" aria-hidden="true" />
        <button type="button" className="mw-gb-dismiss" aria-label="Dismiss" tabIndex={-1}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2 2L9 9M9 2L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="mw-gb-body">
          <div className="mw-gb-avatar">
            <img className="mw-gb-avatar-img" src="/icons/guest-light.png" alt="" />
          </div>
          <div className="mw-gb-text">
            <p className="mw-gb-title">Guest Badge</p>
            <p className="mw-gb-sub">Your guest will be able to message you, meet with you, and visit you. It’s free to add Guests. Invite as many as you like.</p>
          </div>
          <div className="mw-gb-section">
            <p className="mw-gb-section-title">Email</p>
            <div className="mw-gb-field">Work Email</div>
          </div>
          <div className="mw-gb-list">
            <div className="mw-gb-cell">
              <div className="mw-gb-cell-text">
                <p className="mw-gb-cell-title">Chat</p>
                <p className="mw-gb-cell-sub">Guests can reach out to you with messages</p>
              </div>
            </div>
            <div className="mw-gb-cell">
              <div className="mw-gb-cell-text">
                <p className="mw-gb-cell-title">Visitor Access</p>
                <p className="mw-gb-cell-sub">Guests are welcome to knock if you’re in your office</p>
              </div>
              <span className="mw-gb-toggle" aria-hidden="true">
                <span className="mw-gb-toggle-knob" />
              </span>
            </div>
          </div>
          <button type="button" className="mw-gb-cta" tabIndex={-1}>Send Badge</button>
        </div>
        <div className="mw-gb-footer">The Office of Tomorrow awaits Them</div>
      </div>
    </>
  );
}

// On-It DM-style chat — back / On-It avatar+title / emoji top
// nav, alternating user (right, white) + bot (left, dark) bubbles
// with the "tail" corner squared, gradient fade behind the header
// like the Magic Minutes view, and a pill composer with audio
// button at the bottom. Lives inside the simulator so it benefits
// from the mobile chrome.
function OnItChatView({ platform }) {
  const messages = [
    { id: 1, self: true,  text: 'Hey On-It, can you schedule a meeting about our GTM strategy for next week?' },
    { id: 2, self: false, text: 'Sure thing! I’ll set up a meeting about the GTM strategy. Any preferences for the day or time next week?' },
    { id: 3, self: true,  text: 'How about Wednesday at 2 PM? Invite Sarah, Mike, and Priya. In Roam in the Walt Disney meeting room.' },
    { id: 4, self: false, text: 'Got it. Scheduling a GTM strategy meeting for Wednesday at 2 PM with Sarah, Mike, and Priya in the Walt Disney meeting room in Roam. Should I add a quick agenda: GTM goals, timeline, and resource allocation?' },
    { id: 5, self: true,  text: 'Yes, perfect.' },
    { id: 6, self: false, text: 'Done! Invites sent to Sarah, Mike, and Priya with the agenda: GTM goals, timeline, resource allocation. Room booked in Roam.' },
  ];
  return (
    <div className="mw-onit-chat" aria-hidden="true">
      <div className="mw-mm-topbar-bg" aria-hidden="true" />
      <div className="mw-onit-header">
        <button type="button" className="mw-top-avatar mw-top-back" aria-label="Back" tabIndex={-1}>
          {platform === 'android' ? <MaterialBackArrowIcon size={16} /> : <ChevronIcon size={14} />}
        </button>
        <div className="mw-onit-title">
          <img className="mw-onit-title-avatar" src="/on-it-agent.png" alt="" />
          <span>On-It!</span>
        </div>
        <span className="mw-onit-header-spacer" aria-hidden="true" />
      </div>
      <AinboxScroller topInset={0}>
        <div className="mw-onit-list">
          {messages.map((m) => (
            <div key={m.id} className={`mw-onit-row ${m.self ? 'mw-onit-row-self' : ''}`}>
              <div className={`mw-onit-bubble ${m.self ? 'mw-onit-bubble-self' : ''}`}>{m.text}</div>
            </div>
          ))}
        </div>
      </AinboxScroller>
      <div className="mw-onit-composer-wrap">
        <div className="mw-onit-composer">
          <span className="mw-onit-composer-placeholder">Write a Message...</span>
          <button type="button" className="mw-onit-composer-audio" tabIndex={-1} aria-label="Voice message">
            <img src="/icons/composer/Audio.svg" alt="" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Magic Minutes group chat view used inside the mobile simulator on
// the FeaturePage. Mirrors the Figma spec — back button + meeting
// title header, scrollable message list with Magic Minutes summary
// bot replies + a teammate question, and a footer with the typing
// indicator stack and the message composer.
function MagicMinutesChatView({ platform }) {
  const messages = [
    {
      id: 1,
      sender: 'Magic Minutes',
      kind: 'bot',
      time: '6:32 PM',
      text: "We just wrapped up an exciting all-hands meeting in Roam HQ's virtual theater today, diving into the latest product updates that are elevating our virtual office platform. The focus was on enhancing hybrid work with seamless mobile features, interactive maps, AI-driven tools, and robust collaboration options. Our mobile app's new Live Activity feature, now live on iOS and Android, displays real-time office activity—like who's in a meeting or at the watercooler—right on users' lock screens, making it easier to stay connected without constant app checks.",
    },
    {
      id: 2,
      sender: 'Howard Lerman',
      avatar: '/headshots/howard-lerman.jpg',
      time: '6:36 PM',
      text: 'When are we releasing the new iOS live activity feature?',
    },
    {
      id: 3,
      sender: 'Magic Minutes',
      kind: 'bot',
      time: '6:32 PM',
      text: "We're targeting an immediate rollout starting today, October 22, 2025, via a phased App Store update for all users on iOS 18+.",
    },
  ];
  const typingAvatars = [
    '/headshots/mattias-leino.jpg',
  ];
  return (
    <div className="mw-mm-chat" aria-hidden="true">
      <div className="mw-mm-header">
        <button type="button" className="mw-top-avatar mw-top-back mw-mm-back" aria-label="Back">
          {platform === 'android' ? <MaterialBackArrowIcon size={16} /> : <ChevronIcon size={14} />}
        </button>
        <div className="mw-mm-title">Roam Weekly All-Hands</div>
      </div>
      <AinboxScroller topInset={56}>
        <div className="mw-mm-list">
          {messages.map((m) => (
            <div key={m.id} className="mw-mm-message">
              <div className={`mw-mm-avatar ${m.kind === 'bot' ? 'mw-mm-avatar-bot' : ''}`}>
                {m.kind === 'bot' ? (
                  <img src="/icons/magic-quill.svg" alt="" width="16" height="16" />
                ) : (
                  <img src={m.avatar} alt="" />
                )}
              </div>
              <div className="mw-mm-message-body">
                <div className="mw-mm-message-meta">
                  <span className="mw-mm-message-name">{m.sender}</span>
                  <span className="mw-mm-message-time">{m.time}</span>
                </div>
                <p className="mw-mm-message-text">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </AinboxScroller>
      <div className="mw-mm-footer">
        <div className="mw-mm-typing" aria-hidden="true">
          {typingAvatars.map((src, i) => (
            <img key={i} className="mw-mm-typing-face" src={src} alt="" />
          ))}
          <div className="mw-mm-typing-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="mw-mm-composer">
          <span className="mw-mm-composer-placeholder">Write a Message...</span>
          <img className="mw-mm-composer-send" src="/icons/composer/Send.svg" alt="" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// Multi-floor "Roam HQ" overview that slides up from the bottom over
// the map when scrolled into view. Mirrors the iOS Maps-style bottom
// sheet treatment from the spec — a header (close + title) followed
// by stacked floor sections, each with a stylized room grid.
function MobileElevatorOverview() {
  const rootRef = useRef(null);
  const [shown, setShown] = useState(false);
  // Trigger the slide-up animation once the simulator's mobile screen
  // reaches the viewport. Observe the parent (.mw-content.mw-map)
  // because the sheet itself sits at translateY(100%) below it and
  // wouldn't intersect on its own.
  useEffect(() => {
    const sheet = rootRef.current;
    const parent = sheet?.parentElement;
    if (!parent) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        setShown(true);
        obs.disconnect();
      }
    }, { threshold: [0, 0.1, 0.25, 0.5] });
    obs.observe(parent);
    // Safety net: animate after 1.6s even if the observer never fires
    // (some layouts may not emit intersection events for off-screen
    // siblings).
    const fallback = setTimeout(() => setShown(true), 1600);
    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  // Each floor renders as a column-stack of "h-stacks" (vertical
  // sub-columns) — mirroring the Figma layout where each floor is a
  // grid of variable-width columns, each containing a vertical stack
  // of office cells (singletons or tall blocks). Cells optionally
  // carry one or more avatars stacked horizontally.
  const F = (...avatars) => ({ avatars });
  const E = () => ({});                  // empty cell
  const FLOORS = [
    {
      name: 'R&D',
      columns: [
        [F('/headshots/joe-woodward.jpg'), E(), F('/headshots/howard-lerman.jpg'), E()],
        [E(), F('/headshots/mattias-leino.jpg', '/headshots/arnav-bansal.jpg'), E(), E()],
        [E(), { wide: true, flex: true, theater: true }],
        [F('/headshots/jeff-grossman.jpg'), { flex: true }],
        [E(), E(), F('/headshots/lexi-bohonnon.jpg'), F('/headshots/will-hou.jpg')],
      ],
      colWidths: ['minmax(36px, 1fr)', 'auto', 'minmax(110px, 2fr)', 'auto', 'minmax(36px, 1fr)'],
    },
    {
      name: 'Commercial',
      columns: [
        [
          F('/headshots/chelsea-turbin.jpg', '/headshots/garima-kewlani.jpg', '/headshots/ava-lee.jpg', '/headshots/grace-sutherland.jpg'),
          F('/headshots/aaron-wadhwa.jpg'),
          F('/headshots/peter-lerman.jpg'),
        ],
        [E(), { flex: true }],
        [F('/headshots/john-moffa.jpg'), F('/headshots/lexi-bohonnon.jpg'), { dock: true }],
        [F('/headshots/howard-lerman.jpg'), E(), F('/headshots/will-hou.jpg'), E()],
        [F('/headshots/joe-woodward.jpg', '/headshots/grace-sutherland.jpg'), { dock: true }],
      ],
      colWidths: ['auto', 'minmax(36px, auto)', 'auto', '1fr', '1fr'],
    },
    {
      name: 'Marketing',
      columns: [
        [F('/headshots/will-hou.jpg', '/headshots/grace-sutherland.jpg'), { tall: true, theater: true }],
        [E(), E(), E()],
        [F('/headshots/peter-lerman.jpg'), F('/headshots/aaron-wadhwa.jpg'), { tall: true, flex: true }],
        [F('/headshots/lexi-bohonnon.jpg'), E(), F('/headshots/john-moffa.jpg'), E(), F('/headshots/jeff-grossman.jpg')],
        [F('/headshots/joe-woodward.jpg', '/headshots/mattias-leino.jpg'), F('/headshots/chelsea-turbin.jpg', '/headshots/ava-lee.jpg'), F('/headshots/howard-lerman.jpg')],
      ],
      colWidths: ['107px', 'minmax(36px, auto)', 'auto', 'auto', 'auto'],
    },
  ];

  return (
    <div ref={rootRef} className={`mw-elevator-sheet ${shown ? 'mw-elevator-shown' : ''}`}>
      <div className="mw-elevator-header">
        <button type="button" className="mw-top-avatar mw-top-back mw-elevator-close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="mw-elevator-title">Roam HQ</div>
        <div className="mw-elevator-header-spacer" />
      </div>
      <div className="mw-elevator-floors">
        {FLOORS.map((floor) => (
          <div key={floor.name} className="mw-elevator-floor">
            <div className="mw-elevator-floor-name">{floor.name}</div>
            <div
              className="mw-elevator-grid"
              style={{ gridTemplateColumns: floor.colWidths.join(' ') }}
            >
              {floor.columns.map((col, ci) => (
                <div key={ci} className="mw-elevator-col">
                  {col.map((cell, i) => (
                    <div
                      key={i}
                      className={`mw-elevator-cell ${cell.flex ? 'mw-elevator-cell-flex' : ''} ${cell.tall ? 'mw-elevator-cell-tall' : ''} ${cell.wide ? 'mw-elevator-cell-wide' : ''} ${cell.theater ? 'mw-elevator-cell-theater' : ''}`}
                    >
                      {cell.avatars && cell.avatars.map((src, j) => (
                        <img key={j} className="mw-elevator-avatar" src={src} alt="" />
                      ))}
                      {cell.theater && (
                        <div className="mw-elevator-stage" aria-hidden="true" />
                      )}
                      {(cell.dock || cell.theater) && (
                        <div className="mw-elevator-dock" aria-hidden="true">
                          {Array.from({ length: 4 }).map((_, r) => (
                            <div key={r} className="mw-elevator-dock-row">
                              {Array.from({ length: 4 }).map((__, c) => (
                                <span key={c} className="mw-elevator-dock-bar" />
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Drop-In Meetings demo: shows a static knock dialog over the map so
// the visual reads as "tap a room → knock to drop in". Kept inside the
// simulator's screen frame.
function MobileKnockSequence() {
  return (
    <div className="mw-knock-overlay" aria-hidden="true">
      <div className="mw-knock-dialog">
        <div className="mw-knock-icon">
          <img src="/icons/knock.svg" alt="" width="24" height="24" />
        </div>
        <div className="mw-knock-label">
          Knocking on Chelsea&rsquo;s Door
          <span className="mw-knock-dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
        <button type="button" className="mw-knock-cancel" tabIndex={-1}>Cancel</button>
      </div>
    </div>
  );
}

function MobileMapGrid({ onOpenTheater } = {}) {
  // Walk rooms in array order, dropping any person whose name was already
  // claimed by an earlier room (or by the theater's hardcoded speakers).
  // Each face only appears in one place on the floor — so a person sitting
  // in the meeting room won't also appear in their personal office.
  const seen = new Set(MW_THEATER_SPEAKERS.map((s) => s.name));
  const rooms = [...(FLOORS['R&D'] || []), ...MW_EXTRA_ROOMS].map((room) => {
    // Mobile-only override: the desktop's "Game Room" (standup) renders as a
    // second meeting room called "Planatarium" on the phone map.
    let r = room.id === 'standup'
      ? { ...room, name: 'Planatarium', type: 'meeting' }
      : room;
    if (MW_EMPTY_ROOM_IDS.has(r.id)) return { ...r, people: [] };
    const people = (r.people || []).filter((p) => {
      if (!p?.name) return true;
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    return { ...r, people };
  });
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const INITIAL_Y = 80;

  // Pan state lives in refs (not React state) so the rAF loop can mutate the
  // transform 60× per second without scheduling re-renders. The transform is
  // written directly to the canvas DOM node.
  const posRef = useRef({ x: 0, y: INITIAL_Y });
  const velRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const samplesRef = useRef([]);
  const rafRef = useRef(0);

  // Apply current pos to the canvas transform.
  const writeTransform = () => {
    const el = canvasRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
  };

  // Compute current pan bounds based on viewport + canvas size.
  const getBounds = () => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const maxX = 0;
    const minX = Math.min(0, vp.clientWidth - canvas.offsetWidth);
    const maxY = INITIAL_Y;
    const minY = Math.min(INITIAL_Y, vp.clientHeight - canvas.offsetHeight - 80);
    return { minX, maxX, minY, maxY };
  };

  // Rubber-band resistance: as the canvas drags past a bound, divide the
  // excess by an increasing factor so motion gets stiffer the further out it
  // goes (matches the curve UIScrollView uses).
  const rubberBand = (delta, dimension) => {
    const c = 0.55;
    const x = Math.abs(delta);
    return (Math.sign(delta) * (1 - 1 / (x * c / dimension + 1))) * dimension;
  };

  const clampWithRubber = (raw, min, max, dim) => {
    if (raw > max) return max + rubberBand(raw - max, dim);
    if (raw < min) return min - rubberBand(min - raw, dim);
    return raw;
  };

  // Momentum + spring-back loop. Runs each frame: applies velocity with
  // friction; when out of bounds applies a spring force toward the boundary
  // (over-damped enough to not oscillate). Stops when motion settles.
  const animate = () => {
    const { minX, maxX, minY, maxY } = getBounds();
    const FRICTION = 0.92;
    const SPRING = 0.18;
    const DAMP = 0.65;
    const STOP = 0.02;

    let { x, y } = posRef.current;
    let vx = velRef.current.x;
    let vy = velRef.current.y;

    // Free-flight: while inside bounds, decay velocity by friction.
    if (x <= maxX && x >= minX) vx *= FRICTION;
    if (y <= maxY && y >= minY) vy *= FRICTION;

    // Spring back when out of bounds — pull toward nearest edge.
    if (x > maxX) { vx += (maxX - x) * SPRING; vx *= DAMP; }
    if (x < minX) { vx += (minX - x) * SPRING; vx *= DAMP; }
    if (y > maxY) { vy += (maxY - y) * SPRING; vy *= DAMP; }
    if (y < minY) { vy += (minY - y) * SPRING; vy *= DAMP; }

    x += vx;
    y += vy;

    posRef.current = { x, y };
    velRef.current = { x: vx, y: vy };
    writeTransform();

    const settled = Math.abs(vx) < STOP && Math.abs(vy) < STOP
      && x <= maxX && x >= minX && y <= maxY && y >= minY;
    if (settled) {
      rafRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(animate);
  };

  // Cancel any in-flight momentum loop (e.g. when the user grabs again).
  const stopAnimation = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  };

  // Pointer-event flow — works for both mouse and touch via the unified
  // PointerEvent API. The move/up listeners attach to `window` after the
  // initial pointerdown so the gesture survives the cursor leaving the
  // viewport (release outside the simulator frame, off the page, etc.).
  const moveHandlerRef = useRef(null);
  const upHandlerRef = useRef(null);

  const detachWindowListeners = () => {
    if (moveHandlerRef.current) {
      window.removeEventListener('pointermove', moveHandlerRef.current);
      window.removeEventListener('pointerup', upHandlerRef.current);
      window.removeEventListener('pointercancel', upHandlerRef.current);
      moveHandlerRef.current = null;
      upHandlerRef.current = null;
    }
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopAnimation();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: posRef.current.x,
      origY: posRef.current.y,
    };
    samplesRef.current = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    velRef.current = { x: 0, y: 0 };

    detachWindowListeners();

    const onMove = (ev) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== ev.pointerId) return;
      const { minX, maxX, minY, maxY } = getBounds();
      const vp = viewportRef.current;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      const rawX = drag.origX + dx;
      const rawY = drag.origY + dy;

      posRef.current = {
        x: clampWithRubber(rawX, minX, maxX, vp?.clientWidth || 320),
        y: clampWithRubber(rawY, minY, maxY, vp?.clientHeight || 480),
      };
      writeTransform();

      const now = performance.now();
      const samples = samplesRef.current;
      samples.push({ t: now, x: ev.clientX, y: ev.clientY });
      while (samples.length > 1 && now - samples[0].t > 120) samples.shift();
    };

    const onUp = (ev) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== ev.pointerId) return;
      dragRef.current = null;

      // Fling velocity from the last ~120ms of samples.
      const samples = samplesRef.current;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = Math.max(16, last.t - first.t);
        const FRAME_MS = 16.67;
        velRef.current = {
          x: ((last.x - first.x) / dt) * FRAME_MS,
          y: ((last.y - first.y) / dt) * FRAME_MS,
        };
      }
      samplesRef.current = [];

      detachWindowListeners();

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    moveHandlerRef.current = onMove;
    upHandlerRef.current = onUp;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    e.preventDefault();
  };

  useEffect(() => () => {
    stopAnimation();
    detachWindowListeners();
  }, []);

  return (
    <div
      className="mw-map-viewport"
      ref={viewportRef}
      onPointerDown={onPointerDown}
    >
      <div
        className="mw-map-canvas"
        ref={canvasRef}
        style={{ transform: `translate3d(0px, ${INITIAL_Y}px, 0)` }}
      >
        <div className="sc-map">
          <div className="sc-grid mw-map-sc-grid">
            {rooms.map((room) => {
              const gridColumn = room.colSpan
                ? `${room.pos.col + 1} / span ${room.colSpan}`
                : `${room.pos.col + 1}`;
              const gridRow = room.rowSpan
                ? `${room.pos.row + 1} / span ${room.rowSpan}`
                : `${room.pos.row + 1}`;
              const isTheater = room.type === 'theater';
              return (
                <div
                  key={room.id}
                  className="sc-grid-cell sc-room-card"
                  data-room-type={room.type}
                  data-room-name={room.name}
                  style={{ gridColumn, gridRow, cursor: isTheater ? 'pointer' : undefined }}
                  onClick={isTheater ? (e) => { e.stopPropagation(); onOpenTheater?.(); } : undefined}
                >
                  <MapRoom room={room} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Vertical pan/fling scroller for the AInbox tab — same gesture model as
   MobileMapGrid (rubber-band overscroll, momentum decay, spring-back, window
   pointer listeners so release outside the simulator still completes), but
   locked to the Y axis. */
function AinboxScroller({ children, topInset = 94 }) {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const posRef = useRef({ x: 0, y: topInset });
  const velRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const samplesRef = useRef([]);
  const rafRef = useRef(0);
  const moveHandlerRef = useRef(null);
  const upHandlerRef = useRef(null);

  const writeTransform = () => {
    const el = canvasRef.current;
    if (!el) return;
    el.style.transform = `translate3d(0px, ${posRef.current.y}px, 0)`;
  };

  // Y bounds — top is the topInset so the first row sits below the header.
  // Bottom: the canvas may be taller than the viewport, so minY pulls up by
  // the difference (so the last row stops at the bottom of the visible area).
  const getBounds = () => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas) return { minY: 0, maxY: topInset };
    const maxY = topInset;
    const overflow = canvas.offsetHeight - vp.clientHeight;
    const minY = overflow > 0 ? -overflow : topInset;
    return { minY, maxY };
  };

  const rubberBand = (delta, dimension) => {
    const c = 0.55;
    const x = Math.abs(delta);
    return (Math.sign(delta) * (1 - 1 / (x * c / dimension + 1))) * dimension;
  };
  const clampWithRubber = (raw, min, max, dim) => {
    if (raw > max) return max + rubberBand(raw - max, dim);
    if (raw < min) return min - rubberBand(min - raw, dim);
    return raw;
  };

  const animate = () => {
    const { minY, maxY } = getBounds();
    const FRICTION = 0.92;
    const SPRING = 0.18;
    const DAMP = 0.65;
    const STOP = 0.02;

    let { x, y } = posRef.current;
    let vy = velRef.current.y;
    if (y <= maxY && y >= minY) vy *= FRICTION;
    if (y > maxY) { vy += (maxY - y) * SPRING; vy *= DAMP; }
    if (y < minY) { vy += (minY - y) * SPRING; vy *= DAMP; }

    y += vy;
    posRef.current = { x, y };
    velRef.current = { x: 0, y: vy };
    writeTransform();

    const settled = Math.abs(vy) < STOP && y <= maxY && y >= minY;
    if (settled) {
      rafRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  };

  const detachWindowListeners = () => {
    if (moveHandlerRef.current) {
      window.removeEventListener('pointermove', moveHandlerRef.current);
      window.removeEventListener('pointerup', upHandlerRef.current);
      window.removeEventListener('pointercancel', upHandlerRef.current);
      moveHandlerRef.current = null;
      upHandlerRef.current = null;
    }
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopAnimation();
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      origY: posRef.current.y,
    };
    samplesRef.current = [{ t: performance.now(), y: e.clientY }];
    velRef.current = { x: 0, y: 0 };
    detachWindowListeners();

    const onMove = (ev) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== ev.pointerId) return;
      const { minY, maxY } = getBounds();
      const vp = viewportRef.current;
      const dy = ev.clientY - drag.startY;
      const rawY = drag.origY + dy;
      posRef.current = {
        x: 0,
        y: clampWithRubber(rawY, minY, maxY, vp?.clientHeight || 480),
      };
      writeTransform();
      const now = performance.now();
      const samples = samplesRef.current;
      samples.push({ t: now, y: ev.clientY });
      while (samples.length > 1 && now - samples[0].t > 120) samples.shift();
    };

    const onUp = (ev) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== ev.pointerId) return;
      dragRef.current = null;
      const samples = samplesRef.current;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = Math.max(16, last.t - first.t);
        const FRAME_MS = 16.67;
        velRef.current = {
          x: 0,
          y: ((last.y - first.y) / dt) * FRAME_MS,
        };
      }
      samplesRef.current = [];
      detachWindowListeners();
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    moveHandlerRef.current = onMove;
    upHandlerRef.current = onUp;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    e.preventDefault();
  };

  useEffect(() => () => {
    stopAnimation();
    detachWindowListeners();
  }, []);

  return (
    <div className="mw-ainbox-scroller" ref={viewportRef} onPointerDown={onPointerDown}>
      <div
        className="mw-ainbox-scroller-canvas"
        ref={canvasRef}
        style={{ transform: `translate3d(0, ${topInset}px, 0)` }}
      >
        {children}
      </div>
    </div>
  );
}

function AinboxSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`mw-ainbox-section ${open ? 'mw-ainbox-section-open' : ''}`}>
      <button
        type="button"
        className="mw-ainbox-section-header"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mw-ainbox-section-caret" aria-hidden="true">
          <ChevronIcon size={10} />
        </span>
        <span className="mw-ainbox-section-title">{title}</span>
        <ArrowIcon />
      </button>
      {open && (
        <div className="mw-ainbox-section-list">
          {children}
        </div>
      )}
    </div>
  );
}
