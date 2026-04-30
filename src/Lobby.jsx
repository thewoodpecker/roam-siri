import React, { useState, useRef, useEffect } from 'react';
import './Lobby.css';
import LobbyInsights from './LobbyInsights';
import LobbyDetail, { NAV_SECTIONS as DETAIL_NAV_SECTIONS } from './LobbyDetail';

const THUMBS = ['/lobby/lobby-thumb.png', '/lobby/lobby-green.png', '/lobby/lobby-purple.png'];

const INITIAL_LINKS = [
  { id: 1, name: 'Secret Meeting',   slug: 'ro.am/joe/secret',        duration: '15m', dropIn: true,  hasThumb: true,  active: true  },
  { id: 2, name: '8 Minute Meeting', slug: 'ro.am/joe/8',             duration: '8m',  dropIn: false, hasThumb: false, active: false },
  { id: 3, name: 'Design Studio',    slug: 'ro.am/joe/design-studio', duration: '30m', dropIn: true,  hasThumb: true,  active: false },
  { id: 4, name: 'Meet Joe',         slug: 'ro.am/joe/meet',          duration: '20m', dropIn: true,  hasThumb: true,  active: true  },
];

const INITIAL_HQ_LINKS = [
  { id: 1,  name: "Founder's Tour",                       slug: 'ro.am/roam/founders-tour',           duration: '45m', type: 'Round Robin', dropIn: true,  active: true },
  { id: 2,  name: 'Schedule Your Onboarding',             slug: 'ro.am/roam/scheduleonboarding',      duration: '15m', type: 'Round Robin', dropIn: true,  active: true },
  { id: 3,  name: 'Activate Your Roam',                   slug: 'ro.am/roam/activateroam',            duration: '30m', type: 'Round Robin', dropIn: true,  active: true },
  { id: 4,  name: 'Meeting with Team Roam',               slug: 'ro.am/roam/enterprise',              duration: '60m', type: 'Collective',  dropIn: true,  active: true },
  { id: 5,  name: "Roam HQ's Lobby",                      slug: 'ro.am/roam/calendar',                duration: '20m', type: 'Collective',  dropIn: true,  active: true },
  { id: 6,  name: 'Activate Your Roam from Founders Lounge', slug: 'ro.am/roam/founderslounge',       duration: '30m', type: 'Round Robin', dropIn: false, active: true },
  { id: 7,  name: 'Talk to an Expert',                    slug: 'ro.am/roam/talktoroamgineer',        duration: '25m', type: 'Round Robin', dropIn: true,  active: true },
  { id: 8,  name: 'Roam HQ Recruiting',                   slug: 'ro.am/roam/recruiting',              duration: '45m', type: 'Round Robin', dropIn: true,  active: true },
  { id: 9,  name: 'Activate Your Roam',                   slug: 'ro.am/roam/activateyourroam',        duration: '30m', type: 'Round Robin', dropIn: true,  active: true },
  { id: 10, name: 'Activate Your Roam from SaaStock',     slug: 'ro.am/roam/activateyourroam-saastock', duration: '15m', type: 'Round Robin', dropIn: true,  active: false },
  { id: 11, name: 'Full Team Orientation',                slug: 'ro.am/roam/tallinger',               duration: '90m', type: 'Collective',  dropIn: false, active: true },
  { id: 12, name: "Roam HQ's Round Robin",                slug: 'ro.am/roam/ghostbusters',            duration: '10m', type: 'Round Robin', dropIn: true,  active: true },
];

