import React, { useEffect, useMemo, useRef, useState } from 'react';
import ShowcaseMap from './ShowcaseMap';

function RightControls({ theme, onToggleTheme, showGrid, onToggleGrid }) {
  return (
    <div className="sc-right-controls">
      <div className="sc-theme-capsule" onClick={onToggleTheme}>
        <div className={`sc-theme-capsule-knob ${theme === 'light' ? 'bottom' : ''}`} />
        <div className={`sc-theme-capsule-icon ${theme === 'dark' ? 'active' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 8.5C13.3 12.1 10 14.5 6.5 13.5C3 12.5 1 9.5 2 6C2.8 3.2 5.5 1.5 8.5 2C7 3.5 6.5 6 8 8.5C9 10 11 11 14 8.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className={`sc-theme-capsule-icon ${theme === 'light' ? 'active' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M8 2V3.5M8 12.5V14M2 8H3.5M12.5 8H14M3.8 3.8L4.8 4.8M11.2 11.2L12.2 12.2M3.8 12.2L4.8 11.2M11.2 4.8L12.2 3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        </div>
      </div>
      <div className="sc-grid-capsule" onClick={onToggleGrid} title="Toggle 12-column grid">
        <div className={`sc-grid-capsule-knob ${showGrid ? 'on' : ''}`} />
        <div className={`sc-grid-capsule-icon ${!showGrid ? 'active' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" strokeWidth="1.3" rx="1.5" /></svg>
        </div>
        <div className={`sc-grid-capsule-icon ${showGrid ? 'active' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" strokeWidth="1.3" rx="1.5" /><path d="M6 2.5V13.5M10 2.5V13.5M2.5 6H13.5M2.5 10H13.5" stroke="currentColor" strokeWidth="1" /></svg>
        </div>
      </div>
    </div>
  );
}
import Navbar from './Navbar';
import AInbox, { TypingIndicator } from './AInbox';
import MeetingWindow from './MeetingWindow';
import TheaterWindow from './TheaterWindow';
import MagicMinutes from './MagicMinutes';
import Lobby from './Lobby';
import OnAir from './OnAir';
import { WindowManagerProvider } from './WindowManager';
import { ChatProvider } from './ChatContext';
import './FeaturePage.css';

const JOE = { name: 'Joe W.', fullName: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' };

const videoPerson = (name, folder, full) => ({
  name,
  fullName: full,
  avatar: `/videos/${folder}/${name.toLowerCase().replace(/\s+/g, '_')}.png`,
  video: `/videos/${folder}/${name.toLowerCase().replace(/\s+/g, '_')}.mp4`,
});

const VIDEO_SPEAKERS = [
  videoPerson('Emily Carter', 'Female', 'Emily Carter'),
  videoPerson('Lauren Hayes', 'Female', 'Lauren Hayes'),
  videoPerson('Ashley Brooks', 'Female', 'Ashley Brooks'),
  videoPerson('Hannah Bennett', 'Female', 'Hannah Bennett'),
  videoPerson('Mia Chen', 'Female', 'Mia Chen'),
  videoPerson('Ethan Bishop', 'Male', 'Ethan Bishop'),
  videoPerson('Sarah Mitchell', 'Female', 'Sarah Mitchell'),
  videoPerson('Olivia Sanders', 'Female', 'Olivia Sanders'),
];

const INITIAL_WINDOWS = [
  { id: 'ainbox', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'meeting', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'theater', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'magicminutes', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'lobby', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
  { id: 'onair', isOpen: true, position: { x: 0, y: 0 }, zIndex: 1 },
];

/* ===== Visual slots — mini previews using actual product components ===== */
const noopWin = (id) => ({
  id, isOpen: true, isFocused: true, position: { x: 0, y: 0 }, zIndex: 1,
  open: () => {}, close: () => {}, requestClose: () => {}, focus: () => {}, move: () => {},
});

function MeetingPreview({ roomName = 'Daily Standup' }) {
  return (
    <MeetingWindow
      win={noopWin('meeting')}
      onDrag={() => {}}
      roomName={roomName}
      people={VIDEO_SPEAKERS}
      onOpenChat={() => {}}
      onOpenOnAir={() => {}}
    />
  );
}

function TheaterPreview() {
  return (
    <TheaterWindow
      win={noopWin('theater')}
      onDrag={() => {}}
      speakers={VIDEO_SPEAKERS.slice(0, 2)}
      audience={VIDEO_SPEAKERS}
      me={JOE}
      onOpenChat={() => {}}
    />
  );
}

const AINBOX_AH_FAVORITES = [
  { id: 'howard', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'grace', name: 'Grace', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
  { id: 'all-hands', name: 'All-Hands', avatar: '/groups/Group Roam.png', type: 'group' },
];

const AINBOX_AH_SECTIONS = [
  {
    id: 'dms', label: 'Direct Messages',
    items: [
      { id: 'howard', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
      { id: 'grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
      { id: 'klas', name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', type: 'dm' },
      { id: 'chelsea', name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', type: 'dm' },
      { id: 'derek', name: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', type: 'dm' },
      { id: 'will', name: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', type: 'dm' },
      { id: 'jeff', name: 'Jeff Grossman', avatar: '/headshots/jeff-grossman.jpg', type: 'dm' },
    ],
  },
  {
    id: 'meetings', label: 'Meetings',
    items: [
      { id: 'meet-board', name: 'Board Prep', type: 'meeting' },
      { id: 'meet-q2', name: 'Q2 Planning', type: 'meeting' },
    ],
  },
  {
    id: 'groups', label: 'My Groups',
    items: [
      { id: 'all-hands', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'exec', name: 'Exec', groupImg: '/groups/Group Exec.png', type: 'group', memberCount: 7 },
      { id: 'gtm', name: 'GTM', groupImg: '/groups/Group GTM.png', type: 'group', memberCount: 9 },
      { id: 'cx', name: 'Customer Experience', groupImg: '/groups/Group CX.png', type: 'group', memberCount: 6 },
      { id: 'features', name: 'Product', groupImg: '/groups/Group Features.png', type: 'group', memberCount: 8 },
    ],
  },
  {
    id: 'threads', label: 'Threads',
    items: [
      { id: 'thread-ah-1', name: 'Team — what a quarter…', type: 'thread', threadRef: { chatId: 'all-hands', messageId: 1 } },
    ],
  },
];

const AINBOX_AH_MESSAGES = {
  'all-hands': {
    type: 'group', name: 'All-Hands', memberCount: 45,
    groupImg: '/groups/Group Roam.png',
    avatars: ['/headshots/howard-lerman.jpg', '/headshots/jon-brod.jpg', '/headshots/grace-sutherland.jpg'],
    pinnedItems: [
      { label: 'Q1 Recap', emoji: null, avatar: '/groups/Group Roam.png' },
      { label: 'Roadmap', emoji: null, avatar: '/groups/Group Features.png' },
    ],
    messages: [
      {
        id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 9:02 AM',
        text: "Team — what a quarter. We crossed 50,000 daily active users this week, up 3x since January. The product is resonating, the team is shipping faster than ever, and the energy across the office is unreal. Customers are telling us Roam has changed how their company works. This is the moment we've been building toward — and we're just getting started. Thank you for the relentless work. Q2 is going to be even bigger.",
        thread: {
          count: 8, lastReply: 'today 11:42 AM',
          replies: [
            { id: 'r1', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "What a milestone. The team's velocity this quarter has been extraordinary — and the customer love is real. Onward." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "So proud of everyone. The product feels alive in a way it didn't six months ago. 🙌" },
            { id: 'r3', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "3x growth and the infra didn't blink. Huge credit to the platform team — and to everyone shipping faster than I can review PRs." },
            { id: 'r4', sender: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', text: "The product depth we've added this quarter is wild. Drop-Ins alone has changed how I work every day." },
            { id: 'r5', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Customers keep telling me Roam is the first tool that actually feels like an office. We're onto something." },
            { id: 'r6', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Massive quarter. Q2 roadmap looks even more exciting — let's keep the momentum." },
            { id: 'r7', sender: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', text: "GTM pipeline is overflowing. The inbound has 4x'd since the relaunch. Get ready." },
            { id: 'r8', sender: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', text: "Best team I've ever worked with. Excited for what's next." },
          ],
        },
      },
      {
        id: 2, sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: 'Today 9:14 AM',
        text: "Quick add: revenue is tracking ahead of plan, NPS is up 12 points QoQ, and we just closed three of our biggest enterprise deals to date. Sales team — extraordinary work.",
      },
      {
        id: 3, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Today 9:31 AM',
        text: "The brand refresh is landing this Friday. New site, new product UI polish, new launch video. Get ready for the wave.",
      },
      {
        id: 4, sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: 'Today 10:05 AM',
        text: "Reminder: company offsite is May 14–16 in Charleston. Travel details going out tomorrow. Bring a swimsuit.",
      },
      {
        id: 5, sender: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', time: 'Today 10:48 AM',
        text: "Closing out a 7-figure deal this afternoon — first one of the quarter. Will drop a 🎉 in #wins when it's signed.",
      },
    ],
  },

  howard: {
    type: 'dm', name: 'Howard Lerman', subtitle: 'CEO of Roam',
    avatar: '/headshots/howard-lerman.jpg',
    messages: [
      { id: 1, self: false, text: "Saw the Q1 numbers — extraordinary. The growth curve is finally bending the right way." },
      { id: 2, self: true, text: "Yeah, the team has been heads down all quarter. The Drop-Ins launch really moved the needle." },
      { id: 3, self: false, text: "It's the whole package. Drop-Ins, the AInbox, the Theater redesign — the product finally feels like one thing instead of five." },
      { id: 4, self: true, text: "Agreed. What do you want to push hardest in Q2?" },
      { id: 5, self: false, text: "Magic Minutes. Every demo I do, the moment people realize the meeting writes itself, they sign. We need to lean all the way in." },
      { id: 6, self: true, text: "Makes sense. I'll align the roadmap around that this week." },
      { id: 7, self: false, text: "Perfect. Let's catch up Friday — I want to walk through the Q2 OKRs together before we ship them." },
    ],
  },

  features: {
    type: 'group', name: 'Product', memberCount: 8,
    groupImg: '/groups/Group Features.png',
    avatars: ['/headshots/chelsea-turbin.jpg', '/headshots/jon-brod.jpg', '/headshots/grace-sutherland.jpg'],
    messages: [
      {
        id: 1, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Today 2:14 PM',
        text: "Final Q2 board deck — please review before Thursday. Feedback welcome.",
        attachment: {
          type: 'pdf',
          name: 'Roam — Q2 Board Deck.pdf',
          pages: 24,
          size: '3.8 MB',
        },
        reactions: [
          { emoji: '📊', count: 6, active: true },
          { emoji: '📈', count: 4 },
          { emoji: '👀', count: 5 },
          { emoji: '🎯', count: 3 },
          { emoji: '💼', count: 2 },
        ],
        thread: {
          count: 3, lastReply: 'today 2:40 PM',
          replies: [
            { id: 'r1', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Thanks Chelsea. Took a first pass — the growth chart on slide 6 is the right hero. Let's open with it." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Agree. Slide 11 could use a tighter customer quote — I'll swap in the Vercel one by tonight." },
            { id: 'r3', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Looks strong. Add a 'what we're betting on in Q3' closer before we walk in." },
          ],
        },
      },
    ],
  },

  'meet-q2': {
    type: 'meeting', name: 'Q2 Planning', memberCount: 8,
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/howard-lerman.jpg', '/headshots/jon-brod.jpg', '/headshots/grace-sutherland.jpg'],
    messages: [
      {
        id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 10:42 AM',
        text: "Q2 Planning — AInbox ships Friday behind a 10% feature flag. Brand refresh and demo day lock for Friday. Next review Tuesday 10am.",
        thread: {
          count: 6, lastReply: 'today 11:04 AM',
          replies: [
            { id: 'r1', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Clean summary. I'll get the customer-facing release note drafted today." },
            { id: 'r2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Icon pass wraps Thursday EOD. Empty states get the fast-follow." },
            { id: 'r3', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Feature flag is wired. 10% rollout ready to flip Friday morning." },
            { id: 'r4', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Perfect. I'll personally ping the top 10 enterprise accounts over the weekend." },
            { id: 'r5', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Flagging: the new search index could spike read latency during rollout. Infra is pre-warming caches — should be a non-event." },
            { id: 'r6', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "CS is drafting the heads-up email for accounts on the old API. Will share for review tonight." },
          ],
        },
      },
    ],
  },

  jeff: {
    type: 'dm', name: 'Jeff Grossman', subtitle: 'Active now',
    avatar: '/headshots/jeff-grossman.jpg',
    messages: [
      { id: 1, self: false, text: "yo did you see Apple just named a new CEO??" },
      { id: 2, self: true, text: "wait what — just now?" },
      { id: 3, self: false, text: "yep. Tim's stepping up to Chairman. John Ternus is taking over as CEO." },
      { id: 4, self: true, text: "Ternus makes a lot of sense. Hardware guy, ran the iPhone org for years." },
      { id: 5, self: false, text: "exactly. feels very 'safe pair of hands' but also 'we're doubling down on devices'" },
      { id: 6, self: true, text: "curious what this means for the services side. Eddy basically running that show now?" },
      { id: 7, self: false, text: "seems like it. stock popped 3% on the announcement btw" },
      { id: 8, self: true, text: "nice. first proper CEO change in what, 14 years?" },
      { id: 9, self: false, text: "yeah end of an era lol. gonna be a wild all-hands at Apple today" },
    ],
  },
};

const AINBOX_FOLDER_FAVORITES = [
  { id: 'howard-fav', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'all-hands-fav', name: 'All-Hands', avatar: '/groups/Group Roam.png', type: 'group' },
  { id: 'design-fav', name: 'Design', avatar: '/groups/Group Design.png', type: 'group' },
];

const AINBOX_FOLDER_SECTIONS = [
  {
    id: 'this-week', label: '🔥 This Week',
    items: [
      { id: 'all-hands', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'thread-rfc', name: "Klas's RFC — auth rewrite", type: 'thread' },
      { id: 'meet-board', name: 'Board prep — Thursday', type: 'meeting' },
      { id: 'howard', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
    ],
  },
  {
    id: 'inner-circle', label: 'Inner Circle',
    items: [
      { id: 'howard-ic', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
      { id: 'jon-ic', name: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', type: 'dm' },
      { id: 'peter-ic', name: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', type: 'dm' },
      { id: 'exec-ic', name: 'Exec', groupImg: '/groups/Group Exec.png', type: 'group', memberCount: 7 },
    ],
  },
  {
    id: 'customers', label: 'Top Customers',
    items: [
      { id: 'cust-cx', name: 'Customer Experience', groupImg: '/groups/Group CX.png', type: 'group', memberCount: 6 },
      { id: 'cust-1', name: 'Ramp', avatar: '/headshots/john-huffsmith.jpg', type: 'dm' },
      { id: 'cust-2', name: 'Vercel', avatar: '/headshots/keegan-lanzillotta.jpg', type: 'dm' },
      { id: 'cust-3', name: 'Notion', avatar: '/headshots/derek-cicerone.jpg', type: 'dm' },
      { id: 'meet-onsite', name: 'Onsite — Stripe HQ', type: 'meeting' },
    ],
  },
  {
    id: 'reading', label: 'Read on Sunday',
    items: [
      { id: 'thread-r1', name: "Howard's Q2 letter to the team", type: 'thread', threadRef: { chatId: 'all-hands', messageId: 1 } },
      { id: 'thread-r2', name: "Customer feedback digest — March", type: 'thread' },
      { id: 'thread-r3', name: "Pricing experiment — early results", type: 'thread' },
      { id: 'thread-r4', name: "Eng career framework v2 (Klas)", type: 'thread' },
    ],
  },
  {
    id: 'buddies', label: 'Buddies',
    items: [
      { id: 'bud-klas', name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', type: 'dm' },
      { id: 'bud-mattias', name: 'Mattias Leino', avatar: '/headshots/mattias-leino.jpg', type: 'dm' },
      { id: 'bud-chelsea', name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', type: 'dm' },
      { id: 'bud-tom', name: 'Tom Dixon', avatar: '/headshots/tom-dixon.jpg', type: 'dm' },
      { id: 'bud-lexi', name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', type: 'dm' },
      { id: 'bud-will', name: 'Will Houseberry', avatar: '/headshots/will-hou.jpg', type: 'dm' },
    ],
  },
];

function AInboxFoldersPreview() {
  return (
    <div className="fp-folders-stage">
      <div className="fp-folders-window">
        <AInbox
          win={noopWin('ainbox')}
          onDrag={() => {}}
          initialChatId="all-hands"
          sidebarScrollToBottom
          staticMode
          autoAddFolders
          favoritesOverride={AINBOX_FOLDER_FAVORITES}
          sectionsOverride={AINBOX_FOLDER_SECTIONS}
          messagesOverride={AINBOX_AH_MESSAGES}
        />
      </div>
    </div>
  );
}

const JEFF_DM_MESSAGES = [
  { id: 1, self: false, text: "yo did you see Apple just named a new CEO??" },
  { id: 2, self: true, text: "wait what — just now?" },
  { id: 3, self: false, text: "yep. Tim's stepping up to Chairman. John Ternus is taking over as CEO." },
  { id: 4, self: true, text: "Ternus makes a lot of sense. Hardware guy, ran the iPhone org for years." },
  { id: 5, self: false, text: "exactly. feels very 'safe pair of hands' but also 'we're doubling down on devices'" },
  { id: 6, self: true, text: "curious what this means for the services side. Eddy basically running that show now?" },
  { id: 7, self: false, text: "seems like it. stock popped 3% on the announcement btw" },
  { id: 8, self: true, text: "nice. first proper CEO change in what, 14 years?" },
  { id: 9, self: false, text: "yeah end of an era lol. gonna be a wild all-hands at Apple today" },
  { id: 10, self: true, text: "do we know what Tim's actually going to do as Chairman? like day-to-day" },
  { id: 11, self: false, text: "sounds mostly ceremonial — strategy, board stuff, big customer meetings" },
  { id: 12, self: false, text: "basically the Jony Ive playbook. step back but stay the face of the company" },
  { id: 13, self: true, text: "makes sense. he's earned it honestly. 14 years of compounding wins" },
  { id: 14, self: false, text: "no joke. stock's up ~12x under him" },
  { id: 15, self: true, text: "ok so what's the first thing Ternus ships as CEO you think" },
  { id: 16, self: false, text: "i'd bet on the Vision Pro 2. cheaper, lighter, actually consumer-ready" },
  { id: 17, self: true, text: "yep. the Vision team reports into him already right" },
  { id: 18, self: false, text: "yeah for years. that product is basically his baby at this point" },
  { id: 19, self: true, text: "alright i'm calling it — Vision Pro 2 at WWDC, $1999, launches in the fall" },
  { id: 20, self: false, text: "i'll take that bet lol. $50?" },
  { id: 21, self: true, text: "done. winner buys dinner" },
  { id: 22, self: false, text: "🤝" },
];

function DMBubble({ msg, isFirstInGroup }) {
  const radiusIn = isFirstInGroup ? '18px 18px 18px 4px' : '4px 18px 18px 4px';
  const radiusOut = isFirstInGroup ? '20px 20px 4px 20px' : '20px 4px 4px 20px';
  return (
    <div className={`mc-msg ${msg.self ? 'mc-msg-self' : ''} ${!isFirstInGroup ? 'mc-msg-consecutive' : ''}`}>
      <div className={`mc-msg-bubble ${msg.self ? 'mc-msg-bubble-self' : ''}`} style={{ borderRadius: msg.self ? radiusOut : radiusIn }}>
        <p>{msg.text}</p>
      </div>
    </div>
  );
}

const CONFIDENTIAL_DM_MESSAGES = [
  { id: 1, self: false, text: "ok confidential chat only — did you SEE what happened at the christmas party last night??" },
  { id: 2, self: true, text: "lol which part 😂 a lot happened" },
  { id: 3, self: false, text: "derek. on the karaoke stage. Bon Jovi. full knees-on-the-floor moment" },
  { id: 4, self: true, text: "i have video. it's going nowhere ever i promise" },
  { id: 5, self: false, text: "PLEASE send. for my eyes only" },
  { id: 6, self: true, text: "sending. also did you catch the CFO trying to breakdance" },
  { id: 7, self: false, text: "i missed that?? 😭" },
  { id: 8, self: true, text: "yeah around 11. he did a worm. there is now a small hole in the event space carpet" },
  { id: 9, self: false, text: "omg. HR is going to have a week" },
  { id: 10, self: true, text: "also — and this stays between us — i think mattias and that designer from the brand team left together" },
  { id: 11, self: false, text: "WAIT. really?" },
  { id: 12, self: true, text: "they shared an uber. grace saw them waiting outside" },
  { id: 13, self: false, text: "ok that's wild. i'm not saying a word" },
  { id: 14, self: true, text: "please don't. and burn this chat when you're done reading it 🔥" },
  { id: 15, self: false, text: "zipping my lips 🤐" },
];

const CONFIDENTIAL_REPLIES = [
  "my lips are sealed 🤐",
  "nooo way 😂 i can't believe that",
  "delete this chat after you read it lol",
  "you did NOT just tell me that",
  "this stays between us forever",
  "ok but who else saw this? be honest",
  "i need a minute. that's a LOT",
  "HR is going to have a field day monday",
  "did anyone catch it on video??",
  "i will take this to my grave",
  "this is the best gossip i've had all year",
  "wait there's MORE??",
  "omg please spill",
  "i'm never going to look at derek the same way",
  "ok new rule: christmas party in february next year. cooling off period needed",
];

const JEFF_REPLIES = [
  "haha yeah exactly",
  "lol right?? wild day",
  "good point. hadn't thought of it like that",
  "100%",
  "okay so apparently Tim's first email to the company just leaked 👀",
  "my buddy at Apple says the whole campus is on edge",
  "this is going to dominate every tech podcast for a month",
  "yeah I'm here for it. change is good",
  "fair. Ternus is underrated imo",
  "also the board must have been planning this for months, no way it was sudden",
  "true. the succession playbook has been obvious for a while honestly",
  "WWDC is going to be insane this year btw",
  "yeah. first keynote under a new CEO always hits different",
  "i bet they announce the vision pro 2 price cut too",
  "ok that would be huge",
  "what's the over/under on a stage appearance from tim",
  "i say he opens the keynote. passes the torch on stage.",
  "would be so on-brand. goosebumps moment",
  "ok i'm definitely watching live this year",
  "same. making it a proper event with snacks 🍿",
];

function MiniChatPreview({ personName, personAvatar, messages, variant = 'default', replies = JEFF_REPLIES }) {
  const [convo, setConvo] = useState([messages[0]]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);
  const scriptIdxRef = useRef(1);
  const replyIdxRef = useRef(0);
  const replyTimersRef = useRef([]);

  const clearReplyTimers = () => {
    replyTimersRef.current.forEach(t => clearTimeout(t));
    replyTimersRef.current = [];
  };

  useEffect(() => {
    let t1, t2;
    if (scriptIdxRef.current >= messages.length) {
      // End of script — keep the conversation going with alternating
      // reply-pool messages. Never reset.
      const lastSelf = convo[convo.length - 1]?.self ?? false;
      const nextSelf = !lastSelf;
      const text = replies[replyIdxRef.current % replies.length];
      replyIdxRef.current += 1;
      if (!nextSelf) {
        t1 = setTimeout(() => setTyping(true), 900);
        t2 = setTimeout(() => {
          setTyping(false);
          setConvo(c => [...c, { id: `p-${Date.now()}-${Math.random()}`, self: false, text }]);
        }, 2400);
      } else {
        t2 = setTimeout(() => {
          setConvo(c => [...c, { id: `p-${Date.now()}-${Math.random()}`, self: true, text }]);
        }, 1600);
      }
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    const next = messages[scriptIdxRef.current];
    const otherTurn = !next.self;
    if (otherTurn) {
      t1 = setTimeout(() => setTyping(true), 700);
      t2 = setTimeout(() => {
        setTyping(false);
        setConvo(c => [...c, next]);
        scriptIdxRef.current += 1;
      }, 2200);
    } else {
      t2 = setTimeout(() => {
        setConvo(c => [...c, next]);
        scriptIdxRef.current += 1;
      }, 1400);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [convo.length, messages, replies]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [convo.length, typing]);

  useEffect(() => () => clearReplyTimers(), []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setConvo(c => [...c, { id: `u-${Date.now()}`, self: true, text }]);
    // kick off a reply once the script is exhausted; otherwise the scripted
    // cycle continues naturally after each turn.
    if (scriptIdxRef.current >= messages.length) {
      clearReplyTimers();
      const t1 = setTimeout(() => setTyping(true), 700);
      const t2 = setTimeout(() => {
        setTyping(false);
        const reply = replies[replyIdxRef.current % replies.length];
        replyIdxRef.current += 1;
        setConvo(c => [...c, { id: `r-${Date.now()}`, self: false, text: reply }]);
      }, 2000 + Math.random() * 800);
      replyTimersRef.current = [t1, t2];
    }
  };

  const groups = convo.map((msg, i) => {
    const prev = convo[i - 1];
    const isFirstInGroup = !prev || prev.self !== msg.self;
    return { ...msg, isFirstInGroup };
  });

  return (
    <div className={`mc-window ${variant === 'confidential' ? 'mc-confidential' : ''}`} style={{ position: 'relative', left: 0, top: 0 }}>
      <div className="mc-header">
        <div className="mc-traffic-lights">
          <div className="mc-light mc-light-close" />
          <div className="mc-light mc-light-minimize" />
          <div className="mc-light mc-light-maximize" />
        </div>
        <div className="mc-header-center">
          <img src={personAvatar} alt="" className="mc-header-avatar" />
          <span className="mc-header-name">{personName}</span>
        </div>
        {variant === 'confidential' && <span className="mc-confidential-badge" aria-label="Confidential" />}
      </div>
      <div className="mc-body">
        <div className="mc-messages" ref={messagesRef}>
          {groups.map(msg => (
            <DMBubble key={msg.id} msg={msg} isFirstInGroup={msg.isFirstInGroup} />
          ))}
        </div>
        <div className="ainbox-composer">
          <TypingIndicator avatars={typing ? [personAvatar] : null} />
          <div className="ainbox-composer-box">
            <div className="ainbox-composer-field">
              <input
                placeholder="Write a Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
              />
            </div>
            <div className="ainbox-composer-toolbar">
              <div className="ainbox-toolbar-plus">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div className="ainbox-toolbar-spacer" />
              <div className="ainbox-toolbar-group">
                <img
                  src="/icons/composer/Send.svg"
                  alt=""
                  className={`ainbox-toolbar-img ainbox-send-icon ${input.trim() ? 'ainbox-send-active' : ''}`}
                  onClick={sendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MM_PROMPTS = [
  {
    q: "@MagicMinutes please summarize this thread for me",
    a: "Here's the gist: the team debated whether to ship the AInbox redesign before the board meeting or hold for more polish. Howard and Jon want it out Friday. Grace and design want one more week. Tentative call: ship Friday, push polish to a fast-follow.",
  },
  {
    q: "@MagicMinutes what action items came out of this?",
    a: "Three action items: (1) Grace owns the final icon pass by Thursday EOD. (2) Derek wires the feature flag so we can dark-launch to 10%. (3) Jon drafts the customer-facing release note and sends it to Howard for review.",
  },
  {
    q: "@MagicMinutes what did Howard actually commit to?",
    a: "Howard committed to personally running the Friday all-hands demo, posting the announcement in #wins at launch, and pinging the top 10 enterprise accounts individually over the weekend to flag the update.",
  },
  {
    q: "@MagicMinutes when is the next review on this?",
    a: "Tuesday 10am with the exec team — Jon booked it yesterday. Calendar invite went out to Howard, Grace, Derek, and Peter. The goal is to decide whether to roll out to 100% or hold at 10%.",
  },
  {
    q: "@MagicMinutes any concerns raised by the team?",
    a: "Two: Klas flagged that the new search index could spike read latency during the 10% rollout — infra is pre-warming caches to mitigate. Chelsea noted that enterprise customers on the old API may see a deprecation warning; comms team is drafting a heads-up email.",
  },
];

const MM_THREAD_SEED = [
  {
    id: 's1', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Mar 12, 9:14 AM',
    text: "Team — let's decide on the AInbox redesign ship date today. I'd like to have it out for the board on Friday.",
  },
  {
    id: 's2', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '9:18 AM',
    text: "Design is 95% there. I'd love one more week on the icons and the empty states — Friday feels tight.",
  },
  {
    id: 's3', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: '9:21 AM',
    text: "Friday is the right call IMO. We can fast-follow polish. The narrative moment matters more than the last 2% of icons.",
  },
  {
    id: 's4', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', time: '9:24 AM',
    text: "Eng is ready. I can put it behind a feature flag and dark-launch to 10% first so we de-risk.",
  },
  {
    id: 's5', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '9:26 AM',
    text: "Love it. Ship Friday, 10% dark launch, polish fast-follow. Grace — you ok with that?",
  },
  {
    id: 's6', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '9:28 AM',
    text: "Yeah, deal. I'll have the icon pass wrapped by Thursday EOD.",
  },
];

function MentionText({ text }) {
  // Wrap @MagicMinutes in a gradient span.
  const parts = text.split(/(@MagicMinutes)/g);
  return (
    <>
      {parts.map((p, i) =>
        p === '@MagicMinutes' ? <span key={i} className="mm-mention">@MagicMinutes</span> : <span key={i}>{p}</span>
      )}
    </>
  );
}

function MagicMinutesThreadPreview() {
  const [thread, setThread] = useState(MM_THREAD_SEED);
  const [composerText, setComposerText] = useState('');
  const [showCaret, setShowCaret] = useState(true);
  const promptIdxRef = useRef(0);
  const phaseRef = useRef('idle');

  useEffect(() => {
    let timers = [];
    const push = (t) => timers.push(t);

    const runCycle = () => {
      const prompt = MM_PROMPTS[promptIdxRef.current % MM_PROMPTS.length];
      promptIdxRef.current += 1;
      setShowCaret(true);
      setComposerText('');

      // Typewriter the question
      let i = 0;
      const typeNext = () => {
        i += 1;
        setComposerText(prompt.q.slice(0, i));
        if (i < prompt.q.length) {
          push(setTimeout(typeNext, 28 + Math.random() * 22));
        } else {
          // Hold briefly, then "send"
          push(setTimeout(() => {
            setComposerText('');
            setShowCaret(false);
            setThread(t => [...t, {
              id: `u-${Date.now()}`,
              sender: 'You', avatar: '/headshots/joe-woodward.jpg',
              time: 'Just now',
              text: prompt.q,
              isMention: true,
            }]);

            // MagicMinutes is "thinking" then replies
            push(setTimeout(() => {
              setThread(t => [...t, {
                id: `m-${Date.now()}`,
                sender: 'Magic Minutes', isMM: true,
                time: 'Just now',
                text: prompt.a,
              }]);
              // Wait, then reset the scroll and start next cycle
              push(setTimeout(() => {
                setThread(MM_THREAD_SEED);
                push(setTimeout(runCycle, 500));
              }, 4500));
            }, 1500));
          }, 600));
        }
      };
      push(setTimeout(typeNext, 600));
    };

    runCycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  const threadBodyRef = useRef(null);
  useEffect(() => {
    if (threadBodyRef.current) {
      threadBodyRef.current.scrollTop = threadBodyRef.current.scrollHeight;
    }
  }, [thread]);

  return (
    <div className="mm-ainbox-shell">
      <div className="ainbox-titlebar">
        <div className="ainbox-traffic-lights">
          <div className="ainbox-light ainbox-light-close" />
          <div className="ainbox-light ainbox-light-minimize" />
          <div className="ainbox-light ainbox-light-maximize" />
        </div>
      </div>
      <div className="mm-thread-header">
        <div>
          <div className="mm-thread-header-title">Q1 Planning Sync — Mar 12</div>
          <div className="mm-thread-header-sub">Thread · AInbox ship date</div>
        </div>
      </div>
      <div className="mm-thread-scroll" ref={threadBodyRef}>
        {thread.map(msg => (
          <div key={msg.id} className="ainbox-group-msg">
            {msg.isMM ? (
              <div className="mm-thread-avatar-circle">
                <img src="/icons/magic-quill.svg" alt="Magic Minutes" />
              </div>
            ) : (
              <img src={msg.avatar} alt="" className="ainbox-group-msg-avatar" />
            )}
            <div className="ainbox-group-msg-body">
              <div className="ainbox-group-msg-header">
                <span className="ainbox-group-msg-name">
                  {msg.isMM ? <span className="mm-mention">Magic Minutes</span> : msg.sender}
                </span>
                <span className="ainbox-group-msg-time">{msg.time}</span>
              </div>
              <div className="ainbox-group-msg-text">
                {msg.isMention ? <MentionText text={msg.text} /> : msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mm-thread-composer-wrap">
        <div className="mm-thread-composer-input">
          <MentionText text={composerText} />
          {showCaret && <span className="mm-thread-caret" />}
        </div>
      </div>
    </div>
  );
}

function AInboxPreview({ overrides = false, view = 'thread', chatId = null, mmAutoPrompt = false, threadView = null, mmPrompts = null, initialSidebarView = 'inbox' } = {}) {
  if (overrides) {
    const dmChatId = view === 'dm' ? (chatId || 'howard') : view === 'activity' ? (chatId || null) : null;
    const defaultThread = view === 'thread' ? { chatId: 'all-hands', messageId: 1 } : null;
    return (
      <AInbox
        win={noopWin('ainbox')}
        onDrag={() => {}}
        initialThreadView={threadView || defaultThread}
        initialChatId={dmChatId}
        initialSearchActive={view === 'search'}
        initialSearchQuery={view === 'search' ? 'messages tab' : ''}
        favoritesOverride={AINBOX_AH_FAVORITES}
        sectionsOverride={AINBOX_AH_SECTIONS}
        messagesOverride={AINBOX_AH_MESSAGES}
        mmAutoPrompt={mmAutoPrompt}
        mmPrompts={mmPrompts}
        initialSidebarView={initialSidebarView}
      />
    );
  }
  return <AInbox win={noopWin('ainbox')} onDrag={() => {}} initialSidebarView={initialSidebarView} />;
}

function MagicMinutesPreview() {
  return <MagicMinutes win={noopWin('magicminutes')} onDrag={() => {}} />;
}

function LobbyPreview() {
  return <Lobby win={noopWin('lobby')} onDrag={() => {}} />;
}

function OnAirPreview() {
  return <OnAir win={noopWin('onair')} onDrag={() => {}} demo />;
}

function MapPreview({ spotifyAlwaysOpen = false, githubAlwaysOpen = false } = {}) {
  return (
    <div className="fp-map-preview">
      <ShowcaseMap initialFloor="Preview" spotifyAlwaysOpen={spotifyAlwaysOpen} githubAlwaysOpen={githubAlwaysOpen} />
    </div>
  );
}

function MagicastPreview() {
  return (
    <>
      <div
        className="fp-magicast-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/magicast/preview.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <video
        src="/videos/Female/sophia_ramirez.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'relative',
          width: 280,
          height: 280,
          objectFit: 'cover',
          borderRadius: '50%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          zIndex: 2,
        }}
      />
    </>
  );
}

/* ===== Feature content registry ===== */
export const FEATURES = {
  'drop-in-meetings': {
    eyebrow: 'Drop-In Meetings',
    title: 'Knock on a door, drop into a chat',
    hero: 'Knock on an empty seat in someone\'s private office to start an audio-only Drop-In Meeting. If they want to talk, they\'ll accept your knock — and you\'re instantly in the room together.',
    visual: <MapPreview />,
    sections: [
      {
        title: 'A knock, not a calendar invite',
        desc: 'See someone is at their desk and just knock. They get a friendly heads-up, accept, and you\'re talking in seconds. No links, no scheduling tetris.',
        visual: <MapPreview />,
      },
      {
        title: 'Audio-first, low-friction',
        desc: 'Drop-Ins start as audio only — like leaning into someone\'s doorway. Turn on video or screenshare the moment you need to.',
      },
      {
        title: 'Their shelf, their vibe',
        desc: 'When you\'re in someone\'s office, you can see their shelf — the pictures, books, music, and trinkets they\'ve chosen to showcase. Conversation starters, built in.',
      },
      {
        title: 'They can say no',
        desc: 'Heads-down? Decline the knock, set yourself busy, or close the door. Drop-Ins respect the rhythm of real work.',
      },
    ],
  },
  'video-conferencing': {
    eyebrow: 'Video Conferencing',
    title: 'Meetings that end when you’re done',
    hero: 'Jump into a meeting room the moment you need to collaborate, and get back to work the moment you don’t. No more standing half-hour meetings for a five-minute decision.',
    visual: <MeetingPreview />,
    sections: [
      {
        title: 'Drop-in, not dialed-in',
        desc: 'Your whole team lives inside the same virtual office. Click any room and you’re inside — no links, no invites, no awkward waiting-room limbo.',
        visual: <MapPreview />,
      },
      {
        title: 'Hi-res screenshare + whiteboard',
        desc: 'Share your screen in full resolution. Sketch on the whiteboard. Everything’s right there, ready, without switching apps.',
      },
      {
        title: 'Talk to anyone, fast',
        desc: 'See who’s at their desk and just walk over. Drop in for 90 seconds, resolve the thing, leave. That’s the whole pitch.',
      },
      {
        title: 'Guest badges',
        desc: 'Invite people outside your company to join a specific room without giving them access to the whole office. Free.',
      },
    ],
  },
  'theater': {
    eyebrow: 'Theater',
    title: 'All-hands, reimagined as a live show',
    hero: 'A stage, an audience, and reactions that actually feel like a room. Theater turns your company meeting into something people show up for.',
    visual: <TheaterPreview />,
    sections: [
      {
        title: 'A real stage, with wings',
        desc: 'Speakers walk on stage. Backstage is where the next presenters prep. The director has controls that feel like running a broadcast.',
        visual: <TheaterPreview />,
      },
      {
        title: 'Whisper rows',
        desc: 'Seatmates can chat quietly while the presenter stays focused on the message. Side-conversations become a feature, not a bug.',
      },
      {
        title: 'Stereo reactions',
        desc: 'Clapping, laughter, and the occasional well-earned boo swell across the audience as more people pile on.',
      },
      {
        title: 'Stadium mode',
        desc: 'Scales up to hundreds of attendees without the whole thing turning into a thumbnail grid.',
      },
    ],
  },
  'ainbox': {
    eyebrow: 'AInbox',
    title: 'Enterprise Messaging with AInbox in your Roam HQ.',
    hero: 'Unleash ultraproductivity in your company HQ with AI-powered Enterprise Chat and Instant Messaging. Send Direct Messages, Group Chats, or Confidential Chats right in your own Virtual HQ. Set up your own custom groups. Tailor for your own bespoke workflow with custom folders, pinned chats, bookmarks, scheduled messages, and drag-and-drop reordering. Search your entire history. Give out guest badges to chat with people outside your organization, free!',
    visual: <AInboxPreview overrides view="dm" />,
    sections: [
      {
        title: 'Group Chat',
        desc: 'Fully featured Group Chat with threads, and replies. Set up your own channel-style named groups, add members and chat away.',
        visual: <AInboxPreview overrides view="thread" />,
      },
      {
        title: 'Folders',
        desc: 'Organize your groups to suit your workflow. Create custom folders, order them as you like, and set your preferences for how read and unread messages are organized among them.',
        visual: <AInboxFoldersPreview />,
      },
      {
        title: 'Direct Messages',
        desc: 'Yo. Instant Messages are fundamentally different than Group Chats. You want something a little more familiar like iMessage or WhatsApp from a DM. Roam blends the best of both worlds together with it’s familiar DM style. 😉',
        visual: (
          <MiniChatPreview
            personName="Jeff Grossman"
            personAvatar="/headshots/jeff-grossman.jpg"
            messages={JEFF_DM_MESSAGES}
          />
        ),
      },
      {
        title: 'Confidential Messages',
        desc: 'Not everything should be on the record forever.',
        visual: (
          <MiniChatPreview
            personName="Grace Sutherland"
            personAvatar="/headshots/grace-sutherland.jpg"
            messages={CONFIDENTIAL_DM_MESSAGES}
            variant="confidential"
            replies={CONFIDENTIAL_REPLIES}
          />
        ),
      },
      {
        title: 'AI Search',
        desc: 'Powerful search across all of your chats and your meetings with one keyword or phrase. Filter by channel or date. Soon, you’ll even be able to prompt both your meetings and chats right in your AInbox.',
        visual: <AInboxPreview overrides view="search" />,
      },
      {
        title: 'AI Promptable Threads',
        desc: 'You can use AI to prompt any thread right in the group with the Magic Minutes handle. Imagine a thread with dozens of replies that will take you forever to read. Simply say "@MagicMinutes please summarize this thread for me" or ask any other question you like.',
        visual: <AInboxPreview overrides view="thread" mmAutoPrompt threadView={{ chatId: 'meet-q2', messageId: 1 }} />,
      },
      {
        title: 'AI-Promptable PDFs',
        desc: 'Simply upload a PDF into your chat and you’ll be able to prompt its contents.',
        visual: (
          <AInboxPreview
            overrides
            view="thread"
            mmAutoPrompt
            threadView={{ chatId: 'features', messageId: 1 }}
            mmPrompts={[
              {
                q: "@MagicMinutes summarize the Q2 board deck for me",
                a: "It's a 24-slide narrative: open on the 3x DAU growth, walk through revenue 18% ahead of plan, highlight Drop-Ins + AInbox as the drivers, preview Magic Minutes as the Q3 headline, and close with the raise plan and ask.",
              },
              {
                q: "@MagicMinutes what are the key numbers in the deck?",
                a: "DAUs: 50,245 (+3.1x YoY). ARR: $24.6M, tracking 18% over plan. Net retention: 142%. NPS: +72 (up from +58 last quarter). Pipeline: $51M, 4x the Dec baseline. Enterprise ACV: $140K average.",
              },
              {
                q: "@MagicMinutes what's the ask on the closing slide?",
                a: "Slide 23 asks the board to approve a $15M Series B bridge at flat valuation, extending runway to 28 months. Use of funds: doubling the go-to-market team, Magic Minutes AI infra, and opening a second EU office.",
              },
              {
                q: "@MagicMinutes any risks the deck flags?",
                a: "Three risks called out on slide 21: enterprise sales cycle lengthening (avg 62 → 74 days), competitive pressure from incumbent collaboration tools, and Magic Minutes AI infra cost curve if model prices don't drop. Mitigations for each are on slide 22.",
              },
              {
                q: "@MagicMinutes pull the three customer quotes from the deck",
                a: "Slide 11: 'Roam replaced Slack, Zoom, and Notion for us — it's the first tool that actually feels like an office.' (Series-B dev-tools co). Slide 12: 'Magic Minutes saved us ~6 hours per week per engineer.' (Series-C fintech). Slide 13: 'We signed up for Drop-Ins. We stayed for the AInbox.' (public collaboration co).",
              },
            ]}
          />
        ),
      },
      {
        title: 'Activity View',
        desc: 'If you prefer a more traditional chronological "Inbox" based view of your messages, simply switch and you\'ll see all of your messages in the order you like. This is how Gmail or iMessage is organized. Whatever suits your fancy!',
        visual: <AInboxPreview overrides view="activity" chatId="act-klas" initialSidebarView="activity" />,
      },
      {
        icons: [
          '/icons/integrations/zapier.svg',
          '/icons/integrations/figma.svg',
          '/icons/integrations/github.svg',
          '/icons/integrations/spotify.svg',
          '/icons/integrations/google.svg',
          '/icons/integrations/microsoft.svg',
          '/icons/integrations/claude.svg',
          '/icons/integrations/codex.svg',
        ],
        title: 'Integrations',
        desc: 'Integrates with your favorite apps via Zapier or the Roam developer API. Native integrations with GitHub & Spotify.',
        visual: <MapPreview spotifyAlwaysOpen />,
      },
      {
        variant: 'additional',
        title: 'Additional Features in your AI-Powered Virtual Office',
        desc: (
          <>
            Your Roam Virtual Office includes, at no additional cost, company visualization, drop-in meetings, video conferencing, AI meeting summarization, &amp; AI Agents -{' '}
            <span className="fp-section-desc-strong">all for just $19.50/month</span>{' '}
            per active member.
          </>
        ),
      },
      {
        title: 'Company Visualization',
        desc: 'Roam gives everyone a complete visualization of everything happening right now at the company - who is at HQ, who is in which physical office, who is talking to who, who is on external calls. It’s like your whole company is together under one roof.',
        visual: <MapPreview />,
      },
      {
        title: 'Ship Faster with GitHub on the Map',
        desc: 'Cut code review times. When you have an outstanding PR from a fellow engineer, a GitHub icon appears next to their office on the map linking to it. At a glance, you know what you owe. You and your team will appreciate this context signal. We cut our own internal PR time by 42%. Ship faster!',
        visual: <MapPreview githubAlwaysOpen />,
      },
    ],
  },
  'magic-minutes': {
    eyebrow: 'Magic Minutes',
    title: 'Meeting notes that write themselves',
    hero: 'Every Roam meeting ends with a clean summary, full transcript, and a list of action items — dropped into a group chat before you’ve closed your laptop.',
    visual: <MagicMinutesPreview />,
    sections: [
      {
        title: 'AI summaries, instantly',
        desc: 'What got decided, what’s outstanding, and who owns it — generated the moment you hit end. Nobody has to volunteer to take notes.',
        visual: <MagicMinutesPreview />,
      },
      {
        title: 'Full transcript',
        desc: 'Deepgram-powered transcripts let you jump to the exact moment someone said the thing. Search across every meeting ever.',
      },
      {
        title: 'Auto group chat',
        desc: 'Each meeting spawns a thread with the attendees so follow-up conversations land in the right place automatically.',
      },
      {
        title: 'Prompt the minutes',
        desc: 'Ask “what did Sarah commit to?” or “summarize the Q3 plan” and get an answer from the meeting itself — hours or months later.',
      },
    ],
  },
  'lobby': {
    eyebrow: 'Lobby',
    title: 'Scheduling, with a drop-in door',
    hero: 'A scheduling link that also lets guests walk in the second you’re free. Like a booking page, but with a doorbell.',
    visual: <LobbyPreview />,
    sections: [
      {
        title: 'Your personal Lobby',
        desc: 'A branded link you can hand to anyone. They pick a time, or — if you’re around — they just knock on the door right now.',
        visual: <LobbyPreview />,
      },
      {
        title: 'Rules that fit your rhythm',
        desc: 'Set buffers, daily caps, minimum notice, and meeting-type limits. No more back-to-back days you didn’t sign up for.',
      },
      {
        title: 'Multiple Lobbies',
        desc: 'Spin up separate links for sales, support, hiring, or office hours — each with its own settings and its own visual identity.',
      },
      {
        title: 'Drop-in mode',
        desc: 'Flip a toggle and the Lobby shows you as available. Guests skip the calendar dance and walk in right away.',
      },
    ],
  },
  'magicast': {
    eyebrow: 'Magicast',
    title: 'Record, edit, and share — without leaving Roam',
    hero: 'A built-in screen recorder with picture-in-picture video, instant transcripts, and one-click sharing to any chat.',
    visual: <MagicastPreview />,
    sections: [
      {
        title: 'Capture anything on screen',
        desc: 'Click record. Talk through your demo. Stop. That’s a finished Magicast — no external tool, no upload step.',
        visual: <MagicastPreview />,
      },
      {
        title: 'On-camera without the drama',
        desc: 'Touch-ups, background blur, and swappable backgrounds keep you looking ready even if the room behind you isn’t.',
      },
      {
        title: 'Trim the dead air',
        desc: 'Snip the fumbles off both ends so every Magicast lands crisp. Transcripts update automatically as you cut.',
      },
      {
        title: 'Share anywhere',
        desc: 'Drop into a group chat, DM a colleague, or send a public link to someone outside the company. Every recording comes with a searchable transcript.',
      },
    ],
  },
  'on-air': {
    eyebrow: 'On-Air',
    title: 'Host a live event the crowd can actually feel',
    hero: 'Everything you love about Theater — the stage, the whispers, the reactions — opened up to your audience. No AV crew, no production stress.',
    visual: <OnAirPreview />,
    sections: [
      {
        title: 'Anyone can host',
        desc: 'No directors, no backstage engineer. Hit go, your event goes live, and the audience arrives through the door.',
        visual: <OnAirPreview />,
      },
      {
        title: 'Registration + comms',
        desc: 'Invite flows built for creator-led events. Collect RSVPs, send reminders, land them straight on stage night.',
      },
      {
        title: 'Audience that feels alive',
        desc: 'Whisper rows keep side-chat where it belongs. Stereo reactions roll across the room like a real crowd.',
      },
      {
        title: 'Replay-ready',
        desc: 'Every On-Air event becomes a Magicast you can share the next day. Talks live on after the doors close.',
      },
    ],
  },
};

export const FEATURE_ORDER = [
  'video-conferencing',
  'theater',
  'ainbox',
  'magic-minutes',
  'lobby',
  'magicast',
  'on-air',
];

function FeatureSection({ eyebrow, title, desc, visual, icons, variant }) {
  return (
    <section className={`fp-section ${variant ? `fp-section-${variant}` : ''}`}>
      <div className="fp-section-text">
        {eyebrow && <div className="fp-section-eyebrow">{eyebrow}</div>}
        <h2 className="fp-section-title">{title}</h2>
        <p className="fp-section-desc">{desc}</p>
        {icons && icons.length > 0 && (
          <div className="fp-section-icons">
            {icons.map((src, i) => (
              src.endsWith('github.svg') ? (
                <span
                  key={i}
                  className="fp-section-icon fp-section-icon-mask"
                  style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
                  aria-hidden="true"
                />
              ) : (
                <img key={i} src={src} alt="" className="fp-section-icon" />
              )
            ))}
          </div>
        )}
      </div>
      {visual && <div className="fp-section-visual">{visual}</div>}
    </section>
  );
}

function FeaturePageInner({ slug }) {
  const feature = FEATURES[slug];
  const [theme, setTheme] = useState('dark');
  const [showGrid, setShowGrid] = useState(() => {
    try { return localStorage.getItem('showGrid') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('showGrid', showGrid); } catch {}
  }, [showGrid]);
  useEffect(() => {
    const handler = () => setShowGrid(g => !g);
    const syncHandler = (e) => { if (e.key === 'showGrid') setShowGrid(e.newValue === 'true'); };
    window.addEventListener('toggle-grid', handler);
    window.addEventListener('storage', syncHandler);
    return () => {
      window.removeEventListener('toggle-grid', handler);
      window.removeEventListener('storage', syncHandler);
    };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'light' ? '#FFFFFF' : '#0C0C0E';
    return () => {
      document.documentElement.removeAttribute('data-theme');
      document.body.style.background = '';
    };
  }, [theme]);
  if (!feature) return null;

  return (
    <div className="sc-viewport fp-page" data-theme={theme}>
      {showGrid && (
        <div className="sc-grid-debug">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="sc-grid-debug-col" />)}
        </div>
      )}
      <div className="sc-navbar-wrap">
        <Navbar />
      </div>
      <RightControls
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(g => !g)}
      />

      <div className="fp-hero">
        <div className="fp-hero-inner">
          <div className="fp-eyebrow">{feature.eyebrow}</div>
          <h1 className="fp-hero-title">{feature.title}</h1>
          <p className="fp-hero-sub">{feature.hero}</p>
          <div className="fp-cta-row">
            <button className="sc-promo-btn">Book Demo</button>
            <button className="sc-promo-btn">Free Trial</button>
          </div>
        </div>
      </div>

      <div className="fp-hero-visual">
        <div className="fp-hero-stage">{feature.visual}</div>
      </div>

      {feature.sections.map((s, i) => (
        <FeatureSection key={i} {...s} />
      ))}

      <div className="fp-footer-cta">
        <div className="fp-footer-cta-inner">
          <h2 className="fp-footer-cta-title">Ready to meet Roam?</h2>
          <p className="fp-footer-cta-sub">Give your team an office that thinks. Book a demo or kick the tires for free.</p>
          <div className="fp-cta-row">
            <button className="sc-promo-btn">Book Demo</button>
            <button className="sc-promo-btn">Free Trial</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturePage({ slug }) {
  // Product components assume the providers exist (ChatContext, WindowManager).
  return (
    <ChatProvider>
      <WindowManagerProvider initialWindows={INITIAL_WINDOWS}>
        <FeaturePageInner slug={slug} />
      </WindowManagerProvider>
    </ChatProvider>
  );
}