const SCHEDULE = [
  {
    day: 'Mon', date: '11', today: true,
    events: [
      { id: 1, time: '9:00 - 11:30 AM', name: 'Jon Snow',      meeting: "Secret Meeting",   slug: 'ro.am/joe/secret' },
      { id: 2, time: '12:30 - 1:30 PM', name: 'Annette Black', meeting: '8 Minute Meeting', slug: 'ro.am/joe/8' },
      { id: 3, time: '3:30 - 4:30 PM',  name: 'Eleanor Pena',  meeting: 'Design Studio',    slug: 'ro.am/joe/design-studio' },
      { id: 4, time: '6:30 - 8:30 PM',  name: 'Jacob Jones',   meeting: 'Meet Joe',         slug: 'ro.am/joe/meet' },
    ],
  },
  {
    day: 'Tue', date: '12',
    events: [
      { id: 5, time: '9:00 - 11:30 AM', name: 'Brooklyn Simmons', meeting: 'Design Studio',    slug: 'ro.am/joe/design-studio' },
      { id: 6, time: '12:30 - 1:30 PM', name: 'Kristin Watson',   meeting: 'Secret Meeting',   slug: 'ro.am/joe/secret' },
      { id: 7, time: '3:30 - 4:30 PM',  name: 'Floyd Miles',      meeting: 'Design Review',    slug: 'ro.am/joe/design-review' },
    ],
  },
  {
    day: 'Wed', date: '13',
    events: [
      { id: 8, time: '10:00 - 11:00 AM', name: 'Cameron Williamson', meeting: '8 Minute Meeting', slug: 'ro.am/joe/8' },
      { id: 9, time: '2:00 - 3:00 PM',   name: 'Savannah Nguyen',    meeting: 'Meet Joe',         slug: 'ro.am/joe/meet' },
    ],
  },
];

const NAV_ITEMS = [
  { key: 'my-links',     label: 'My Links',          icon: LobbySignIcon },
  { key: 'hq-links',     label: 'Company Links',     icon: LinkIcon      },
  { key: 'schedule',     label: 'Schedule',          icon: CalendarIcon  },
  { key: 'insights',     label: 'Insights',          icon: InsightsIcon  },
  { key: 'calendar-settings', label: 'Calendar Settings', icon: SettingsIcon },
];

function LobbySignIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C8.55228 1 9 1.44772 9 2C9 2.24377 8.91154 2.46613 8.7666 2.63965L10.7344 5H11.5996C12.4393 5 12.8598 4.99981 13.1807 5.16309C13.4629 5.3069 13.6931 5.53709 13.8369 5.81934C14.0002 6.14015 14 6.56068 14 7.40039V10.5996C14 11.4393 14.0002 11.8598 13.8369 12.1807L13.7783 12.2842C13.6342 12.5191 13.4276 12.7111 13.1807 12.8369L13.0557 12.8906C12.7488 13.0002 12.3348 13 11.5996 13H4.40039L3.84375 12.9971C3.43727 12.9907 3.16355 12.9689 2.94434 12.8906L2.81934 12.8369C2.53709 12.6931 2.3069 12.4629 2.16309 12.1807C1.99981 11.8598 2 11.4393 2 10.5996V7.40039C2 6.66516 1.99978 6.2512 2.10938 5.94434L2.16309 5.81934C2.28891 5.57239 2.48088 5.3658 2.71582 5.22168L2.81934 5.16309C3.05992 5.04064 3.35641 5.01059 3.84375 5.00293L4.40039 5H5.26562L6.58594 3.41406C6.82582 3.65391 7.1267 3.83122 7.46289 3.9248L6.56738 5H9.43262L7.73535 2.96289C7.31172 2.84672 7 2.46051 7 2C7 1.44772 7.44772 1 8 1ZM4.40039 6C3.96385 6 3.69606 6.00124 3.49609 6.01758C3.40312 6.02518 3.34671 6.03394 3.3125 6.04199C3.29649 6.04576 3.28673 6.04982 3.28125 6.05176C3.27677 6.05336 3.27423 6.0543 3.27344 6.05469C3.17936 6.10262 3.10262 6.17936 3.05469 6.27344C3.0543 6.27423 3.05336 6.27677 3.05176 6.28125C3.04982 6.28673 3.04576 6.29649 3.04199 6.3125C3.03394 6.34671 3.02518 6.40312 3.01758 6.49609C3.00124 6.69605 3 6.96385 3 7.40039V10.5996C3 11.0361 3.00124 11.3039 3.01758 11.5039C3.02518 11.5969 3.03394 11.6533 3.04199 11.6875C3.04576 11.7035 3.04982 11.7133 3.05176 11.7188C3.05336 11.7232 3.0543 11.7258 3.05469 11.7266C3.10262 11.8206 3.17936 11.8974 3.27344 11.9453C3.27423 11.9457 3.27677 11.9466 3.28125 11.9482C3.28673 11.9502 3.29649 11.9542 3.3125 11.958C3.34671 11.9661 3.40312 11.9748 3.49609 11.9824C3.69605 11.9988 3.96385 12 4.40039 12H11.5996C12.0361 12 12.3039 11.9988 12.5039 11.9824C12.5969 11.9748 12.6533 11.9661 12.6875 11.958C12.7035 11.9542 12.7133 11.9502 12.7188 11.9482C12.7232 11.9466 12.7258 11.9457 12.7266 11.9453C12.8206 11.8974 12.8974 11.8206 12.9453 11.7266C12.9457 11.7258 12.9466 11.7232 12.9482 11.7188C12.9502 11.7133 12.9542 11.7035 12.958 11.6875C12.9661 11.6533 12.9748 11.5969 12.9824 11.5039C12.9988 11.3039 13 11.0361 13 10.5996V7.40039C13 6.96385 12.9988 6.69605 12.9824 6.49609C12.9748 6.40312 12.9661 6.34671 12.958 6.3125C12.9542 6.29649 12.9502 6.28673 12.9482 6.28125C12.9466 6.27677 12.9457 6.27423 12.9453 6.27344C12.8974 6.17936 12.8206 6.10262 12.7266 6.05469C12.7258 6.0543 12.7232 6.05336 12.7188 6.05176C12.7133 6.04982 12.7035 6.04576 12.6875 6.04199C12.6533 6.03394 12.5969 6.02518 12.5039 6.01758C12.3039 6.00124 12.0361 6 11.5996 6H4.40039Z" fill="currentColor" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.23223 3.40371C7.98959 1.64635 10.8388 1.64635 12.5962 3.40371C14.3536 5.16107 14.3536 8.01031 12.5962 9.76767L12.2426 10.1212C12.0474 10.3165 11.7308 10.3165 11.5355 10.1212C11.3403 9.92596 11.3403 9.60938 11.5355 9.41412L11.8891 9.06057C13.2559 7.69373 13.2559 5.47765 11.8891 4.11082C10.5223 2.74398 8.30617 2.74398 6.93934 4.11082L6.58578 4.46437C6.39052 4.65964 6.07394 4.65964 5.87868 4.46437C5.68342 4.26911 5.68342 3.95253 5.87868 3.75727L6.23223 3.40371ZM10.1213 5.87859C10.3166 6.07385 10.3166 6.39043 10.1213 6.58569L6.58578 10.1212C6.39052 10.3165 6.07394 10.3165 5.87868 10.1212C5.68342 9.92597 5.68342 9.60938 5.87868 9.41412L9.41421 5.87859C9.60947 5.68332 9.92606 5.68332 10.1213 5.87859ZM4.46446 5.87859C4.65973 6.07385 4.65973 6.39043 4.46446 6.58569L4.11091 6.93925C2.74408 8.30608 2.74408 10.5222 4.11091 11.889C5.47775 13.2558 7.69382 13.2558 9.06066 11.889L9.41421 11.5354C9.60947 11.3402 9.92606 11.3402 10.1213 11.5354C10.3166 11.7307 10.3166 12.0473 10.1213 12.2425L9.76777 12.5961C8.01041 14.3535 5.16116 14.3535 3.4038 12.5961C1.64644 10.8387 1.64645 7.9895 3.4038 6.23214L3.75736 5.87859C3.95262 5.68332 4.2692 5.68332 4.46446 5.87859Z" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M6 1C6 0.723858 5.77614 0.5 5.5 0.5C5.22386 0.5 5 0.723858 5 1V1.50544C4.74737 1.51019 4.52097 1.51908 4.31729 1.53572C3.86949 1.57231 3.48765 1.64884 3.13803 1.82698C2.57354 2.1146 2.1146 2.57354 1.82698 3.13803C1.64884 3.48765 1.57231 3.86949 1.53572 4.31729C1.52097 4.4978 1.51231 4.69616 1.50723 4.91481C1.50248 4.94249 1.5 4.97096 1.5 5C1.5 5.02234 1.50147 5.04434 1.5043 5.0659C1.5 5.33871 1.5 5.64139 1.5 5.97812V10.0219C1.5 10.7034 1.49999 11.2454 1.53572 11.6827C1.57231 12.1305 1.64884 12.5123 1.82698 12.862C2.1146 13.4265 2.57354 13.8854 3.13803 14.173C3.48765 14.3512 3.86949 14.4277 4.31729 14.4643C4.75457 14.5 5.29657 14.5 5.97806 14.5H10.0219C10.7034 14.5 11.2454 14.5 11.6827 14.4643C12.1305 14.4277 12.5123 14.3512 12.862 14.173C13.4265 13.8854 13.8854 13.4265 14.173 12.862C14.3512 12.5123 14.4277 12.1305 14.4643 11.6827C14.5 11.2454 14.5 10.7034 14.5 10.0219V5.97811C14.5 5.6414 14.5 5.3387 14.4957 5.0659C14.4985 5.04434 14.5 5.02234 14.5 5C14.5 4.97096 14.4975 4.9425 14.4928 4.91481C14.4877 4.69616 14.479 4.4978 14.4643 4.31729C14.4277 3.86949 14.3512 3.48765 14.173 3.13803C13.8854 2.57354 13.4265 2.1146 12.862 1.82698C12.5123 1.64884 12.1305 1.57231 11.6827 1.53572C11.479 1.51908 11.2526 1.51019 11 1.50544V1C11 0.723858 10.7761 0.5 10.5 0.5C10.2239 0.5 10 0.723858 10 1V1.5H6V1ZM13.475 4.5C13.4728 4.46543 13.4703 4.43169 13.4676 4.39872C13.4361 4.01276 13.3764 3.77717 13.282 3.59202C13.0903 3.21569 12.7843 2.90973 12.408 2.71799C12.2228 2.62365 11.9872 2.56393 11.6013 2.5324C11.4257 2.51806 11.2282 2.51006 11 2.50561V3C11 3.27614 10.7761 3.5 10.5 3.5C10.2239 3.5 10 3.27614 10 3V2.5H6V3C6 3.27614 5.77614 3.5 5.5 3.5C5.22386 3.5 5 3.27614 5 3V2.50561C4.77176 2.51006 4.57426 2.51806 4.39872 2.5324C4.01276 2.56393 3.77717 2.62365 3.59202 2.71799C3.21569 2.90973 2.90973 3.21569 2.71799 3.59202C2.62365 3.77717 2.56393 4.01276 2.5324 4.39872C2.52971 4.43169 2.52724 4.46543 2.52497 4.5H13.475ZM2.50058 5.5C2.50003 5.65443 2.5 5.82057 2.5 6V10C2.5 10.7083 2.50039 11.2095 2.5324 11.6013C2.56393 11.9872 2.62365 12.2228 2.71799 12.408C2.90973 12.7843 3.21569 13.0903 3.59202 13.282C3.77717 13.3764 4.01276 13.4361 4.39872 13.4676C4.79052 13.4996 5.29168 13.5 6 13.5H10C10.7083 13.5 11.2095 13.4996 11.6013 13.4676C11.9872 13.4361 12.2228 13.3764 12.408 13.282C12.7843 13.0903 13.0903 12.7843 13.282 12.408C13.3764 12.2228 13.4361 11.9872 13.4676 11.6013C13.4996 11.2095 13.5 10.7083 13.5 10V6C13.5 5.82057 13.5 5.65443 13.4994 5.5H2.50058Z" fill="currentColor" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2V12.6667C2 13.0203 2.14048 13.3594 2.39052 13.6095C2.64057 13.8595 2.97971 14 3.33333 14H14" stroke="currentColor" strokeWidth="1.133" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11.3333V6" stroke="currentColor" strokeWidth="1.133" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.66666 11.3333V3.33325" stroke="currentColor" strokeWidth="1.133" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33334 11.3333V9.33325" stroke="currentColor" strokeWidth="1.133" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.18725 2C5.27239 2 4.4306 2.49972 3.99251 3.30287L2.08342 6.80287C1.67641 7.54906 1.67641 8.45094 2.08342 9.19713L3.99251 12.6971C4.4306 13.5003 5.27239 14 6.18725 14H9.81272C10.7276 14 11.5694 13.5003 12.0075 12.6971L13.9165 9.19713C14.3236 8.45094 14.3236 7.54906 13.9165 6.80287L12.0075 3.30287C11.5694 2.49972 10.7276 2 9.81272 2H6.18725ZM4.87041 3.78172C5.13326 3.29983 5.63834 3 6.18725 3H9.81272C10.3616 3 10.8667 3.29983 11.1296 3.78172L13.0387 7.28172C13.2829 7.72944 13.2829 8.27056 13.0387 8.71828L11.1296 12.2183C10.8667 12.7002 10.3616 13 9.81272 13H6.18725C5.63834 13 5.13326 12.7002 4.87041 12.2183L2.96132 8.71828C2.71711 8.27056 2.71711 7.72944 2.96132 7.28172L4.87041 3.78172ZM6.99996 8C6.99996 7.44772 7.44768 7 7.99996 7C8.55225 7 8.99996 7.44772 8.99996 8C8.99996 8.55228 8.55225 9 7.99996 9C7.44768 9 6.99996 8.55228 6.99996 8ZM7.99996 6C6.89539 6 5.99996 6.89543 5.99996 8C5.99996 9.10457 6.89539 10 7.99996 10C9.10453 10 9.99996 9.10457 9.99996 8C9.99996 6.89543 9.10453 6 7.99996 6Z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7 2.5C4.51472 2.5 2.5 4.51472 2.5 7C2.5 9.48528 4.51472 11.5 7 11.5C8.11 11.5 9.12488 11.1015 9.90796 10.4397L12.2341 12.7658C12.4293 12.9611 12.7459 12.9611 12.9412 12.7658C13.1365 12.5706 13.1365 12.254 12.9412 12.0587L10.6151 9.73264C11.1527 9.00212 11.5 8.1087 11.5 7C11.5 4.51472 9.48528 2.5 7 2.5ZM3.5 7C3.5 5.067 5.067 3.5 7 3.5C8.933 3.5 10.5 5.067 10.5 7C10.5 8.933 8.933 10.5 7 10.5C5.067 10.5 3.5 8.933 3.5 7Z" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M8 5.5V8L9.5 9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function DropInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 2H14V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2L8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 4H4C2.89543 4 2 4.89543 2 6V12C2 13.1046 2.89543 14 4 14H10C11.1046 14 12 13.1046 12 12V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="3.5" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="12.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function EllipsisHIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RoundRobinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M11 2L13.5 4.5L11 7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollectiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2 12C2 9.79086 3.79086 8 6 8C8.20914 8 10 9.79086 10 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="11" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10 8.5C10.9 8.2 12 8.5 13 9.5C13.7 10.2 14 11.1 14 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function Badge({ label }) {
  return (
    <div className="lb-badge">
      <span className="lb-badge-label">{label}</span>
    </div>
  );
}

function Toggle({ active, onChange }) {
  return (
    <button
      type="button"
      className={`lb-toggle ${active ? 'lb-toggle-on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
    >
      <span className="lb-toggle-knob" />
    </button>
  );
}

export default function Lobby({ win, onDrag, initialNav = 'my-links', initialSelectedLinkId = null, initialDetailSection = 'design', initialLinks = null, scrollDetailToBottom = false }) {
  const [closing, setClosing] = useState(false);
  const [activeNav, setActiveNav] = useState(initialNav);
  const [links, setLinks] = useState(initialLinks || INITIAL_LINKS);
  const [hqLinks, setHqLinks] = useState(INITIAL_HQ_LINKS);
  const [selectedLink, setSelectedLink] = useState(() => {
    if (initialSelectedLinkId == null) return null;
    const pool = initialNav === 'hq-links' ? INITIAL_HQ_LINKS : (initialLinks || INITIAL_LINKS);
    return pool.find((l) => l.id === initialSelectedLinkId) || null;
  });
  const [detailSection, setDetailSection] = useState(initialDetailSection);
  const [isCompact, setIsCompact] = useState(false);
  const winRef = useRef(null);

  useEffect(() => {
    if (!winRef.current) return;
    const el = winRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setIsCompact(w < 780);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);

  const toggleLink = (id) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  };

  const toggleHqLink = (id) => {
    setHqLinks((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  };

  const headerLabel =
    activeNav === 'hq-links' ? 'Company Links' :
    activeNav === 'schedule' ? 'Schedule' :
    activeNav === 'insights' ? 'Insights' :
    activeNav === 'calendar-settings' ? 'Calendar Settings' :
    'My Links';

  return (
    <div
      ref={winRef}
      className={`lb-win ${!win.isFocused ? 'lb-win-unfocused' : ''} ${closing ? 'lb-win-closing' : ''} ${isCompact ? 'lb-win-compact' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      {/* Sidebar — blur bg */}
      <aside className="lb-sidebar" onMouseDown={onDrag}>
        <div className="lb-lights">
          <div className="lb-light lb-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="lb-light lb-light-min" />
          <div className="lb-light lb-light-max" />
        </div>
        {isCompact && selectedLink ? (
          <nav className="lb-nav lb-nav-sections">
            {DETAIL_NAV_SECTIONS.map(({ key, label, subtitle, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`lb-nav-item lb-nav-item-section ${detailSection === key ? 'lb-nav-item-active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setDetailSection(key); }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Icon />
                <span className="lb-nav-section-text">
                  <span className="lb-nav-section-label">{label}</span>
                  <span className="lb-nav-section-sub">{subtitle(selectedLink.slug)}</span>
                </span>
              </button>
            ))}
          </nav>
        ) : (
          <nav className="lb-nav">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`lb-nav-item ${activeNav === key ? 'lb-nav-item-active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveNav(key); setSelectedLink(null); }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* Main — elevated primary */}
      <main className="lb-main">
        {selectedLink ? (
          <LobbyDetail
            link={selectedLink}
            onBack={() => setSelectedLink(null)}
            onDrag={onDrag}
            compact={isCompact}
            activeSection={detailSection}
            setActiveSection={setDetailSection}
            scrollToBottom={scrollDetailToBottom}
          />
        ) : (
        <>
        <header className="lb-header" onMouseDown={onDrag}>
          <h1 className="lb-header-title">{headerLabel}</h1>
          <div className="lb-header-actions">
            {activeNav === 'schedule' ? (
              <div className="lb-month-nav" onMouseDown={(e) => e.stopPropagation()}>
                <span className="lb-month-label">September <span className="lb-month-year">2024</span></span>
                <button type="button" className="lb-icon-btn lb-icon-btn-sm"><ChevronLeftIcon /></button>
                <button type="button" className="lb-icon-btn lb-icon-btn-sm"><ChevronRightIcon /></button>
              </div>
            ) : activeNav === 'insights' ? (
              <button type="button" className="lb-range-btn" onMouseDown={(e) => e.stopPropagation()}>
                <span>Last 30 Days</span>
                <span className="lb-range-chevron">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            ) : (
              <>
                <button type="button" className="lb-search-btn" onMouseDown={(e) => e.stopPropagation()}>
                  <SearchIcon />
                  <span>Search</span>
                </button>
                <button type="button" className="lb-new-btn" onMouseDown={(e) => e.stopPropagation()}>
                  <PlusIcon />
                  <span>New</span>
                </button>
              </>
            )}
          </div>
        </header>

        {activeNav === 'my-links' || activeNav === 'hq-links' ? (
          <div className="lb-list">
            {(activeNav === 'hq-links' ? hqLinks.slice(0, 3) : links).map((link) => (
              <div key={link.id} className="lb-card" onClick={() => setSelectedLink(link)}>
                <div className="lb-thumb">
                  <img src={link.thumb || (activeNav === 'hq-links' ? (link.id === 2 ? '/lobby/lobby-green.png' : '/lobby/lobby-thumb.png') : THUMBS[link.id % THUMBS.length])} alt="" />
                </div>
                <div className="lb-card-info">
                  <div className="lb-card-title-row">
                    <span className="lb-card-name">{link.name}</span>
                    <span className="lb-card-slug">{link.slug}</span>
                  </div>
                  <div className="lb-card-badges">
                    <Badge icon={ClockIcon} label={link.duration} />
                    {link.type && (
                      <Badge
                        icon={link.type === 'Round Robin' ? RoundRobinIcon : CollectiveIcon}
                        label={link.type}
                      />
                    )}
                    {link.dropIn && <Badge icon={DropInIcon} label="Drop-In" />}
                  </div>
                </div>
                <div className="lb-card-actions">
                  <Toggle
                    active={link.active}
                    onChange={() => (activeNav === 'hq-links' ? toggleHqLink(link.id) : toggleLink(link.id))}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : activeNav === 'calendar-settings' ? (
          <div className="lb-calsettings">
            {[{ email: 'joe@ro.am' }, { email: 'joe.c.woodward@gmail.com' }].map((c) => (
              <div key={c.email} className="lb-calsettings-row">
                <div className="lb-calsettings-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.07989 2 5.2 2H7V22H5.2C4.0799 22 3.51984 22 3.09202 21.782C2.71569 21.5903 2.40973 21.2843 2.21799 20.908C2 20.4802 2 19.9201 2 18.8V5.2Z" fill="#1E88E5"/>
                    <path d="M2 17H17V22H5.2C4.07989 22 3.51984 22 3.09202 21.782C2.71569 21.5903 2.40973 21.2843 2.21799 20.908C2 20.4802 2 19.9201 2 18.8V17Z" fill="#FBC02D"/>
                    <path d="M2 5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.07989 2 5.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.07989 22 5.2V7H2V5.2Z" fill="#1E88E5"/>
                    <path d="M17 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V7H17V2Z" fill="#1565C0"/>
                    <path d="M17 7H22V17H17V7Z" fill="#4CAF50"/>
                    <path d="M22 17H17V22L22 17Z" fill="#E53935"/>
                  </svg>
                </div>
                <div className="lb-calsettings-info">
                  <span className="lb-calsettings-title">Google Calendar</span>
                  <span className="lb-calsettings-email">{c.email}</span>
                  <span className="lb-calsettings-status">Checking 1 calendar</span>
                </div>
                <svg className="lb-calsettings-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        ) : activeNav === 'insights' ? (
          <LobbyInsights />
        ) : activeNav === 'schedule' ? (
          <div className="lb-schedule">
            {SCHEDULE.map((day) => (
              <div key={day.date} className="lb-schedule-day">
                <div className="lb-schedule-date-col">
                  <span className="lb-schedule-dow">{day.day}</span>
                  <span className={`lb-schedule-date ${day.today ? 'lb-schedule-date-today' : ''}`}>
                    {day.date}
                  </span>
                </div>
                <div className="lb-schedule-events">
                  {day.events.map((ev) => (
                    <div key={ev.id} className="lb-schedule-event">
                      <div className="lb-schedule-event-info">
                        <div className="lb-schedule-event-title">
                          <span className="lb-schedule-event-name">{ev.name}</span>
                          <span className="lb-schedule-event-meeting">{ev.meeting}</span>
                        </div>
                        <span className="lb-schedule-event-slug">{ev.slug}</span>
                      </div>
                      <span className="lb-schedule-event-time">{ev.time}</span>
                      <div className="lb-schedule-thumb">
                        <img src={THUMBS[ev.id % THUMBS.length]} alt="" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="lb-empty">Coming soon.</div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
