import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseMap, { HomepageReviews, OnItFeatureChat, MagicastFeatureVisual } from './ShowcaseMap';
import { EditMapView } from './App';

function RightControls({ theme, onToggleTheme, showGrid, onToggleGrid }) {
  return (
    <div className="sc-right-controls">
      <button
        type="button"
        className="unbutton sc-theme-capsule"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        aria-pressed={theme === 'light'}
      >
        <span className={`sc-theme-capsule-knob ${theme === 'light' ? 'bottom' : ''}`} aria-hidden="true" />
        <span className={`sc-theme-capsule-icon ${theme === 'dark' ? 'active' : ''}`} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 8.5C13.3 12.1 10 14.5 6.5 13.5C3 12.5 1 9.5 2 6C2.8 3.2 5.5 1.5 8.5 2C7 3.5 6.5 6 8 8.5C9 10 11 11 14 8.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span className={`sc-theme-capsule-icon ${theme === 'light' ? 'active' : ''}`} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M8 2V3.5M8 12.5V14M2 8H3.5M12.5 8H14M3.8 3.8L4.8 4.8M11.2 11.2L12.2 12.2M3.8 12.2L4.8 11.2M11.2 4.8L12.2 3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        </span>
      </button>
      <button
        type="button"
        className="unbutton sc-grid-capsule"
        onClick={onToggleGrid}
        title="Toggle 12-column grid"
        aria-label="Toggle 12-column grid"
        aria-pressed={showGrid}
      >
        <span className={`sc-grid-capsule-knob ${showGrid ? 'on' : ''}`} aria-hidden="true" />
        <span className={`sc-grid-capsule-icon ${!showGrid ? 'active' : ''}`} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" strokeWidth="1.3" rx="1.5" /></svg>
        </span>
        <span className={`sc-grid-capsule-icon ${showGrid ? 'active' : ''}`} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" strokeWidth="1.3" rx="1.5" /><path d="M6 2.5V13.5M10 2.5V13.5M2.5 6H13.5M2.5 10H13.5" stroke="currentColor" strokeWidth="1" /></svg>
        </span>
      </button>
    </div>
  );
}
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingCTA from './FloatingCTA';
import AInbox, { TypingIndicator } from './AInbox';
import MeetingWindow from './MeetingWindow';
import TheaterWindow from './TheaterWindow';
import MagicMinutes from './MagicMinutes';
import Recordings from './Recordings';
import Calendar from './Calendar';
import Lobby from './Lobby';
import Magnify from './Magnify';
import OnAir from './OnAir';
import MobileWindow from './MobileWindow';
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

const SPOTLIGHT_RESULTS = [
  { name: 'Walt Disney', subtitle: 'Inventors · Designer · NYC', avatar: '/videos/Male/ethan_bishop.png', status: 'online' },
  { name: 'Walter White', subtitle: 'Marketing · Engineer · Miami', avatar: '/videos/Male/daniel_russell.png', status: 'busy' },
  { name: 'Walter Scott', subtitle: 'Overworld · Engineer · San Francisco', avatar: '/videos/Male/michael_stevens.png', status: 'away' },
  { name: 'Walter Winter', subtitle: 'Offline · Sales · Miami', avatar: '/headshots/jeff-grossman.jpg', status: 'offline' },
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

function MeetingPreview({ roomName = 'Daily Standup', autoReactions = true, roamojiOpen = true, people, gesturesEnabled = true, incomingGesturesEnabled = false, captionsScript, compact = false, mmCatchUp = false, lockViewMode = true }) {
  const resolvedPeople = people || VIDEO_SPEAKERS.filter(p => p.name !== 'Ethan Bishop' && p.name !== 'Hannah Bennett');
  return (
    <MeetingWindow
      win={noopWin('meeting')}
      onDrag={() => {}}
      roomName={roomName}
      people={resolvedPeople}
      onOpenChat={() => {}}
      onOpenOnAir={() => {}}
      autoReactions={autoReactions}
      roamojiOpen={roamojiOpen}
      gesturesEnabled={gesturesEnabled}
      incomingGesturesEnabled={incomingGesturesEnabled}
      captionsScript={captionsScript}
      compact={compact}
      mmCatchUp={mmCatchUp}
      lockViewMode={lockViewMode}
    />
  );
}

function TheaterPreview({ speakers, audience, backstage, stereoDemo } = {}) {
  return (
    <TheaterWindow
      win={noopWin('theater')}
      onDrag={() => {}}
      speakers={speakers || VIDEO_SPEAKERS.slice(0, 2)}
      audience={audience || VIDEO_SPEAKERS}
      backstage={backstage}
      me={JOE}
      onOpenChat={() => {}}
      stereoDemo={stereoDemo}
    />
  );
}

// Reordered speakers + audience for the Stereo Reactions section so it
// doesn't reuse the same faces as other Theater previews on the page.
const STEREO_SPEAKERS = [VIDEO_SPEAKERS[3], VIDEO_SPEAKERS[6], VIDEO_SPEAKERS[4]];
const STEREO_AUDIENCE = [
  VIDEO_SPEAKERS[5], VIDEO_SPEAKERS[2], VIDEO_SPEAKERS[7], VIDEO_SPEAKERS[0],
  VIDEO_SPEAKERS[1], VIDEO_SPEAKERS[4], VIDEO_SPEAKERS[6], VIDEO_SPEAKERS[3],
];

// Whisper Rows preview — focused 3×3 audience grid where my row is highlighted
// (focus border + talking ring on me) and every other row is dimmed.
// Each face appears at most once across the whole grid.
const WHISPER_AUDIENCE = [
  videoPerson('Emily Carter', 'Female', 'Emily Carter'),
  videoPerson('Lauren Hayes', 'Female', 'Lauren Hayes'),
  videoPerson('Ashley Brooks', 'Female', 'Ashley Brooks'),
  videoPerson('Hannah Bennett', 'Female', 'Hannah Bennett'),
  videoPerson('Mia Chen', 'Female', 'Mia Chen'),
  videoPerson('Ethan Bishop', 'Male', 'Ethan Bishop'),
  videoPerson('Sarah Mitchell', 'Female', 'Sarah Mitchell'),
  videoPerson('Olivia Sanders', 'Female', 'Olivia Sanders'),
  videoPerson('Brooke Foster', 'Female', 'Brooke Foster'),
  videoPerson('Camila Torres', 'Female', 'Camila Torres'),
  videoPerson('Chloe Peterson', 'Female', 'Chloe Peterson'),
  videoPerson('Grace Thompson', 'Female', 'Grace Thompson'),
  videoPerson('Isabella Morgan', 'Female', 'Isabella Morgan'),
  videoPerson('Jessica Hall', 'Female', 'Jessica Hall'),
  videoPerson('Madison Reed', 'Female', 'Madison Reed'),
  videoPerson('Megan Taylor', 'Female', 'Megan Taylor'),
  videoPerson('Natalie Wilson', 'Female', 'Natalie Wilson'),
  videoPerson('Rachel Cooper', 'Female', 'Rachel Cooper'),
  videoPerson('Sophia Ramirez', 'Female', 'Sophia Ramirez'),
  videoPerson('Daniel Russell', 'Male', 'Daniel Russell'),
  videoPerson('Michael Stevens', 'Male', 'Michael Stevens'),
];

function WhisperPreview() {
  const HOWARD = { name: 'Howard L.', fullName: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' };
  // 9 benches. idx 4 (center) is the "me" bench. Other entries are the
  // slot indices (0-4) within a 5-slot bench that should be filled.
  const benchPatterns = [
    [1, 3],
    [0, 2, 4],
    [0, 4],
    [0, 2, 3],
    null, // me — flanked by two unique audience members
    [1, 3],
    [0, 4],
    [0, 2, 4],
    [1, 3],
  ];
  let cursor = 0;
  const pick = () => WHISPER_AUDIENCE[cursor++];
  const benches = benchPatterns.map((pattern) => {
    if (pattern === null) {
      const slots = [null, pick(), HOWARD, pick(), null];
      return { slots, isMe: true };
    }
    const slots = Array(5).fill(null);
    pattern.forEach((slotIdx) => { slots[slotIdx] = pick(); });
    return { slots, isMe: false };
  });

  return (
    <div className="fp-whisper-preview">
      <div className="fp-whisper-grid">
        {benches.map((b, idx) => (
          <div key={idx} className={`fp-whisper-bench ${b.isMe ? 'fp-whisper-bench-me' : 'fp-whisper-bench-dimmed'}`}>
            {b.slots.map((p, si) => {
              const isMe = b.isMe && p === HOWARD;
              return (
                <div key={si} className={`fp-whisper-slot ${!p ? 'fp-whisper-slot-empty' : ''}`}>
                  {isMe && <div className="sc-private-talk-ring sc-talking" />}
                  {p && <img src={p.avatar} alt="" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
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
    ],
  },
  {
    id: 'meetings', label: 'Meetings',
    items: [
      { id: 'compute', name: 'Inference Architecture Sync', type: 'meeting' },
      { id: 'meet-mm-launch', name: 'Magic Minutes Launch Review', type: 'meeting' },
      { id: 'meet-eval', name: 'ML Eval Triage', type: 'meeting' },
      { id: 'meet-pdf', name: 'Magic PDF Spec Review', type: 'meeting' },
      { id: 'meet-ainbox-ship', name: 'AInbox Ship Date Sync', type: 'meeting' },
      { id: 'meet-q2', name: 'Q2 Planning', type: 'meeting' },
      { id: 'meet-board', name: 'Board Prep', type: 'meeting' },
      { id: 'meet-howard', name: 'Howard 1:1', type: 'meeting' },
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

const HOWARD_MAGICAST_SHARE_MESSAGE = {
  id: 'howard-magicast',
  sender: 'Howard Lerman',
  avatar: '/headshots/howard-lerman.jpg',
  time: 'Today 9:02 AM',
  text: "Recorded a quick walkthrough of February's numbers and what we're shipping next. 4 minutes — give it a watch when you have a sec.",
  magicast: {
    title: 'March Investor Update',
    cover: '/magicast/march-update-cover.gif',
  },
};

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
        reactions: [
          { emoji: '🎉', count: 6, active: true },
          { emoji: '📈', count: 4 },
          { emoji: '🔥', count: 3 },
          { emoji: '🚀', count: 5 },
          { emoji: '💯', count: 2 },
        ],
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

  compute: {
    type: 'meeting', name: 'Inference Architecture Sync', memberCount: 4,
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/klas-leino.jpg', '/headshots/john-beutner.jpg', '/headshots/thomas-grapperon.jpg', '/headshots/keegan-lanzillotta.jpg'],
    messages: [
      {
        id: 1, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Today 11:14 AM',
        text: "Working through the speculative-decoding plumbing for the on-device Magic Minutes summarizer. 1.5B draft proposing tokens to a 14B target — getting ~2.4x throughput on the M4 Max, but the rejection rate cliffs past a 256-token speculative window because the draft drifts off the target's distribution. Question for the room: switch to a tree-based draft (Medusa-style heads) or keep the linear draft and shorten the window?",
        reactions: [
          { emoji: '🧠', count: 6, active: true },
          { emoji: '🚀', count: 4 },
          { emoji: '⚡️', count: 3 },
          { emoji: '🔥', count: 5 },
          { emoji: '🤖', count: 2 },
        ],
        thread: {
          count: 6, lastReply: 'today 12:07 PM',
          replies: [
            { id: 'r1', sender: 'John Beutner', avatar: '/headshots/john-beutner.jpg', text: "Go Medusa. At our model sizes the linear draft has exactly the rejection cliff you're hitting — the tree expansion lets you keep the longer horizon while pruning bad branches early. Trick is the verification kernel: fuse the parallel verification tree into a single attention call or the kernel-launch overhead eats the speedup. I'll send the FlashAttention kernel I wrote for the Bocca decoder, same shape." },
            { id: 'r2', sender: 'Kevin Hart', avatar: '/headshots/keegan-lanzillotta.jpg', text: "Second the Medusa direction — the linear draft's rejection variance kills P99 latency even when the average looks fine. Watch the KV-cache layout though: paged attention with 16-token blocks fragments under tree pruning and you bleed memory bandwidth. We dropped to 8-token pages and got it back." },
            { id: 'r3', sender: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg', text: "One flag — M4 Max ANE only kicks in on the FP16 path. If you quantize the draft below FP16 you fall back to GPU and lose the pipelined dispatch. We saw a 30% throughput hit going FP16 → INT8 on the draft. Unified memory means no draft↔target KV copy, but you have to align tile sizes or CoreML splits it under the hood and you eat two copies anyway." },
            { id: 'r4', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "All useful. Thomas — yeah, I clocked the ANE drop. Was hoping to keep the draft INT8 to fit alongside the target in working memory. Maybe FP16 draft + NF4 target instead. John, please send the kernel — that kernel-launch tail is exactly what's killing P99. Kevin, repro'ing the 8-token paging today." },
            { id: 'r5', sender: 'John Beutner', avatar: '/headshots/john-beutner.jpg', text: "Sent. Two more: tokenizer alignment between draft and target — if BPE merge order doesn't match you'll see systematic rejection at common bigrams. And the first ~50 tokens after a context switch are dominated by KV-cache materialization, so include warm-up in your benchmarks or the numbers look better than reality." },
            { id: 'r6', sender: 'Thomas Grapperon', avatar: '/headshots/thomas-grapperon.jpg', text: "Last one — if you're targeting M4 Max and M3 Pro, the L2 cache geometry differs enough that the optimal tile size doesn't transfer. We ended up shipping two compiled variants and switching at runtime." },
          ],
        },
      },
    ],
  },

  'meet-mm-launch': {
    type: 'meeting', name: 'Magic Minutes Launch Review', memberCount: 6,
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/howard-lerman.jpg', '/headshots/lexi-bohonnon.jpg', '/headshots/grace-sutherland.jpg', '/headshots/chelsea-turbin.jpg'],
    timeline: {
      avatars: [
        { src: '/headshots/lexi-bohonnon.jpg',     pos: 3 },
        { src: '/headshots/howard-lerman.jpg',     pos: 7 },
        { src: '/headshots/grace-sutherland.jpg',  pos: 19 },
        { src: '/headshots/lexi-bohonnon.jpg',     pos: 23 },
        { src: '/headshots/chelsea-turbin.jpg',    pos: 28 },
        { src: '/headshots/howard-lerman.jpg',     pos: 41 },
        { src: '/headshots/grace-sutherland.jpg',  pos: 49 },
        { src: '/headshots/lexi-bohonnon.jpg',     pos: 53 },
        { src: '/headshots/chelsea-turbin.jpg',    pos: 67 },
        { src: '/headshots/grace-sutherland.jpg',  pos: 71 },
        { src: '/headshots/howard-lerman.jpg',     pos: 84 },
        { src: '/headshots/lexi-bohonnon.jpg',     pos: 92 },
        { src: '/headshots/chelsea-turbin.jpg',    pos: 96 },
      ],
    },
    messages: [
      {
        id: 1, sender: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: 'Today 11:02 AM',
        text: "Magic Minutes posted the recap. Headlines: on-device Whisper is in dogfood, EU residency unblocked for day one, summary template variants signed off. Full call brief and action items in the meeting itself.",
      },
      {
        id: 2, sender: 'Magic Minutes', avatar: '/icons/magic-quill.svg', time: '11:02 AM',
        text: "Highlight pinned at 02:34 — Grace confirmed legal sign-off on Stop & Shred. Highlight at 03:15 — Lexi committed to sending the data-flow diagram after standup. Tap any highlight to jump to that moment.",
      },
      {
        id: 3, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '11:08 AM',
        text: "Pulled the 02:34 highlight as a Magicast — sending it to legal so they have the deletion behavior in their own words. Saved 20 min of writing it up.",
      },
      {
        id: 4, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '11:14 AM',
        text: "Love it. The timeline view is the unlock — I scrub a 30-min standup in 90 seconds and still come away knowing what got committed.",
      },
      {
        id: 5, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '11:21 AM',
        text: "Posted my 30-min slot with Lexi for the Stop & Shred deep-dive. Calendar invite landed; I also pinned the relevant transcript section so we walk in with the same context.",
      },
      {
        id: 6, sender: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '11:24 AM',
        text: "Data-flow diagram drafted. Going to clip the 03:15 explanation as a Magicast and attach it to the doc — easier than re-explaining over text.",
      },
      {
        id: 7, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '11:30 AM',
        text: "Approved Frankfurt region spend in #ops. EU residency is officially day-one. Lexi — provisioning starts Thursday as discussed.",
      },
      {
        id: 8, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '11:38 AM',
        text: "Launch checklist locked in #magic-minutes-launch. Anyone with risks, drop them in the thread before EOD Wednesday so we triage live in Friday's review.",
      },
    ],
  },

  'meet-ainbox-ship': {
    type: 'meeting', name: 'AInbox Ship Date Sync', memberCount: 5,
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/howard-lerman.jpg', '/headshots/grace-sutherland.jpg', '/headshots/jon-brod.jpg', '/headshots/derek-cicerone.jpg'],
    messages: [
      {
        id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Mar 12, 9:14 AM',
        text: "Team — let's decide on the AInbox redesign ship date today. I'd like to have it out for the board on Friday.",
        reactions: [
          { emoji: '🚢', count: 6, active: true },
          { emoji: '✅', count: 4 },
          { emoji: '🎯', count: 3 },
          { emoji: '🚀', count: 5 },
          { emoji: '🔥', count: 2 },
        ],
        thread: {
          count: 5, lastReply: 'Mar 12, 9:28 AM',
          replies: [
            { id: 'r1', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Design is 95% there. I'd love one more week on the icons and the empty states — Friday feels tight." },
            { id: 'r2', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Friday is the right call IMO. We can fast-follow polish. The narrative moment matters more than the last 2% of icons." },
            { id: 'r3', sender: 'Derek Cicerone', avatar: '/headshots/derek-cicerone.jpg', text: "Eng is ready. I can put it behind a feature flag and dark-launch to 10% first so we de-risk." },
            { id: 'r4', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Love it. Ship Friday, 10% dark launch, polish fast-follow. Grace — you ok with that?" },
            { id: 'r5', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Yeah, deal. I'll have the icon pass wrapped by Thursday EOD." },
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
        reactions: [
          { emoji: '🚀', count: 6, active: true },
          { emoji: '✅', count: 4 },
          { emoji: '🎯', count: 3 },
          { emoji: '📅', count: 2 },
          { emoji: '🔥', count: 5 },
        ],
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

// On-Air events — one is picked at random per page load and threaded through
// every on-air visual via OnAirEventContext (see useOnAirEvent below).
const ONAIR_EVENTS = [
  {
    id: 'world-tour',
    slug: 'roam-world-tour-nyc',
    title: 'Roam World Tour 2026 — Live from NYC',
    shortTitle: 'Roam World Tour 2026',
    posterTitle: 'Roam World Tour 2026',
    desc: 'Howard and Jon kick off a global tour with Roam — six cities, six demos, one continuous broadcast from the road.',
    inviteDesc: 'Howard and Jon kick off a global tour with Roam — six cities, six demos, one continuous broadcast from the road',
    date: 'June 14, 2026 · 7:00 PM ET',
    dateShort: 'Sunday, June 14',
    time: '7:00 PM ET',
    location: 'Roam Stage, NYC HQ',
    posterLocation: 'A virtual event in Roam',
    color: 4,
    curtainLandscape: '/on-air/on-air-blue-landscape.png',
    hostOrg: 'Roam HQ',
    hosts: [
      { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg' },
      { name: 'Jon Brod', avatar: '/headshots/jon-brod.jpg' },
    ],
    /* Map (TheaterOnAir) override — short-name keys for SHOWCASE_PEOPLE. */
    mapStageNames: ['Howard L.', 'Jon B.'],
    inviteGuests: [
      { name: 'Marc Andreessen', avatar: '/headshots/derek-cicerone.jpg', sub: 'a16z Founder Fireside', subType: 'event' },
      { name: 'Patrick Collison', avatar: '/headshots/mattias-leino.jpg', sub: 'Stripe HQ, San Francisco', subType: 'location' },
      { name: 'Sam Altman', avatar: '/headshots/john-huffsmith.jpg', sub: 'AI Founders Roundtable', subType: 'event' },
      { name: 'Kara Swisher', avatar: '/headshots/lexi-bohonnon.jpg', sub: 'Pivot Live in NYC', subType: 'event' },
      { name: 'Paul Graham', avatar: '/headshots/keegan-lanzillotta.jpg', sub: 'YC Demo Day Watch Party', subType: 'event' },
      { name: 'Reid Hoffman', avatar: '/headshots/arnav-bansal.jpg', sub: 'LinkedIn HQ, Mountain View', subType: 'location' },
      { name: 'Naval Ravikant', avatar: '/headshots/tom-dixon.jpg' },
      { name: 'Brian Chesky', avatar: '/headshots/john-moffa.jpg' },
    ],
    inviteInitialAdded: ['Sam Altman', 'Brian Chesky'],
    guestList: [
      { name: 'Marc Andreessen', avatar: '/headshots/derek-cicerone.jpg', time: '2 hrs ago', status: 'going' },
      { name: 'Patrick Collison', avatar: '/headshots/mattias-leino.jpg', time: '5 days ago', status: 'going' },
      { name: 'Sam Altman', avatar: '/headshots/john-huffsmith.jpg', time: '8 days ago', status: 'going' },
      { name: 'Kara Swisher', avatar: '/headshots/lexi-bohonnon.jpg', time: '9 days ago', status: 'maybe' },
      { name: 'Paul Graham', avatar: '/headshots/keegan-lanzillotta.jpg', time: '10 days ago', status: 'going' },
      { name: 'Reid Hoffman', avatar: '/headshots/arnav-bansal.jpg', time: '11 days ago', status: 'maybe' },
    ],
    recording: {
      title: 'Roam World Tour 2026 — Live from NYC',
      subtitle: 'Howard Lerman & Jon Brod',
      when: 'Today · 7:00 pm',
      thumb: '/on-air/on-air-blue-landscape.png',
      avatars: ['/headshots/howard-lerman.jpg', '/headshots/jon-brod.jpg'],
    },
    producerChat: {
      avatars: ['/headshots/howard-lerman.jpg', '/headshots/jon-brod.jpg', '/headshots/chelsea-turbin.jpg', '/headshots/will-hou.jpg'],
      pinnedItems: [
        { label: 'Tour Run-of-Show', emoji: null, avatar: '/groups/Group Roam.png' },
        { label: 'Press Kit', emoji: null, avatar: '/groups/Group Features.png' },
      ],
      messages: [
        {
          id: 1, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 9:30 AM',
          text: "Producer chat is live — 6 days to NYC kickoff. Jon and I are on stage; Chelsea's running stage right; Will's on remote production from London. Six cities in seven days, one continuous broadcast — run-of-show is pinned above. Drop questions in the thread and let's lock travel by Wednesday.",
          reactions: [
            { emoji: '🌎', count: 8, active: true },
            { emoji: '✈️', count: 5 },
            { emoji: '🎙️', count: 4 },
            { emoji: '🔥', count: 3 },
          ],
          thread: {
            count: 6, lastReply: 'today 11:24 AM',
            replies: [
              { id: 'r1', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Walked through the run-of-show with Howard last night. NYC opens, Berlin handoff at hour two, Tokyo wrap at hour six. Curtain drops at 6:55 ET sharp." },
              { id: 'r2', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "RSVP curve is unreal — 3,128 going / 562 maybe / 47 can't go. Sending the early reminder blast tomorrow to the Maybe column." },
              { id: 'r3', sender: 'Will Hou', avatar: '/headshots/will-hou.jpg', text: "Remote production is locked in. Each city has a 5-min B-roll package and a city-flag lower-third. Audio handoffs tested — sub-second latency from Berlin and Tokyo." },
              { id: 'r4', sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', text: "Walk-on music: 'New York, New York' for kickoff, then a city-specific cue at every handoff. Exit: Sinatra into a slow fade." },
              { id: 'r5', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Press kit is ready — square + landscape + portrait posters live in six city color-ways. Pushing to socials end of day Tuesday." },
              { id: 'r6', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Auto-reminders set: 1 week (Going + Maybe), 2 hours (Going only). I'll watch the Can't Go column for last-minute swaps." },
            ],
          },
        },
        {
          id: 2, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 10:00 AM',
          text: "Email blast scheduled — '1 week countdown' to 3,800 invitees. Sending Mon, Jun 8 at 9:00 AM ET.",
        },
        {
          id: 3, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 10:01 AM',
          text: "RSVPs in last 24 hours: +312 Going, +58 Maybe, +9 Can't Go. Total Going: 3,128.",
        },
        {
          id: 4, sender: 'Jon Brod', avatar: '/headshots/jon-brod.jpg', time: 'Today 11:42 AM',
          text: "Howard — can we reserve a Whisper Row for the remote crew? Want to coordinate handoffs live without breaking the audience experience.",
        },
        {
          id: 5, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 11:45 AM',
          text: "Already done. Seats A1–A6 reserved with Whisper enabled. Will's in A1 from London with the city-cue tablet.",
        },
        {
          id: 6, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 12:14 PM',
          text: "Press kit downloaded by 22 producers. Top format: Landscape (1920×1080).",
        },
      ],
    },
  },
  {
    id: 'music',
    slug: 'roam-sessions-acoustic',
    title: 'Roam Sessions — Live Acoustic Showcase',
    shortTitle: 'Roam Sessions — Live Acoustic',
    posterTitle: 'Roam Sessions',
    desc: 'Six artists, one stage, intimate sets — live to the world from a candle-lit theater.',
    inviteDesc: 'Six artists, one stage, intimate sets — live to the world from a candle-lit theater',
    date: 'August 23, 2026 · 8:00 PM ET',
    dateShort: 'Saturday, August 23',
    time: '8:00 PM ET',
    location: 'Roam Amphitheater',
    posterLocation: 'A virtual event in Roam',
    color: 5,
    curtainLandscape: '/on-air/static-landscape-purple.png',
    hostOrg: 'Roam HQ',
    hosts: [
      { name: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg' },
      { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg' },
    ],
    mapStageNames: ['Peter L.', 'Chelsea T.'],
    inviteGuests: [
      { name: 'Taylor Swift', avatar: '/headshots/grace-sutherland.jpg', sub: 'Eras Tour Roundtable', subType: 'event' },
      { name: 'Bad Bunny', avatar: '/headshots/keegan-lanzillotta.jpg', sub: 'San Juan HQ', subType: 'location' },
      { name: 'Olivia Rodrigo', avatar: '/headshots/chelsea-turbin.jpg', sub: 'Guts Tour Q&A', subType: 'event' },
      { name: 'Kendrick Lamar', avatar: '/headshots/john-moffa.jpg', sub: 'Compton HQ', subType: 'location' },
      { name: 'Beyoncé', avatar: '/headshots/lexi-bohonnon.jpg', sub: 'Renaissance Sessions', subType: 'event' },
      { name: 'Billie Eilish', avatar: '/headshots/garima-kewlani.jpg', sub: 'Hit Me Hard Listening Party', subType: 'event' },
      { name: 'The Weeknd', avatar: '/headshots/derek-cicerone.jpg' },
      { name: 'Drake', avatar: '/headshots/tom-dixon.jpg' },
    ],
    inviteInitialAdded: ['Olivia Rodrigo', 'Billie Eilish'],
    guestList: [
      { name: 'Taylor Swift', avatar: '/headshots/grace-sutherland.jpg', time: '3 hrs ago', status: 'going' },
      { name: 'Bad Bunny', avatar: '/headshots/keegan-lanzillotta.jpg', time: '4 days ago', status: 'going' },
      { name: 'Olivia Rodrigo', avatar: '/headshots/chelsea-turbin.jpg', time: '6 days ago', status: 'going' },
      { name: 'Kendrick Lamar', avatar: '/headshots/john-moffa.jpg', time: '7 days ago', status: 'maybe' },
      { name: 'Beyoncé', avatar: '/headshots/lexi-bohonnon.jpg', time: '8 days ago', status: 'going' },
      { name: 'Billie Eilish', avatar: '/headshots/garima-kewlani.jpg', time: '10 days ago', status: 'maybe' },
    ],
    recording: {
      title: 'Roam Sessions — Live Acoustic Showcase',
      subtitle: 'Peter Lerman & Chelsea Turbin',
      when: 'Today · 8:00 pm',
      thumb: '/on-air/static-landscape-purple.png',
      avatars: ['/headshots/peter-lerman.jpg', '/headshots/chelsea-turbin.jpg'],
    },
    producerChat: {
      avatars: ['/headshots/peter-lerman.jpg', '/headshots/chelsea-turbin.jpg', '/headshots/howard-lerman.jpg', '/headshots/grace-sutherland.jpg'],
      pinnedItems: [
        { label: 'Set List', emoji: null, avatar: '/groups/Group Roam.png' },
        { label: 'Press Kit', emoji: null, avatar: '/groups/Group Features.png' },
      ],
      messages: [
        {
          id: 1, sender: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', time: 'Today 9:30 AM',
          text: "Producer chat is live — we're 5 days out from Roam Sessions. Chelsea and I are on hosting duty; Howard's running the floor; Grace is on lighting. Set list is pinned above. Drop questions in the thread and let's lock load-in by Thursday.",
          reactions: [
            { emoji: '🎸', count: 7, active: true },
            { emoji: '🎤', count: 5 },
            { emoji: '🔥', count: 3 },
            { emoji: '🕯️', count: 2 },
          ],
          thread: {
            count: 6, lastReply: 'today 11:14 AM',
            replies: [
              { id: 'r1', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Ran the cue sheet with Peter last night. Six 12-minute sets, two-minute changeovers. Curtain drops at 7:55 ET sharp." },
              { id: 'r2', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "RSVPs are flying — 2,134 going / 408 maybe / 22 can't go. Pushing the 'doors open' reminder Friday morning." },
              { id: 'r3', sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', text: "Lighting cues programmed: warm amber for the openers, cool blue at midpoint, candle wash for the closer. House mix sounds incredible." },
              { id: 'r4', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Walk-on tracks: queued each artist's intro. Exit music — fading to room tone for that 'lights up' feel?" },
              { id: 'r5', sender: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', text: "Press kit is ready — square + landscape + portrait posters live. Pushing to socials end of day Tuesday." },
              { id: 'r6', sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', text: "Auto-reminders set: 1 week (Going + Maybe), 2 hours (Going only). Will watch the Can't Go column for last-minute swaps." },
            ],
          },
        },
        {
          id: 2, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 10:00 AM',
          text: "Email blast scheduled — '1 week countdown' to 2,564 invitees. Sending Mon, Aug 18 at 9:00 AM ET.",
        },
        {
          id: 3, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 10:01 AM',
          text: "RSVPs in last 24 hours: +212 Going, +47 Maybe, +3 Can't Go. Total Going: 2,134.",
        },
        {
          id: 4, sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: 'Today 11:42 AM',
          text: "Peter — can we reserve a Whisper Row for the audio team? Want to flag mix tweaks live without breaking the room.",
        },
        {
          id: 5, sender: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', time: 'Today 11:45 AM',
          text: "Already done. Seats A1–A6 with Whisper enabled. Grace is in A1 with the lighting cue tablet.",
        },
        {
          id: 6, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 12:14 PM',
          text: "Press kit downloaded by 18 producers. Top format: Portrait (1080×1920).",
        },
      ],
    },
  },
  {
    id: 'walt-disney',
    slug: 'evening-with-walt',
    title: 'An Evening with Walt — The Florida Project Reimagined',
    shortTitle: 'An Evening with Walt',
    posterTitle: 'An Evening with Walt',
    desc: "A guided journey through Walt's original Epcot vision — rare archival reels and live commentary.",
    inviteDesc: "A guided journey through Walt's original Epcot vision — rare archival reels and live commentary",
    date: 'October 17, 2026 · 7:30 PM ET',
    dateShort: 'Friday, October 17',
    time: '7:30 PM ET',
    location: 'Roam Studio Theater',
    posterLocation: 'A virtual event in Roam',
    color: 2,
    curtainLandscape: '/on-air/static-landscape-orange.png',
    hostOrg: 'Roam HQ',
    hosts: [
      { name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg' },
      { name: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg' },
    ],
    mapStageNames: ['Klas L.', 'Joe W.'],
    inviteGuests: [
      { name: 'Bob Iger', avatar: '/headshots/jon-brod.jpg', sub: 'Burbank HQ', subType: 'location' },
      { name: 'Joe Rohde', avatar: '/headshots/jeff-grossman.jpg', sub: 'Animal Kingdom Retrospective', subType: 'event' },
      { name: 'Marty Sklar', avatar: '/headshots/peter-lerman.jpg', sub: 'Imagineering Roundtable', subType: 'event' },
      { name: 'Kim Irvine', avatar: '/headshots/ava-lee.jpg', sub: 'Disneyland HQ', subType: 'location' },
      { name: 'Tony Baxter', avatar: '/headshots/aaron-wadhwa.jpg', sub: 'Splash Mountain Postmortem', subType: 'event' },
      { name: 'John Hench', avatar: '/headshots/michael-walrath.jpg', sub: 'Color Theory Workshop', subType: 'event' },
      { name: 'Mary Blair', avatar: '/headshots/lexi-bohonnon.jpg' },
      { name: 'Herbert Ryman', avatar: '/headshots/sean-macisaac.jpg' },
    ],
    inviteInitialAdded: ['Marty Sklar', 'Joe Rohde'],
    guestList: [
      { name: 'Bob Iger', avatar: '/headshots/jon-brod.jpg', time: '1 hr ago', status: 'going' },
      { name: 'Joe Rohde', avatar: '/headshots/jeff-grossman.jpg', time: '3 days ago', status: 'going' },
      { name: 'Marty Sklar', avatar: '/headshots/peter-lerman.jpg', time: '5 days ago', status: 'going' },
      { name: 'Kim Irvine', avatar: '/headshots/ava-lee.jpg', time: '6 days ago', status: 'maybe' },
      { name: 'Tony Baxter', avatar: '/headshots/aaron-wadhwa.jpg', time: '8 days ago', status: 'going' },
      { name: 'John Hench', avatar: '/headshots/michael-walrath.jpg', time: '9 days ago', status: 'maybe' },
    ],
    recording: {
      title: 'An Evening with Walt — The Florida Project Reimagined',
      subtitle: 'Klas Leino & Joe Woodward',
      when: 'Today · 7:30 pm',
      thumb: '/on-air/static-landscape-orange.png',
      avatars: ['/headshots/klas-leino.jpg', '/headshots/joe-woodward.jpg'],
    },
    producerChat: {
      avatars: ['/headshots/klas-leino.jpg', '/headshots/joe-woodward.jpg', '/headshots/chelsea-turbin.jpg', '/headshots/peter-lerman.jpg'],
      pinnedItems: [
        { label: 'Run-of-Show', emoji: null, avatar: '/groups/Group Roam.png' },
        { label: 'Archival Reel List', emoji: null, avatar: '/groups/Group Features.png' },
      ],
      messages: [
        {
          id: 1, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Today 9:30 AM',
          text: "Producer chat is live — we're 8 days from An Evening with Walt. Joe and I are on stage; Chelsea is running stage right; Peter's our archive curator. Run-of-show is pinned above. Drop questions in the thread and let's lock the reel order by Thursday.",
          reactions: [
            { emoji: '🏰', count: 8, active: true },
            { emoji: '🎬', count: 5 },
            { emoji: '✨', count: 4 },
            { emoji: '📽️', count: 3 },
          ],
          thread: {
            count: 6, lastReply: 'today 11:24 AM',
            replies: [
              { id: 'r1', sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', text: "Walked the run-of-show with Klas last night. Open with the 1966 Florida film, hold for the EPCOT model reveal, Q&A at the closer. Curtain drops at 7:25 ET sharp." },
              { id: 'r2', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "RSVP curve is steady — 1,402 going / 287 maybe / 19 can't go. Sending the 1-week reminder Friday to the Maybe column." },
              { id: 'r3', sender: 'Peter Lerman', avatar: '/headshots/peter-lerman.jpg', text: "Archive cleared: I have license for the 4 reels we're showing. Frame rates synced to 24fps so transitions don't judder." },
              { id: 'r4', sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', text: "Walk-on score: 'When You Wish Upon a Star' — orchestral cut. Exit: silence into rolling credits, very deliberate." },
              { id: 'r5', sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', text: "Press kit is ready — square + landscape + portrait posters live. Pushing to socials end of day Tuesday." },
              { id: 'r6', sender: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', text: "Auto-reminders set: 1 week (Going + Maybe), 2 hours (Going only). I'll watch the Can't Go column for last-minute swaps." },
            ],
          },
        },
        {
          id: 2, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 10:00 AM',
          text: "Email blast scheduled — '1 week countdown' to 1,820 invitees. Sending Fri, Oct 10 at 9:00 AM ET.",
        },
        {
          id: 3, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 10:01 AM',
          text: "RSVPs in last 24 hours: +96 Going, +21 Maybe, +2 Can't Go. Total Going: 1,402.",
        },
        {
          id: 4, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Today 11:42 AM',
          text: "Klas — can we reserve a Whisper Row for the archive team? Want Peter to flag reel cues live without breaking the immersion.",
        },
        {
          id: 5, sender: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', time: 'Today 11:45 AM',
          text: "Already done. Seats A1–A6 reserved with Whisper enabled. Peter's in A1 with the cue list ready.",
        },
        {
          id: 6, sender: 'On-Air', avatar: '/icons/on-air.svg', time: 'Today 12:14 PM',
          text: "Press kit downloaded by 9 producers. Top format: Landscape (1920×1080).",
        },
      ],
    },
  },
];

// Picked once per FeaturePage mount and provided via context to every on-air
// visual. Defaults to World Cup so visuals rendered outside the on-air page
// (or before the provider mounts) keep their existing content.
const OnAirEventContext = React.createContext(ONAIR_EVENTS[0]);
const useOnAirEvent = () => React.useContext(OnAirEventContext);
function pickOnAirEvent() {
  return ONAIR_EVENTS[Math.floor(Math.random() * ONAIR_EVENTS.length)];
}

// Producer chat is keyed off a stable id so the AInbox thread view can find it.
const ONAIR_PRODUCER_FAVORITES = [
  { id: 'howard', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'all-hands', name: 'All-Hands', avatar: '/groups/Group Roam.png', type: 'group' },
];

function buildOnAirProducerSections(event) {
  return [
    {
      id: 'onair', label: 'On-Air',
      items: [
        { id: 'onair-event', name: event.shortTitle, onAirIcon: true, type: 'group', memberCount: 4 },
      ],
    },
    ...AINBOX_AH_SECTIONS,
  ];
}

function buildOnAirProducerMessages(event) {
  return {
    ...AINBOX_AH_MESSAGES,
    'onair-event': {
      type: 'group',
      name: event.shortTitle,
      memberCount: 4,
      onAirIcon: true,
      avatars: event.producerChat.avatars,
      pinnedItems: event.producerChat.pinnedItems,
      messages: event.producerChat.messages,
    },
  };
}

function buildOnAirInviteEvent(event) {
  return {
    title: event.title,
    desc: event.inviteDesc,
    date: event.date,
    location: event.location,
    host: event.hosts[0].name,
    avatar: event.hosts[0].avatar,
    color: event.color,
  };
}

// On-It pinned at the top of favorites for the AInbox preview on the On-It page
const ONIT_AINBOX_FAVORITES = [
  { id: 'onit', name: 'On-It', avatar: '/on-it-agent.png', type: 'onit' },
  { id: 'howard', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'all-hands', name: 'All-Hands', avatar: '/groups/Group Roam.png', type: 'group' },
];

// On-It chat with company-recap conversation for the "Lives in your AInbox" section
const ONIT_AINBOX_MESSAGES = {
  ...AINBOX_AH_MESSAGES,
  onit: {
    type: 'onit',
    name: 'On-It',
    subtitle: 'AI Assistant',
    avatar: '/on-it-agent.png',
    taskSummary: 'Pulling the Q3 priorities from yesterday’s exec sync',
    taskSteps: [
      'Locating yesterday’s Exec Sync Magic Minutes',
      'Reading the speaker-attributed transcript',
      'Compiling the Q3 priority list',
      'Drafting the recap for You',
    ],
    tasks: [
      {
        summary: 'Pulling the Q3 priorities from yesterday’s exec sync',
        steps: [
          'Locating yesterday’s Exec Sync Magic Minutes',
          'Reading the speaker-attributed transcript',
          'Compiling the Q3 priority list',
          'Drafting the recap for You',
        ],
      },
      {
        summary: 'Checking Lexi’s status on the threading rewrite',
        steps: [
          'Finding Lexi’s most recent threading-rewrite update',
          'Cross-referencing the staff flag rollout state',
          'Pinging Klas for staging confirmation',
          'Drafting a status reply for You',
        ],
      },
    ],
    messages: [
      { id: 1, self: true, text: 'What’s our ARR right now?' },
      { id: 2, self: false, text: 'We crossed $3M ARR last week — up 14% from January. Want me to drop the trend chart in this thread?' },
      { id: 3, self: true, text: 'How did Q3 planning land in yesterday’s exec sync?' },
      { id: 4, self: false, text: 'The team locked in three priorities: Magic Minutes GA, AInbox ship date of May 14, and pulling the EU office launch into Q4. I can post the full call brief if helpful.' },
      { id: 5, self: true, text: 'What’s blocking Lexi on the threading rewrite?' },
      { id: 6, self: false, text: 'She’s waiting on the staff flag rollout — Klas pushed it to staging yesterday, so she should be unblocked by EOD. I’ll ping you the moment she flips it on.' },
    ],
  },
};

// Meeting chat with On-It posting an Action Items follow-up — used in the
// "On-It with Magic Minutes" feature visual.
const ONIT_MM_MESSAGES = {
  ...AINBOX_AH_MESSAGES,
  'meet-design': {
    type: 'meeting',
    name: 'Inbox Design Discussion',
    groupImg: '/icons/magic-quill.svg',
    avatars: ['/headshots/grace-sutherland.jpg', '/headshots/howard-lerman.jpg', '/headshots/joe-woodward.jpg'],
    memberCount: 5,
    pinnedItems: [],
    messages: [
      { id: 1, sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: 'Today 9:00 AM', text: "Let’s kick off the inbox design discussion. I’ve prepared some wireframes based on the user feedback." },
      { id: 2, sender: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: 'Today 9:05 AM', text: "Great, I’ve been thinking about the folder system. Users really want drag-and-drop reordering." },
      { id: 3, sender: 'Joe Woodward', avatar: '/headshots/joe-woodward.jpg', time: 'Today 9:10 AM', text: "Agreed. The pinned items and collapsible sections tested really well in the prototype." },
      { id: 4, sender: 'Rob Figueiredo', avatar: '/headshots/rob-figueiredo.jpg', time: 'Today 9:15 AM', text: "I can start on the API for custom folder ordering this sprint. Should be straightforward." },
      {
        id: 5,
        sender: 'On-It',
        avatar: '/on-it-agent.png',
        time: 'Today 9:32 AM',
        actionItems: [
          {
            title: 'Schedule Kick Off Meeting with Max and Joe',
            desc: 'Arrange an initial meeting with Max and Joe to discuss project goals, timelines, and roles, ensuring alignment and clear next steps.',
            action: 'Schedule?',
          },
          {
            title: 'Get Video Assets from Grace',
            desc: 'Request and collect necessary video files or materials from Grace to support project deliverables or marketing efforts.',
            action: 'Email?',
          },
          {
            title: 'Follow Up with Chelsea about SMS Notifications',
            desc: 'Schedule Roam dashboard UI review. Email Jeff and Joe with mockups.',
            action: 'Schedule?',
          },
        ],
      },
    ],
  },
};

const ONIT_MM_FAVORITES = [
  { id: 'howard-fav', name: 'Howard', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
  { id: 'all-hands-fav', name: 'All-Hands', avatar: '/groups/Group Roam.png', type: 'group' },
];

const ONIT_MM_SECTIONS = [
  {
    id: 'dms', label: 'Direct Messages',
    items: [
      { id: 'onit', name: 'On-It', avatar: '/on-it-agent.png', type: 'onit' },
      { id: 'howard', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', type: 'dm' },
      { id: 'grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', type: 'dm' },
      { id: 'klas', name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', type: 'dm' },
    ],
  },
  {
    id: 'meetings', label: 'Meetings',
    items: [
      { id: 'meet-design', name: 'Inbox Design Discussion', type: 'meeting' },
    ],
  },
  {
    id: 'groups', label: 'My Groups',
    items: [
      { id: 'all-hands', name: 'All-Hands', groupImg: '/groups/Group Roam.png', type: 'group', memberCount: 45 },
      { id: 'exec', name: 'Exec', groupImg: '/groups/Group Exec.png', type: 'group', memberCount: 7 },
    ],
  },
];

// All-Hands chat with Howard's magicast share appended as the latest message
const MAGICAST_SHARE_AH_MESSAGES = {
  ...AINBOX_AH_MESSAGES,
  'all-hands': {
    ...AINBOX_AH_MESSAGES['all-hands'],
    pinnedItems: [],
    messages: [
      ...AINBOX_AH_MESSAGES['all-hands'].messages,
      HOWARD_MAGICAST_SHARE_MESSAGE,
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

function AInboxPreview({ overrides = false, view = 'thread', chatId = null, mmAutoPrompt = false, threadView = null, mmPrompts = null, initialSidebarView = 'inbox', messagesOverride = null, favoritesOverride = null, sectionsOverride = null, initialCollapsedSections = null } = {}) {
  if (overrides) {
    const dmChatId =
      view === 'dm' ? (chatId || 'howard')
      : view === 'activity' ? (chatId || null)
      : view === 'chat' ? chatId
      : null;
    const defaultThread = view === 'thread' ? { chatId: 'all-hands', messageId: 1 } : null;
    return (
      <AInbox
        win={noopWin('ainbox')}
        onDrag={() => {}}
        initialThreadView={threadView || defaultThread}
        initialChatId={dmChatId}
        initialSearchActive={view === 'search'}
        initialSearchQuery={view === 'search' ? 'messages tab' : ''}
        favoritesOverride={favoritesOverride || AINBOX_AH_FAVORITES}
        sectionsOverride={sectionsOverride || AINBOX_AH_SECTIONS}
        messagesOverride={messagesOverride || AINBOX_AH_MESSAGES}
        mmAutoPrompt={mmAutoPrompt}
        mmPrompts={mmPrompts}
        initialSidebarView={initialSidebarView}
        initialCollapsedSections={initialCollapsedSections}
      />
    );
  }
  return <AInbox win={noopWin('ainbox')} onDrag={() => {}} initialSidebarView={initialSidebarView} />;
}

/* Hero-only wrapper that drives the internal chat scrollTop from page scroll,
   so the messages glide upward as the visitor scrolls past the hero. */
function AInboxHeroAnimated(props) {
  const wrapRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const msgs = wrap.querySelector('.ainbox-detail-messages');
      if (!msgs) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const progress = Math.min(1, Math.max(0, passed / total));
      const maxScroll = msgs.scrollHeight - msgs.clientHeight;
      if (maxScroll > 0) msgs.scrollTop = maxScroll * (1 - progress);
    };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };
    const initial = requestAnimationFrame(() => requestAnimationFrame(tick));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(initial);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return (
    <div ref={wrapRef} className="fp-ainbox-hero-anim">
      <AInboxPreview {...props} />
    </div>
  );
}

function MagicMinutesPreview({ meeting } = {}) {
  const resolved = { defaultTab: 'transcript', ...(meeting || {}) };
  return (
    <div className="fp-mm-preview">
      <MagicMinutes win={noopWin('magicminutes')} onDrag={() => {}} meeting={resolved} />
    </div>
  );
}

const TRANSLATION_MESSAGES = {
  en: [
    { time: '11:21 AM', body: "Posted my 30-min slot with Lexi for the Stop & Shred deep-dive. Calendar invite landed; I also pinned the relevant transcript section so we walk in with the same context." },
    { time: '11:24 AM', body: "Data-flow diagram drafted. Going to clip the 03:15 explanation as a Magicast and attach it to the doc — easier than re-explaining over text." },
    { time: '11:30 AM', body: "Approved Frankfurt region spend in #ops. EU residency is officially day-one. Lexi — provisioning starts Thursday as discussed." },
    { time: '11:38 AM', body: "Launch checklist locked in #magic-minutes-launch. Anyone with risks, drop them in the thread before EOD Wednesday so we triage live in Friday's review." },
  ],
  fr: [
    { time: '11:21', body: "J'ai publié mon créneau de 30 min avec Lexi pour le deep-dive Stop & Shred. L'invitation est partie ; j'ai aussi épinglé la section pertinente du transcript pour qu'on arrive avec le même contexte." },
    { time: '11:24', body: "Le diagramme de flux est rédigé. Je vais découper l'explication de 03:15 en Magicast et l'attacher au doc — plus simple que de tout réexpliquer par écrit." },
    { time: '11:30', body: "Dépense de la région Francfort approuvée dans #ops. La résidence des données UE est officiellement disponible dès le jour 1. Lexi — le provisionnement démarre jeudi comme convenu." },
    { time: '11:38', body: "Checklist de lancement verrouillée dans #magic-minutes-launch. Si vous avez des risques, mettez-les dans le thread avant mercredi EOD pour qu'on les trie en direct vendredi." },
  ],
  de: [
    { time: '11:21', body: "Meinen 30-Minuten-Slot mit Lexi für das Stop-&-Shred-Deep-Dive eingestellt. Kalendereinladung ist raus; ich habe außerdem den relevanten Transkriptabschnitt angeheftet, damit wir mit demselben Kontext einsteigen." },
    { time: '11:24', body: "Datenflussdiagramm steht im Entwurf. Ich werde die Erklärung um 03:15 als Magicast schneiden und ans Dokument anhängen — einfacher als alles per Text neu zu erklären." },
    { time: '11:30', body: "Frankfurt-Region-Spend in #ops freigegeben. EU-Datenresidenz ist offiziell ab Tag 1. Lexi — die Provisionierung startet wie besprochen am Donnerstag." },
    { time: '11:38', body: "Launch-Checkliste in #magic-minutes-launch gesperrt. Wer Risiken hat, bitte vor Mittwoch EOD in den Thread posten, damit wir am Freitag live triagieren." },
  ],
  pt: [
    { time: '11:21', body: "Publiquei meu slot de 30 min com a Lexi para o deep-dive de Stop & Shred. O convite no calendário já foi; também fixei a seção relevante do transcript para entrarmos com o mesmo contexto." },
    { time: '11:24', body: "Diagrama de fluxo rascunhado. Vou recortar a explicação às 03:15 como Magicast e anexar ao doc — mais fácil do que reexplicar por texto." },
    { time: '11:30', body: "Aprovado o gasto na região de Frankfurt em #ops. Residência de dados na UE é oficialmente day-one. Lexi — o provisionamento começa quinta-feira como combinado." },
    { time: '11:38', body: "Checklist de lançamento travada em #magic-minutes-launch. Quem tiver riscos, jogue na thread até o final de quarta para triarmos ao vivo na sexta." },
  ],
  es: [
    { time: '11:21', body: "Publiqué mi hueco de 30 min con Lexi para el deep-dive de Stop & Shred. El invite del calendario ya está; también fijé la sección relevante del transcript para que entremos con el mismo contexto." },
    { time: '11:24', body: "Diagrama de flujo de datos en borrador. Voy a recortar la explicación de las 03:15 como Magicast y adjuntarla al doc — más fácil que volver a explicarlo por texto." },
    { time: '11:30', body: "Aprobado el gasto de la región de Frankfurt en #ops. La residencia de datos de la UE es oficialmente day-one. Lexi — el aprovisionamiento empieza el jueves, como hablamos." },
    { time: '11:38', body: "Checklist de lanzamiento cerrada en #magic-minutes-launch. Quien tenga riesgos, que los suelte en el thread antes del fin del miércoles para triarlos en vivo el viernes." },
  ],
  ja: [
    { time: '11:21', body: "Stop & Shred のディープダイブ用に Lexi との30分の枠を投稿しました。カレンダー招待も送付済み。同じ前提で入れるよう、関連する文字起こしのセクションもピン留めしておきました。" },
    { time: '11:24', body: "データフロー図のドラフトが完成。03:15の説明を Magicast として切り出してドキュメントに添付します。テキストで再説明するより楽です。" },
    { time: '11:30', body: "#ops でフランクフルト リージョンの費用を承認しました。EU データレジデンシーは正式に Day-One 対応です。Lexi — プロビジョニングは予定どおり木曜から開始してください。" },
    { time: '11:38', body: "ローンチ チェックリストを #magic-minutes-launch でロックしました。リスクがある方は水曜日の終業時刻までにスレッドへ投稿してください。金曜日のレビューでライブにトリアージュします。" },
  ],
  zh: [
    { time: '上午11:21', body: "我已在日历里发出与 Lexi 关于 Stop & Shred 深度讨论的 30 分钟时段，邀请已发出；同时把相关的会议文字记录区段进行了置顶，方便大家以相同上下文进入。" },
    { time: '上午11:24', body: "数据流图初稿已完成。我会把 03:15 的解释裁剪为 Magicast 并附在文档中——比再用文字重新解释更方便。" },
    { time: '上午11:30', body: "已在 #ops 批准法兰克福区域支出。欧盟数据驻留正式 Day-One 上线。Lexi — 配置按计划周四开始。" },
    { time: '上午11:38', body: "上线清单已在 #magic-minutes-launch 中锁定。各位若有风险，请在周三前提到线程，我们将在周五的复盘中实时分诊。" },
  ],
  ar: [
    { time: '11:21', body: "نشرت موعد 30 دقيقة مع ليكسي للنقاش المعمّق حول Stop & Shred. دعوة التقويم وصلت؛ ثبّتُ كذلك القسم المرتبط من النص حتى ندخل جميعًا بنفس السياق." },
    { time: '11:24', body: "اكتملت مسودة مخطط تدفق البيانات. سأقصّ شرح الدقيقة 03:15 كـ Magicast وأرفقه بالمستند — أسهل من إعادة الشرح كتابيًا." },
    { time: '11:30', body: "تمت الموافقة على إنفاق منطقة فرانكفورت في #ops. إقامة بيانات الاتحاد الأوروبي متاحة رسميًا من اليوم الأول. ليكسي — التهيئة تبدأ الخميس كما اتفقنا." },
    { time: '11:38', body: "قائمة الإطلاق مُقفلة في #magic-minutes-launch. من لديه مخاطر، فليُضِفها في الموضوع قبل نهاية الأربعاء حتى نراجعها مباشرةً يوم الجمعة." },
  ],
};

const TRANSLATION_LANGUAGES = [
  {
    id: 'en', flag: '🇬🇧', label: 'English',
    meetingName: 'Magic Minutes Launch Review',
    senders: [
      { sender: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'Lexi Bohonnon',    avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'Howard Lerman',    avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'Chelsea Turbin',   avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'fr', flag: '🇫🇷', label: 'Français',
    meetingName: 'Bilan du lancement Magic Minutes',
    senders: [
      { sender: 'Grâce Sauveterre', avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'Léxie Beaumont',   avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'Édouard Lemerle',  avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'Cécile Tournier',  avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'de', flag: '🇩🇪', label: 'Deutsch',
    meetingName: 'Magic Minutes Launch-Review',
    senders: [
      { sender: 'Grete Sudermann', avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'Lena Bohnert',    avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'Hartmut Lermann', avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'Käthe Turbin',    avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'pt', flag: '🇵🇹', label: 'Português',
    meetingName: 'Revisão do Lançamento do Magic Minutes',
    senders: [
      { sender: 'Graça Saldanha',    avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'Lexa Bonifácio',    avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'Eduardo Lermão',    avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'Cecília Trindade',  avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'es', flag: '🇪🇸', label: 'Español',
    meetingName: 'Revisión del Lanzamiento de Magic Minutes',
    senders: [
      { sender: 'Gracia Salvador',  avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'Lexia Boldú',      avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'Eduardo Larrazábal', avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'Celia Turró',      avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'ja', flag: '🇯🇵', label: '日本語',
    meetingName: 'Magic Minutes ローンチレビュー',
    senders: [
      { sender: 'グレース・佐藤',   avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'レキシ・本郷',     avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'ハワード・林田',   avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'チェルシー・津村', avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'zh', flag: '🇨🇳', label: '中文',
    meetingName: 'Magic Minutes 上线复盘',
    senders: [
      { sender: '葛蕾思',  avatar: '/headshots/grace-sutherland.jpg' },
      { sender: '蕾茜',    avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: '霍华德',  avatar: '/headshots/howard-lerman.jpg' },
      { sender: '雪西',    avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
  {
    id: 'ar', flag: '🇸🇦', label: 'العربية',
    meetingName: 'مراجعة إطلاق Magic Minutes',
    senders: [
      { sender: 'غريس صالح',  avatar: '/headshots/grace-sutherland.jpg' },
      { sender: 'ليكسي بهجت', avatar: '/headshots/lexi-bohonnon.jpg' },
      { sender: 'هوارد لبيب',  avatar: '/headshots/howard-lerman.jpg' },
      { sender: 'شيلسي طارق', avatar: '/headshots/chelsea-turbin.jpg' },
    ],
  },
];

const TRANSLATION_TRANSITION_MS = 240;

const TRANSLATION_I18N = {
  en: {
    sectionLabels: { dms: 'Direct Messages', meetings: 'Meetings', groups: 'My Groups' },
    favoritesShort: { howard: 'Howard', grace: 'Grace', 'all-hands': 'All-Hands' },
    dms: { howard: 'Howard Lerman', grace: 'Grace Sutherland', klas: 'Klas Leino' },
    meetings: {
      compute: 'Inference Architecture Sync',
      'meet-mm-launch': 'Magic Minutes Launch Review',
      'meet-eval': 'ML Eval Triage',
      'meet-pdf': 'Magic PDF Spec Review',
      'meet-ainbox-ship': 'AInbox Ship Date Sync',
      'meet-q2': 'Q2 Planning',
      'meet-board': 'Board Prep',
      'meet-howard': 'Howard 1:1',
    },
  },
  fr: {
    sectionLabels: { dms: 'Messages directs', meetings: 'Réunions', groups: 'Mes groupes' },
    favoritesShort: { howard: 'Édouard', grace: 'Grâce', 'all-hands': 'Plénière' },
    dms: { howard: 'Édouard Lemerle', grace: 'Grâce Sauveterre', klas: 'Klaus Lainé' },
    meetings: {
      compute: "Sync d'architecture d'inférence",
      'meet-mm-launch': 'Bilan du lancement Magic Minutes',
      'meet-eval': 'Triage des évaluations ML',
      'meet-pdf': 'Revue de spec Magic PDF',
      'meet-ainbox-ship': "Sync date d'expédition AInbox",
      'meet-q2': 'Planification T2',
      'meet-board': 'Préparation conseil',
      'meet-howard': '1:1 avec Édouard',
    },
  },
  de: {
    sectionLabels: { dms: 'Direktnachrichten', meetings: 'Meetings', groups: 'Meine Gruppen' },
    favoritesShort: { howard: 'Hartmut', grace: 'Grete', 'all-hands': 'All-Hands' },
    dms: { howard: 'Hartmut Lermann', grace: 'Grete Sudermann', klas: 'Klaus Leinemann' },
    meetings: {
      compute: 'Inferenz-Architektur-Sync',
      'meet-mm-launch': 'Magic Minutes Launch-Review',
      'meet-eval': 'ML-Eval-Triage',
      'meet-pdf': 'Magic PDF Spec-Review',
      'meet-ainbox-ship': 'AInbox Liefertermin-Sync',
      'meet-q2': 'Q2-Planung',
      'meet-board': 'Board-Vorbereitung',
      'meet-howard': '1:1 mit Hartmut',
    },
  },
  pt: {
    sectionLabels: { dms: 'Mensagens diretas', meetings: 'Reuniões', groups: 'Meus grupos' },
    favoritesShort: { howard: 'Eduardo', grace: 'Graça', 'all-hands': 'Plenária' },
    dms: { howard: 'Eduardo Lermão', grace: 'Graça Saldanha', klas: 'Klaus Leitão' },
    meetings: {
      compute: 'Sync de arquitetura de inferência',
      'meet-mm-launch': 'Revisão do Lançamento do Magic Minutes',
      'meet-eval': 'Triagem de avaliações ML',
      'meet-pdf': 'Revisão de spec Magic PDF',
      'meet-ainbox-ship': 'Sync da data de envio do AInbox',
      'meet-q2': 'Planejamento do T2',
      'meet-board': 'Preparação do conselho',
      'meet-howard': '1:1 com Eduardo',
    },
  },
  es: {
    sectionLabels: { dms: 'Mensajes directos', meetings: 'Reuniones', groups: 'Mis grupos' },
    favoritesShort: { howard: 'Eduardo', grace: 'Gracia', 'all-hands': 'General' },
    dms: { howard: 'Eduardo Larrazábal', grace: 'Gracia Salvador', klas: 'Claudio Leinos' },
    meetings: {
      compute: 'Sync de arquitectura de inferencia',
      'meet-mm-launch': 'Revisión del Lanzamiento de Magic Minutes',
      'meet-eval': 'Triaje de evaluaciones ML',
      'meet-pdf': 'Revisión de la spec de Magic PDF',
      'meet-ainbox-ship': 'Sync de fecha de envío de AInbox',
      'meet-q2': 'Planificación del T2',
      'meet-board': 'Preparación del consejo',
      'meet-howard': '1:1 con Eduardo',
    },
  },
  ja: {
    sectionLabels: { dms: 'ダイレクト メッセージ', meetings: 'ミーティング', groups: 'マイ グループ' },
    favoritesShort: { howard: 'ハワード', grace: 'グレース', 'all-hands': '全社' },
    dms: { howard: 'ハワード・林田', grace: 'グレース・佐藤', klas: 'クラス・李野' },
    meetings: {
      compute: '推論アーキテクチャ同期',
      'meet-mm-launch': 'Magic Minutes ローンチレビュー',
      'meet-eval': 'ML 評価トリアージ',
      'meet-pdf': 'Magic PDF 仕様レビュー',
      'meet-ainbox-ship': 'AInbox 出荷日同期',
      'meet-q2': 'Q2 プランニング',
      'meet-board': 'ボード準備',
      'meet-howard': 'ハワードとの1on1',
    },
  },
  zh: {
    sectionLabels: { dms: '私信', meetings: '会议', groups: '我的群组' },
    favoritesShort: { howard: '霍华德', grace: '葛蕾思', 'all-hands': '全员' },
    dms: { howard: '霍华德·勒曼', grace: '葛蕾思·苏德兰', klas: '克拉斯·李诺' },
    meetings: {
      compute: '推理架构同步',
      'meet-mm-launch': 'Magic Minutes 上线复盘',
      'meet-eval': 'ML 评估分诊',
      'meet-pdf': 'Magic PDF 规格评审',
      'meet-ainbox-ship': 'AInbox 上线日期同步',
      'meet-q2': 'Q2 规划',
      'meet-board': '董事会筹备',
      'meet-howard': '与霍华德的 1:1',
    },
  },
  ar: {
    sectionLabels: { dms: 'الرسائل المباشرة', meetings: 'الاجتماعات', groups: 'مجموعاتي' },
    favoritesShort: { howard: 'هوارد', grace: 'غريس', 'all-hands': 'اجتماع شامل' },
    dms: { howard: 'هوارد لبيب', grace: 'غريس صالح', klas: 'كلاس لينو' },
    meetings: {
      compute: 'مزامنة بنية الاستدلال',
      'meet-mm-launch': 'مراجعة إطلاق Magic Minutes',
      'meet-eval': 'فرز تقييمات التعلم الآلي',
      'meet-pdf': 'مراجعة مواصفات Magic PDF',
      'meet-ainbox-ship': 'مزامنة موعد إطلاق AInbox',
      'meet-q2': 'تخطيط الربع الثاني',
      'meet-board': 'تحضير مجلس الإدارة',
      'meet-howard': 'اجتماع فردي مع هوارد',
    },
  },
};

function MagicMinutesTranslationsPreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [pendingIdx, setPendingIdx] = useState(0);
  const [phase, setPhase] = useState('in');
  const [direction, setDirection] = useState('next');
  const [paused, setPaused] = useState(false);
  const lang = TRANSLATION_LANGUAGES[activeIdx];
  const selectedIdx = phase === 'out' ? pendingIdx : activeIdx;

  const transitionTo = (i) => {
    if (i === activeIdx && phase === 'in') return;
    setDirection(i > activeIdx ? 'next' : 'prev');
    setPendingIdx(i);
    setPhase('out');
  };

  useEffect(() => {
    if (phase !== 'out') return;
    const t = setTimeout(() => {
      setActiveIdx(pendingIdx);
      setPhase('in');
    }, TRANSLATION_TRANSITION_MS);
    return () => clearTimeout(t);
  }, [phase, pendingIdx]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDirection('next');
      setPendingIdx((prev) => {
        const base = phase === 'out' ? prev : activeIdx;
        return (base + 1) % TRANSLATION_LANGUAGES.length;
      });
      setPhase('out');
    }, 4000);
    return () => clearInterval(t);
  }, [paused, activeIdx, phase]);

  const messages = useMemo(() => {
    const baseSrc = AINBOX_AH_MESSAGES['meet-mm-launch'];
    const langMsgs = TRANSLATION_MESSAGES[lang.id] || TRANSLATION_MESSAGES.en;
    const senders = lang.senders || TRANSLATION_LANGUAGES[0].senders;
    const messagesArr = langMsgs.map((m, i) => {
      const sender = senders[i % senders.length];
      return {
        id: i + 1,
        sender: sender.sender,
        avatar: sender.avatar,
        time: m.time,
        text: m.body,
      };
    });
    return {
      ...AINBOX_AH_MESSAGES,
      'meet-mm-launch': {
        ...baseSrc,
        name: lang.meetingName || baseSrc.name,
        messages: messagesArr,
      },
    };
  }, [lang.id]);

  const i18n = TRANSLATION_I18N[lang.id] || TRANSLATION_I18N.en;

  const favorites = useMemo(() => (
    AINBOX_AH_FAVORITES.map((f) => ({ ...f, name: i18n.favoritesShort[f.id] || f.name }))
  ), [lang.id]);

  const sections = useMemo(() => (
    AINBOX_AH_SECTIONS.map((section) => {
      const label = i18n.sectionLabels[section.id] || section.label;
      const items = section.items.map((item) => {
        if (section.id === 'dms') return { ...item, name: i18n.dms[item.id] || item.name };
        if (section.id === 'meetings') return { ...item, name: i18n.meetings[item.id] || item.name };
        return item;
      });
      return { ...section, label, items };
    })
  ), [lang.id]);

  return (
    <div className="fp-mm-translations">
      <div
        className={`fp-mm-translations-stage fp-mm-translations-stage-${phase}-${direction}`}
      >
        <AInboxPreview
          key={lang.id}
          overrides
          view="chat"
          chatId="meet-mm-launch"
          messagesOverride={messages}
          favoritesOverride={favorites}
          sectionsOverride={sections}
        />
      </div>
      <div className="fp-mm-translations-flags" role="tablist" aria-label="Language">
        {TRANSLATION_LANGUAGES.map((l, i) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={i === selectedIdx}
            aria-label={l.label}
            className={`fp-mm-translations-flag ${i === selectedIdx ? 'fp-mm-translations-flag-active' : ''}`}
            onClick={() => { setPaused(true); transitionTo(i); }}
          >
            <span className="fp-mm-translations-flag-glyph">{l.flag}</span>
            <span className="fp-mm-translations-flag-label">{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HubSpotIntegrationPreview() {
  const [autoSync, setAutoSync] = useState(true);
  const [restrict, setRestrict] = useState(false);
  return (
    <div className="fp-mm-preview fp-hubspot-preview">
      <MagicMinutes win={noopWin('magicminutes')} onDrag={() => {}} meeting={{ defaultTab: 'summary' }} />
        <div className="fp-hubspot-scrim" aria-hidden="true" />
        <div className="fp-hubspot-dialog" role="dialog" aria-modal="true" aria-labelledby="fp-hubspot-title">
        <div className="fp-hubspot-header">
          <button type="button" className="fp-hubspot-close" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="fp-hubspot-titles">
            <div className="fp-hubspot-title" id="fp-hubspot-title">HubSpot</div>
            <div className="fp-hubspot-subtitle">Export Magic Minute summaries to HubSpot</div>
          </div>
          <span className="fp-hubspot-actions-spacer" aria-hidden="true" />
        </div>
        <div className="fp-hubspot-body">
          <div className="fp-hubspot-section-label">Admin</div>
          <div className="fp-hubspot-row">
            <div className="fp-hubspot-row-text">
              <div className="fp-hubspot-row-title">HubSpot</div>
              <div className="fp-hubspot-row-desc">Allow Roam to export Magic Minute summaries to HubSpot</div>
            </div>
            <button type="button" className="fp-hubspot-pill">
              <span>Linked</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6.5L8 10.5L12 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="fp-hubspot-row">
            <div className="fp-hubspot-row-text">
              <div className="fp-hubspot-row-title">Automatic Sync</div>
              <div className="fp-hubspot-row-desc">Automatically sync calendar meetings</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoSync}
              className={`fp-hubspot-toggle ${autoSync ? 'fp-hubspot-toggle-on' : ''}`}
              onClick={() => setAutoSync((v) => !v)}
            >
              <span className="fp-hubspot-toggle-knob" />
            </button>
          </div>
          <div className="fp-hubspot-row">
            <div className="fp-hubspot-row-text">
              <div className="fp-hubspot-row-title">Restrict Sync to Selected Members</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={restrict}
              className={`fp-hubspot-toggle ${restrict ? 'fp-hubspot-toggle-on' : ''}`}
              onClick={() => setRestrict((v) => !v)}
            >
              <span className="fp-hubspot-toggle-knob" />
            </button>
          </div>
        </div>
        <div className="fp-hubspot-footer">
          <button type="button" className="fp-hubspot-btn fp-hubspot-btn-secondary">Cancel</button>
          <button type="button" className="fp-hubspot-btn fp-hubspot-btn-primary">Done</button>
        </div>
      </div>
    </div>
  );
}

const AINBOX_STANDUP_MEETING = {
  title: 'AInbox Standup',
  when: '9:30 AM - 9:45 AM',
  calendarLabel: 'Daily AInbox Standup',
  location: 'Commercial',
  gridVideos: [
    { video: '/videos/Female/camila_torres.mp4',  poster: '/videos/Female/camila_torres.png' },
    { video: '/videos/Female/brooke_foster.mp4',  poster: '/videos/Female/brooke_foster.png' },
    { video: '/videos/Male/daniel_russell.mp4',   poster: '/videos/Male/daniel_russell.png' },
    { video: '/videos/Female/olivia_sanders.mp4', poster: '/videos/Female/olivia_sanders.png' },
  ],
  brief: "The AInbox team kicked off the day aligned on the threading rewrite and the confidential-messages rollout. Lexi shipped the new thread renderer behind the staff flag and is now wiring the @MagicMinutes prompt handler so any thread can be summarized inline. Howard pushed for a call to default confidential messages to a 24-hour TTL — the team agreed for the launch and will revisit. Chelsea closed the spec on folder reordering with drag-and-drop persistence and is taking the activity-view loading states to design today. Grace is running the legal review on guest-badge invites so external chat can ship at the same time.",
  nextSteps: [
    "Lexi to land the @MagicMinutes thread-prompt handler behind the staff flag by EOD Wednesday. 00:38",
    "Howard to ratify 24-hour default TTL for confidential messages and document the carve-outs. 01:05",
    "Chelsea to ship folder drag-and-drop reordering with server-side order persistence. 01:19",
    "Chelsea to walk activity-view loading states with design today and post the recording in the AInbox. 01:59",
    "Grace to close legal review on guest-badge invites so external chat ships at the same time. 02:34",
    "Lexi to publish the new threading benchmark numbers in #ainbox-launch. 03:15",
    "Team to drop launch risks in the thread before EOD Wednesday for triage in Friday's review. 03:40",
  ],
  transcript: [
    { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '00:12', text: "Morning — kicking off the AInbox standup. Yesterday I shipped the new thread renderer behind the staff flag. Today I'm wiring up the @MagicMinutes prompt handler so any thread can be summarized inline. Blocker: I need a call from Howard on whether confidential messages default to a TTL or live forever." },
    { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '00:38', text: "Default to 24-hour TTL for the launch. The whole point of confidential messages is they don't live forever — that's the differentiator vs. Slack. We can revisit if customers push back, but ship the opinionated default." },
    { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '01:05', text: "Product side — yesterday I closed the spec on folder reordering. Drag-and-drop with server-side persistence so the order syncs across web and desktop. Today I'm walking the activity-view loading states with design. Open question: do we keep Activity as an opt-in view or surface it in onboarding?" },
    { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '01:19', text: "Surface it in onboarding. Activity is the bridge for the iMessage-and-Gmail crowd — if we hide it, we lose them in week one. Make it the second screen of the AInbox tour." },
    { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '01:59', text: "On threading — early benchmarks are 3.2x faster scroll on the staff dogfood, and memory's flat under 80MB even with 10k messages loaded. I'll post the full numbers in #ainbox-launch this afternoon once I've run it on the M1 baseline too." },
    { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '02:34', text: "From the people side — I'm running legal review on guest-badge invites today so external chat can ship alongside the AInbox launch. Blocker on me: I need 15 minutes from Chelsea to confirm the exact data exposed to a guest before legal will sign off." },
    { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '03:15', text: "I'll grab the 15 right after standup. Short version for the room — guests see the chat they're added to, the members of that chat, and the message history from the moment they were invited. They don't see other channels, the directory, or anything outside that chat." },
    { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '03:40', text: "Last thing — I'll lock the AInbox launch checklist by Thursday and post in #ainbox-launch. Anyone with risks, drop them in the thread before EOD Wednesday so we can triage live in Friday's review. That's it from me." },
  ],
};

// All-Hands themed Magic Minutes content for the Theater "Magic Minutes for
// the whole audience" section visual.
const THEATER_ALL_HANDS_MEETING = {
  title: 'Q2 All-Hands',
  when: '10:00 AM - 11:00 AM',
  calendarLabel: 'Roam All-Hands',
  location: 'Walt Disney Theater',
  brief: "Howard opened the all-hands with Q1 results — ARR up 38% quarter-over-quarter, three new enterprise wins, and net retention crossing 130%. Grace walked the company through Q2 hiring plans, including the EMEA cluster landing in May, and the redesigned onboarding journey built around the virtual office. Chelsea recapped the product roadmap: Magic Minutes hits GA next month, Theater enters open beta with whisper rows and stereo reactions, and the API opens to a wider group of design partners. The session closed with live audience Q&A captured directly from Theater.",
  nextSteps: [
    "Howard to share the full Q1 board deck in AInbox by end of week. 03:18",
    "Engineering leads to finalize Magic Minutes launch checklist and submit risks by Thursday. 21:12",
    "Grace to publish the EMEA onboarding plan and buddy assignments in #all-hands. 08:55",
    "Chelsea to open Theater open-beta sign-ups for every pod via the AInbox digest. 14:24",
    "All managers to run team-level retros within seven days and send rollups to chiefs of staff. 28:48",
    "Open Q&A items deferred for follow-up are tagged in Magic Minutes — reply to assign owners. 41:02",
  ],
  transcript: [
    { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '00:32', text: "Welcome to the Q2 All-Hands, everyone. I want to start by celebrating one of our strongest quarters yet. ARR is up 38% quarter-over-quarter, we closed three enterprise deals over a million dollars each, and net retention just crossed 130%. That's not luck — that's every team in this Theater pulling in the same direction.", active: false },
    { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '03:18', text: "Today we're going to spend most of our time looking forward. Q2 is the quarter we go from product-led to product-and-platform-led. Magic Minutes ships to GA, Theater hits open beta, and we open the API to a wider group of design partners. Before I hand it off, thank you to everyone who shipped through the holiday slowdown — you set us up for this.", active: false },
    { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '08:55', text: "On the people side — we're hiring 27 folks this quarter, with a meaningful EMEA cluster landing in May. I've redesigned the buddy program around the virtual office, so every new hire gets a Theater intro on day one and a guided tour of the rooms by the end of week one.", active: false },
    { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '14:24', text: "Product update: Magic Minutes ships to general availability next month with auto-summaries, action items, and audience-wide recaps for Theater sessions. Theater itself enters open beta with whisper rows and stereo reactions — what you're experiencing in this all-hands is built on those features.", active: true },
    { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '21:12', text: "On the engineering side — the Magic Minutes infrastructure is fully on-device for transcription, with cloud-side summarization where a bigger model adds value. We finished the security review last week, and the EU residency option ships alongside GA.", active: false },
    { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '28:48', text: "One of the things I love about this all-hands format is that the entire company sees the same context at the same time. Magic Minutes will distribute this recap to anyone who couldn't attend — same transcript, same action items, same chat, no information asymmetry.", active: false },
    { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '35:30', text: "Quick people note — please use the new whisper rows responsibly. Side conversations during all-hands are a feature, not a workaround. They're how we make a 600-person room feel like a real auditorium without anyone losing the thread.", active: false },
    { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '41:02', text: "Closing the loop on Q&A — everything you raised in the audience chat is captured. I'll triage with the team this afternoon and reply with owners attached. Thanks for the energy today, everyone.", active: false },
  ],
};

function RecordingsPreview({ initialTab, onAirRecording } = {}) {
  return (
    <div className="fp-rec-preview">
      <Recordings win={noopWin('recordings')} onDrag={() => {}} initialTab={initialTab} onAirRecording={onAirRecording} />
    </div>
  );
}

/* Mobile feature page preview — wraps the existing MobileWindow component
   in a stage so the iPhone/Pixel mock can drive each section's visual.
   `initialTab` and `initialView` let us point at the overworld, the map,
   the AInbox, or the camera roll without keeping per-section markup. */
function MobilePreview({ initialTab = 'roam', initialView = 'overworld', initialPlatform = 'ios', lockscreen = false, theater = false, richMap = false } = {}) {
  // When `richMap` is set we hand the desktop ShowcaseMap into MobileWindow via
  // the `mapContent` prop so the phone's map view shows the same rich room
  // treatment (badges, theater seats, game-room leaderboard, etc) as the
  // desktop showcase. CSS in MobileWindow.css clips the embedded map's chrome
  // so only the floor renders inside the phone screen.
  const mapContent = richMap && initialView === 'map'
    ? <MapPreview initialFloor="R&D" />
    : null;
  return (
    <div className="fp-mobile-preview">
      <MobileWindow
        win={noopWin('mobile')}
        onDrag={() => {}}
        initialTab={initialTab}
        initialView={initialView}
        initialPlatform={initialPlatform}
        lockscreen={lockscreen}
        theater={theater}
        mapContent={mapContent}
      />
    </div>
  );
}

function CalendarPreview() {
  return (
    <div className="fp-cal-preview">
      <Calendar win={noopWin('calendar')} onDrag={() => {}} />
    </div>
  );
}

function LobbyPreview({ initialNav, initialSelectedLinkId, initialDetailSection, initialLinks, scrollDetailToBottom } = {}) {
  return (
    <Lobby
      win={noopWin('lobby')}
      onDrag={() => {}}
      initialNav={initialNav}
      initialSelectedLinkId={initialSelectedLinkId}
      initialDetailSection={initialDetailSection}
      initialLinks={initialLinks}
      scrollDetailToBottom={scrollDetailToBottom}
    />
  );
}

const MULTI_HOST_LINKS = [
  {
    id: 1,
    name: 'Quarterly Business Review',
    slug: 'ro.am/roam/qbr',
    duration: '60m',
    dropIn: false,
    hasThumb: true,
    active: true,
    hosts: [
      { name: 'John Moffa', email: 'john@ro.am', avatar: '/headshots/john-moffa.jpg' },
      { name: 'Peter Lerman', email: 'peter@ro.am', avatar: '/headshots/peter-lerman.jpg' },
    ],
    roundRobinHosts: [
      { name: 'Joe Woodward', email: 'joe@ro.am', avatar: '/headshots/joe-woodward.jpg' },
    ],
  },
];

const ROUND_ROBIN_LINKS = [
  {
    id: 1,
    name: 'Talk to Sales',
    slug: 'ro.am/roam/sales-rotation',
    duration: '20m',
    type: 'Round Robin',
    dropIn: true,
    hasThumb: true,
    active: true,
    hosts: [],
    roundRobinHosts: [
      { name: 'Joe Woodward',  email: 'joe@ro.am',     avatar: '/headshots/joe-woodward.jpg' },
      { name: 'Peter Lerman',  email: 'peter@ro.am',   avatar: '/headshots/peter-lerman.jpg' },
      { name: 'Howard Lerman', email: 'howard@ro.am',  avatar: '/headshots/howard-lerman.jpg' },
      { name: 'Sean MacIsaac', email: 'sean@ro.am',    avatar: '/headshots/sean-macisaac.jpg' },
      { name: 'Klas Leino',    email: 'klas@ro.am',    avatar: '/headshots/klas-leino.jpg' },
    ],
  },
];

const USE_CASE_LINKS = [
  { id: 1, name: 'Sales Demo',         slug: 'ro.am/joe/sales',     duration: '30m', dropIn: true,  active: true,  thumb: '/lobby/lobby-purple.png' },
  { id: 2, name: 'Customer Support',   slug: 'ro.am/joe/support',   duration: '15m', dropIn: true,  active: true,  thumb: '/lobby/lobby-green.png'  },
  { id: 3, name: 'Recruiting Loop',    slug: 'ro.am/joe/hiring',    duration: '45m', dropIn: false, active: true,  thumb: '/lobby/lobby-thumb.png'  },
  { id: 4, name: 'Office Hours',       slug: 'ro.am/joe/office',    duration: '20m', dropIn: true,  active: true,  thumb: '/lobby/lobby-green.png'  },
  { id: 5, name: 'VIP Access',         slug: 'ro.am/joe/vip',       duration: '60m', dropIn: true,  active: false, thumb: '/lobby/lobby-purple.png' },
];

function LobbyBookingPreview() {
  const [mode, setMode] = useState('minimal');
  const [is24h, setIs24h] = useState(false);
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayD = now.getDate();
  const [viewYear, setViewYear] = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM);
  const [selected, setSelected] = useState({ y: todayY, m: todayM, d: todayD });
  const [selectedSlotMins, setSelectedSlotMins] = useState(10 * 60);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long' });
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const days = [];
  for (let i = 0; i < cells.length; i += 7) days.push(cells.slice(i, i + 7));

  // Available days in the visible month = today + future weekdays (Mon–Fri).
  const isPastMonth = viewYear < todayY || (viewYear === todayY && viewMonth < todayM);
  const isCurrentMonth = viewYear === todayY && viewMonth === todayM;
  const availableDays = new Set();
  if (!isPastMonth) {
    const startDay = isCurrentMonth ? todayD : 1;
    for (let d = startDay; d <= daysInMonth; d++) {
      const dow = new Date(viewYear, viewMonth, d).getDay();
      if (dow !== 0 && dow !== 6) availableDays.add(d);
    }
  }
  const selectedInView = selected.y === viewYear && selected.m === viewMonth ? selected.d : null;
  const selectedDate = new Date(selected.y, selected.m, selected.d);
  const selectedDow = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });

  const goPrev = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNext = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const slotMinutes = [9*60+30, 10*60, 10*60+30, 11*60, 11*60+30, 12*60, 12*60+30, 13*60, 13*60+30, 14*60, 14*60+30, 15*60];
  const formatSlot = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (is24h) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const h12 = h % 12 || 12;
    const ap = h < 12 ? 'am' : 'pm';
    return `${h12}:${String(m).padStart(2, '0')}${ap}`;
  };

  return (
    <div className="fp-lbk-stage">
    <div className="fp-lbk-browser">
      <div className="fp-lbk-chrome">
        <div className="fp-lbk-lights">
          <span className="fp-lbk-light fp-lbk-light-close" />
          <span className="fp-lbk-light fp-lbk-light-min" />
          <span className="fp-lbk-light fp-lbk-light-max" />
        </div>
        <div className="fp-lbk-urlbar">ro.am/howard</div>
        <div className="fp-lbk-chrome-spacer" />
      </div>
      <div className={`fp-lbk-page ${mode === 'skeu' ? 'fp-lbk-page-skeu' : ''}`}>
        <div className="fp-lbk-pane fp-lbk-pane-minimal" hidden={mode !== 'minimal'}>
        <div className="fp-lbk-card">
          <div className="fp-lbk-col fp-lbk-col-host">
            <img className="fp-lbk-avatar" src="/headshots/howard-lerman.jpg" alt="" />
            <p className="fp-lbk-host-name">Meet with Howard</p>
            <div className="fp-lbk-host-meta">
              <div className="fp-lbk-meta-row">
                <ClockIcon16 />
                <span>8 mins or Drop-In</span>
              </div>
              <div className="fp-lbk-meta-row">
                <PinIcon16 />
                <span>Roam HQ</span>
              </div>
              <div className="fp-lbk-meta-row">
                <GlobeIcon16 />
                <span>EST · New York</span>
                <ChevronDown12 />
              </div>
            </div>
            <a
              href="https://ro.am/howard"
              target="_blank"
              rel="noopener noreferrer"
              className="fp-lbk-dropin"
            >
              <span className="fp-lbk-dropin-pulse" />
              Drop-In Now
            </a>
          </div>
          <div className="fp-lbk-col fp-lbk-col-month">
            <div className="fp-lbk-month-head">
              <div className="fp-lbk-month-label">
                <span className="fp-lbk-month-name">{monthName}</span>
                <span className="fp-lbk-month-year">{viewYear}</span>
              </div>
              <div className="fp-lbk-month-nav">
                <button type="button" className="fp-lbk-icon-btn" onClick={goPrev} aria-label="Previous month"><ChevronLeft16 /></button>
                <button type="button" className="fp-lbk-icon-btn" onClick={goNext} aria-label="Next month"><ChevronRight16 /></button>
              </div>
            </div>
            <div className="fp-lbk-week">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d} className="fp-lbk-week-day">{d}</span>
              ))}
            </div>
            {days.map((row, ri) => (
              <div key={ri} className="fp-lbk-week">
                {row.map((d, di) => {
                  if (d == null) return <span key={di} className="fp-lbk-day fp-lbk-day-empty" />;
                  const isSelected = d === selectedInView;
                  const isAvailable = availableDays.has(d);
                  if (!isAvailable && !isSelected) {
                    return <span key={di} className="fp-lbk-day">{d}</span>;
                  }
                  const cls = isSelected
                    ? 'fp-lbk-day fp-lbk-day-selected'
                    : 'fp-lbk-day fp-lbk-day-available';
                  return (
                    <button
                      key={di}
                      type="button"
                      className={cls}
                      onClick={() => setSelected({ y: viewYear, m: viewMonth, d })}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="fp-lbk-col fp-lbk-col-slots">
            <div className="fp-lbk-slots-head">
              <div className="fp-lbk-month-label">
                <span className="fp-lbk-month-name">{selectedDow}</span>
                <span className="fp-lbk-month-year">{selected.d}</span>
              </div>
              <div className="fp-lbk-tabs">
                <button
                  type="button"
                  className={`fp-lbk-tab ${!is24h ? 'fp-lbk-tab-active' : ''}`}
                  onClick={() => setIs24h(false)}
                >
                  12h
                </button>
                <button
                  type="button"
                  className={`fp-lbk-tab ${is24h ? 'fp-lbk-tab-active' : ''}`}
                  onClick={() => setIs24h(true)}
                >
                  24h
                </button>
              </div>
            </div>
            <div className="fp-lbk-slots">
              {slotMinutes.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`fp-lbk-slot ${mins === selectedSlotMins ? 'fp-lbk-slot-selected' : ''}`}
                  onClick={() => setSelectedSlotMins(mins)}
                >
                  {formatSlot(mins)}
                </button>
              ))}
            </div>
            <div className="fp-lbk-action">
              <button type="button" className="fp-lbk-next">Next</button>
            </div>
          </div>
        </div>
        <img className="fp-lbk-roam-logo" src="/icons/roam-logo.png" alt="roam" />
        </div>
        <div className="fp-lbk-pane fp-lbk-pane-skeu" hidden={mode !== 'skeu'}>
          <div className="fp-lbk-skeu">
            <img className="fp-lbk-skeu-wordmark" src="/icons/roam-logo.png" alt="" aria-hidden="true" />
            <div className="fp-lbk-skeu-id">
              <img className="fp-lbk-skeu-avatar" src="/headshots/howard-lerman.jpg" alt="" />
              <div className="fp-lbk-skeu-name-block">
                <div className="fp-lbk-skeu-name">Howard Lerman</div>
                <div className="fp-lbk-skeu-org">Roam</div>
              </div>
            </div>
            <a
              href="https://ro.am/howard"
              target="_blank"
              rel="noopener noreferrer"
              className="fp-lbk-skeu-cta"
            >
              <span className="fp-lbk-skeu-cta-pulse" />
              <span>Drop-In Now</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <div className="fp-lbk-skeu-card">
              <div className="fp-lbk-skeu-section">
                <div className="fp-lbk-skeu-card-title">Meet with Howard</div>
                <div className="fp-lbk-skeu-meta">
                  <div className="fp-lbk-skeu-meta-row"><PinIcon16 /><span>Roam HQ</span></div>
                  <div className="fp-lbk-skeu-meta-row"><ClockIcon16 /><span>8 mins · One-on-One</span></div>
                  <div className="fp-lbk-skeu-meta-row">
                    <DropInIcon16 />
                    <span>Drop-Ins</span>
                    <span className="fp-lbk-skeu-pill">
                      <span className="fp-lbk-skeu-pill-dot" />
                      OPEN
                    </span>
                  </div>
                </div>
              </div>
              <div className="fp-lbk-skeu-divider" />
              <div className="fp-lbk-skeu-section">
                <div className="fp-lbk-skeu-section-title">Select a Date &amp; Time</div>
                <div className="fp-lbk-month-head">
                  <div className="fp-lbk-month-label">
                    <span className="fp-lbk-month-name">{monthName}</span>
                    <span className="fp-lbk-month-year">{viewYear}</span>
                  </div>
                  <div className="fp-lbk-month-nav">
                    <button type="button" className="fp-lbk-icon-btn" onClick={goPrev} aria-label="Previous month"><ChevronLeft16 /></button>
                    <button type="button" className="fp-lbk-icon-btn" onClick={goNext} aria-label="Next month"><ChevronRight16 /></button>
                  </div>
                </div>
                <div className="fp-lbk-skeu-cal-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="fp-lbk-week-day">{d}</span>
                  ))}
                  {days.flat().map((d, i) => {
                    if (d == null) return <span key={i} className="fp-lbk-day fp-lbk-day-empty" />;
                    const isSelected = d === selectedInView;
                    const isAvailable = availableDays.has(d);
                    if (!isAvailable && !isSelected) {
                      return <span key={i} className="fp-lbk-day">{d}</span>;
                    }
                    const cls = isSelected
                      ? 'fp-lbk-day fp-lbk-day-selected'
                      : 'fp-lbk-day fp-lbk-day-available';
                    return (
                      <button
                        key={i}
                        type="button"
                        className={cls}
                        onClick={() => setSelected({ y: viewYear, m: viewMonth, d })}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="fp-lbk-mode-tabs" role="tablist" aria-label="Lobby design">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'minimal'}
        className={`fp-lbk-mode-tab ${mode === 'minimal' ? 'fp-lbk-mode-tab-active' : ''}`}
        onClick={() => setMode('minimal')}
      >
        Minimal
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'skeu'}
        className={`fp-lbk-mode-tab ${mode === 'skeu' ? 'fp-lbk-mode-tab-active' : ''}`}
        onClick={() => setMode('skeu')}
      >
        Skeumorphic
      </button>
    </div>
    </div>
  );
}

function DropInIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fill="currentColor" d="M9.64638 7.64648L8.49994 8.79293L8.49994 2.50003C8.49994 2.22389 8.27608 2.00003 7.99994 2.00003C7.7238 2.00003 7.49994 2.22389 7.49994 2.50003L7.49994 8.79292L6.35349 7.64648C6.15823 7.45122 5.84165 7.45122 5.64638 7.64648C5.45112 7.84174 5.45112 8.15832 5.64638 8.35358L7.64638 10.3536C7.84165 10.5488 8.15823 10.5488 8.35349 10.3536L10.3535 8.35359C10.5488 8.15832 10.5488 7.84174 10.3535 7.64648C10.1582 7.45122 9.84165 7.45122 9.64638 7.64648Z" />
      <path fill="currentColor" d="M4.11081 11.2891C3.91555 11.0938 3.59897 11.0938 3.40371 11.2891C3.20845 11.4844 3.20845 11.8009 3.40371 11.9962C5.94212 14.5346 10.0577 14.5346 12.5961 11.9962C12.7914 11.8009 12.7914 11.4844 12.5961 11.2891C12.4008 11.0938 12.0843 11.0938 11.889 11.2891C9.7411 13.437 6.2587 13.437 4.11081 11.2891Z" />
    </svg>
  );
}

function ClockIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fill="currentColor" d="m8 2c3.3137 0 6 2.68629 6 6 0 3.3137-2.6863 6-6 6-3.31371 0-6-2.6863-6-6 0-3.31371 2.68629-6 6-6zm0 1c-2.76142 0-5 2.23858-5 5 0 2.7614 2.23858 5 5 5 2.7614 0 5-2.2386 5-5 0-2.76142-2.2386-5-5-5zm-.49847 2c.24546 0 .44961.17688.49194.41012l.00806.08988v2.5h1.49847c.27614 0 .5.22386.5.5 0 .24546-.17688.44961-.41012.49194l-.08988.00806h-1.99847c-.24546 0-.44961-.17688-.49195-.41012l-.00805-.08988v-3c0-.27614.22385-.5.5-.5z" />
    </svg>
  );
}
function PinIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fill="currentColor" d="m12 3.33838c-3.73631 0-6.75 2.99092-6.75 6.66172 0 2.8853 1.71237 5.4554 3.5414 7.3633.90378.9427 1.81 1.6964 2.4908 2.2144.2859.2174.5309.3925.7178.5217.1869-.1292.4319-.3043.7178-.5217.6808-.518 1.587-1.2717 2.4908-2.2144 1.829-1.9079 3.5414-4.478 3.5414-7.3633 0-3.6708-3.0137-6.66172-6.75-6.66172zm0 17.66162c-.395.6375-.3955.6373-.3955.6373l-.0024-.0016-.0056-.0035-.0193-.0121c-.0163-.0103-.0395-.0251-.0692-.0444-.0594-.0384-.1446-.0946-.252-.1676-.2148-.1461-.5187-.3601-.882-.6365-.72539-.5519-1.69418-1.3571-2.6654-2.3702-1.92097-2.0038-3.9586-4.9336-3.9586-8.4013 0-4.51592 3.70204-8.16172 8.25-8.16172 4.548 0 8.25 3.6458 8.25 8.16172 0 3.4677-2.0376 6.3975-3.9586 8.4013-.9712 1.0131-1.94 1.8183-2.6654 2.3702-.3633.2764-.6672.4904-.882.6365-.1074.073-.1926.1292-.252.1676-.0297.0193-.0529.0341-.0692.0444l-.0193.0121-.0056.0035-.0018.0012s-.0011.0006-.3961-.6369zm0 0 .395.6375c-.242.15-.5485.1497-.7905-.0002z" />
    </svg>
  );
}
function GlobeIcon16() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fill="currentColor" d="m14 8c0 3.3137-2.6863 6-6 6-3.31371 0-6-2.6863-6-6 0-3.31371 2.68629-6 6-6 3.3137 0 6 2.68629 6 6zm-1.0247.5h-2.4846c-.0764 2.0266-.6169 3.3761-1.29711 4.3566 2.02821-.4967 3.57071-2.2308 3.78171-4.3566zm-4.97527 4.2668c.73239-.8505 1.40107-2.0916 1.48997-4.2668h-2.97999c.08891 2.1752.75762 3.4163 1.49002 4.2668zm-1.19356.0899c-.68023-.9806-1.22079-2.3301-1.29721-4.3567h-2.48457c.21106 2.1258 1.75356 3.8599 3.78178 4.3567zm-.29647-5.3567h2.97999c-.08891-2.17522-.75762-3.41632-1.49002-4.26677-.73238.85046-1.40107 2.09156-1.48997 4.26677zm-1.00074 0c.0764-2.02661.61694-3.37607 1.29715-4.35664-2.0282.49675-3.57066 2.23086-3.78172 4.35664zm7.46604 0c-.2111-2.1258-1.7535-3.85992-3.78177-4.35666.68023.98057 1.22077 2.33003 1.29717 4.35666z" />
    </svg>
  );
}
function ChevronDown12() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LobbyShelfPreview() {
  const items = [
    { src: '/shelf/wonka.avif',             alt: 'Movie poster' },
    { src: '/shelf/walt.webp',              alt: 'Walt Disney portrait' },
    { src: '/shelf/ready-player-one.jpeg',  alt: 'Movie poster' },
    { src: '/shelf/epcot.jpg',              alt: 'Spaceship Earth' },
    { src: '/shelf/moon.jpeg',              alt: 'Moon' },
  ];
  return (
    <div className="fp-lobby-shelf">
      <div className="fp-lobby-shelf-stage">
        <div className="fp-lobby-shelf-items">
          {items.map((it, i) => (
            <div key={i} className="fp-lobby-shelf-item">
              <img src={it.src} alt={it.alt} />
            </div>
          ))}
        </div>
        <div className="fp-lobby-shelf-base" />
      </div>
    </div>
  );
}

function LobbyEmbedPreview() {
  const [config, setConfig] = useState('booking_only');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('blue');
  const baseUrl = 'https://ro.am/joe/lobby-7';
  const accentHex = {
    red:    '#FF4D4F',
    orange: '#FFB020',
    green:  '#22C55E',
    blue:   '#0059DC',
    purple: '#7C3AED',
  }[accent];
  const snippet = config === 'drop_in_button'
    ? `<!-- Roam inline widget begin -->
<div id="roam-lobby" style="width: 300px;"></div>
<script type="text/javascript" src="https://ro.am/lobbylinks/embed.js"></script>
<script>
  const parentElement = document.getElementById("roam-lobby");
  Roam.initLobbyEmbed({
    url: "${baseUrl}",
    parentElement,
    lobbyConfiguration: "${config}",
    theme: "${theme}",
  });
</script>
<!-- Roam inline widget end -->`
    : `<!-- Roam inline widget begin -->
<div id="roam-lobby" style="min-width: 320px;"></div>
<script type="text/javascript" src="https://ro.am/lobbylinks/embed.js"></script>
<script>
  const parentElement = document.getElementById("roam-lobby");
  Roam.initLobbyEmbed({
    url: "${baseUrl}",
    parentElement,
    lobbyConfiguration: "${config}",
    accentColor: "${accentHex}",
    theme: "${theme}",
</script>
<!-- Roam inline widget end -->`;

  return (
    <div className="fp-emb-stage">
      <div className="fp-emb-frame">
        <LobbyPreview
          initialNav="my-links"
          initialSelectedLinkId={1}
          initialDetailSection="basics"
          initialLinks={MULTI_HOST_LINKS}
        />
        <div className="fp-emb-scrim" />
        <div className="fp-emb-dialog">
        <header className="fp-emb-header">
          <button type="button" className="fp-emb-close" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <h3 className="fp-emb-title">Embed Lobby</h3>
        </header>
        <div className="fp-emb-body">
          <div className="fp-emb-configs">
            <EmbedConfig
              label="Calendar"
              selected={config === 'booking_only'}
              accent={accentHex}
              variant="calendar"
              onClick={() => setConfig('booking_only')}
            />
            <EmbedConfig
              label="Button"
              selected={config === 'drop_in_button'}
              accent={accentHex}
              variant="button"
              onClick={() => setConfig('drop_in_button')}
            />
            <EmbedConfig
              label="Both"
              selected={config === 'default'}
              accent={accentHex}
              variant="both"
              onClick={() => setConfig('default')}
            />
          </div>
          <div className="fp-emb-row">
            <span className="fp-emb-row-label">Theme</span>
            <button type="button" className="fp-emb-picker" onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}>
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
          {config !== 'drop_in_button' && (
            <div className="fp-emb-row">
              <span className="fp-emb-row-label">Accent Color</span>
              <div className="fp-emb-colors">
                {(['red','orange','green','blue','purple']).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`fp-emb-color ${accent === c ? 'fp-emb-color-active' : ''}`}
                    style={{ background: { red:'#FF4D4F', orange:'#FFB020', green:'#22C55E', blue:'#0059DC', purple:'#7C3AED' }[c] }}
                    onClick={() => setAccent(c)}
                    aria-label={c}
                  >
                    {accent === c && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.25L4.75 8.5L9.5 3.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
                <div className="fp-emb-color-add">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div className="fp-emb-row fp-emb-row-link">
            <span className="fp-emb-row-label">Advanced Configuration</span>
            <span className="fp-emb-chev">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <pre className="fp-emb-snippet">{snippet}</pre>
        </div>
        <footer className="fp-emb-footer">
          <button type="button" className="fp-emb-btn fp-emb-btn-secondary">Cancel</button>
          <button type="button" className="fp-emb-btn fp-emb-btn-primary">Copy Code</button>
        </footer>
        </div>
      </div>
    </div>
  );
}

function EmbedConfig({ label, selected, accent, variant, onClick }) {
  return (
    <button type="button" className={`fp-emb-config ${selected ? 'fp-emb-config-selected' : ''}`} onClick={onClick}>
      <div className="fp-emb-config-card">
        {variant !== 'button' && (
          <div className="fp-emb-config-cal">
            <div className="fp-emb-config-grid" style={{ color: accent }}>
              {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
            </div>
            <div className="fp-emb-config-list">
              <span /><span /><span /><span />
            </div>
          </div>
        )}
        {variant !== 'calendar' && (
          <div className="fp-emb-config-btn" style={{ background: accent }}>Drop-In →</div>
        )}
      </div>
      <span className="fp-emb-config-label">{label}</span>
    </button>
  );
}

function ChevronLeft16() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight16() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OnAirPreview() {
  return <OnAir win={noopWin('onair')} onDrag={() => {}} demo />;
}

function OnAirCurtainVisual() {
  const event = useOnAirEvent();
  const speakers = event.hosts;
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      setStarted(true);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const v = videoRef.current;
            if (v) {
              try { v.currentTime = 0; } catch (_) {}
              const p = v.play();
              if (p && typeof p.catch === 'function') p.catch(() => {});
            }
            // Defer the class flip by one frame so the browser commits the
            // initial opacity:0 state before the animation kicks in.
            requestAnimationFrame(() => requestAnimationFrame(() => setStarted(true)));
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="fp-onair-curtain">
      <video
        ref={videoRef}
        className="fp-onair-curtain-video"
        src="/on-air/curtain-open.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className={`fp-onair-curtain-content ${started ? 'fp-onair-curtain-content-started' : ''}`}>
        <h1 className="fp-onair-rsvp-title">{event.title}</h1>
        <p className="fp-onair-rsvp-desc">{event.desc}</p>
        <div className="fp-onair-rsvp-meta">
          <p className="fp-onair-rsvp-date">{event.dateShort}</p>
          <p className="fp-onair-rsvp-time">{event.time}</p>
          <p className="fp-onair-rsvp-loc">{event.location}</p>
        </div>
        <div className="fp-onair-rsvp-speakers">
          {speakers.map((s, i) => (
            <div key={i} className="fp-onair-rsvp-speaker">
              <img className="fp-onair-rsvp-speaker-avatar" src={s.avatar} alt="" />
              <span className="fp-onair-rsvp-speaker-name">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="fp-onair-rsvp-actions">
          <button type="button" className="fp-onair-rsvp-btn fp-onair-rsvp-btn-going">
            <img src="/on-air/checkmark-icon.svg" alt="" width="16" height="16" />
            <span>Going</span>
          </button>
          <button type="button" className="fp-onair-rsvp-btn fp-onair-rsvp-btn-maybe">
            <img src="/on-air/question-icon.svg" alt="" width="16" height="16" />
            <span>Maybe</span>
          </button>
          <button type="button" className="fp-onair-rsvp-btn fp-onair-rsvp-btn-cantgo">
            <img src="/on-air/dismiss-icon.svg" alt="" width="16" height="16" />
            <span>Can&rsquo;t Go</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OnAirEpcotVisual() {
  return (
    <img
      className="fp-onair-epcot-img"
      src="/shelf/walt-disney-epcot.png"
      alt="Walt Disney presenting the Florida Project / Epcot plans"
    />
  );
}


/* On-Air RSVP page — ported from /Users/joewoodward/Developer/on-air/src/app/page.tsx,
   wrapped in the lobby-booking mock browser frame (.fp-lbk-browser). */
function OnAirRsvpPreview() {
  const event = useOnAirEvent();
  const speakers = event.hosts;
  return (
    <div className="fp-lbk-stage">
      <div className="fp-lbk-browser fp-onair-rsvp-browser">
        <div className="fp-lbk-chrome">
          <div className="fp-lbk-lights">
            <span className="fp-lbk-light fp-lbk-light-close" />
            <span className="fp-lbk-light fp-lbk-light-min" />
            <span className="fp-lbk-light fp-lbk-light-max" />
          </div>
          <div className="fp-lbk-urlbar">ro.am/on-air/{event.slug}</div>
          <div className="fp-lbk-chrome-spacer" />
        </div>
        <div className="fp-onair-rsvp-page">
          <video
            className="fp-onair-rsvp-curtain"
            src="/on-air/curtain-sway.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="fp-onair-rsvp-content">
            <h1 className="fp-onair-rsvp-title">{event.title}</h1>
            <p className="fp-onair-rsvp-desc">{event.desc}</p>
            <div className="fp-onair-rsvp-meta">
              <p className="fp-onair-rsvp-date">{event.dateShort}</p>
              <p className="fp-onair-rsvp-time">{event.time}</p>
              <p className="fp-onair-rsvp-loc">{event.location}</p>
            </div>
            <div className="fp-onair-rsvp-speakers">
              {speakers.map((s, i) => (
                <div key={i} className="fp-onair-rsvp-speaker">
                  <img className="fp-onair-rsvp-speaker-avatar" src={s.avatar} alt="" />
                  <span className="fp-onair-rsvp-speaker-name">{s.name}</span>
                </div>
              ))}
            </div>
            <div className="fp-onair-rsvp-actions">
              <button type="button" className="fp-onair-rsvp-btn fp-onair-rsvp-btn-going">
                <img src="/on-air/checkmark-icon.svg" alt="" width="16" height="16" />
                <span>Going</span>
              </button>
              <button type="button" className="fp-onair-rsvp-btn fp-onair-rsvp-btn-maybe">
                <img src="/on-air/question-icon.svg" alt="" width="16" height="16" />
                <span>Maybe</span>
              </button>
              <button type="button" className="fp-onair-rsvp-btn fp-onair-rsvp-btn-cantgo">
                <img src="/on-air/dismiss-icon.svg" alt="" width="16" height="16" />
                <span>Can&rsquo;t Go</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ONAIR_INVITE_EVENT/_GUESTS/_INITIAL_ADDED are now derived from the active
   on-air event via useOnAirEvent() — see ONAIR_EVENTS above. */

function OnAirInviteSubtitle({ subType, sub }) {
  if (!sub) return null;
  if (subType === 'event') {
    return (
      <div className="fp-oai-sub fp-oai-sub-event">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
          <path d="M6 3.25V6L7.75 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span>{sub}</span>
      </div>
    );
  }
  return <span className="fp-oai-sub fp-oai-sub-loc">{sub}</span>;
}

function OnAirInvitePreview() {
  const event = useOnAirEvent();
  const inviteEvent = useMemo(() => buildOnAirInviteEvent(event), [event]);
  const [addedNames, setAddedNames] = useState(() => new Set(event.inviteInitialAdded));
  const toggleAdded = (name) => {
    setAddedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  const invitees = event.inviteGuests.filter((g) => addedNames.has(g.name));
  return (
    <div className="fp-oai-stage">
      <div className="fp-oai-frame">
        <OnAir win={noopWin('onair-invite')} onDrag={() => {}} staticEvent={inviteEvent} />
        <div className="fp-oai-scrim" />
        <div className="fp-oai-dialog" role="dialog" aria-label="Invite">
          <header className="fp-oai-header">
            <button type="button" className="fp-oai-close-btn" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <p className="fp-oai-title">Invite</p>
            <span className="fp-oai-close-btn fp-oai-close-spacer" aria-hidden="true" />
          </header>
          <div className="fp-oai-content">
            {/* Left pane — guest list */}
            <div className="fp-oai-pane fp-oai-pane-left">
              <div className="fp-oai-pane-scroll">
                <div className="fp-oai-search">
                  <img src="/icons/oai-search.svg" alt="" width="16" height="16" />
                  <span className="fp-oai-search-text">Search</span>
                </div>
                <div className="fp-oai-chips">
                  <button type="button" className="fp-oai-chip">Past Guests</button>
                  <button type="button" className="fp-oai-chip fp-oai-chip-with-chev">
                    <span>Filter by Event</span>
                    <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
                      <path d="M1 1L4.5 4L8 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <div className="fp-oai-list">
                  {event.inviteGuests.map((g) => {
                    const isAdded = addedNames.has(g.name);
                    return (
                      <div key={g.name} className="fp-oai-cell">
                        <img className="fp-oai-avatar" src={g.avatar} alt="" />
                        <div className="fp-oai-labels">
                          <p className="fp-oai-name">{g.name}</p>
                          <OnAirInviteSubtitle subType={g.subType} sub={g.sub} />
                        </div>
                        <button
                          type="button"
                          className={`fp-oai-cell-btn fp-oai-cell-btn-${isAdded ? 'added' : 'add'}`}
                          onClick={() => toggleAdded(g.name)}
                        >
                          {isAdded ? 'Added' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="fp-oai-pane-actions">
                <button type="button" className="fp-oai-icon-btn" aria-label="Email">
                  <img src="/icons/oai-mail.svg" alt="" width="16" height="16" />
                </button>
                <button type="button" className="fp-oai-icon-btn" aria-label="Copy link">
                  <img src="/icons/oai-link.svg" alt="" width="16" height="16" />
                </button>
                <button type="button" className="fp-oai-icon-btn" aria-label="Share">
                  <img src="/icons/oai-share.svg" alt="" width="16" height="16" />
                </button>
              </div>
            </div>

            {/* Right pane — message + invitees */}
            <div className="fp-oai-pane fp-oai-pane-right">
              <div className="fp-oai-section fp-oai-section-msg">
                <div className="fp-oai-section-head">
                  <p className="fp-oai-section-title">Message</p>
                </div>
                <div className="fp-oai-msg-body">
                  <p>
                    Hey [Name], you’re invited to the On-Air event: {event.title}.
                  </p>
                  <p>&nbsp;</p>
                  <p>
                    Can you make it? RSVP here to let the host know: [link to RSVP]
                    <span className="fp-oai-msg-edit" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </p>
                </div>
              </div>
              <div className="fp-oai-section fp-oai-section-invitees">
                <div className="fp-oai-section-head">
                  <p className="fp-oai-section-title">Invitees</p>
                </div>
                <div className="fp-oai-list fp-oai-list-invitees">
                  {invitees.map((g) => (
                    <div key={g.name} className="fp-oai-cell fp-oai-cell-static">
                      <img className="fp-oai-avatar" src={g.avatar} alt="" />
                      <div className="fp-oai-labels">
                        <p className="fp-oai-name">{g.name}</p>
                        <OnAirInviteSubtitle subType={g.subType} sub={g.sub} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fp-oai-pane-actions fp-oai-pane-actions-right">
                <button type="button" className="fp-oai-btn fp-oai-btn-secondary">Cancel</button>
                <button type="button" className="fp-oai-btn fp-oai-btn-primary">Send Invites</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ONAIR_SHARE_FORMATS = [
  { id: 'square', label: 'Square', w: 10, h: 10, bg: '/on-air/speaker-square-1080.png' },
  { id: 'landscape', label: 'Landscape', w: 12, h: 8, bg: '/on-air/speaker-landscape.png' },
  { id: 'portrait', label: 'Portrait', w: 8, h: 12, bg: '/on-air/speaker-portrait.png' },
];

function OnAirSharePreview() {
  const event = useOnAirEvent();
  const inviteEvent = useMemo(() => buildOnAirInviteEvent(event), [event]);
  const [format, setFormat] = useState('square');
  const activeBg = ONAIR_SHARE_FORMATS.find((f) => f.id === format)?.bg;
  return (
    <div className="fp-oai-stage">
      <div className="fp-oai-frame">
        <OnAir win={noopWin('onair-share')} onDrag={() => {}} staticEvent={inviteEvent} />
        <div className="fp-oai-scrim" />
        <div className="fp-oai-dialog fp-oas-dialog" role="dialog" aria-label="Share">
          <header className="fp-oai-header">
            <button type="button" className="fp-oai-close-btn" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <p className="fp-oai-title">Share</p>
            <span className="fp-oai-close-btn fp-oai-close-spacer" aria-hidden="true" />
          </header>
          <div className="fp-oas-body">
            <div className="fp-oas-toolbar">
              <button type="button" className="fp-oas-variant-chip">
                <span>T-7 DAYS</span>
                <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
                  <path d="M1 1L4.5 4L8 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="fp-oas-format-toggles">
                {ONAIR_SHARE_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`fp-oas-format-btn ${format === f.id ? 'fp-oas-format-btn-active' : ''}`}
                    aria-label={f.label}
                    aria-pressed={format === f.id}
                    onClick={() => setFormat(f.id)}
                  >
                    <span className="fp-oas-format-icon" style={{ width: f.w, height: f.h }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="fp-oas-poster-slot">
              <div className={`fp-oas-poster fp-oas-poster-${format}`}>
              <img
                className="fp-oas-poster-bg"
                src={activeBg}
                alt=""
                aria-hidden="true"
              />
              <div className="fp-oas-poster-content">
                <p className="fp-oas-poster-eyebrow">T-7 DAYS</p>
                <h3 className="fp-oas-poster-title">{event.posterTitle}</h3>
                <div className="fp-oas-poster-meta">
                  <p className="fp-oas-poster-date">{event.dateShort}</p>
                  <p className="fp-oas-poster-time">{event.time}</p>
                  <p className="fp-oas-poster-loc">{event.posterLocation}</p>
                </div>
                <div className="fp-oas-poster-hosts">
                  {event.hosts.map((h) => (
                    <div key={h.name} className="fp-oas-poster-host">
                      <img src={h.avatar} alt="" className="fp-oas-poster-host-avatar" />
                      <span className="fp-oas-poster-host-name">{h.name}</span>
                      <span className="fp-oas-poster-host-org">{event.hostOrg}</span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </div>
          <div className="fp-oas-footer">
            <button type="button" className="fp-oas-download-btn">
              <span className="fp-oas-download-label">Download</span>
              <span className="fp-oas-download-sub">Post on your socials and tag @roam for a repost!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ONAIR_GUEST_LIST is now derived per-event from useOnAirEvent().guestList. */

const STATUS_LABEL = { going: 'Going', maybe: 'Maybe', cantgo: 'Can’t Go' };

function OnAirGuestsPreview() {
  const event = useOnAirEvent();
  const inviteEvent = useMemo(() => buildOnAirInviteEvent(event), [event]);
  return (
    <div className="fp-oai-stage">
      <div className="fp-oai-frame">
        <OnAir win={noopWin('onair-guests')} onDrag={() => {}} staticEvent={inviteEvent} />
        <div className="fp-oai-scrim" />
        <div className="fp-oai-dialog fp-oag-dialog" role="dialog" aria-label="Guest List">
          <header className="fp-oai-header">
            <button type="button" className="fp-oai-close-btn" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <p className="fp-oai-title">Guest List</p>
            <button type="button" className="fp-oai-close-btn" aria-label="More">
              <svg width="3" height="13" viewBox="0 0 3 13" fill="none">
                <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
                <circle cx="1.5" cy="6.5" r="1.5" fill="currentColor" />
                <circle cx="1.5" cy="11.5" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </header>
          <div className="fp-oag-search-row">
            <div className="fp-oag-search">
              <img src="/icons/oai-search.svg" alt="" width="16" height="16" />
              <span className="fp-oag-search-text">Search Guests</span>
            </div>
            <button type="button" className="fp-oag-picker">
              <span>Status</span>
              <span className="fp-oag-picker-icon">
                <svg width="9" height="12" viewBox="0 0 9 12" fill="none">
                  <path d="M1 4L4.5 1L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 8L4.5 11L8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
          <div className="fp-oag-filter-chips">
            <span className="fp-oag-chip fp-oag-chip-going">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="6.5" fill="#46D08F" />
                <path d="M3.75 6.75L5.5 8.5L9.25 4.75" stroke="#0F1010" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Going</span>
            </span>
            <span className="fp-oag-chip">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(255,255,255,0.2)" />
                <path d="M5 5C5 4.17157 5.67157 3.5 6.5 3.5C7.32843 3.5 8 4.17157 8 5C8 5.55228 7.55228 6 7 6H6.5V7" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="6.5" cy="9" r="0.65" fill="white" />
              </svg>
              <span>Maybe</span>
            </span>
            <span className="fp-oag-chip fp-oag-chip-cantgo">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="6.5" fill="#EF5350" />
                <path d="M4.25 4.25L8.75 8.75M8.75 4.25L4.25 8.75" stroke="#0F1010" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span>Can&rsquo;t Go</span>
            </span>
          </div>
          <div className="fp-oag-list">
            {event.guestList.map((g) => (
              <div key={g.name} className="fp-oag-cell">
                <img className="fp-oag-avatar" src={g.avatar} alt="" />
                <div className="fp-oag-labels">
                  <p className="fp-oag-name">{g.name}</p>
                  <p className="fp-oag-time">{g.time}</p>
                </div>
                <button type="button" className={`fp-oag-status fp-oag-status-${g.status}`}>
                  <span>{STATUS_LABEL[g.status]}</span>
                  <svg width="9" height="5" viewBox="0 0 9 5" fill="none">
                    <path d="M1 1L4.5 4L8 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OnAirBlastPreview() {
  const event = useOnAirEvent();
  const inviteEvent = useMemo(() => buildOnAirInviteEvent(event), [event]);
  const [autoReminders, setAutoReminders] = useState(true);
  return (
    <div className="fp-oai-stage">
      <div className="fp-oai-frame">
        <OnAir win={noopWin('onair-blast')} onDrag={() => {}} staticEvent={inviteEvent} />
        <div className="fp-oai-scrim" />
        <div className="fp-oai-dialog fp-oab-dialog" role="dialog" aria-label="Text Blasts">
          <header className="fp-oai-header fp-oab-header">
            <button type="button" className="fp-oai-close-btn fp-oab-icon-btn" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <p className="fp-oai-title">Text Blasts</p>
            <button type="button" className="fp-oai-close-btn fp-oab-icon-btn" aria-label="New blast">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="fp-oab-body">
            <div className="fp-oab-card">
              <div className="fp-oab-row">
                <span className="fp-oab-row-label">Auto-Reminders</span>
                <button
                  type="button"
                  className={`fp-oab-toggle ${autoReminders ? 'fp-oab-toggle-on' : ''}`}
                  role="switch"
                  aria-checked={autoReminders}
                  onClick={() => setAutoReminders((v) => !v)}
                >
                  <span className="fp-oab-toggle-knob" />
                </button>
              </div>

              <p className="fp-oab-section-label">Reminders to RSVP</p>
              <div className="fp-oab-bracket-row">
                <span className="fp-oab-bracket" aria-hidden="true" />
                <div className="fp-oab-bracket-content">
                  <p className="fp-oab-bracket-text">1 week before event, only sent to</p>
                  <div className="fp-oab-chips">
                    <span className="fp-oab-chip fp-oab-chip-going">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="6.5" fill="#46D08F" />
                        <path d="M3.75 6.75L5.5 8.5L9.25 4.75" stroke="#0F1010" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Going</span>
                    </span>
                    <span className="fp-oab-chip">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(255,255,255,0.2)" />
                        <path d="M5 5C5 4.17157 5.67157 3.5 6.5 3.5C7.32843 3.5 8 4.17157 8 5C8 5.55228 7.55228 6 7 6H6.5V7" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
                        <circle cx="6.5" cy="9" r="0.65" fill="white" />
                      </svg>
                      <span>Maybe</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="fp-oab-separator" />

              <p className="fp-oab-section-label">Event Reminders</p>
              <div className="fp-oab-bracket-row">
                <span className="fp-oab-bracket" aria-hidden="true" />
                <div className="fp-oab-bracket-content">
                  <p className="fp-oab-bracket-text">2 hours before event, only sent to</p>
                  <div className="fp-oab-chips">
                    <span className="fp-oab-chip fp-oab-chip-going">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="6.5" fill="#46D08F" />
                        <path d="M3.75 6.75L5.5 8.5L9.25 4.75" stroke="#0F1010" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Going</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fp-oab-footer">
            <button type="button" className="fp-oab-cta">New Blast</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoPreview({ label = 'TODO' } = {}) {
  return (
    <div className="fp-todo-preview">
      <span className="fp-todo-label">{label}</span>
    </div>
  );
}

/* On-Air producer's chat — picks the active event from context and rebuilds
   the AInbox sections + messages for that event so the thread view shows the
   correct group name, hosts, and crew chatter. */
function OnAirProducerChatPreview() {
  const event = useOnAirEvent();
  const sections = useMemo(() => buildOnAirProducerSections(event), [event]);
  const messages = useMemo(() => buildOnAirProducerMessages(event), [event]);
  return (
    <AInboxPreview
      overrides
      view="thread"
      threadView={{ chatId: 'onair-event', messageId: 1 }}
      favoritesOverride={ONAIR_PRODUCER_FAVORITES}
      sectionsOverride={sections}
      messagesOverride={messages}
    />
  );
}

/* Recordings preview that injects the active on-air event's recording entry
   at the top of the On-Air tab. */
function OnAirRecordingsPreview() {
  const event = useOnAirEvent();
  return <RecordingsPreview initialTab="On-Air" onAirRecording={event.recording} />;
}

/* Map preview pinned to the TheaterOnAir floor — passes the active event
   into ShowcaseMap so the theater room name + on-stage speakers reflect it. */
function OnAirMapPreview() {
  const event = useOnAirEvent();
  const onAirOverride = useMemo(() => ({
    title: event.shortTitle,
    stageNames: event.mapStageNames,
  }), [event]);
  return <MapPreview initialFloor="TheaterOnAir" onAirOverride={onAirOverride} />;
}

function formatTrimTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const MAGICAST_TRANSCRIPT = [
  { time: '0:00', sec: 0, text: 'What\'s up, everyone?' },
  { time: '0:01', sec: 1, text: 'I appreciate you taking a break from your Claude coding this Sunday morning to watch the Roam February investor update.' },
  { time: '0:10', sec: 10, text: 'So let\'s get right to it.' },
  { time: '0:13', sec: 13, text: 'We had our fastest growth month ever in February.' },
  { time: '0:17', sec: 17, text: 'Roam grew ARR by 14% from January to February.' },
  { time: '0:22', sec: 22, text: 'This puts our annual growth at right around a 115%.' },
  { time: '0:25', sec: 25, text: 'We\'re right around $3,000,000 of ARR.' },
  { time: '0:28', sec: 28, text: 'We were right about 1,000,000 a year ago.' },
  { time: '0:30', sec: 30, text: 'We intend to be on this classic SaaS triple triple double double double growth rate.' },
  { time: '0:37', sec: 37, text: 'I actually think we\'re gonna accelerate growth in the upcoming year, probably hitting 10,000,000 or more by the end of the year based on some things we are seeing.' },
  { time: '0:46', sec: 46, text: 'So we are very encouraged by our progress there.' },
  { time: '0:49', sec: 49, text: 'Usage for the month was really pretty solid considering that February is a shorter month with three fewer days, but we still saw meetings go up by three and a half percent for the month and chat grow up go up by 4% for the month.' },
  { time: '1:04', sec: 64, text: 'So usage was good.' },
  { time: '1:05', sec: 65, text: 'And retention was really a great bright spot for us.' },
  { time: '1:09', sec: 69, text: 'We saw retention, NDR, net dollar retention at a 116% for the quarter.' },
  { time: '1:15', sec: 75, text: 'This is right in line with our lifetime average.' },
  { time: '1:18', sec: 78, text: 'Up ticked up two points, from the prior period, which is pretty solid.' },
  { time: '1:23', sec: 83, text: 'And the way we compute this is we look at the logos that were with us twelve months ago, and for every dollar they spent, what this means is they spent those same logos, that same cohort spent a buck 16 with us in this period.' },
  { time: '1:35', sec: 95, text: 'So customers are loving Roam, and they\'re expanding with Roam and they\'re seeing success.' },
  { time: '1:41', sec: 101, text: 'They\'re seeing incredible productivity.' },
  { time: '1:43', sec: 103, text: 'Meeting times on average were less than eight minutes.' },
  { time: '1:47', sec: 107, text: 'On the invention side, we continue to add unbelievable features to Roam.' },
  { time: '1:52', sec: 112, text: 'We just launched On Air, which is our immersive virtual events platform designed for the creator era.' },
  { time: '2:00', sec: 120, text: 'It\'s simple enough for anyone to use.' },
  { time: '2:03', sec: 123, text: 'It obliterates the sort of webinar Yahoo era stuff that\'s complicated and it is the ninth invention in our virtual office super bundle which is very unique.' },
  { time: '2:15', sec: 135, text: 'It includes nine products.' },
  { time: '2:17', sec: 137, text: 'You can cancel eight other software products when you use Roam.' },
  { time: '2:21', sec: 141, text: 'You can cancel Zoom and Calendly.' },
  { time: '2:23', sec: 143, text: 'You can cancel Loom.' },
  { time: '2:25', sec: 145, text: 'You can cancel Slack.' },
  { time: '2:26', sec: 146, text: 'You can cancel now webinar software.' },
  { time: '2:29', sec: 149, text: 'You can cancel which is expensive and cost a thousand or more per year.' },
  { time: '2:33', sec: 153, text: 'You can cancel even any AI notetaker you have because Magic Minutes can record all calls on any platform not just Roam calls and this is a very unique place.' },
  { time: '2:43', sec: 163, text: 'We, you know, have engineered Roam intentionally as part of our pricing and packaging so that you don\'t have to choose between the absolute best and the absolute price point that makes sense for your business.' },
  { time: '2:57', sec: 177, text: 'And so at Roam, we now offer all the incredible productivity and elite culture that companies benefit from from using our virtual office map, eight minute meetings and AI powered note takers and everything integrated into one thing at the cheapest cost, at the most customer friendly pricing model.' },
  { time: '3:16', sec: 196, text: 'It\'s billed monthly.' },
  { time: '3:17', sec: 197, text: 'There\'s one price.' },
  { time: '3:18', sec: 198, text: 'There\'s no upsells, and you can literally save 93 percent by adopting something that\'s better.' },
  { time: '3:24', sec: 204, text: 'Roam is better and Roam is cheaper.' },
  { time: '3:29', sec: 209, text: 'It was a long time ago my dream to have an office building in the middle of New York City and that dream came true, but it was not all it was cracked up to be.' },
  { time: '3:40', sec: 220, text: 'And then AI came along and I realized that the future belongs to virtual companies in virtual offices with AI woven into every interaction.' },
  { time: '3:52', sec: 232, text: 'This office is not AI native and you don\'t wanna have one of these.' },
  { time: '3:57', sec: 237, text: 'What you want is one of these.' },
  { time: '4:00', sec: 240, text: 'You want a virtual office to power your company\'s productivity to give them elite culture with talent anywhere in the world and instant connection and spontaneous ability to collaborate from anywhere with AI built in the entire way.' },
  { time: '4:16', sec: 256, text: 'That is what we were building at Roam, one component at a time.' },
  { time: '4:20', sec: 260, text: 'We now have nine of these components we\'ve built.' },
  { time: '4:22', sec: 262, text: 'We\'ve got three more incredible components in the works and I can\'t wait to launch them for all of you.' },
  { time: '4:29', sec: 269, text: 'Thanks for coming along and I will see you on April 1.' },
];

const MAGICAST_COMMENTS = [
  {
    id: 1,
    name: 'Howard Lerman',
    avatar: '/headshots/howard-lerman.jpg',
    time: '00:14',
    body: 'Strong opener — let’s lead the next call with this same hook 🔥',
  },
  {
    id: 2,
    name: 'Rob Figueiredo',
    avatar: '/headshots/rob-figueiredo.jpg',
    time: '00:42',
    body: 'Pause here a beat so the ARR number lands.',
  },
  {
    id: 3,
    name: 'Jeff Grossman',
    avatar: '/headshots/jeff-grossman.jpg',
    time: '01:18',
    body: 'Trim the umm at 1:22, otherwise this is ready to send.',
  },
];

const MV_VIDEO_SRC = '/magicast/march-investor-update.mp4';
const MV_THUMB_COUNT = 8;
const MV_MIN_GAP = 0.04;

const mvFmt = (sec, padMin = false) => {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  return `${padMin ? String(m).padStart(2, '0') : m}:${String(safe % 60).padStart(2, '0')}`;
};

const mvMask = (url) => ({ WebkitMaskImage: `url(${url})`, maskImage: `url(${url})` });

const mvHighlight = (text, q) => {
  if (!q) return text;
  const lower = text.toLowerCase();
  const out = [];
  let cursor = 0;
  let idx = lower.indexOf(q);
  let key = 0;
  while (idx !== -1) {
    if (idx > cursor) out.push(<span key={key++}>{text.slice(cursor, idx)}</span>);
    out.push(<mark key={key++} className="fp-mv-tx-mark">{text.slice(idx, idx + q.length)}</mark>);
    cursor = idx + q.length;
    idx = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) out.push(<span key={key++}>{text.slice(cursor)}</span>);
  return out;
};

function MagicastViewerWindow({ initialTrimOpen = true, initialSideTab = 'comments', searchAnimationTerms = null } = {}) {
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const transcriptListRef = useRef(null);
  const draggingRef = useRef(null);

  // Trim state
  const [trimOpen, setTrimOpen] = useState(initialTrimOpen);
  const [trimStart, setTrimStart] = useState(0.27);
  const [trimEnd, setTrimEnd] = useState(0.4);
  const [thumbs, setThumbs] = useState([]);

  // Video state
  const [duration, setDuration] = useState(35);
  const [playhead, setPlayhead] = useState(0.14);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  // Sidebar state
  const [sideTab, setSideTab] = useState(initialSideTab);
  const [transcriptQuery, setTranscriptQuery] = useState('');
  const [comments, setComments] = useState(MAGICAST_COMMENTS);
  const [draft, setDraft] = useState('');

  // ——— Search demo: type → hold → delete → loop ———
  useEffect(() => {
    if (!searchAnimationTerms?.length) return;
    let cancelled = false;
    const timeouts = [];
    const wait = (ms) => new Promise((resolve) => {
      timeouts.push(setTimeout(resolve, ms));
    });
    (async () => {
      for (let termIdx = 0; !cancelled; termIdx++) {
        const term = searchAnimationTerms[termIdx % searchAnimationTerms.length];
        for (let i = 1; i <= term.length && !cancelled; i++) {
          setTranscriptQuery(term.slice(0, i));
          await wait(110);
        }
        await wait(4000);
        for (let i = term.length; i >= 0 && !cancelled; i--) {
          setTranscriptQuery(term.slice(0, i));
          await wait(55);
        }
        await wait(500);
      }
    })();
    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, [searchAnimationTerms]);

  // ——— Video lifecycle: metadata, play/pause, playhead RAF ———
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => Number.isFinite(v.duration) && v.duration > 0 && setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    onMeta();
    setPlaying(!v.paused);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    let raf = 0;
    const tick = () => {
      const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
      if (dur > 0) setPlayhead(v.currentTime / dur);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  // ——— Capture evenly-spaced thumbnails for the trim strip ———
  useEffect(() => {
    const video = Object.assign(document.createElement('video'), {
      src: MV_VIDEO_SRC, muted: true, playsInline: true, preload: 'auto',
    });
    const canvas = Object.assign(document.createElement('canvas'), { width: 240, height: 135 });
    const ctx = canvas.getContext('2d');
    let cancelled = false;
    const waitFor = (event) => new Promise((resolve, reject) => {
      video.addEventListener(event, resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });
    (async () => {
      try {
        await waitFor('loadedmetadata');
        if (cancelled) return;
        const dur = Number.isFinite(video.duration) ? video.duration : 0;
        if (dur <= 0) return;
        const frames = [];
        for (let i = 0; i < MV_THUMB_COUNT && !cancelled; i++) {
          video.currentTime = MV_THUMB_COUNT === 1
            ? 0
            : Math.min((i / (MV_THUMB_COUNT - 1)) * dur, dur - 0.05);
          await waitFor('seeked');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.82));
        }
        if (!cancelled) setThumbs(frames);
      } catch { /* ignore — placeholder shows */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // ——— Active transcript row + auto-scroll into view ———
  const activeTranscriptIdx = useMemo(() => {
    const sec = playhead * duration;
    let idx = 0;
    for (let i = 0; i < MAGICAST_TRANSCRIPT.length; i++) {
      if (MAGICAST_TRANSCRIPT[i].sec <= sec) idx = i;
    }
    return idx;
  }, [playhead, duration]);

  useEffect(() => {
    if (sideTab !== 'transcript' || transcriptQuery.trim()) return;
    const list = transcriptListRef.current;
    const row = list?.querySelector(`[data-transcript-idx="${activeTranscriptIdx}"]`);
    if (!list || !row) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const targetTop = rowRect.top - listRect.top + list.scrollTop - list.clientHeight / 2 + rowRect.height / 2;
    list.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, [activeTranscriptIdx, sideTab, transcriptQuery]);

  // ——— Filtered transcript ———
  const filteredTranscript = useMemo(() => {
    const q = transcriptQuery.trim().toLowerCase();
    const all = MAGICAST_TRANSCRIPT.map((entry, i) => ({ entry, i }));
    return q ? all.filter(({ entry }) => entry.text.toLowerCase().includes(q)) : all;
  }, [transcriptQuery]);

  // ——— Player controls ———
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const seekTo = (sec) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = sec;
    v.play().catch(() => {});
  };

  // ——— Trim handle drag ———
  const fromClientX = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };
  const updateHandle = (handle, clientX) => {
    const x = fromClientX(clientX);
    if (handle === 'start') setTrimStart(Math.min(x, trimEnd - MV_MIN_GAP));
    else setTrimEnd(Math.max(x, trimStart + MV_MIN_GAP));
  };
  const onHandleDown = (handle) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    draggingRef.current = handle;
    updateHandle(handle, e.clientX);
  };
  const onHandleMove = (e) => {
    if (!draggingRef.current) return;
    if (e.pointerType && !e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    updateHandle(draggingRef.current, e.clientX);
  };
  const onHandleUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    draggingRef.current = null;
  };

  // ——— Comments composer ———
  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: 'You',
        avatar: '/headshots/joe-woodward.jpg',
        time: mvFmt(playhead * duration, true),
        body: text,
      },
    ]);
    setDraft('');
  };

  return (
    <div className="fp-mv-win">
      <div className="fp-mv-titlebar">
        <div className="fp-mv-lights" aria-hidden="true">
          <span className="fp-mv-light fp-mv-light-close" />
          <span className="fp-mv-light fp-mv-light-min" />
          <span className="fp-mv-light fp-mv-light-max" />
        </div>
        <div className="fp-mv-title-text">
          <div className="fp-mv-title">March Investor Update</div>
          <div className="fp-mv-subtitle">Howard Lerman · April 11, 5:02 PM</div>
        </div>
        <div className="fp-mv-title-actions">
          {[
            { label: 'Download', icon: '/icons/magicast-titlebar/download.svg' },
            { label: 'Closed captions', icon: '/icons/magicast-titlebar/closed-captions.svg' },
            { label: 'Copy link', icon: '/icons/magicast-titlebar/link.svg' },
            { label: 'Send to', icon: '/icons/mm-send-btn.svg' },
          ].map(({ label, icon }) => (
            <button key={label} type="button" className="fp-mv-icon-btn" aria-label={label}>
              <span className="fp-mv-icon-glyph" style={mvMask(icon)} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div className="fp-mv-body">
        <div className="fp-mv-main">
          <div className="fp-mv-stage-pad">
            <div className="fp-mv-stage">
              <video
                ref={videoRef}
                className="fp-mv-video"
                src={MV_VIDEO_SRC}
                autoPlay
                loop
                muted
                playsInline
                onClick={togglePlay}
              />
              {!playing && (
                <button
                  type="button"
                  className="fp-mv-stage-play-overlay"
                  aria-label="Play"
                  onClick={togglePlay}
                >
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="#ffffff" aria-hidden="true">
                    <path d="M18 12l24 16-24 16z" />
                  </svg>
                </button>
              )}
              <div className="fp-mv-stage-fade" />
              <div className="fp-mv-controls">
                <span className="fp-mv-time">
                  <span>{mvFmt(playhead * duration)}</span>
                  <span className="fp-mv-time-sep">/</span>
                  <span>{mvFmt(duration)}</span>
                </span>
                <div className="fp-mv-controls-spacer" />
                <button type="button" className="fp-mv-icon-btn fp-mv-icon-btn-light" aria-label="Set cover">
                  <span className="fp-mv-icon-glyph" style={mvMask('/magicast/player-image.svg')} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`fp-mv-icon-btn fp-mv-icon-btn-light ${trimOpen ? 'fp-mv-icon-btn-active' : ''}`}
                  aria-label="Trim"
                  aria-pressed={trimOpen}
                  onClick={() => setTrimOpen((v) => !v)}
                >
                  <span className="fp-mv-icon-glyph" style={mvMask('/magicast/player-trim.svg')} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="fp-mv-icon-btn fp-mv-icon-btn-light"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  onClick={toggleMute}
                >
                  <span
                    className="fp-mv-icon-glyph"
                    style={mvMask(muted ? '/magicast/player-muted.svg' : '/magicast/player-volume.svg')}
                    aria-hidden="true"
                  />
                </button>
                <button type="button" className="fp-mv-icon-btn fp-mv-icon-btn-light" aria-label="Fullscreen">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6.75V3h3.75M11.25 3H15v3.75M15 11.25V15h-3.75M6.75 15H3v-3.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
            <div
              className={`fp-mv-trim-collapse ${trimOpen ? 'fp-mv-trim-collapse-open' : ''}`}
              aria-hidden={!trimOpen}
            >
              <div className="fp-mv-trim-collapse-inner">
                <div className="fp-mv-trim-track" ref={trackRef}>
                  <div className="fp-mv-trim-thumbs">
                    {Array.from({ length: MV_THUMB_COUNT }).map((_, i) => (
                      <div
                        key={i}
                        className="fp-mv-trim-thumb"
                        style={thumbs[i] ? { backgroundImage: `url(${thumbs[i]})` } : undefined}
                      />
                    ))}
                  </div>
                  <div className="fp-mv-trim-shade" style={{ width: `${trimStart * 100}%` }} />
                  <div className="fp-mv-trim-shade" style={{ left: `${trimEnd * 100}%`, right: 0 }} />
                  <div
                    className="fp-mv-trim-selection"
                    style={{ left: `${trimStart * 100}%`, right: `${100 - trimEnd * 100}%` }}
                  />
                  <button
                    type="button"
                    className="fp-mv-trim-handle fp-mv-trim-handle-start"
                    style={{ left: `${trimStart * 100}%` }}
                    aria-label="Trim start"
                    tabIndex={trimOpen ? 0 : -1}
                    onPointerDown={onHandleDown('start')}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                  />
                  <button
                    type="button"
                    className="fp-mv-trim-handle fp-mv-trim-handle-end"
                    style={{ left: `${trimEnd * 100}%` }}
                    aria-label="Trim end"
                    tabIndex={trimOpen ? 0 : -1}
                    onPointerDown={onHandleDown('end')}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`fp-mv-actions-collapse ${trimOpen ? 'fp-mv-actions-collapse-open' : ''}`}
            aria-hidden={!trimOpen}
          >
            <div className="fp-mv-actions-collapse-inner">
              <div className="fp-mv-actions">
                <div className="fp-mv-actions-spacer" />
                <button
                  type="button"
                  className="fp-mv-btn fp-mv-btn-secondary"
                  onClick={() => setTrimOpen(false)}
                  tabIndex={trimOpen ? 0 : -1}
                >Cancel</button>
                <button
                  type="button"
                  className="fp-mv-btn fp-mv-btn-primary"
                  onClick={() => setTrimOpen(false)}
                  tabIndex={trimOpen ? 0 : -1}
                >Trim</button>
              </div>
            </div>
          </div>
        </div>
        <div className="fp-mv-side">
          <div className="fp-mv-side-tabs">
            <button
              type="button"
              className={`fp-mv-tab ${sideTab === 'comments' ? 'fp-mv-tab-active' : ''}`}
              onClick={() => setSideTab('comments')}
            >Comments</button>
            <button
              type="button"
              className={`fp-mv-tab ${sideTab === 'transcript' ? 'fp-mv-tab-active' : ''}`}
              onClick={() => setSideTab('transcript')}
            >Transcript</button>
          </div>
          {sideTab === 'transcript' && (
            <>
              <div className="fp-mv-tx-search">
                {searchAnimationTerms ? (
                  <div className="fp-mv-tx-search-faux" aria-hidden="true">
                    <span className="fp-mv-tx-search-faux-text">{transcriptQuery}</span>
                    <span className="fp-mv-tx-search-cursor" />
                  </div>
                ) : (
                  <input
                    type="text"
                    className="fp-mv-tx-search-input"
                    placeholder="Search"
                    value={transcriptQuery}
                    onChange={(e) => setTranscriptQuery(e.target.value)}
                  />
                )}
              </div>
              <div className="fp-mv-tx-list" ref={transcriptListRef}>
                {filteredTranscript.length === 0 ? (
                  <div className="fp-mv-tx-empty">No matches for &ldquo;{transcriptQuery}&rdquo;</div>
                ) : filteredTranscript.map(({ entry, i }) => (
                  <button
                    key={i}
                    type="button"
                    data-transcript-idx={i}
                    className={`fp-mv-tx-row ${i === activeTranscriptIdx ? 'fp-mv-tx-row-active' : ''}`}
                    onClick={() => seekTo(entry.sec)}
                  >
                    <span className="fp-mv-time-pill">{entry.time}</span>
                    <span className="fp-mv-tx-body">{mvHighlight(entry.text, transcriptQuery.trim().toLowerCase())}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {sideTab === 'comments' && (
            <>
          <div className="fp-mv-side-body">
            {comments.map((c) => (
              <div key={c.id} className="fp-mv-comment">
                <img className="fp-mv-comment-avatar" src={c.avatar} alt="" />
                <div className="fp-mv-comment-content">
                  <div className="fp-mv-comment-name">{c.name}</div>
                  <div className="fp-mv-comment-line">
                    <span className="fp-mv-time-pill">{c.time}</span>
                    <span className="fp-mv-comment-body">{c.body}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="fp-mv-composer">
            <div className="fp-mv-composer-toolbar">
              <button type="button" className="fp-mv-composer-btn fp-mv-composer-btn-tempo" aria-label="Timecode">
                <span className="fp-mv-composer-glyph" style={mvMask('/magicast/composer-clock-stop.svg')} aria-hidden="true" />
              </button>
              <button type="button" className="fp-mv-composer-btn" aria-label="Emoji">
                <span className="fp-mv-composer-glyph" style={mvMask('/magicast/composer-emoji.svg')} aria-hidden="true" />
              </button>
            </div>
            <div className="fp-mv-composer-input">
              <span className="fp-mv-time-pill">{mvFmt(playhead * duration, true)}</span>
              <input
                className="fp-mv-composer-field"
                type="text"
                placeholder="Leave Your Comment…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitComment(); } }}
              />
              <button
                type="button"
                className={`fp-mv-composer-send ${draft.trim() ? 'fp-mv-composer-send-active' : ''}`}
                aria-label="Send"
                onClick={submitComment}
                disabled={!draft.trim()}
              >
                <span className="fp-mv-composer-glyph" style={mvMask('/icons/composer/Send.svg')} aria-hidden="true" />
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MagicastShareSection() {
  const [copied, setCopied] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const url = 'https://ro.am/share/indxotgx-12kpzwa3-1rl013bl-npl909dx';
  const onCopy = () => {
    try {
      navigator.clipboard?.writeText(url);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fp-mvs-stage">
      <div className="fp-mvs-frame">
        <MagicastViewerWindow initialTrimOpen={false} />
        <div className="fp-mvs-scrim" />
        <div className="fp-mvs-dialog" role="dialog" aria-label="Share Magicast">
        <header className="fp-mvs-header">
          <button type="button" className="fp-mvs-close" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <h3 className="fp-mvs-title">Share Magicast</h3>
        </header>
        <div className="fp-mvs-body">
          <div className="fp-mvs-section">
            <div className="fp-mvs-section-label">Share Link</div>
            <div className="fp-mvs-link-row">
              <span className="fp-mvs-link-url">{url}</span>
              <button
                type="button"
                className="fp-mvs-link-copy-btn"
                onClick={onCopy}
                aria-label={copied ? 'Copied' : 'Copy link'}
                title={copied ? 'Copied' : 'Copy link'}
              >
                <span
                  className="fp-mvs-link-copy-glyph"
                  style={mvMask(copied ? '/magicast/copied.svg' : '/magicast/copy.svg')}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <div className="fp-mvs-row">
            <span className="fp-mvs-row-label">Require Password</span>
            <button
              type="button"
              className={`fp-mvs-toggle ${requirePassword ? 'fp-mvs-toggle-on' : ''}`}
              onClick={() => setRequirePassword((v) => !v)}
              aria-pressed={requirePassword}
              aria-label="Require Password"
            >
              <span className="fp-mvs-toggle-knob" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


function FlashCard({ supertitle, title, media, back }) {
  const isVideo = media?.type === 'video';
  const videoRef = useRef(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (flipped) v.pause();
    else v.play().catch(() => {});
  }, [flipped]);

  const handleCardClick = () => {
    if (!flipped) setFlipped(true);
  };
  const handlePlusClick = (e) => {
    e.stopPropagation();
    setFlipped(f => !f);
  };

  return (
    <div
      className={`fp-flashcard ${flipped ? 'fp-flashcard-flipped' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped(f => !f);
        }
      }}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          className="fp-flashcard-bg"
          src={media.src2x || media.src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
      ) : (
        <img
          className="fp-flashcard-bg"
          src={media.src}
          srcSet={media.src2x ? `${media.src2x} 2x` : undefined}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="fp-flashcard-blur" aria-hidden="true" />
      <div className="fp-flashcard-header">
        {supertitle && <div className="fp-flashcard-supertitle">{supertitle}</div>}
        <h3 className="fp-flashcard-title">{title}</h3>
      </div>
      <div className="fp-flashcard-footer">
        {back && <div className="fp-flashcard-back">{back}</div>}
        <button
          type="button"
          className="fp-flashcard-plus"
          onClick={handlePlusClick}
          aria-label={flipped ? 'Close' : 'Open'}
          aria-expanded={flipped}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const MAGNIFY_TARGET_PERSON = 'Michael W.';
const MAGNIFY_TARGET_CITY = 'SFO';

function MapPreview({ spotifyAlwaysOpen = false, githubAlwaysOpen = false, figmaAlwaysOpen = false, hideOnIt = false, onItAutoOpen = false, autoKnock = false, shelfAutoOpen = false, shareAutoOpen = false, initialFloor = 'Preview', showSidebar = false, autoCycleFloors = false, autoCycleDms = false, showPhysicalTags = false, spotlightSearch = false, onAirOverride = null, children = null } = {}) {
  const [pageTheme, setPageTheme] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'dark' : 'dark'
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const obs = new MutationObserver(() => {
      setPageTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  const wrapRef = useRef(null);
  const [magnifyPos, setMagnifyPos] = useState(null);
  const [magnifyHost, setMagnifyHost] = useState(null);
  useEffect(() => {
    if (!showPhysicalTags) return;
    const host = wrapRef.current?.closest('.fp-section-visual') || null;
    setMagnifyHost(host);
    const measure = () => {
      const wrap = wrapRef.current;
      const refHost = host || wrap;
      if (!wrap || !refHost) return;
      const tag = wrap.querySelector(`[data-tag-person="${MAGNIFY_TARGET_PERSON}"]`);
      if (!tag) {
        setMagnifyPos(null);
        return;
      }
      const hostRect = refHost.getBoundingClientRect();
      const tagRect = tag.getBoundingClientRect();
      const tagCenterX = tagRect.left - hostRect.left + tagRect.width / 2;
      const tagCenterY = tagRect.top - hostRect.top + tagRect.height / 2;
      const magnifySize = 88;
      const lineLength = Math.max(80, Math.min(170, tagCenterY - 74));
      const left = tagCenterX - magnifySize / 2;
      const top = tagCenterY - lineLength - magnifySize / 2;
      setMagnifyPos(prev => {
        if (prev && Math.abs(prev.left - left) < 1 && Math.abs(prev.top - top) < 1 && Math.abs(prev.lineLength - lineLength) < 1) return prev;
        return { left, top, lineLength };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    const id = setInterval(measure, 500);
    return () => { ro.disconnect(); clearInterval(id); };
  }, [showPhysicalTags]);
  const className = [
    'fp-map-preview',
    showSidebar && 'fp-map-preview-with-sidebar',
    autoCycleFloors && 'fp-map-preview-elevator',
    autoCycleDms && 'fp-map-preview-dms',
    showPhysicalTags && 'fp-map-preview-tags',
    spotlightSearch && 'fp-map-preview-spotlight',
    onItAutoOpen && 'fp-map-preview-onit-pin',
  ].filter(Boolean).join(' ');
  return (
    <div ref={wrapRef} className={className}>
      <ShowcaseMap embedded autoKnock={autoKnock} initialFloor={initialFloor} spotifyAlwaysOpen={spotifyAlwaysOpen} githubAlwaysOpen={githubAlwaysOpen} figmaAlwaysOpen={figmaAlwaysOpen} hideOnIt={hideOnIt} onItAutoOpen={onItAutoOpen} shelfAutoOpen={shelfAutoOpen} shareAutoOpen={shareAutoOpen} theme={pageTheme} autoCycleFloors={autoCycleFloors} autoCycleDms={autoCycleDms} showPhysicalTags={showPhysicalTags} onAirOverride={onAirOverride} />
      {children}
      {spotlightSearch && (
        <>
          <div className="fp-spotlight-scrim" aria-hidden="true" />
          <div className="fp-spotlight" role="search">
            <div className="fp-spotlight-bar">
              <svg className="fp-spotlight-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="fp-spotlight-input">
                <span className="fp-spotlight-query">Walt</span>
                <span className="fp-spotlight-caret" aria-hidden="true" />
              </div>
            </div>
            <div className="fp-spotlight-results">
              {SPOTLIGHT_RESULTS.map((r) => (
                <div className="fp-spotlight-result" key={r.name}>
                  <div className="fp-spotlight-avatar">
                    <img src={r.avatar} alt="" />
                    <span className={`fp-spotlight-status fp-spotlight-status-${r.status}`} aria-hidden="true" />
                  </div>
                  <div className="fp-spotlight-result-text">
                    <p className="fp-spotlight-result-name">{r.name}</p>
                    <p className="fp-spotlight-result-subtitle">{r.subtitle}</p>
                  </div>
                  <div className="fp-spotlight-action" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {showPhysicalTags && magnifyPos && magnifyHost && ReactDOM.createPortal(
        <Magnify
          size={88}
          lineTo={{ x: 0, y: magnifyPos.lineLength }}
          className="fp-tags-magnify"
          style={{ left: magnifyPos.left, top: magnifyPos.top }}
        >
          <span className="fp-tags-magnify-city">{MAGNIFY_TARGET_CITY}</span>
        </Magnify>,
        magnifyHost
      )}
    </div>
  );
}

function DesktopRecordingsPreview() {
  return (
    <div className="fp-desktop">
      <div className="fp-desktop-menubar">
        <div className="fp-desktop-menubar-blur" aria-hidden="true" />
        <div className="fp-desktop-menubar-content">
          <div className="fp-desktop-menus">
            <div className="fp-desktop-menu-item fp-desktop-menu-apple">
              <img src="/icons/apple-logo.svg" alt="" className="fp-desktop-apple" />
            </div>
            <div className="fp-desktop-menu-item fp-desktop-menu-active">Roam</div>
            <div className="fp-desktop-menu-item">File</div>
            <div className="fp-desktop-menu-item">Edit</div>
            <div className="fp-desktop-menu-item">View</div>
            <div className="fp-desktop-menu-item">Go</div>
            <div className="fp-desktop-menu-item">Window</div>
            <div className="fp-desktop-menu-item">Help</div>
          </div>
          <div className="fp-desktop-status">
            <img src="/icons/desktop-menubar-notif.svg" alt="" className="fp-desktop-status-quill" />
            <span className="fp-desktop-status-date">Sat Jun 10</span>
            <span className="fp-desktop-status-time">9:41 AM</span>
          </div>
        </div>
      </div>

      <div className="fp-desktop-dropdown" role="menu" aria-label="Roam menu">
        <div className="fp-desktop-dropdown-row">
          <span className="fp-desktop-dropdown-left">
            <img src="/icons/desktop-chat.svg" alt="" className="fp-desktop-dropdown-icon" />
            <span className="fp-desktop-dropdown-label">1 New Message</span>
          </span>
          <span className="fp-desktop-dropdown-shortcut">⇧⌘M</span>
        </div>
        <div className="fp-desktop-dropdown-separator" />
        <div className="fp-desktop-dropdown-row">
          <span className="fp-desktop-dropdown-left">
            <img src="/icons/desktop-magic-quill.svg" alt="" className="fp-desktop-dropdown-icon" />
            <span className="fp-desktop-dropdown-label">Recording Magic Minutes</span>
          </span>
          <span className="fp-desktop-dropdown-shortcut">⇧⌘R</span>
        </div>
        <div className="fp-desktop-dropdown-row">
          <span className="fp-desktop-dropdown-left">
            <img src="/icons/desktop-stop.svg" alt="" className="fp-desktop-dropdown-icon" />
            <span className="fp-desktop-dropdown-label">Stop Magic Minutes</span>
          </span>
          <span className="fp-desktop-dropdown-shortcut">⇧⌘S</span>
        </div>
        <div className="fp-desktop-dropdown-row">
          <span className="fp-desktop-dropdown-left">
            <img src="/icons/desktop-delete.svg" alt="" className="fp-desktop-dropdown-icon" />
            <span className="fp-desktop-dropdown-label">Stop and Shred</span>
          </span>
        </div>
        <div className="fp-desktop-dropdown-separator" />
        <div className="fp-desktop-dropdown-row">
          <span className="fp-desktop-dropdown-left">
            <img src="/icons/desktop-settings.svg" alt="" className="fp-desktop-dropdown-icon" />
            <span className="fp-desktop-dropdown-label">Settings</span>
          </span>
        </div>
        <div className="fp-desktop-dropdown-row">
          <span className="fp-desktop-dropdown-left">
            <img src="/icons/desktop-quit.svg" alt="" className="fp-desktop-dropdown-icon" />
            <span className="fp-desktop-dropdown-label">Quit Roam</span>
          </span>
        </div>
      </div>
    </div>
  );
}

const COMPLETED_TASK_TIPS = [
  { id: 'lexi', name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', task: 'Frankfurt EU bucket provisioned' },
  { id: 'chelsea', name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', task: 'GA launch checklist locked' },
  { id: 'grace', name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', task: 'Stop & Shred privacy review signed off' },
  { id: 'klas', name: 'Klas Leino', avatar: '/headshots/klas-leino.jpg', task: 'Speculative-decoding eval harness shipped' },
  { id: 'howard', name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', task: 'Top-10 enterprise outreach sent' },
];

const COMPLETED_TASK_POSITIONS = [
  { left: '14%', top: '32%' },
  { left: '38%', top: '60%' },
  { left: '62%', top: '24%' },
  { left: '78%', top: '54%' },
  { left: '24%', top: '72%' },
];

function CompletedActionsMapPreview() {
  return (
    <MapPreview hideOnIt initialFloor="R&D">
      <div className="fp-completed-overlay" aria-hidden="true">
        {COMPLETED_TASK_TIPS.map((tip, i) => (
          <div key={tip.id} className="fp-completed-tip" style={COMPLETED_TASK_POSITIONS[i]}>
            <div className="fp-completed-check">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fp-completed-text">
              <div className="fp-completed-label">Complete</div>
              <div className="fp-completed-task">{tip.task}</div>
            </div>
          </div>
        ))}
      </div>
    </MapPreview>
  );
}

function MapEditorPreview() {
  const [windowTint, setWindowTint] = useState(null);
  return (
    <div className="fp-map-preview fp-map-editor-preview">
      <div className="sc-window sc-window-mounted" style={windowTint ? { background: windowTint } : undefined}>
        <div className="sc-titlebar">
          <div className="sc-traffic-lights">
            <div className="sc-light sc-light-close" />
            <div className="sc-light sc-light-minimize" />
            <div className="sc-light sc-light-maximize" />
          </div>
          <img className="sc-titlebar-logo" src="/icons/roam-logo.png" alt="roam" />
          <div className="sc-titlebar-spacer" />
        </div>
        <div className="fp-map-editor-body">
          <EditMapView onThemeChange={(t) => setWindowTint(hexToRgba(t.room, 0.3))} />
        </div>
      </div>
    </div>
  );
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return null;
  const v = hex.length === 4
    ? hex.slice(1).split('').map(c => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  return `rgba(${v[0]}, ${v[1]}, ${v[2]}, ${alpha})`;
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

function KnockDropInPreview() {
  // Cycle: knocking → joined (10s) → leaving (Sophia's tile exits) → idle (3s) → knocking …
  const [phase, setPhase] = useState('knocking');
  // Split mounted/visible so the dialog stays in the DOM through its exit
  // transition. First paint is opacity 0; a double-rAF flips visible true to
  // fire the entry transition; we unmount only after the exit transition runs.
  const [dialogMounted, setDialogMounted] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  // Hold the cycle until the preview is scrolled into view — otherwise the
  // tiles have already animated mid-cycle by the time the user sees them.
  const [started, setStarted] = useState(false);
  const previewRef = useRef(null);
  const DIALOG_EXIT_MS = 400; // buffer past the 320ms transform transition
  const TILE_EXIT_MS = 440;

  useEffect(() => {
    if (started) return;
    const el = previewRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (phase === 'knocking') {
      setDialogMounted(true);
      setDialogVisible(false);
      // Double rAF so the browser commits and paints the opacity:0 frame
      // before we flip the class — that's what makes the entry transition fire.
      let raf1 = 0, raf2 = 0;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setDialogVisible(true));
      });
      const tHide = setTimeout(() => setDialogVisible(false), 2800);
      const tDone = setTimeout(() => {
        setDialogMounted(false);
        setPhase('joined');
      }, 2800 + DIALOG_EXIT_MS);
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        clearTimeout(tHide);
        clearTimeout(tDone);
      };
    }
    if (phase === 'joined') {
      const t = setTimeout(() => setPhase('leaving'), 10000);
      return () => clearTimeout(t);
    }
    if (phase === 'leaving') {
      const t = setTimeout(() => setPhase('idle'), TILE_EXIT_MS);
      return () => clearTimeout(t);
    }
    // phase === 'idle'
    const t = setTimeout(() => setPhase('knocking'), 3000);
    return () => clearTimeout(t);
  }, [phase, started]);

  const sophia = videoPerson('Sophia Ramirez', 'Female', 'Sophia Ramirez');
  const others = VIDEO_SPEAKERS.filter(p => p.name !== 'Sophia Ramirez').slice(0, 4);
  const sophiaPresent = phase === 'joined' || phase === 'leaving';
  const people = sophiaPresent ? [...others, sophia] : others;

  // When the grid relayouts (Sophia joining), existing tiles just snap to
  // their new positions — only the new tile gets a fade+scale-in. We track
  // tile IDs (not rects) so scroll-induced viewport changes don't trigger
  // any animation.
  const frameRef = useRef(null);
  const prevIdsRef = useRef(null); // null = haven't seen any render yet
  useLayoutEffect(() => {
    const root = frameRef.current;
    if (!root) return;
    const tiles = root.querySelectorAll('[data-tile-id]');
    const newIds = new Set();
    tiles.forEach(t => newIds.add(t.dataset.tileId));
    const prev = prevIdsRef.current;
    if (prev) {
      tiles.forEach(t => {
        const id = t.dataset.tileId;
        if (!prev.has(id)) {
          // Brand-new tile (added since last render). Fade + scale in.
          t.animate(
            [
              { opacity: 0, transform: 'scale(0.7)' },
              { opacity: 1, transform: 'scale(1)' },
            ],
            { duration: 420, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'both' }
          );
        }
      });
    }
    prevIdsRef.current = newIds;
  }, [people]);

  return (
    <div className="fp-knock-preview" ref={previewRef}>
      <div className="fp-knock-frame" data-phase={phase} ref={frameRef}>
        <MeetingWindow
          win={noopWin('meeting')}
          onDrag={() => {}}
          roomName="Walt Disney"
          people={people}
          onOpenChat={() => {}}
          onOpenOnAir={() => {}}
          roamojiOpen={false}
          autoReactions={false}
        />
        {dialogMounted && (
          <div className={`fp-knock-dialog-overlay ${dialogVisible ? 'fp-knock-dialog-overlay-visible' : ''}`}>
            <div className={`fp-knock-dialog ${dialogVisible ? 'fp-knock-dialog-visible' : ''}`}>
              <img
                className="fp-knock-avatar"
                src="/videos/Female/sophia_ramirez.png"
                alt=""
              />
              <div className="fp-knock-label">
                Sophia is knocking on Walt Disney
                <span className="fp-knock-dots"><span>.</span><span>.</span><span>.</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LockedRoomPreview() {
  // Two people not shown in the Drop-In Video Meetings preview above.
  const people = [
    VIDEO_SPEAKERS.find(p => p.name === 'Mia Chen'),
    VIDEO_SPEAKERS.find(p => p.name === 'Ethan Bishop'),
  ].filter(Boolean);

  // Measure the actual lock-icon position so the magnify pin lands on its
  // exact horizontal/vertical center, regardless of font rendering width.
  const frameRef = useRef(null);
  const [pinPos, setPinPos] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const lock = frame.querySelector('.meeting-win-lock');
      if (!lock) return;
      const fRect = frame.getBoundingClientRect();
      const lRect = lock.getBoundingClientRect();
      const lockCenterX = lRect.left + lRect.width / 2 - fRect.left;
      const lockCenterY = lRect.top + lRect.height / 2 - fRect.top;
      const PIN_TOP = 64;
      const PIN_SIZE = 80;
      const pinCenterY = PIN_TOP + PIN_SIZE / 2;
      setPinPos({
        left: lockCenterX,
        top: PIN_TOP,
        lineY: lockCenterY - pinCenterY,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="fp-knock-preview">
      <div className="fp-lock-frame" ref={frameRef}>
        <MeetingWindow
          win={noopWin('meeting')}
          onDrag={() => {}}
          roomName="Strategy Sync"
          people={people}
          onOpenChat={() => {}}
          onOpenOnAir={() => {}}
          locked
          roamojiOpen={false}
          autoReactions={false}
        />
        {pinPos && (
          <Magnify
            className="fp-lock-magnify"
            style={{ left: pinPos.left, top: pinPos.top, transform: 'translateX(-50%)' }}
            lineTo={{ y: pinPos.lineY }}
          >
            <span className="fp-lock-magnify-glyph" aria-hidden="true" />
          </Magnify>
        )}
      </div>
    </div>
  );
}

function RaisedHandsPreview() {
  // 9 people in the meeting room — five of them have raised hands.
  const people = [
    VIDEO_SPEAKERS.find(p => p.name === 'Olivia Sanders'),
    VIDEO_SPEAKERS.find(p => p.name === 'Ethan Bishop'),
    VIDEO_SPEAKERS.find(p => p.name === 'Hannah Bennett'),
    VIDEO_SPEAKERS.find(p => p.name === 'Sarah Mitchell'),
    videoPerson('Daniel Russell', 'Male', 'Daniel Russell'),
    VIDEO_SPEAKERS.find(p => p.name === 'Mia Chen'),
    VIDEO_SPEAKERS.find(p => p.name === 'Emily Carter'),
    VIDEO_SPEAKERS.find(p => p.name === 'Lauren Hayes'),
    VIDEO_SPEAKERS.find(p => p.name === 'Ashley Brooks'),
  ].filter(Boolean);

  // Order matches the popover, with hand-raise count.
  const raisedHands = [
    { person: VIDEO_SPEAKERS.find(p => p.name === 'Olivia Sanders'), count: 1 },
    { person: VIDEO_SPEAKERS.find(p => p.name === 'Ethan Bishop'), count: 2 },
    { person: VIDEO_SPEAKERS.find(p => p.name === 'Hannah Bennett'), count: 3 },
    { person: VIDEO_SPEAKERS.find(p => p.name === 'Sarah Mitchell'), count: 4 },
    { person: videoPerson('Daniel Russell', 'Male', 'Daniel Russell'), count: 5 },
  ];

  // Measure the hand-raise toolbar pill so the popover anchors over it.
  const frameRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(true);
  // Local user's own hand state — drives the toolbar pill color (amber when
  // raised, default when lowered). Independent of the popover list which
  // shows other people who have raised their hands.
  const [myHandRaised, setMyHandRaised] = useState(true);
  useLayoutEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const centerGroup = frame.querySelector('.meeting-win-toolbar > .meeting-win-pill-group:nth-child(2)');
      if (!centerGroup) return;
      const pills = centerGroup.querySelectorAll('.meeting-win-pill');
      const handPill = pills[3];
      if (!handPill) return;
      const fr = frame.getBoundingClientRect();
      const pr = handPill.getBoundingClientRect();
      setPopoverPos({
        left: pr.left + pr.width / 2 - fr.left,
        bottom: fr.bottom - pr.top + 12,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, []);

  // Close popover on outside click (excluding the hand pill itself, which
  // toggles via onClickHands).
  useEffect(() => {
    if (!popoverOpen) return;
    const onDocClick = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-hand-pill="true"]')) return;
      setPopoverOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [popoverOpen]);

  return (
    <div className="fp-knock-preview">
      <div className="fp-lock-frame" ref={frameRef}>
        <MeetingWindow
          win={noopWin('meeting')}
          onDrag={() => {}}
          roomName="All Hands"
          people={people}
          onOpenChat={() => {}}
          onOpenOnAir={() => {}}
          roamojiOpen={false}
          autoReactions={false}
          handsRaised={myHandRaised}
          onClickHands={() => {
            // If your hand is lowered, clicking the pill raises it and opens
            // the popover. Otherwise just toggle the popover.
            if (!myHandRaised) {
              setMyHandRaised(true);
              setPopoverOpen(true);
            } else {
              setPopoverOpen(o => !o);
            }
          }}
        />
        {popoverPos && popoverOpen && (
          <div
            ref={popoverRef}
            className="fp-hands-popover"
            style={{ left: popoverPos.left, bottom: popoverPos.bottom, transform: 'translateX(-50%)' }}
          >
            <div className="fp-hands-title">Raised Hands</div>
            <ul className="fp-hands-list">
              {raisedHands.map(({ person, count }) => (
                <li key={person.name} className="fp-hands-item">
                  <img className="fp-hands-avatar" src={person.avatar} alt="" />
                  <span className="fp-hands-name">{person.fullName || person.name}</span>
                  <span className="fp-hands-badge">
                    <span className="fp-hands-badge-icon" aria-hidden="true" />
                    <span className="fp-hands-badge-count">{count}</span>
                  </span>
                </li>
              ))}
            </ul>
            <button className="fp-hands-lower" onClick={() => { setMyHandRaised(false); setPopoverOpen(false); }}>Lower Hand</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExternalMeetingsPreview() {
  return (
    <div className="fp-image-preview fp-image-preview-external-meetings">
      <img src="/feature/calendar-google.png" alt="Google Calendar with Roam meeting integration" />
    </div>
  );
}

// Reusable before/after compare slider — drag the vertical handle to reveal
// the difference between two stacked images. The "before" image (leftSrc)
// sits beneath; the "after" image (rightSrc) is clipped to the right of the
// divider, so dragging right reveals more of it.
function CompareSlider({ leftSrc, rightSrc, leftAlt = '', rightAlt = '' }) {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(0.5);
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = (clientX - rect.left) / rect.width;
      setPos(Math.max(0, Math.min(1, x)));
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const startDrag = () => { draggingRef.current = true; };

  return (
    <div
      ref={containerRef}
      className="fp-image-preview fp-vbg-compare"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      <img className="fp-vbg-img" src={leftSrc} alt={leftAlt} />
      <div className="fp-vbg-clip" style={{ clipPath: `inset(0 0 0 ${pos * 100}%)` }}>
        <img className="fp-vbg-img" src={rightSrc} alt={rightAlt} />
      </div>
      <div className="fp-vbg-divider" style={{ left: `${pos * 100}%` }}>
        <span className="fp-vbg-handle" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L2 7L5 11M9 3L12 7L9 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function VirtualBackgroundPreview() {
  return (
    <CompareSlider
      leftSrc="/feature/vbg-without.png"
      rightSrc="/feature/vbg-with.png"
      leftAlt="Without virtual background"
      rightAlt="With virtual background"
    />
  );
}

function FaceTouchUpPreview() {
  return (
    <CompareSlider
      leftSrc="/feature/beauty-without.png"
      rightSrc="/feature/beauty-with.png"
      leftAlt="Without Face Touch Up"
      rightAlt="With Face Touch Up"
    />
  );
}

function KrispToggleRow({ title, sub, on, onToggle }) {
  return (
    <button type="button" className="fp-krisp-toggle-row" onClick={onToggle} aria-pressed={on}>
      <div className="fp-krisp-toggle-text">
        <div className="fp-krisp-toggle-title">{title}</div>
        <div className="fp-krisp-toggle-sub">{sub}</div>
      </div>
      <span className={`fp-krisp-switch ${on ? 'fp-krisp-switch-on' : ''}`} aria-hidden="true" />
    </button>
  );
}

function KrispNoiseCancellationPreview() {
  const [volume, setVolume] = useState(0.7);
  const [toggles, setToggles] = useState({
    noise: true,
    background: true,
    autoLevel: true,
    disable: true,
  });
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromClientX = (clientX) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, x)));
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const onSliderDown = (e) => {
    draggingRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setFromClientX(clientX);
  };

  const toggle = (key) => () => setToggles(t => ({ ...t, [key]: !t[key] }));
  const pct = `${volume * 100}%`;

  return (
    <div className="fp-krisp-frame">
      <MeetingPreview autoReactions={false} roamojiOpen={false} />
      <div className="fp-krisp-popover">
        <div className="fp-krisp-row">
          <span className="fp-krisp-label">Speaker</span>
          <div className="fp-krisp-picker">
            <span className="fp-krisp-picker-value">Logitech 4K</span>
            <button type="button" className="fp-krisp-picker-btn" aria-label="Choose speaker">
              <span className="fp-krisp-picker-caret" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="fp-krisp-row">
          <span className="fp-krisp-label">Microphone</span>
          <div className="fp-krisp-picker">
            <span className="fp-krisp-picker-value">MacBook Air</span>
            <button type="button" className="fp-krisp-picker-btn" aria-label="Choose microphone">
              <span className="fp-krisp-picker-caret" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="fp-krisp-row">
          <span className="fp-krisp-label">Output Volume</span>
          <div
            className="fp-krisp-slider"
            ref={sliderRef}
            onMouseDown={onSliderDown}
            onTouchStart={onSliderDown}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
          >
            <div className="fp-krisp-slider-fill" style={{ width: pct }} />
            <div className="fp-krisp-slider-thumb" style={{ left: pct }} />
          </div>
        </div>
        <div className="fp-krisp-spacer" />
        <div className="fp-krisp-section-label">Advanced</div>
        <KrispToggleRow title="Noise Cancellation" sub="Powered by Krisp" on={toggles.noise} onToggle={toggle('noise')} />
        <KrispToggleRow title="Background Voice Cancellation" sub="May increase power consumption" on={toggles.background} onToggle={toggle('background')} />
        <KrispToggleRow title="Automatic Input Level Adjustment" sub="Recommended" on={toggles.autoLevel} onToggle={toggle('autoLevel')} />
        <KrispToggleRow title="Disable Audio Processing" sub="Not Recommended" on={toggles.disable} onToggle={toggle('disable')} />
      </div>
    </div>
  );
}

function RoamojiReactionsPreview() {
  const fourPeople = [
    VIDEO_SPEAKERS[1], // Lauren Hayes
    VIDEO_SPEAKERS[2], // Ashley Brooks
    VIDEO_SPEAKERS[5], // Ethan Bishop
    VIDEO_SPEAKERS[6], // Sarah Mitchell
  ];
  return <MeetingPreview people={fourPeople} incomingGesturesEnabled={true} />;
}

function WbIcon({ name, size = 24 }) {
  return (
    <span
      className="fp-wb-glyph"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(/icons/wb/${name}.svg)`,
        maskImage: `url(/icons/wb/${name}.svg)`,
      }}
      aria-hidden="true"
    />
  );
}

const MP_CURSOR_PALETTE = [
  { color: 'var(--citrus-500)', dark: true },
  { color: 'var(--green-500)' },
  { color: 'var(--amber-500)', dark: true },
  { color: 'var(--red-500)' },
  { color: 'var(--pink-500)' },
  { color: 'var(--indigo-500)' },
  { color: 'var(--blue-500)' },
  { color: 'var(--cyan-500)', dark: true },
];

const MP_CURSOR_NAMES = [
  'Aaron', 'Arnav', 'Ava', 'Chelsea', 'Derek', 'Garima', 'Grace', 'Howard',
  'Jeff', 'Joe', 'Jon', 'Keegan', 'Klas', 'Lexi', 'Mattias', 'Michael',
  'Peter', 'Rob', 'Sean', 'Thomas', 'Tom', 'Will',
];

function pickRandom(arr, exclude) {
  const pool = exclude == null ? arr : arr.filter(x => x !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

function SimulatedCursors({ containerRef, count = 2 }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [, setTick] = useState(0);

  const agentsRef = useRef(null);
  if (agentsRef.current == null) {
    const usedNames = new Set();
    const usedSwatches = new Set();
    const pickUnique = (arr, used) => {
      const pool = arr.filter(x => !used.has(x));
      const choice = pool[Math.floor(Math.random() * pool.length)];
      used.add(choice);
      return choice;
    };
    agentsRef.current = Array.from({ length: count }, () => ({
      name: pickUnique(MP_CURSOR_NAMES, usedNames),
      swatch: pickUnique(MP_CURSOR_PALETTE, usedSwatches),
      seg: null,
      pos: { x: 0, y: 0 },
    }));
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (size.w <= 0 || size.h <= 0) return;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const randomPoint = () => ({
      x: Math.random() * Math.max(40, size.w - 40) + 20,
      y: Math.random() * Math.max(40, size.h - 40) + 20,
    });
    const buildSegment = (from, startAt) => {
      const isJitter = Math.random() < 0.35;
      let to;
      if (isJitter) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 60;
        to = {
          x: clamp(from.x + Math.cos(angle) * dist, 20, size.w - 20),
          y: clamp(from.y + Math.sin(angle) * dist, 20, size.h - 20),
        };
      } else {
        to = randomPoint();
      }
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy) || 1;
      const px = -dy / dist;
      const py = dx / dist;
      const sway = (Math.random() - 0.5) * dist * 0.6;
      const sway2 = (Math.random() - 0.5) * dist * 0.6;
      const c1 = { x: from.x + dx * 0.33 + px * sway, y: from.y + dy * 0.33 + py * sway };
      const c2 = { x: from.x + dx * 0.66 + px * sway2, y: from.y + dy * 0.66 + py * sway2 };
      const baseDur = isJitter ? 280 + Math.random() * 320 : 900 + dist * (1.6 + Math.random() * 1.2);
      return {
        from,
        c1,
        c2,
        to,
        startedAt: startAt,
        duration: baseDur,
        idleAfter: isJitter ? 80 + Math.random() * 240 : 400 + Math.random() * 2400,
      };
    };
    const now = performance.now();
    agentsRef.current.forEach((agent, i) => {
      const start = randomPoint();
      agent.pos = start;
      agent.seg = buildSegment(start, now + i * 600);
    });

    let raf;
    const step = () => {
      const now2 = performance.now();
      agentsRef.current.forEach(agent => {
        const seg = agent.seg;
        if (!seg) return;
        const segEnd = seg.startedAt + seg.duration + seg.idleAfter;
        if (now2 >= segEnd) {
          agent.pos = seg.to;
          agent.seg = buildSegment(seg.to, now2);
        }
      });
      setTick(t => (t + 1) % 1000000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [size.w, size.h]);

  if (size.w <= 0) return null;

  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const cubic = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const now = performance.now();

  return (
    <>
      {agentsRef.current.map((agent, i) => {
        const seg = agent.seg;
        let x = agent.pos.x;
        let y = agent.pos.y;
        if (seg) {
          const elapsed = now - seg.startedAt;
          if (elapsed <= 0) {
            x = seg.from.x;
            y = seg.from.y;
          } else if (elapsed >= seg.duration) {
            x = seg.to.x;
            y = seg.to.y;
          } else {
            const t = easeInOut(elapsed / seg.duration);
            x = cubic(seg.from.x, seg.c1.x, seg.c2.x, seg.to.x, t);
            y = cubic(seg.from.y, seg.c1.y, seg.c2.y, seg.to.y, t);
          }
        }
        const { color, dark } = agent.swatch;
        return (
          <div key={i} className="fp-mp-cursor" style={{ left: x, top: y }} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="fp-mp-cursor-arrow">
              <path
                d="M4.97267 3.72088L9.70161 19.7968C9.90771 20.4986 10.8692 20.5759 11.1839 19.9162L13.8073 14.4138C13.9093 14.2 14.1012 14.0427 14.3306 13.9846L20.2349 12.4944C20.9424 12.3156 21.0562 11.3566 20.41 11.0161L5.60331 3.20409C5.25697 3.02145 4.86185 3.34513 4.97279 3.72131L4.97267 3.72088Z"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`fp-mp-cursor-name${dark ? ' fp-mp-cursor-name-dark' : ''}`}
              style={{ background: color }}
            >
              {agent.name}
            </span>
          </div>
        );
      })}
    </>
  );
}

const BIG_MEETING_VIDEO_FILES = [
  ['Female', 'ashley_brooks'],
  ['Female', 'brooke_foster'],
  ['Female', 'camila_torres'],
  ['Female', 'chloe_peterson'],
  ['Female', 'emily_carter'],
  ['Female', 'grace_thompson'],
  ['Female', 'hannah_bennett'],
  ['Female', 'isabella_morgan'],
  ['Female', 'jessica_hall'],
  ['Female', 'lauren_hayes'],
  ['Female', 'madison_reed'],
  ['Female', 'megan_taylor'],
  ['Female', 'mia_chen'],
  ['Female', 'natalie_wilson'],
  ['Female', 'olivia_sanders'],
  ['Female', 'rachel_cooper'],
  ['Female', 'sarah_mitchell'],
  ['Female', 'sophia_ramirez'],
  ['Male', 'daniel_russell'],
  ['Male', 'ethan_bishop'],
  ['Male', 'michael_stevens'],
];

const BIG_MEETING_ROAM_AVATARS = [
  ['Aaron Wadhwa', 'aaron-wadhwa'],
  ['Arnav Bansal', 'arnav-bansal'],
  ['Ava Lee', 'ava-lee'],
  ['Chelsea Turbin', 'chelsea-turbin'],
  ['Derek Cicerone', 'derek-cicerone'],
  ['Garima Kewlani', 'garima-kewlani'],
  ['Grace Sutherland', 'grace-sutherland'],
  ['Howard Lerman', 'howard-lerman'],
  ['Jeff Grossman', 'jeff-grossman'],
  ['Joe Woodward', 'joe-woodward'],
  ['John Beutner', 'john-beutner'],
  ['John Huffsmith', 'john-huffsmith'],
  ['John Moffa', 'john-moffa'],
  ['Jon Brod', 'jon-brod'],
  ['Keegan Lanzillotta', 'keegan-lanzillotta'],
  ['Klas Leino', 'klas-leino'],
  ['Lexi Bohonnon', 'lexi-bohonnon'],
  ['Mattias Leino', 'mattias-leino'],
  ['Michael Miller', 'michael-miller'],
  ['Michael Walrath', 'michael-walrath'],
  ['Peter Lerman', 'peter-lerman'],
  ['Rob Figueiredo', 'rob-figueiredo'],
  ['Sean MacIsaac', 'sean-macisaac'],
  ['Thomas Grapperon', 'thomas-grapperon'],
  ['Tom Dixon', 'tom-dixon'],
  ['Will Houseberry', 'will-hou'],
];

const BIG_MEETING_PEOPLE = (() => {
  const TOTAL = 56;
  const base = BIG_MEETING_VIDEO_FILES.map(([folder, slug]) => {
    const fullName = slug.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
    return {
      fullName,
      avatar: `/videos/${folder}/${slug}.png`,
      video: `/videos/${folder}/${slug}.mp4`,
    };
  });
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const queue = [];
  while (queue.length < TOTAL) {
    queue.push(...shuffle(base));
  }
  for (let i = 1; i < TOTAL; i++) {
    if (queue[i].video === queue[i - 1].video) {
      for (let j = i + 1; j < queue.length; j++) {
        if (queue[j].video !== queue[i - 1].video && (i + 1 >= TOTAL || queue[j].video !== queue[i + 1].video)) {
          [queue[i], queue[j]] = [queue[j], queue[i]];
          break;
        }
      }
    }
  }
  return queue.slice(0, TOTAL).map((p, i) => ({
    ...p,
    name: `${p.fullName}#${i}`,
  }));
})();

function ActiveSpeakerPreview() {
  const speakers = VIDEO_SPEAKERS.filter(p => p.name !== 'Ethan Bishop' && p.name !== 'Hannah Bennett');
  return (
    <div className="fp-as-preview">
      <MeetingWindow
        win={noopWin('meeting')}
        onDrag={() => {}}
        roomName="Walt Disney"
        people={speakers}
        onOpenChat={() => {}}
        onOpenOnAir={() => {}}
        autoReactions={false}
        roamojiOpen={false}
        gesturesEnabled={false}
        initialViewMode="speaker"
        initialViewMenuOpen
      />
    </div>
  );
}

function RoamvisionPreview() {
  return (
    <div className="fp-rv-window">
      <img src="/feature/roamvision-hero.jpg" alt="Roamvision conference room" />
    </div>
  );
}

function BigMeetingPreview() {
  return (
    <div className="fp-big-meeting">
      <MeetingWindow
        win={noopWin('meeting')}
        onDrag={() => {}}
        roomName="Walt Disney"
        people={BIG_MEETING_PEOPLE}
        onOpenChat={() => {}}
        onOpenOnAir={() => {}}
        autoReactions={false}
        roamojiOpen={false}
        gesturesEnabled={false}
      />
    </div>
  );
}

function MultiplayerCursor({ containerRef }) {
  const [pos, setPos] = useState(null);
  const [identity, setIdentity] = useState(() => ({
    name: pickRandom(MP_CURSOR_NAMES),
    swatch: pickRandom(MP_CURSOR_PALETTE),
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onEnter = () => {
      setIdentity(prev => ({
        name: pickRandom(MP_CURSOR_NAMES, prev.name),
        swatch: pickRandom(MP_CURSOR_PALETTE, prev.swatch),
      }));
    };
    const onLeave = () => setPos(null);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [containerRef]);

  if (!pos) return null;
  const { color, dark } = identity.swatch;
  return (
    <div className="fp-mp-cursor" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="fp-mp-cursor-arrow">
        <path
          d="M4.97267 3.72088L9.70161 19.7968C9.90771 20.4986 10.8692 20.5759 11.1839 19.9162L13.8073 14.4138C13.9093 14.2 14.1012 14.0427 14.3306 13.9846L20.2349 12.4944C20.9424 12.3156 21.0562 11.3566 20.41 11.0161L5.60331 3.20409C5.25697 3.02145 4.86185 3.34513 4.97279 3.72131L4.97267 3.72088Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`fp-mp-cursor-name${dark ? ' fp-mp-cursor-name-dark' : ''}`}
        style={{ background: color }}
      >
        {identity.name}
      </span>
    </div>
  );
}

function WhiteboardPreview() {
  const tools = [
    { key: 'select', label: 'Select', icon: 'IconMousePointer' },
    { key: 'pen', label: 'Pencil', icon: 'IconPencil' },
    { key: 'square', label: 'Square', icon: 'IconShapeSquare' },
    { key: 'circle', label: 'Circle', icon: 'IconShapeCircle' },
    { key: 'arrow', label: 'Arrow', icon: 'IconArrowUpRight' },
    { key: 'line', label: 'Line', icon: 'IconShapeLine' },
    { key: 'text', label: 'Text', icon: 'IconText' },
    { key: 'sticker', label: 'Sticky note', icon: 'IconStickyNote' },
    { key: 'image', label: 'Image', icon: 'IconPhoto' },
  ];
  const colorRows = [
    ['#FF453A', '#FF9F0A', '#FFD60A', '#34C759'],
    ['#5AC8FA', '#0A84FF', '#1E40FF', '#AF52DE'],
    ['#8E8E93', '#E5E5EA'],
  ];

  const SHAPE_TOOLS = ['square', 'circle', 'arrow', 'line'];
  const STICKER_SIZE = 140;

  const [activeTool, setActiveTool] = useState('pen');
  const [activeColor, setActiveColor] = useState('#FFD60A');
  const [strokes, setStrokes] = useState([]); // [{ color, points: [{x,y}, ...] }]
  const [currentStroke, setCurrentStroke] = useState(null);
  const [shapes, setShapes] = useState([]); // [{ id, type, color, x1, y1, x2, y2 }]
  const [currentShape, setCurrentShape] = useState(null);
  const [texts, setTexts] = useState([]); // [{ id, x, y, color, value }]
  const [stickers, setStickers] = useState([]); // [{ id, x, y, color, value }]
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingStickerId, setEditingStickerId] = useState(null);
  const textIdRef = useRef(0);
  const stickerIdRef = useRef(0);
  const shapeIdRef = useRef(0);
  const canvasRef = useRef(null);
  const windowRef = useRef(null);
  const editingTextRef = useRef(null);
  const editingStickerRef = useRef(null);

  useEffect(() => {
    if (editingTextId != null) {
      const id = window.requestAnimationFrame(() => {
        editingTextRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [editingTextId]);

  useEffect(() => {
    if (editingStickerId != null) {
      const id = window.requestAnimationFrame(() => {
        editingStickerRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [editingStickerId]);

  const getCanvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onCanvasPointerDown = (e) => {
    if (activeTool === 'pen') {
      const { x, y } = getCanvasPoint(e);
      setCurrentStroke({ color: activeColor, points: [{ x, y }] });
      canvasRef.current.setPointerCapture?.(e.pointerId);
      return;
    }
    if (SHAPE_TOOLS.includes(activeTool)) {
      const { x, y } = getCanvasPoint(e);
      setCurrentShape({ type: activeTool, color: activeColor, x1: x, y1: y, x2: x, y2: y });
      canvasRef.current.setPointerCapture?.(e.pointerId);
      return;
    }
    if (activeTool === 'text') {
      e.preventDefault();
      const { x, y } = getCanvasPoint(e);
      const id = ++textIdRef.current;
      setTexts(prev => [...prev, { id, x, y, color: activeColor, value: '' }]);
      setEditingTextId(id);
    }
  };

  const onCanvasPointerMove = (e) => {
    if (currentStroke) {
      const { x, y } = getCanvasPoint(e);
      setCurrentStroke(prev => prev && { ...prev, points: [...prev.points, { x, y }] });
    }
    if (currentShape) {
      const { x, y } = getCanvasPoint(e);
      setCurrentShape(prev => prev && { ...prev, x2: x, y2: y });
    }
  };

  const onCanvasPointerUp = () => {
    if (currentStroke) {
      if (currentStroke.points.length > 1) {
        setStrokes(prev => [...prev, currentStroke]);
      }
      setCurrentStroke(null);
    }
    if (currentShape) {
      const { x1, y1, x2, y2 } = currentShape;
      if (Math.abs(x2 - x1) > 2 || Math.abs(y2 - y1) > 2) {
        setShapes(prev => [...prev, { ...currentShape, id: ++shapeIdRef.current }]);
      }
      setCurrentShape(null);
    }
  };

  const updateText = (id, value) => {
    setTexts(prev => prev.map(t => (t.id === id ? { ...t, value } : t)));
  };

  const finishEditingText = (id) => {
    setEditingTextId(null);
    setTexts(prev => prev.filter(t => t.id !== id || t.value.trim().length > 0));
  };

  const updateSticker = (id, value) => {
    setStickers(prev => prev.map(s => (s.id === id ? { ...s, value } : s)));
  };

  const dropStickerAtCenter = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2 - STICKER_SIZE / 2;
    const cy = rect.height / 2 - STICKER_SIZE / 2;
    const id = ++stickerIdRef.current;
    setStickers(prev => [...prev, { id, x: cx, y: cy, color: activeColor, value: '' }]);
    setEditingStickerId(id);
  };

  const startStickerDrag = (id) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    const startBox = { x: sticker.x, y: sticker.y };
    const wasEditing = editingStickerId === id;
    let moved = false;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      const nx = Math.max(0, Math.min(rect.width - STICKER_SIZE, startBox.x + dx));
      const ny = Math.max(0, Math.min(rect.height - STICKER_SIZE, startBox.y + dy));
      setStickers(prev => prev.map(s => (s.id === id ? { ...s, x: nx, y: ny } : s)));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (!moved && !wasEditing) {
        setEditingStickerId(id);
      } else if (moved && wasEditing) {
        window.requestAnimationFrame(() => editingStickerRef.current?.focus());
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const strokeToPath = (stroke) => {
    if (!stroke || stroke.points.length === 0) return '';
    const [first, ...rest] = stroke.points;
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  const renderShape = (s, key) => {
    const x = Math.min(s.x1, s.x2);
    const y = Math.min(s.y1, s.y2);
    const w = Math.abs(s.x2 - s.x1);
    const h = Math.abs(s.y2 - s.y1);
    const common = { stroke: s.color, strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (s.type === 'square') {
      return <rect key={key} x={x} y={y} width={w} height={h} {...common} />;
    }
    if (s.type === 'circle') {
      return <ellipse key={key} cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} {...common} />;
    }
    if (s.type === 'line') {
      return <line key={key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...common} />;
    }
    if (s.type === 'arrow') {
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      const len = Math.hypot(dx, dy) || 1;
      const angle = Math.atan2(dy, dx);
      const headLen = Math.min(14, len * 0.4);
      const headAngle = Math.PI / 6;
      const ax1 = s.x2 - headLen * Math.cos(angle - headAngle);
      const ay1 = s.y2 - headLen * Math.sin(angle - headAngle);
      const ax2 = s.x2 - headLen * Math.cos(angle + headAngle);
      const ay2 = s.y2 - headLen * Math.sin(angle + headAngle);
      return (
        <g key={key}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...common} />
          <line x1={ax1} y1={ay1} x2={s.x2} y2={s.y2} {...common} />
          <line x1={ax2} y1={ay2} x2={s.x2} y2={s.y2} {...common} />
        </g>
      );
    }
    return null;
  };

  const clearStrokes = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setShapes([]);
    setCurrentShape(null);
    setTexts([]);
    setEditingTextId(null);
    setStickers([]);
    setEditingStickerId(null);
  };

  return (
    <div className="fp-wb-window fp-mp-host" ref={windowRef}>
      <div
        ref={canvasRef}
        className={`fp-wb-canvas fp-wb-canvas-${activeTool}`}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerCancel={onCanvasPointerUp}
      >
        <svg className="fp-wb-svg" preserveAspectRatio="none">
          {strokes.map((s, i) => (
            <path key={`stroke-${i}`} d={strokeToPath(s)} stroke={s.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentStroke && (
            <path d={strokeToPath(currentStroke)} stroke={currentStroke.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {shapes.map(s => renderShape(s, `shape-${s.id}`))}
          {currentShape && renderShape(currentShape, 'shape-current')}
        </svg>
        {texts.map(t => (
          editingTextId === t.id ? (
            <textarea
              key={t.id}
              ref={editingTextRef}
              autoFocus
              className="fp-wb-text fp-wb-text-edit"
              style={{ left: t.x, top: t.y, color: t.color }}
              value={t.value}
              onChange={(e) => updateText(t.id, e.target.value)}
              onBlur={() => finishEditingText(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.target.blur();
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Type..."
            />
          ) : (
            <div
              key={t.id}
              className="fp-wb-text"
              style={{ left: t.x, top: t.y, color: t.color }}
              onPointerDown={(e) => {
                if (activeTool === 'text') {
                  e.stopPropagation();
                  setEditingTextId(t.id);
                }
              }}
            >
              {t.value}
            </div>
          )
        ))}
        {stickers.map(s => (
          <div
            key={s.id}
            className="fp-wb-sticker"
            style={{ left: s.x, top: s.y, width: STICKER_SIZE, height: STICKER_SIZE }}
            onPointerDown={startStickerDrag(s.id)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {editingStickerId === s.id ? (
              <textarea
                ref={editingStickerRef}
                autoFocus
                className="fp-wb-sticker-text fp-wb-sticker-edit"
                value={s.value}
                onChange={(e) => updateSticker(s.id, e.target.value)}
                onBlur={() => setEditingStickerId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.target.blur();
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Note..."
              />
            ) : (
              <div className="fp-wb-sticker-text">{s.value}</div>
            )}
          </div>
        ))}
      </div>
      <div className="fp-wb-titlebar">
        <button type="button" className="fp-wb-iconbtn" aria-label="Close">
          <WbIcon name="IconDismiss" />
        </button>
        <div className="fp-wb-title-right">
          <button type="button" className="fp-wb-iconbtn" aria-label="Expand">
            <WbIcon name="IconArrowExpand" />
          </button>
          <button type="button" className="fp-wb-iconbtn" aria-label="More">
            <WbIcon name="IconEllipsisVertical" />
          </button>
        </div>
      </div>
      <div className="fp-wb-zoom">
        <button type="button" className="fp-wb-zoom-btn" aria-label="Zoom out">
          <WbIcon name="IconMinus" size={16} />
        </button>
        <span className="fp-wb-zoom-value">100%</span>
        <button type="button" className="fp-wb-zoom-btn" aria-label="Zoom in">
          <WbIcon name="IconPlus" size={16} />
        </button>
      </div>
      <div className="fp-wb-toolbar">
        {tools.map((t, i) => (
          <React.Fragment key={t.key}>
            {(i === 2 || i === 6) && <div className="fp-wb-toolbar-divider" />}
            <button
              type="button"
              className={`fp-wb-tool ${activeTool === t.key ? 'fp-wb-tool-active' : ''}`}
              aria-label={t.label}
              onClick={() => {
                setActiveTool(t.key);
                if (t.key === 'sticker') {
                  dropStickerAtCenter();
                }
              }}
            >
              <WbIcon name={t.icon} size={20} />
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="fp-wb-palette">
        <div className="fp-wb-swatches">
          {colorRows.map((row, i) => (
            <div key={i} className="fp-wb-swatch-row">
              {row.map(color => (
                <span
                  key={color}
                  className={`fp-wb-swatch ${activeColor === color ? 'fp-wb-swatch-active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="fp-wb-palette-row">
          <button type="button" className="fp-wb-palette-action">
            <WbIcon name="IconLayers3BottomFill" size={20} />
            <span>Back</span>
          </button>
          <div className="fp-wb-palette-vdivider" />
          <button type="button" className="fp-wb-palette-action">
            <WbIcon name="IconLayers3TopFill" size={20} />
            <span>Front</span>
          </button>
        </div>
        <button type="button" className="fp-wb-palette-delete" onClick={clearStrokes}>
          <WbIcon name="IconTrash" size={20} />
          <span>Delete</span>
        </button>
      </div>
      <SimulatedCursors containerRef={windowRef} count={2} />
      <MultiplayerCursor containerRef={windowRef} />
    </div>
  );
}

const MIN_ITEM_SIZE = 80;

function MediaBoardItem({ src, initialX, initialY, width: initialWidth, height: initialHeight, boardRef, onSelect, z }) {
  const [box, setBox] = useState({ x: initialX, y: initialY, w: initialWidth, h: initialHeight });
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);

  const startMove = (e) => {
    e.preventDefault();
    onSelect?.();
    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startBox = box;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const maxX = boardRect.width - startBox.w;
      const maxY = boardRect.height - startBox.h;
      setBox({
        x: Math.max(0, Math.min(maxX, startBox.x + dx)),
        y: Math.max(0, Math.min(maxY, startBox.y + dy)),
        w: startBox.w,
        h: startBox.h,
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startResize = (handle) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
    const board = boardRef.current;
    if (!board) return;
    const boardRect = board.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startBox = box;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let { x, y, w, h } = startBox;
      if (handle.includes('e')) {
        w = Math.max(MIN_ITEM_SIZE, Math.min(boardRect.width - startBox.x, startBox.w + dx));
      }
      if (handle.includes('s')) {
        h = Math.max(MIN_ITEM_SIZE, Math.min(boardRect.height - startBox.y, startBox.h + dy));
      }
      if (handle.includes('w')) {
        const newW = Math.max(MIN_ITEM_SIZE, startBox.w - dx);
        x = startBox.x + (startBox.w - newW);
        x = Math.max(0, x);
        w = startBox.x + startBox.w - x;
      }
      if (handle.includes('n')) {
        const newH = Math.max(MIN_ITEM_SIZE, startBox.h - dy);
        y = startBox.y + (startBox.h - newH);
        y = Math.max(0, y);
        h = startBox.y + startBox.h - y;
      }
      setBox({ x, y, w, h });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const showButton = !playing || hovered;
  const cornerHandles = ['nw', 'ne', 'se', 'sw'];
  const edgeHandles = ['n', 'e', 's', 'w'];

  return (
    <div
      className="fp-mb-item"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, zIndex: z }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="fp-mb-item-inner" onPointerDown={startMove}>
        <video
          ref={videoRef}
          className="fp-mb-video"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className={`fp-mb-overlay ${showButton ? 'fp-mb-overlay-visible' : ''}`} />
        <button
          type="button"
          className={`fp-mb-play ${showButton ? 'fp-mb-play-visible' : ''}`}
          aria-label={playing ? 'Pause' : 'Play'}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={togglePlay}
        >
          <WbIcon name={playing ? 'IconPauseCircle' : 'IconPlayCircle'} />
        </button>
      </div>
      {hovered && (
        <div className="fp-mb-bbox" aria-hidden="true">
          {edgeHandles.map(h => (
            <span
              key={h}
              className={`fp-mb-handle fp-mb-handle-edge fp-mb-handle-${h}`}
              onPointerDown={startResize(h)}
            />
          ))}
          {cornerHandles.map(h => (
            <span
              key={h}
              className={`fp-mb-handle fp-mb-handle-corner fp-mb-handle-${h}`}
              onPointerDown={startResize(h)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaBoardPreview() {
  const boardRef = useRef(null);
  const windowRef = useRef(null);
  const [zOrder, setZOrder] = useState(['disneyland', 'portrait']);
  const [textActive, setTextActive] = useState(false);
  const [texts, setTexts] = useState([]);
  const [editingTextId, setEditingTextId] = useState(null);
  const textIdRef = useRef(0);
  const editingTextRef = useRef(null);
  const bringToFront = (id) => setZOrder(prev => [...prev.filter(p => p !== id), id]);
  const zIndexOf = (id) => zOrder.indexOf(id) + 1;

  useEffect(() => {
    if (editingTextId != null) {
      const id = window.requestAnimationFrame(() => editingTextRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [editingTextId]);

  const onBoardPointerDown = (e) => {
    if (!textActive) return;
    if (e.target !== boardRef.current) return;
    e.preventDefault();
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++textIdRef.current;
    setTexts(prev => [...prev, { id, x, y, value: '' }]);
    setEditingTextId(id);
  };

  const updateText = (id, value) => {
    setTexts(prev => prev.map(t => (t.id === id ? { ...t, value } : t)));
  };

  const finishEditingText = (id) => {
    setEditingTextId(null);
    setTexts(prev => prev.filter(t => t.id !== id || t.value.trim().length > 0));
  };

  return (
    <div className="fp-mb-window fp-mp-host" ref={windowRef} aria-hidden="true">
      <div className="fp-mb-titlebar">
        <button type="button" className="fp-wb-iconbtn" aria-label="Close">
          <WbIcon name="IconDismiss" />
        </button>
        <div className="fp-mb-title-center">
          <button type="button" className="fp-wb-iconbtn" aria-label="Recent">
            <WbIcon name="IconArrowCounterclockwise" />
          </button>
          <button
            type="button"
            className={`fp-wb-iconbtn ${textActive ? 'fp-wb-iconbtn-active' : ''}`}
            aria-label="Text"
            onClick={() => setTextActive(v => !v)}
          >
            <WbIcon name="IconText" />
          </button>
          <button type="button" className="fp-wb-iconbtn" aria-label="Attach">
            <WbIcon name="IconPaperclip" />
          </button>
        </div>
        <div className="fp-mb-title-right">
          <button type="button" className="fp-wb-iconbtn" aria-label="Expand">
            <WbIcon name="IconArrowExpand" />
          </button>
          <button type="button" className="fp-wb-iconbtn" aria-label="More">
            <WbIcon name="IconEllipsisVertical" />
          </button>
        </div>
      </div>
      <div className="fp-mb-body">
        <div
          className={`fp-mb-board ${textActive ? 'fp-mb-board-text' : ''}`}
          ref={boardRef}
          onPointerDown={onBoardPointerDown}
        >
          <MediaBoardItem
            src="/feature/disneyland.mp4"
            initialX={32}
            initialY={48}
            width={420}
            height={236}
            boardRef={boardRef}
            onSelect={() => bringToFront('disneyland')}
            z={zIndexOf('disneyland')}
          />
          <MediaBoardItem
            src="/feature/portrait-clip.mp4"
            initialX={500}
            initialY={32}
            width={180}
            height={320}
            boardRef={boardRef}
            onSelect={() => bringToFront('portrait')}
            z={zIndexOf('portrait')}
          />
          {texts.map(t => (
            editingTextId === t.id ? (
              <textarea
                key={t.id}
                ref={editingTextRef}
                autoFocus
                className="fp-wb-text fp-wb-text-edit"
                style={{ left: t.x, top: t.y }}
                value={t.value}
                onChange={(e) => updateText(t.id, e.target.value)}
                onBlur={() => finishEditingText(t.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') e.target.blur();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Type..."
              />
            ) : (
              <div
                key={t.id}
                className="fp-wb-text"
                style={{ left: t.x, top: t.y }}
                onPointerDown={(e) => {
                  if (textActive) {
                    e.stopPropagation();
                    setEditingTextId(t.id);
                  }
                }}
              >
                {t.value}
              </div>
            )
          ))}
        </div>
      </div>
      <SimulatedCursors containerRef={windowRef} count={2} />
      <MultiplayerCursor containerRef={windowRef} />
    </div>
  );
}

function ClosedCaptionsPreview() {
  const fourPeople = [
    VIDEO_SPEAKERS[0], // Emily Carter
    VIDEO_SPEAKERS[5], // Ethan Bishop
    VIDEO_SPEAKERS[6], // Sarah Mitchell
    VIDEO_SPEAKERS[7], // Olivia Sanders
  ];
  const [emily, ethan, sarah, olivia] = fourPeople;
  const line = (p, text) => ({ name: p.fullName || p.name, avatar: p.avatar, text });
  const script = [
    line(emily, 'Hey everyone, thanks for hopping on.'),
    line(ethan, 'Of course. Should we kick things off?'),
    line(sarah, 'Yeah let’s do it. I went through the captions exploration today and I think we’re really close — the transcript scrolls live, the avatars match the speakers, and it stays out of the way of the video.'),
    line(olivia, 'That’s great. Anything we still need to figure out before we ship?'),
    line(emily, 'Just one open thread on punctuation timing — I’ll have an answer by tomorrow.'),
    line(ethan, 'Sounds good. Let’s plan to walk through it again on Friday.'),
  ];
  return <MeetingPreview people={fourPeople} autoReactions={false} roamojiOpen={false} captionsScript={script} />;
}

function BootChatPreview() {
  return (
    <div className="fp-minichat-preview">
      <div className="fp-minichat-preview-frame">
        <Magnify
          className="fp-boot-magnify"
          style={{ top: 260, left: 10 }}
          lineTo={{ y: 188 }}
        >
          <span className="fp-boot-magnify-glyph" aria-hidden="true" />
        </Magnify>
      <div className="mc-window fp-minichat-preview-win">
        <div className="mc-header">
          <div className="mc-traffic-lights">
            <div className="mc-light mc-light-close" />
            <div className="mc-light mc-light-minimize" />
            <div className="mc-light mc-light-maximize" />
          </div>
          <div className="mc-header-center">
            <img className="mc-header-avatar" src="/headshots/howard-lerman.jpg" alt="" />
            <span className="mc-header-name">Howard L.</span>
          </div>
        </div>
        <div className="mc-body">
          <div className="mc-messages">
            <div className="mc-msg">
              <div className="mc-msg-bubble" style={{ borderRadius: '18px 18px 18px 4px' }}>
                <p>…and circling back to the Q3 forecast, I really think we should walk through all 47 line items one more time, just to make sure—</p>
              </div>
            </div>
            <div className="mc-msg">
              <div className="mc-msg-bubble mc-msg-consecutive" style={{ borderRadius: '4px 18px 18px 4px' }}>
                <p>Actually, on second thought, let me start from the top.</p>
              </div>
            </div>
            <div className="fp-minichat-system">
              <span className="fp-minichat-system-icon" aria-hidden="true" />
              <span>You gave Howard the boot.</span>
            </div>
          </div>
          <div className="ainbox-composer">
            <div className="ainbox-composer-box">
              <div className="ainbox-composer-field">
                <input placeholder="Write a Message..." readOnly />
              </div>
              <div className="ainbox-composer-toolbar">
                <div className="ainbox-toolbar-plus">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div className="ainbox-toolbar-group fp-minichat-actions">
                  <span className="fp-minichat-action-icon" style={{ WebkitMaskImage: 'url(/icons/boot.svg)', maskImage: 'url(/icons/boot.svg)' }} title="Boot" />
                  <span className="fp-minichat-action-icon" style={{ WebkitMaskImage: 'url(/icons/hand-raise.svg)', maskImage: 'url(/icons/hand-raise.svg)' }} title="Wave" />
                  <span className="fp-minichat-action-icon" style={{ WebkitMaskImage: 'url(/icons/knock.svg)', maskImage: 'url(/icons/knock.svg)' }} title="Knock" />
                </div>
                <div className="ainbox-toolbar-spacer" />
                <div className="ainbox-toolbar-group">
                  <img src="/icons/composer/Send.svg" alt="" className="ainbox-toolbar-img ainbox-send-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/* Pricing comparison shared across feature pages — Legacy stack vs. the
   bundled Virtual Office. Page-agnostic so it can sit at the bottom of
   every feature page below the social-post reviews. */
const STANDARD_PRICING_COMPARE = {
  variant: 'compare',
  left: {
    title: 'Legacy Work',
    subtitle: 'Manual, Not Integrated, $282/month',
    rows: [
      { name: 'Zoom', value: '$27/month', note: 'Endless 30-minute meetings' },
      { name: 'Hopin', value: '$25/month', note: 'Outside your office' },
      { name: 'Calendly', value: '$16/month', note: 'Can’t meet now' },
      { name: 'Slack', value: '$32/month', note: 'No meetings' },
      { name: 'Otter', value: '$29/month', note: 'Annoying bot' },
      { name: 'Loom', value: '$20/month', note: 'Annoying extension' },
      { name: 'Standalone AI Assistant', value: '$50/month', note: 'No office awareness' },
      { name: 'Zoom Webinars', value: '$83/month', note: 'Yahoo-era webinars' },
      { name: 'Cubicle', value: '$1,000/month', note: 'Commute, manual' },
    ],
    total: { label: 'Total', value: '$282/month', tone: 'negative' },
  },
  right: {
    featured: true,
    badge: 'Save 93%',
    title: 'Virtual Office Super Bundle',
    subtitle: 'AI-Powered, Integrated, $19.50/month',
    rows: [
      { name: 'Drop-In Meetings', href: '/drop-in-meetings', value: 'Included', note: '8-minute average' },
      { name: 'Theater', href: '/theater', value: 'Included', note: 'In your office' },
      { name: 'Lobby', href: '/lobby', value: 'Included', note: 'Meet now or later' },
      { name: 'AInbox', href: '/ainbox', value: 'Included', note: 'Prompt your meetings' },
      { name: 'Magic Minutes', href: '/magic-minutes', value: 'Included', note: 'No annoying bot' },
      { name: 'Magicast', href: '/magicast', value: 'Included', note: 'No download' },
      { name: 'On-It', href: '/on-it', value: 'Included', note: 'Office-aware AI' },
      { name: 'On-Air', href: '/on-air', value: 'Included', note: 'Creator-era events' },
      { name: 'Virtual Office', href: '/virtual-office', value: 'Included', note: 'Whole company, no commute' },
    ],
    total: { label: '9 products for the price of 1', value: '$19.50/month', tone: 'positive' },
  },
};

/* ===== Feature content registry ===== */
export const FEATURES = {
  'virtual-office': {
    eyebrow: 'Virtual Office Platform',
    title: 'Your Whole Company in One HQ',
    hero: <>It’s as if your whole company is in the same room from anywhere.<br /><br />A Roam Virtual Office lets you instantly see what’s happening and feel the buzz of the office at your distributed company.</>,
    visual: <MapPreview initialFloor="R&D" />,
    sections: [
      {
        title: 'Full Company Visualization',
        desc: 'Visualize the whole company as people enter and exit video rooms. Instantly see who is meeting with who and who is talking — just as if you were in a real office.',
        visual: <MapPreview initialFloor="VirtualOffice" />,
      },
      {
        title: 'Feel the Office Buzz',
        desc: 'Click a seat to enter a room. Your new location is visible on the map. A talking indicator animates on your head as you talk. As people move around and talk, your company will feel the energy of the movement and presence — just as if you were in the same physical office. Company Culture 📈',
        visual: <MapPreview autoKnock initialFloor="DropIn" />,
      },
      {
        variant: 'cards',
        cards: [
          { title: 'Private Office', desc: 'Each member is assigned a Private Office, an audio-only home base to hold meetings and showcase your favorite books, movies, awards, articles, and more on their personal shelf.' },
          { title: 'Meeting Room', desc: 'Dedicated video-enabled room to share your screen, collaborate on a shared whiteboard, record Magic Minutes, react with Roamoji, and more.' },
          { title: 'Theater', desc: 'Hold all-hands meetings, presentations, and large-scale events for up to 3,000 people.' },
          { title: 'Do Not Disturb', desc: 'If someone is doing deep work or otherwise doesn’t want to be bothered, they can set Do Not Disturb. Roam even automatically detects if someone is on a video conferencing call from Zoom or Google Meet and automatically puts that person in DND on Roam.' },
          { title: '3D Chat', desc: 'See chats and typing indicators from all groups as people message you. 3D chats visualize everyone who is messaging you right from the map at the same time.' },
          { title: 'Stories', desc: 'Share short video stories with your team as you work in the familiar social format beloved by millions. Stories are viewable for 24 hours but the good ones last forever.' },
        ],
      },
      {
        title: 'Drop-In Meetings',
        desc: 'Knock to drop-in to anyone who is available for a quick meeting. The average meeting time in Roam is just 8 minutes long!',
        visual: <KnockDropInPreview />,
      },
      {
        title: 'Game Room',
        subtitle: <>Teams that Play Together <em>Win</em> Together</>,
        desc: 'Increase employee engagement, build culture, and ramp newly formed teams with Game Room. Choose from 18 multiplayer titles like Battle Karts and Doodle Up, and view a live leaderboard that shows who’s winning right on the map. Team Video Games have a particularly strong impact on building newly formed teams. A recent study by four BYU information systems professors found newly-formed work teams experienced a 20 percent increase in productivity on subsequent tasks after playing video games together for just 45 minutes.',
        visual: <MapPreview initialFloor="GameDay" />,
      },
      {
        type: 'quote',
        quote: '“To see that big of a jump — especially for the amount of time they played — was a little shocking. Companies are spending thousands and thousands of dollars on team-building activities, and I’m thinking, go buy an Xbox.”',
        author: 'Greg Anderson',
        role: 'Professor, Information Systems, BYU',
      },
      {
        variant: 'cards',
        cards: [
          { title: 'GitHub', desc: 'A new era of handling PR requests. When you submit a PR request to your fellow dev, it appears next to your office right on the map until it’s done. PR review wait times drop drastically.' },
          { title: 'Figma', desc: 'Your Figma conversations appear right on the Roam floor map. Whenever you reply or comment on a Figma file, the Figma logo shows right next to your office. Click to instantly open the comment in Figma.' },
          { title: 'Spotify', desc: 'Stay in tune with your team by sharing what you’re playing on Spotify or Apple Music, right in your own office, right on the map.' },
          { title: 'Game Room', desc: 'Increase employee engagement, build better culture, and ramp new teams in your Game Room. Teams that play together win together.' },
          { title: 'Out of Roam', desc: 'If you’re out of the office for multiple days, your return date shows on your office.' },
          { title: 'Will Return', desc: 'If you’re stepping away but returning today just set your Will Return time and a clock appears.' },
        ],
      },
      {
        title: 'Customize Your Virtual Office with the Map Editor',
        desc: 'Make your virtual office your own. Decide who sits next to whom. Pick your logo and colors. Resize offices and rooms to fit accordingly. Give yourself the corner office! Add new floors as you expand. Put the theater on its own floor. If you’ve ever played SimCity to lay out your own city, you’ll intuitively know how to lay out your own office with the Roam Map Editor.',
        visual: <MapEditorPreview />,
      },
      {
        title: 'Spotlight Search',
        desc: 'Looking for someone? Instantly spotlight them on the map, on any floor. It’s like an automatic version of "Where’s Waldo".',
        visual: <MapPreview spotlightSearch initialFloor="Commercial" />,
      },
      {
        title: 'Elevator',
        desc: 'Turn your HQ into a skyscraper! Add floors as your company expands. Organize the company by floor, if you like. See multiple floors from the same view, and scroll up and down to see everyone.',
        visual: <MapPreview initialFloor="R&D" showSidebar autoCycleFloors />,
      },
      {
        title: 'Interact on the Map',
        desc: 'Click someone’s head to wave, knock, or chat. Waving at someone is a great way to say hey without annoying them too much.',
        visual: <MapPreview initialFloor="R&D" autoCycleDms />,
      },
      {
        title: 'Physical Office Tags',
        desc: 'For hybrid companies, automatically show which people are in which physical offices right on the map.',
        visual: <MapPreview initialFloor="R&D" showPhysicalTags />,
      },
      {
        title: 'Recordings',
        desc: 'Every meeting, On-Air Event, and Magic Minutes session is captured automatically and lands in Recordings. Browse by room or date, scrub through the video, and jump straight to a quoted moment — no more "can someone share the recording?" in chat.',
        visual: <RecordingsPreview />,
      },
      {
        title: 'Calendar',
        desc: 'Pull up your calendar right from the map. Add events. You can even schedule meetings in Roam chat. Just chat a meeting time like "Tomorrow at 2pm" and it will be automatically underlined. Click it to instantly schedule a meeting with everyone you’re speaking with!',
        visual: <CalendarPreview />,
      },
      {
        title: 'AI Agents on the Map',
        desc: 'Ultraproductive AI-first companies are hiring AI Agents to achieve tasks. You’re able to see which AI Agents are present, in their own offices, and you can even chat with them, knock on their doors and have voice conversations.',
        visual: <MapPreview onItAutoOpen initialFloor="R&D" />,
      },
      {
        variant: 'columns',
        columns: [
          {
            title: 'Ultraproductivity',
            desc: 'See everything going on at your company, instantly.',
          },
          {
            title: 'Instant Culture',
            desc: 'Everyone can see what’s happening at the company instantly. 9 out of 10 members of Roam report feeling more connected to their company within 3 days.',
          },
          {
            title: 'Bespoke for Your Company',
            desc: 'Your company has a unique identity. The subtle signals in the way you set up your virtual office is a reflection of that. Who sits next to who matters.',
          },
        ],
      },
      {
        variant: 'lead',
        leadContent: (
          <>Roam is <strong>Your AI-powered Virtual HQ</strong>. Unleash <em>ultraproductivity</em> as an AI-first, globally distributed, fully digitized company—one single HQ for your people to work side-by-side with AI Agents.</>
        ),
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'drop-in-meetings': {
    eyebrow: 'Drop-In Meetings',
    title: 'Knock. Talk. Done.',
    hero: <>Turn next week’s 60 minute meeting into a 5 minute conversation, right now. Audio-only private office or fully featured video conferencing rooms, right on the map.<br /><br />Knock to drop-in to anyone who is available for a quick meeting. The average meeting time in Roam is just 8 minutes long!</>,
    visual: <MapPreview autoKnock initialFloor="DropIn" />,
    quote: {
      quote: '“Walk out of a meeting … as soon as it is obvious you aren’t adding value … It is not rude to leave, it is rude to make someone stay and waste their time.”',
      author: 'Elon Musk',
      role: 'CEO, Tesla',
      avatar: '/quotes/elon-musk.jpg',
    },
    sections: [
      {
        title: 'Shelf',
        desc: 'Showcase your favorite pictures, books, movies, awards, achievements and more on your virtual shelf. Discover unexpected connections. You’ll get to know your team faster in 2 minutes in Roam than 2 years on Zoom.',
        visual: <MapPreview shelfAutoOpen initialFloor="Shelf" />,
      },
      {
        type: 'quote',
        quote: '“Always hated the sight of five, six grown men sitting around a table, doing nothing but work their jaw.”',
        author: 'Annie Proulx',
      },
      {
        title: 'The Boot',
        desc: 'If someone’s overstaying their welcome in your office, give them the boot!',
        visual: <BootChatPreview />,
      },
      {
        title: 'Drop-In Video Meetings',
        desc: 'Drop into any Video Conference room to join a meeting. See a discussion you want in on? Knock and join.',
        visual: <KnockDropInPreview />,
      },
      {
        title: 'Locked Room',
        desc: 'Lock your room if you wish to prevent drop-ins.',
        visual: <LockedRoomPreview />,
      },
      {
        title: 'Presence on the Map',
        desc: 'Your meeting shows up right on the HQ map so you can project your presence and your colleagues have a strong sense of what’s going on at HQ.',
        visual: <MapPreview initialFloor="Presence" />,
      },
      {
        title: 'External Meetings',
        desc: 'Easily set up a meeting via Google Calendar or O365. Just select Roam and add anyone you like to the meeting.',
        visual: <ExternalMeetingsPreview />,
      },
      {
        title: 'Screenshare',
        desc: 'Ultra high resolution screenshare with optional soundshare.',
        visual: <MapPreview shareAutoOpen initialFloor="R&D" />,
      },
      {
        title: 'Raised Hands',
        desc: 'Raise hands in order to ask questions.',
        visual: <RaisedHandsPreview />,
      },
      {
        title: 'Virtual Background or Blur',
        desc: 'Blur your background or upload an image to use as your virtual background.',
        visual: <VirtualBackgroundPreview />,
        variant: 'horz',
      },
      {
        title: 'Face Touch Up',
        desc: 'Add Face Touch Up effects to beautify your skin!',
        visual: <FaceTouchUpPreview />,
        variant: 'horz-reverse',
      },
      {
        title: 'Krisp Noise Cancellation',
        desc: 'Roam embeds Krisp, the #1 Noise Cancellation technology, ensuring only active voices on calls are heard, eliminating all other nearby voices and distractions.',
        visual: <KrispNoiseCancellationPreview />,
      },
      {
        titleImage: { src: '/feature/roamoji-wordmark.svg', alt: 'Roamoji' },
        title: 'Roamoji Reactions',
        desc: 'Fist bump, high five, or show respect by bowing with Roamoji reactions. There’s even a secret FOUNDER MODE unlock for those adventurous members who can figure it out…',
        visual: <RoamojiReactionsPreview />,
      },
      {
        title: 'Closed Captions',
        desc: 'Turn on closed captions if you’d like to see the meeting transcribed in real time.',
        visual: <ClosedCaptionsPreview />,
      },
      {
        title: 'Magic Minutes',
        desc: 'AI Meeting Summarization that transcribes any meeting, summarizes it, and creates a group chat about the meeting in your AInbox for prompting and searching.',
        visual: <MagicMinutesPreview />,
      },
      {
        title: 'Whiteboard',
        desc: 'Pull up a multiplayer, interactive whiteboard for your meeting.',
        visual: <WhiteboardPreview />,
      },
      {
        title: 'Media Board',
        desc: 'Don’t share streamed videos live. Preload videos and sounds with HLS encoding for super fast and high quality local playback during your meeting. Let everyone enjoy the moment at the same time with quality.',
        visual: <MediaBoardPreview />,
      },
      {
        title: '300 Person Meetings',
        desc: 'Roam Videoconferencing supports up to 300 people in a single meeting with cameras on. If you you want to go even bigger, you can use our Theater which supports up to 3,000 people in a unique immersive virtual events environment. Roam uses a proprietary, breakthrough technology called Magic Multiplexing to ensure high quality, smooth video for all uses even in large meetings.',
        visual: <BigMeetingPreview />,
      },
      {
        title: 'Active Speaker',
        desc: 'Select Active Speaker mode to automatically pin the active speaker in a large focus window in the meeting. You can even exclude yourself from being active.\n\nRoam developed a proprietary signal processing technology using Noise Gate with Hysteresis to ensure a peaceful leadership transition.',
        visual: <ActiveSpeakerPreview />,
      },
      {
        title: 'Roamvision',
        desc: 'Connect your physical conference rooms to Roam and display on-site participants on the Roam Virtual Office Map. Conduct Hybrid meetings that finally work the way they should: with presence, energy, and velocity. Bring your own Mac, PC, or use our hardware integration with the all-in-one Neat Board.',
        visual: <RoamvisionPreview />,
      },
      {
        variant: 'columns',
        columns: [
          {
            title: 'Globally Distributed Mesh Architecture',
            desc: 'Our patent-pending breakthrough architecture has 12 edge data centers spread around the globe to minimize latency for all participants.',
          },
          {
            title: '99.9% Quality',
            desc: 'Roam built its own proprietary video conferencing technology and dedicates significant R&D resources to monitoring meeting quality continuously under all internet and computation performance conditions.',
          },
          {
            title: 'Everyday Low Prices',
            desc: 'Roam is only $19.50/month per active member. Includes Company Visualization, Video Conferencing, Drop-In Meetings, AI Meeting Summaries, Group Chat, Booking and much more.',
          },
        ],
      },
      {
        variant: 'lead',
        leadContent: (
          <>Roam is <strong>Your AI-powered Virtual HQ</strong>. Unleash <em>ultraproductivity</em> as an AI-first, globally distributed, fully digitized company—one single HQ for your people to work side-by-side with AI Agents.</>
        ),
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      {
        variant: 'explore',
        title: 'Compare Roam to Legacy Video Conferencing Providers',
        items: [
          'Roam vs. Zoom',
          'Roam vs. WebEx',
          'Roam vs. Teams',
          'Roam vs. Meet',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'video-conferencing': {
    eyebrow: 'Video Conferencing',
    title: 'Meetings that end when you’re done',
    hero: 'Jump into a meeting room the moment you need to collaborate, and get back to work the moment you don’t. No more standing half-hour meetings for a five-minute decision.',
    visual: <MeetingPreview compact gesturesEnabled={false} autoReactions={false} />,
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
    title: 'All The World’s a Stage',
    hero: <>Successful people know their ideas are only as good as their ability to communicate them. Theater is your virtual venue for all-hands, town halls, and demos — a real stage, a real audience, and reactions that swell across the room.<br /><br />Up to 3,000 people, no thumbnail grid in sight.</>,
    visual: <MapPreview initialFloor="TheaterHero" />,
    sections: [
      {
        type: 'quote',
        quote: '“We are the music makers, and we are the dreamers of dreams.”',
        author: 'Willy Wonka',
        role: 'Willy Wonka & the Chocolate Factory',
      },
      {
        title: 'An immersive, focused space',
        desc: 'Theater darkens the room and pulls every eye to the stage — Broadway, the Apple Park theater, your favorite museum auditorium. Presenters get the spotlight; audiences get permission to actually pay attention.',
        visual: (
          <TheaterPreview
            speakers={[videoPerson('Camila Torres', 'Female', 'Camila Torres')]}
            audience={[
              VIDEO_SPEAKERS[5],
              VIDEO_SPEAKERS[2],
              VIDEO_SPEAKERS[7],
              VIDEO_SPEAKERS[0],
              VIDEO_SPEAKERS[4],
              VIDEO_SPEAKERS[1],
              VIDEO_SPEAKERS[6],
            ]}
            backstage={[VIDEO_SPEAKERS[1]]}
          />
        ),
      },
      {
        title: 'The Stage',
        desc: 'Presenters walk on stage when it’s their turn. Pull a colleague up next to you mid-talk. Send someone backstage with a click. It feels like running a real show, because it is.',
        visual: <TheaterPreview />,
      },
      {
        type: 'quote',
        quote: '“Make sure you have finished speaking before your audience has finished listening.”',
        author: 'Dorothy Sarnoff',
        role: 'American Theatre Actress',
      },
      {
        title: 'Whisper Rows',
        desc: 'Pick a seat. Whisper with the people next to you while the presenter keeps going — the audio is private to your row, the presenter never hears it. Side conversations become a feature, not a distraction.',
        visual: <WhisperPreview />,
      },
      {
        title: 'Laugh, Clap & Boo in Stereo',
        desc: 'Audience reactions amplify with the crowd. Five claps is a smattering. Five hundred is a roar. Theater renders applause, laughter, and the occasional well-earned boo in stereo, scaled to the size of the room.',
        visual: <TheaterPreview stereoDemo speakers={STEREO_SPEAKERS} audience={STEREO_AUDIENCE} />,
      },
      {
        type: 'quote',
        quote: '“Performance is not about getting your act together, but about opening up to the energy of the audience.”',
        author: 'Benjamin Zander',
        role: 'English Conductor',
      },
      {
        title: 'Backstage',
        desc: 'A coordination room only your presenters can see. Run the rundown, queue your slides, calm the nerves, and walk on when it’s time. The audience never sees the prep — only the show.',
        visual: (
          <TheaterPreview
            speakers={[VIDEO_SPEAKERS[4]]}
            audience={[
              VIDEO_SPEAKERS[2],
              VIDEO_SPEAKERS[0],
              VIDEO_SPEAKERS[7],
              VIDEO_SPEAKERS[3],
              VIDEO_SPEAKERS[5],
              VIDEO_SPEAKERS[1],
              VIDEO_SPEAKERS[6],
            ]}
            backstage={[
              videoPerson('Sophia Ramirez', 'Female', 'Sophia Ramirez'),
              videoPerson('Daniel Russell', 'Male', 'Daniel Russell'),
            ]}
          />
        ),
      },
      {
        title: 'Recordings',
        desc: 'Every Theater event is automatically recorded and dropped into Recordings. Browse by date, scrub through the show, and jump straight to a quoted moment — the way it should be.',
        visual: <RecordingsPreview />,
      },
      {
        type: 'quote',
        quote: '“Music acts like a magic key, to which the most tightly closed heart opens.”',
        author: 'Maria von Trapp',
        role: 'Singer',
      },
      {
        variant: 'columns',
        columnsStyle: 'cards',
        columns: [
          { title: 'The Curtain', desc: 'Add a moment of mystery. Drop the curtain right before you walk on, and let the audience feel the anticipation.' },
          { title: 'Open Mic', desc: 'Audio-only broadcast for audience members. Anyone can step up and address the whole theater, first-come-first-served.' },
          { title: 'Walk On and Exit Music', desc: 'Set your own leitmotif. Pick a Wagner overture or a Nintendo theme — your song plays when you take the stage, and a different one as you walk off. Every entrance feels like an entrance.' },
          { title: 'Town Halls', desc: 'Run a proper town hall — quiet, focused audience by default, raised hands for Q&A, and Open Mic when you want to invite anyone to speak. Big room energy without the chaos of an unmuted Zoom.' },
          { title: 'Group Roundups', desc: 'Multiple teams report out in a single show — engineering pods, product squads, regional offices. Each group takes the stage in turn while everyone else watches. The rest of the company finally sees what every team has been shipping.' },
          { title: 'Magic Minutes', desc: 'Every Theater session is captured by Magic Minutes. The full transcript, the video, and a group chat of every attendee lands in your AInbox the moment the curtain drops. Anyone who couldn’t make it gets caught up instantly.' },
          { title: 'Stadium Mode', desc: 'Cross 100 attendees and Theater automatically scales into Stadium Mode. The seating wraps, the audio model reshapes, and the stage stays sharp — up to 2,500 people in one room. No thumbnail grid. No crashed Zoom webinar.' },
          { title: 'Media Player', desc: 'High-quality video streaming with HLS encoding. Roll a polished pre-recorded segment in the middle of your show — broadcast-grade fidelity, no dropped frames.' },
          { title: 'Stagehand Controls', desc: 'Toggle backstage access, hand out the mic, mute reactions, generate a theater link. The presenter command center sits in your hands.' },
          { title: 'Superior Audience Experience', desc: 'Audiences instinctively know Theater isn’t a video call. The room reads as an event — they show up, they pay attention, they react.' },
          { title: 'Superior Presenter Experience', desc: 'Backstage prep, walk-on cues, stagehand controls, and an audience that’s actually focused. Presenting in Theater feels like presenting in real life — only easier.' },
          { title: 'Lifelike Energy', desc: 'Stereo reactions, whisper rows, and a stage worth walking on. The room feels alive, even when everyone’s remote.' },
        ],
      },
      {
        variant: 'lead',
        leadContent: (
          <>Roam Theater is your <strong>company’s stage</strong>. Every all-hands, every demo day, every keynote — held in a room that <em>feels like a room</em>, with reactions that <em>feel like reactions</em>.</>
        ),
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'ainbox': {
    eyebrow: 'AInbox',
    title: 'Enterprise Messaging with AInbox in your Roam HQ.',
    hero: 'Unleash ultraproductivity in your company HQ with AI-powered Enterprise Chat and Instant Messaging. Send Direct Messages, Group Chats, or Confidential Chats right in your own Virtual HQ. Set up your own custom groups. Tailor for your own bespoke workflow with custom folders, pinned chats, bookmarks, scheduled messages, and drag-and-drop reordering. Search your entire history. Give out guest badges to chat with people outside your organization, free!',
    visual: <AInboxHeroAnimated overrides view="dm" />,
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
        visual: <MapPreview spotifyAlwaysOpen figmaAlwaysOpen hideOnIt />,
      },
      {
        variant: 'additional',
        eyebrow: 'Included',
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
        visual: <MapPreview hideOnIt />,
      },
      {
        title: 'Ship Faster with GitHub on the Map',
        desc: 'Cut code review times. When you have an outstanding PR from a fellow engineer, a GitHub icon appears next to their office on the map linking to it. At a glance, you know what you owe. You and your team will appreciate this context signal. We cut our own internal PR time by 42%. Ship faster!',
        visual: <MapPreview githubAlwaysOpen hideOnIt />,
      },
      {
        variant: 'columns',
        columnsStyle: 'cards',
        columns: [
          {
            title: 'External Guests',
            desc: 'Invite external guests by their email to chat in your organization. Invite as many as you like, free of charge.',
          },
          {
            title: 'SSO/SAML',
            desc: 'Powerful controls to manage your organization. Integrates directly with SSO and SAML so you’re in real-time control over who has access to your chats.',
          },
          {
            title: 'Archiving and Retrieval',
            desc: 'Integration with Global Relay available for messaging archive compliance.',
          },
        ],
      },
      {
        variant: 'split',
        title: 'Why Enterprise Messaging from Roam?',
        bullets: [
          'AI-Native.',
          'Meetings & Chats are better together',
          'Familiar Interface for Direct Messages',
          'Confidential Messages.',
        ],
      },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'magic-minutes': {
    eyebrow: 'Magic Minutes',
    title: 'AI Meeting Summarization, without the bot.',
    hero: <>AI Meeting Summarization for every Roam meeting and every drop-in. No awkward bot showing up to your calls — Magic Minutes is built into the office itself.<br /><br />Every conversation ends with a clean summary, a full transcript, action items, and a group chat with the attendees — ready before you’ve closed your laptop.</>,
    visual: <MagicMinutesPreview meeting={{ defaultTab: 'summary' }} />,
    sections: [
      {
        title: 'AI Summarization & Transcription',
        desc: 'The moment a meeting ends, Magic Minutes drops a Call Brief, Next Steps, and a full speaker-attributed transcript — generated with state-of-the-art models and Deepgram-grade transcription. Nobody volunteers to take notes again, and you can still jump to the exact moment someone said the thing.',
        visual: <MagicMinutesPreview meeting={AINBOX_STANDUP_MEETING} />,
      },
      {
        title: 'Group Chat for every meeting',
        desc: 'Each meeting spawns a chat in your AInbox with everyone who attended. Follow-ups, decisions, and links land in the right thread automatically — no “where was that conversation?” later.',
        visual: <AInboxPreview overrides view="thread" threadView={{ chatId: 'compute', messageId: 1 }} />,
      },
      {
        title: 'Templates',
        desc: 'Customize Magic Minutes for the kind of meeting it is. Sales calls get a discovery template, 1:1s get a coaching template, all-hands get an exec recap — pick a default per room or per calendar.',
        visual: <MagicMinutesPreview meeting={{ defaultTab: 'summary', defaultTemplatesOpen: true, activeTemplate: 'auto' }} />,
      },
      {
        title: 'Prompt the minutes',
        desc: 'Ask “what did Sarah commit to?” or “summarize the Q3 plan” and get an answer from the meeting itself — hours, weeks, or months later. Use @MagicMinutes right inside the meeting’s group chat.',
        visual: (
          <AInboxPreview
            overrides
            view="thread"
            mmAutoPrompt
            threadView={{ chatId: 'meet-ainbox-ship', messageId: 1 }}
            mmPrompts={MM_PROMPTS}
          />
        ),
      },
      {
        title: 'Timeline & Highlights',
        desc: 'A visual timeline of who spoke when, with the highlights pinned to the moments that matter. Scrub the meeting like a podcast and pull a clip out as a Magicast in one click.',
        visual: <AInboxPreview overrides view="chat" chatId="meet-mm-launch" />,
      },
      {
        title: 'Action Items',
        desc: 'Magic Minutes detects commitments as they happen and assigns them to the right person — with the timestamp from the meeting attached so context is one click away.',
        visual: <AInboxPreview overrides view="chat" chatId="_none" initialSidebarView="actions" />,
      },
      {
        title: 'On-It picks up the slack',
        desc: 'No volunteers? On-It, your AI Assistant, takes the action items nobody raised a hand for. It does the research, drafts the doc, books the meeting, and reports back in the group chat.',
        visual: <OnItFeatureChat />,
      },
      {
        title: 'Action Items in your AInbox',
        desc: 'Every commitment from every meeting rolls up into one place. See what you owe, what you’re owed, and what’s overdue across the whole company — without chasing it through threads.',
        visual: <AInboxPreview overrides view="chat" chatId="_none" initialSidebarView="actions" />,
      },
      {
        title: 'Catch Up',
        desc: 'Walked in late? Hit Catch Up and get a 30-second brief on what you missed — decisions made, action items so far, who’s on what. No more “can someone recap?”',
        visual: (
          <MeetingPreview
            roomName="Magic Minutes Launch Review"
            autoReactions={false}
            roamojiOpen={false}
            gesturesEnabled={false}
            mmCatchUp
            people={[
              VIDEO_SPEAKERS[0],
              VIDEO_SPEAKERS[1],
              VIDEO_SPEAKERS[5],
              VIDEO_SPEAKERS[6],
            ]}
          />
        ),
      },
      {
        title: 'Magic PDF',
        desc: 'Drop a PDF into the meeting’s group chat and prompt it. Ask for the key numbers, the risks, the ask on the closing slide — the deck answers, in your AInbox.',
        visual: (
          <AInboxPreview
            overrides
            view="thread"
            mmAutoPrompt
            threadView={{ chatId: 'features', messageId: 1 }}
            mmPrompts={[
              {
                q: "@MagicMinutes summarize this PDF for me",
                a: "It's a 24-slide narrative: open on the 3x DAU growth, walk through revenue 18% ahead of plan, highlight Drop-Ins + AInbox as the drivers, preview Magic Minutes as the Q3 headline, and close with the raise plan and ask.",
              },
              {
                q: "@MagicMinutes pull the key numbers",
                a: "DAUs: 50,245 (+3.1x YoY). ARR: $24.6M, tracking 18% over plan. Net retention: 142%. NPS: +72 (up from +58 last quarter). Pipeline: $51M, 4x the Dec baseline.",
              },
              {
                q: "@MagicMinutes any risks flagged?",
                a: "Three risks on slide 21: enterprise sales cycle lengthening (62 → 74 days), competitive pressure from incumbent collaboration tools, and AI infra cost curve if model prices don't drop. Mitigations on slide 22.",
              },
            ]}
          />
        ),
      },
      {
        title: 'Transcriptions & Translations in 16+ Languages',
        desc: 'Magic Minutes boasts extensive multilingual capabilities, empowering users to generate written content across a broad spectrum of languages. Available in 30+ languages including English, Spanish, Chinese, Portuguese, French, and many more.',
        visual: <MagicMinutesTranslationsPreview />,
      },
      {
        variant: 'columns',
        columnsStyle: 'cards',
        columns: [
          {
            title: 'Magic Minutes Always On',
            desc: 'Optionally choose to have Magic Minutes start automatically be default across your organization, floor or room type. You don’t need to remember to turn it on.',
          },
          {
            title: 'Stop & Shred',
            desc: 'At any time during a meeting, stop it, and shred the Magic Minutes. So they’ll never be saved or summarized.',
          },
        ],
      },
      {
        title: 'Desktop Recordings',
        desc: 'Capture meetings in Zoom, Teams, Meet, or WebEx with the Roam desktop app — no bot joining the call, no extra invite link. Magic Minutes processes them just like a Roam meeting.',
        visual: <DesktopRecordingsPreview />,
      },
      {
        title: 'HubSpot CRM Integration',
        desc: 'One click syncs the call brief, transcript, and action items to the right HubSpot deal. Sales calls update the pipeline automatically — no copy-paste, no end-of-day reconciliation.',
        visual: <HubSpotIntegrationPreview />,
      },
      {
        variant: 'explore',
        title: 'Why AI Meeting Summarization?',
        itemMarker: 'bullet',
        items: [
          'Get accurate notes from all of your meetings and drop-in conversations.',
          'Use AI to prompt your meeting notes with questions for things you’ve missed.',
          'Meeting visualization shows quick information about what’s happened in the meeting.',
          'Fully digitized meetings drive ultraproductivity from AI.',
          'Use Magic Minutes to transcribe and summarize any meeting you have on your desktop computer — in Roam, or in another platform.',
          'Full record of all your sales or support calls, synced into your CRM.',
        ],
      },
      {
        variant: 'explore',
        title: 'Why Roam Magic Minutes vs. Otter, Fireflies, or others?',
        itemMarker: 'bullet',
        items: [
          'No awkward bot showing up to your meetings. Magic Minutes is natively built into your HQ.',
          'State-of-the-art models. Roam uses the state of the art LLM from OpenAI.',
          'Fully integrated into your HQ. Catch all of your drop-in meetings and scheduled meetings.',
          'Group Chat. You get a group chat in AInbox that’s in your normal chat workflow.',
          'You are in total control. You turn Magic Minutes on and off. No "uninstall" games. There are whole Reddit threads about how to turn off nefarious meeting summarizers like read.ai.',
          'Cost. Roam includes video conferencing, the map company visualization, group chat, scheduling and meeting summarization for just $19.50/month per active user. All of these features are bundled into a cheaper package than Fireflies which costs $19–$39/month and Otter ($20/month). They’re not as good, cost twice as much, and for just one of 6 features!',
        ],
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'lobby': {
    eyebrow: 'Lobby',
    title: 'A booking page with a doorbell.',
    hero: 'A scheduling link that also lets guests walk in the second you’re free.',
    visual: <LobbyBookingPreview />,
    sections: [
      {
        title: 'Set Your Lobby Link',
        desc: 'Pick your unique handle on the ro.am URL — any name that’s available, first come first serve. Verified Roamaniacs get special rights to a Premium Reserve handle, including first names and rare words. Hand out something like ro.am/henryford instead of a 40-character Calendly link.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="basics" />,
      },
      {
        title: 'Scheduling Settings',
        desc: 'Buffers, minimum notice, daily caps, and a custom availability window — per Lobby. Set it once and your calendar stops getting trampled.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="scheduling" />,
      },
      {
        title: 'Drop-In Meetings',
        desc: 'Roam knows when you’re free and flips your Lobby to available automatically. Guests skip the calendar dance and walk in right away. Software shouldn’t be sold like shoes — make it easy to talk to a human the second you’re ready.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="availability" />,
      },
      {
        title: 'Different Lobbies for Different Use Cases',
        desc: 'Spin up separate links for sales, support, hiring, or office hours — each with its own availability, its own design, its own routing. VIPs get a different door than everyone else.',
        visual: <LobbyPreview initialLinks={USE_CASE_LINKS} />,
      },
      {
        title: 'Design Your Lobby',
        desc: 'Add your logo, pick a background color, choose a texture, and toggle the verification badge. Your Lobby looks like you, not like a generic booking page.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="design" />,
      },
      {
        title: 'Custom Form',
        desc: 'Add custom fields to the pre-booking form to collect exactly the information you want. Qualify the lead, capture the use case, or just ask for the company size — before the meeting starts.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="booking-form" />,
      },
      {
        title: 'Set Guest Destination',
        desc: 'Route guests to your Private Office, a fully-featured video conferencing room, or a shared Reception room. Dynamic routing means inbound leads land where they need to be without you babysitting the inbox.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="destination" />,
      },
      {
        title: 'Multiple Hosts',
        desc: 'Add multiple required hosts to a Lobby. Roam shows guests only the slots where everyone is free — no more six-person Doodle polls.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="basics" initialLinks={MULTI_HOST_LINKS} />,
      },
      {
        title: 'Round Robin Hosts',
        desc: 'Pool availability across a group — sales, support, recruiting — and Roam routes the booking to whoever picks up next. Great for keeping queues moving without a coordinator.',
        visual: <LobbyPreview initialNav="my-links" initialSelectedLinkId={1} initialDetailSection="basics" initialLinks={ROUND_ROBIN_LINKS} scrollDetailToBottom />,
      },
      {
        title: 'Embed',
        desc: 'Drop your Lobby — drop-in button included — straight into your website. Copy the snippet, paste it in, done.',
        visual: <LobbyEmbedPreview />,
      },
      {
        title: 'Company Lobby Links',
        desc: 'Team-wide links that share availability across your company, all on the same ro.am domain. One set of links your whole company can hand out.',
        visual: <LobbyPreview initialNav="hq-links" />,
      },
      {
        title: 'Virtual Shelf on Company Lobby',
        desc: 'Show off awards, photos, press, and product moments in the virtual waiting room while guests wait for the meeting to start. Your Lobby does the work of the front desk and the trophy case.',
        visual: <LobbyShelfPreview />,
      },
      {
        variant: 'explore',
        title: 'Why Lobby?',
        itemMarker: 'bullet',
        items: [
          'Take back control of your calendar — the rules you set, every time.',
          'Drop-in capability turns scheduled meetings into right-now conversations.',
          'Selectively share availability — VIPs, customers, and the public each get their own door.',
          'A branded, professional Lobby that looks like your company, not a generic form.',
          'Multiple hosts, round robin, and reception flows handle the messy real-world cases.',
        ],
      },
      {
        variant: 'explore',
        title: 'Why Roam Lobby vs. Calendly, Zoom Scheduler, or Google Meet?',
        itemMarker: 'bullet',
        items: [
          'Drop-in meetings — Roam is the only scheduler where guests can walk in the second you’re free.',
          'Native to your Virtual HQ — bookings land in your office, not a random video link.',
          'Overflow-aware — your Lobby knows when you’re actually slammed and adjusts.',
          'Cost — Roam Lobby is included in $19.50/month per active member, alongside 8 other products. Calendly is $16/month for scheduling alone.',
        ],
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'magicast': {
    eyebrow: 'Magicast',
    title: 'Record, edit, and share — without leaving Roam',
    hero: 'Create polished, professional videos in seconds, right from Roam. A built-in screen recorder with picture-in-picture video, instant transcripts, and one-click sharing to any chat. No external tool, no upload step.',
    visual: <MagicastFeatureVisual theme="dark" anchor="bottom-right" bare />,
    sections: [
      {
        title: 'Perfect Your Appearance with Magicast Effects',
        desc: 'Touch up your face, add background blur, or swap in a virtual background. Look ready even if the room behind you isn’t.',
        visual: <MagicastFeatureVisual theme="dark" bare effectsOpen hideBubble />,
      },
      {
        title: 'Trim Your Magicast',
        desc: 'Start with a bang and end with emphasis! Snip the fumbles off both ends so every Magicast lands crisp. Transcripts update automatically as you cut.',
        visual: <MagicastViewerWindow />,
      },
      {
        title: 'Integrated with AInbox',
        desc: 'Share your Magicast recordings natively with groups and DMs through AInbox. The recording lives where the conversation happens.',
        visual: (
          <AInboxPreview
            overrides
            view="chat"
            chatId="all-hands"
            messagesOverride={MAGICAST_SHARE_AH_MESSAGES}
            initialCollapsedSections={{ meetings: true }}
          />
        ),
      },
      {
        title: 'Share Your Magicast',
        desc: 'Send a link with your Magicast to anyone, anywhere. Drop into a group chat, DM a colleague, or send a public link to someone outside the company.',
        visual: <MagicastShareSection />,
      },
      {
        title: 'Interactive Transcription',
        desc: 'Within seconds, get a fully interactive transcript of your Magicast. Click any line to jump to that part of the recording.',
        visual: <MagicastViewerWindow initialTrimOpen={false} initialSideTab="transcript" />,
      },
      {
        title: 'Search Magicast Transcript',
        desc: 'Jump right to a specific moment in your Magicast with powerful transcript search.',
        visual: (
          <MagicastViewerWindow
            initialTrimOpen={false}
            initialSideTab="transcript"
            searchAnimationTerms={['ARR', 'retention', 'Slack', 'growth', 'Magic Minutes']}
          />
        ),
      },
      {
        title: 'AI Assistant Integration',
        desc: 'Direct your AI Assistant to share Magicast recordings effortlessly. Instruct it to send a Product Demo video to a prospect or share a bug report with a developer. Coming soon.',
        visual: (
          <OnItFeatureChat
            initialMessages={[
              { id: 1, self: true, text: 'Can you share my March Investor Update Magicast with Sean MacIsaac, Klas Leino, and Thomas Grapperon?' },
              { id: 2, self: false, text: "I'm On-It! Sending the Magicast to Sean, Klas, and Thomas now — I'll let you know once they've all opened it." },
            ]}
            taskSummary="Share March Investor Update with Sean, Klas, and Thomas"
            taskSteps={[
              'Resolving Sean, Klas, and Thomas in the company directory',
              'Pulling the March Investor Update from your Magicasts',
              'Generating a share link with comments enabled',
              'Sending the link to each of them via DM',
              'Watching for opens and notifying You',
            ]}
          />
        ),
      },
      {
        variant: 'compare-table',
        columns: [
          { label: 'Magicast' },
          { label: 'Loom' },
        ],
        rows: [
          { left: 'Nothing to install. Embedded in existing Roam app.', right: 'Download separate app.' },
          { left: 'No clunky browser extension. Just embedded right in Roam.', right: 'Clunky browser extension always in your face.' },
          { left: 'AInbox Integration. Prompt your meetings, chats, and media including Magicast transcripts.', right: 'Not native.' },
          { left: 'Fully included in the Virtual Office Super Bundle.', right: '$20.00/month' },
          { left: 'Monthly billing.', right: 'Annual upfront.' },
          {
            left: {
              lead: 'AI Agents',
              items: [
                'Tell your AI Agent to email a Magicast.',
                'Tell your AI Agent to submit a bug report.',
              ],
            },
            right: 'Not native.',
          },
        ],
      },
      {
        variant: 'explore',
        title: 'Why Roam Magicast?',
        itemMarker: 'bullet',
        items: [
          'Embedded directly in your Virtual HQ — no extension, no separate desktop app to install.',
          'Picture-in-picture video with circle, square, and custom shape options.',
          'Native AInbox integration — share into any group or DM in one click.',
          'Interactive transcripts you can search and click to scrub.',
          'AI Assistant can share Magicasts on your behalf.',
          'Just $19.50/month per active member, bundled with 8 other products. Loom alone is $20/month.',
        ],
      },
      {
        variant: 'explore',
        title: 'Screen Recording Use Cases',
        itemMarker: 'bullet',
        items: [
          'Investor updates — share a quick walkthrough instead of scheduling another meeting.',
          'Bug reports — record the repro once, send the link to engineering.',
          'Sales pitches — leave a personalized demo for prospects to watch on their time.',
          'Customer support — show the fix instead of writing a five-paragraph email.',
          'Design ideas — talk through the mock while the team is asleep.',
          'Onboarding — record once, ramp every new hire.',
        ],
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'on-it': {
    eyebrow: 'On-It',
    title: 'Your AI assistant, on the org chart',
    hero: 'On-It is the AI agent that lives in your Virtual HQ. It sees the office, joins meetings, picks up action items, shares recordings, and chats back in your AInbox — all without leaving Roam.',
    visual: <OnItFeatureChat />,
    sections: [
      {
        title: 'On-It is Your Eyes & Ears',
        desc: 'In a legacy office, one of the most valuable things an executive assistant does is act as your “eyes and ears” within the company. They observe who is talking to who, they can let you know when someone frees up, they can keep you posted when someone enters the office. This scales only to what is immediately observable to the person. Unfortunately, in digital environments, this subtle signaling is lost. When companies are distributed and people are in the field or remote, there’s no sense of where anyone is, or who is present, or what people are doing. Of course, since Roam is in a digital environment, On-It’s ability to observe spans the entire company, not just what a real person can see in their immediate vicinity!',
        subBullets: [
          'Tell you when someone enters the office.',
          'Tell you when it sees a certain set of people talking.',
          'Tell you when a certain meeting is over and the people free up.',
        ],
        visual: <MapPreview onItAutoOpen initialFloor="R&D" />,
      },
      {
        title: 'On-It Can Schedule',
        desc: 'How much time do you spend scheduling meetings? How much do you estimate your team spends? Swapping links back and forth between people, endlessly discussing and pushing back times. This is the perfect kind of task to be handled by On-It.',
        subBullets: [
          'Ask On-It about your calendar.',
          'Schedule with people in the company.',
          'Schedule with people outside the company.',
        ],
        visual: (
          <OnItFeatureChat
            initialMessages={[
              { id: 1, self: true, text: 'Find a 30-min slot this week to meet with Sean MacIsaac and Klas Leino, then send invites.' },
              { id: 2, self: false, text: "I'm On-It! Thursday at 2pm works for all three of you — I'll send the invite with a Lobby room and confirm once they accept." },
            ]}
            taskSummary="Schedule a 30-min sync with Sean and Klas"
            taskSteps={[
              'Pulling everyone’s availability for the next 5 days',
              'Finding the first 30-min slot all three are free',
              'Booking a Lobby room and drafting the invite',
              'Sending invites and watching for accepts',
            ]}
          />
        ),
      },
      {
        title: 'On-It Can Follow Up with Chat & Email',
        desc: 'In a legacy office, a candidate interviewing for a job may meet 6 people at the company during their interview day. A recruiting coordinator solicits feedback from all 6 people and then compiles it for review. Or, a manager may ask their 10 or 12 direct reports for a status update on a project or their accomplishments that week. On-It can now just do all this for you, as a Follow Up:',
        subBullets: [
          'Message people within your company.',
          'Send an email to any email address.',
          'Send a templated “Knowledge” email tailored for the circumstance.',
        ],
        visual: (
          <OnItFeatureChat
            initialMessages={[
              { id: 1, self: true, text: 'Collect feedback from yesterday’s 6 interview panelists for Maya Chen, then email Maya a status update.' },
              { id: 2, self: false, text: "I'm On-It! DMing each panelist for written feedback now — once it’s all in, I’ll compile a summary and send Maya a status email from your address." },
            ]}
            taskSummary="Gather interview feedback for Maya Chen and email her a status update"
            taskSteps={[
              'Pulling yesterday’s 6 interview panelists from the calendar',
              'DMing each panelist for written feedback',
              'Compiling the feedback into a summary',
              'Drafting a status email to Maya from your address',
              'Sending the email and watching for a reply',
            ]}
          />
        ),
      },
      {
        title: 'On-It with Magic Minutes',
        desc: 'Magic Minutes provides AI-promptable transcripts, meeting summaries and proposed action item assignments in a chat group for everyone in the meeting. On-It is smart enough to volunteer to do your tasks when it has the skills! All you have to do is click the button and they’re on it!',
        subBullets: [
          'Volunteer for action items it can complete.',
          'Pull context from any past meeting transcript.',
          'Post a follow-up summary back in the meeting chat.',
        ],
        visual: (
          <AInboxPreview
            overrides
            view="chat"
            chatId="meet-design"
            favoritesOverride={ONIT_MM_FAVORITES}
            sectionsOverride={ONIT_MM_SECTIONS}
            messagesOverride={ONIT_MM_MESSAGES}
          />
        ),
      },
      {
        title: 'On-It Can Prompt All Your Meetings',
        desc: 'On-It has the knowledge from all of your meetings. You can prompt On-It to use all your meetings as context.',
        visual: (
          <OnItFeatureChat
            initialMessages={[
              { id: 1, self: true, text: 'Who from sales is meeting with Howard right now?' },
              { id: 2, self: false, text: "Peter Lerman, Mike Walrath, and Jon Brod are with Howard in the War Room — they jumped in 6 minutes ago." },
            ]}
            taskSummary="Look up who is meeting with Howard right now"
            taskSteps={[
              'Locating Howard on the map',
              'Reading the room he’s in (War Room)',
              'Filtering attendees by sales team',
              'Reporting back to You',
            ]}
          />
        ),
      },
      {
        title: 'Upload Individual Knowledge, Company Knowledge',
        desc: 'If you have sales templates, company policies, or recruiting templates, simply upload to On-It and it will include that knowledge as context when assisting you. Individuals can upload their own knowledge, and company administrators can upload company knowledge that will apply universally to all assistants in the company.',
        visual: (
          <OnItFeatureChat
            compact
            initialMessages={[
              {
                id: 1,
                self: true,
                attachment: { type: 'pdf', name: 'Q1 Board Update.pdf' },
                text: 'Can you summarize the key risks in this deck?',
              },
              {
                id: 2,
                self: false,
                text: 'Three risks stand out: ARR concentration in the top 10 customers (38%), AInbox launch slipping to mid-May, and EU office hiring behind plan. Want me to draft talking points for the board?',
              },
              {
                id: 3,
                self: true,
                text: 'Just the customer concentration one — what changed since last quarter?',
              },
              {
                id: 4,
                self: false,
                text: 'Top 10 were 31% of ARR last quarter — up 7 points. Driven by Notion expansion and the new Vercel contract. Klas flagged it in last week’s exec sync.',
              },
            ]}
          />
        ),
      },
      {
        title: 'Watch the Chain of Thought',
        desc: 'See the substatus of the tasks On-It is working on in your AInbox.',
        visual: (
          <OnItFeatureChat
            initialMessages={[
              { id: 1, self: true, text: 'What did Klas decide about the auth rewrite in yesterday’s RFC review?' },
              { id: 2, self: false, text: "I'm On-It! Pulling the RFC thread and the Magic Minutes from yesterday's review — give me a sec to walk through it." },
            ]}
            taskSummary="Find Klas’s decision on the auth rewrite"
            taskSteps={[
              'Locating the RFC thread in #engineering',
              'Loading Magic Minutes from yesterday’s RFC review',
              'Cross-referencing Klas’s comments with the call decision',
              'Drafting the answer for You',
            ]}
          />
        ),
      },
      {
        title: 'Lives in your AInbox',
        desc: 'On-It is just another conversation in your AInbox. Chat, ask follow-ups, attach files, and pull up the answer history exactly like you would with a teammate.',
        visual: (
          <AInboxPreview
            overrides
            view="dm"
            chatId="onit"
            favoritesOverride={ONIT_AINBOX_FAVORITES}
            messagesOverride={ONIT_AINBOX_MESSAGES}
          />
        ),
      },
      {
        variant: 'prose',
        title: 'An Assistant for All',
        body: [
          'In a legacy office, only senior people like executives and Vice Presidents have the luxury of an assistant. But in Roam, everyone can enjoy the great benefits of their own Executive Assistant. Imagine how much more productive your company would be if every single person in the company were assisted, not just the few at the top.',
          'This is just another reason why Roam is a productivity 8x.',
        ],
      },
      {
        variant: 'prose',
        title: 'The Future of On-It',
        body: [
          'The potential of AI to transform your company is not a futuristic dream, it’s here today.',
          'The AI-powered Virtual Office Super Bundle is designed to 8x your productivity and 8x your savings overnight, with 8 fully integrated AI products for the price of 1 to power your AI work.',
          'On-It’s job is to serve as your admin in your AI Office. This is its full purpose — basic office skills: observation, follow-ups, email, scheduling, greeting. We’re going to leave it to you to build with other AIs and custom Coworkers. On-It is just the start.',
          'We’re going to be totally focused on building your AI Office for people and AIs to collaborate in the Office of the Future. You’re going to build the future.',
        ],
      },
      {
        variant: 'explore',
        title: 'Why On-It?',
        itemMarker: 'bullet',
        items: [
          'Office-aware — knows who is in which room, what meetings ran, and what was decided.',
          'Native to Roam — no separate app, no copy-pasting transcripts.',
          'Promptable across meetings, chats, and Magicasts.',
          'Picks up unowned action items and reports back in the group chat.',
          'Just $19.50/month per active member, bundled with 8 other products. A standalone AI assistant runs $50/month.',
        ],
      },
      {
        variant: 'explore',
        title: 'AI Assistant Use Cases',
        itemMarker: 'bullet',
        items: [
          'Stand-up notes — draft the team’s daily summary from yesterday’s meetings.',
          'Research — get a one-pager on a prospect before the next sales call.',
          'Inbox triage — surface the threads that actually need your reply.',
          'Calendar wrangling — find a 30-min slot with three execs across timezones.',
          'Knowledge lookup — “what did we decide about pricing in last week’s exec sync?”',
          'Executive comms — share the latest investor update with the board.',
        ],
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      {
        variant: 'compare-table',
        columns: [
          { label: 'On-It in Roam' },
          { label: 'Standalone AI Assistant' },
        ],
        rows: [
          { left: 'Lives in your Virtual HQ. Sees who is in which room and what is happening right now.', right: 'No office context. Stares at a blank chat window.' },
          { left: 'Reads your meetings, chats, PDFs, and Magicast transcripts.', right: 'Re-paste everything, every time.' },
          { left: 'Acts on your behalf — sends DMs, books meetings, shares Magicasts.', right: 'Drafts you a message you have to send yourself.' },
          { left: 'Picks up unowned action items from Magic Minutes.', right: 'Doesn’t know your meetings ever happened.' },
          { left: 'Bundled in the Virtual Office Super Bundle.', right: '$50.00/month' },
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'on-air': {
    eyebrow: 'On-Air',
    title: 'Now anyone can host Immersive Events for the Creator-Era',
    hero: 'On-Air is built for the creator-era — clean RSVP pages, tailored invites, a press kit you can post in a tap, and a theater that feels alive when the doors open. No AV crew. No webinar fatigue. Just a stage, an audience, and the energy.',
    visual: <OnAirEpcotVisual />,
    sections: [
      {
        variant: 'compare-table',
        columns: [
          { label: 'The Creator Era' },
          { label: 'Webinar Software is Stuck in the Yahoo Era' },
        ],
        rows: [
          { left: 'Kids want to be YouTubers.', right: 'Clunky registration experience.' },
          { left: 'Creators launch billion-dollar brands.', right: 'Monologue-style audience experience.' },
          { left: 'Founders build in public.', right: 'Made for experts — you need to be an IT admin to figure out how to use it.' },
          { left: 'Every company needs a face.', right: 'Even the word “webinar” sounds terrible — who is excited to attend a Webinar?' },
          { left: '“I love to create content and I want to entertain people.” — Mr. Beast', right: 'Stuck in the Yahoo era.' },
        ],
      },
      {
        title: 'Introducing On-Air: Host Creator-Era Immersive Events',
        desc: 'On-Air is your creator-era studio for live events. Run it from your virtual office, in front of an audience that actually shows up.',
        subBullets: [
          'Guest Registration — communications designed for the creator-era.',
          'Immersive Theater — experience events like never before.',
          'Anyone Can Host — no technical expertise required.',
          'On-Air events show up on your Roam Virtual Office map, so everyone feels the energy.',
        ],
        visual: <OnAirRsvpPreview />,
      },
      {
        title: 'Create Your RSVP Page',
        desc: 'Tailor your RSVP page and get a friendly URL. Pick a color, set the date, write the description — your event is ready to share in under a minute.',
        visual: (
          <div className="fp-onair-rsvp-wp">
            <OnAirPreview />
          </div>
        ),
      },
      {
        title: 'Invite Your Guests',
        desc: 'By Email or SMS — choose your sender, tailor your invite message. Land in inboxes that actually get opened.',
        visual: <OnAirInvitePreview />,
      },
      {
        title: 'Download Your Social Media Press Kit',
        desc: 'Instantly generate stunning images ready to share on every social platform.',
        subBullets: [
          'Instagram Stories.',
          'TikTok Reels.',
          'X Posts.',
          'LinkedIn.',
        ],
        visual: <OnAirSharePreview />,
      },
      {
        title: 'Blast!',
        desc: 'Easily send text and email messages to your attendees to keep them informed on the latest — last-minute schedule changes, dial-in links, thank-you notes.',
        visual: <OnAirBlastPreview />,
      },
      {
        title: 'Manage Guests',
        desc: 'Easily search for guests and download your lists. Know who’s confirmed, who showed up, and who needs a follow-up.',
        visual: <OnAirGuestsPreview />,
      },
      {
        title: 'On-Air, On the Map',
        desc: 'Enter a theater on Broadway, for a Movie, at a Museum or at Apple Park and you’re immersed in a darker, quiet space focused on the stage. The Roam Theater is no different. Enter and you’re instantly transported to a different place with a focused view on the curtain and the stage.',
        visual: <OnAirMapPreview />,
      },
      {
        title: 'Curtain',
        desc: 'Add an element of surprise to your performance — drop the curtain right before you walk on stage and let the audience feel the anticipation build.',
        visual: <OnAirCurtainVisual />,
      },
      {
        title: 'Whisper in Audience Rows',
        desc: 'Join a row and whisper with others in the audience. Just like in a real theater, you can talk to the people next to you during the presentation. And the person on stage can’t hear you. And, you choose your theater seat. You can move around until you find a group of people you’re most excited to sit next to and talk to. The movement creates extra energy!',
        visual: <WhisperPreview />,
      },
      {
        title: 'Laugh, Clap & Boo in Stereo Audio',
        desc: 'Audiences and presenters feed off of each other. This dynamic is lost completely on Zoom calls. The Roam Theater brings back the magic, starting by allowing the audience to clap, laugh and boo. The more people who clap, the louder the clapping becomes. The same goes for booing…',
        visual: <TheaterPreview stereoDemo speakers={STEREO_SPEAKERS} audience={STEREO_AUDIENCE} />,
      },
      {
        title: 'Stadium Mode',
        desc: 'Once more than 100 people enter your audience, your Theater automatically converts into stadium mode. You’ll see a different floor each containing about 100 people. You’ll get a preview of all the floors to the live action as the audience moves around. Stadium mode supports presentations for as many as 2,500 people simultaneously.',
        visual: <TheaterPreview stereoDemo speakers={STEREO_SPEAKERS} audience={STEREO_AUDIENCE} />,
      },
      {
        title: 'The Stage',
        desc: 'Presenters walk up to the stage. It’s not just about the message — it’s about the medium. Easily invite other people backstage or to the main stage.',
        visual: (
          <TheaterPreview
            speakers={[videoPerson('Camila Torres', 'Female', 'Camila Torres')]}
            audience={[
              VIDEO_SPEAKERS[5],
              VIDEO_SPEAKERS[2],
              VIDEO_SPEAKERS[7],
              VIDEO_SPEAKERS[0],
              VIDEO_SPEAKERS[4],
              VIDEO_SPEAKERS[1],
              VIDEO_SPEAKERS[6],
            ]}
          />
        ),
      },
      {
        title: 'Backstage',
        desc: 'Magic happening on the stage starts backstage. There’s a certain anxiety in presenting. In a real theater, being able to get ready backstage — and see what’s going on backstage from the actual stage — helps presentation teams coordinate and deliver better. Being able to see the next speaker backstage and ready to go relieves anxiety and allows total focus on the moment instead of having to present while simultaneously multitasking to make sure the next speaker’s arrived and their camera is working, etc. And from backstage, stagehands can control the screen, play media and have coordination conversations — all while the show is going on.',
        visual: (
          <TheaterPreview
            speakers={[VIDEO_SPEAKERS[4]]}
            audience={[
              VIDEO_SPEAKERS[2],
              VIDEO_SPEAKERS[0],
              VIDEO_SPEAKERS[7],
              VIDEO_SPEAKERS[3],
              VIDEO_SPEAKERS[5],
              VIDEO_SPEAKERS[1],
              VIDEO_SPEAKERS[6],
            ]}
            backstage={[
              videoPerson('Sophia Ramirez', 'Female', 'Sophia Ramirez'),
              videoPerson('Daniel Russell', 'Male', 'Daniel Russell'),
            ]}
          />
        ),
      },
      {
        title: 'Producer’s Chat',
        desc: 'A group chat is created for you and everyone else working on your event. You’ll get real-time notifications of RSVPs, blasts sent, and other stats — all in your AInbox.',
        visual: <OnAirProducerChatPreview />,
      },
      {
        title: 'Recording',
        desc: 'Get a full recording with a Magic Minutes summary and timeline. Download the video or blast out a link to your attendees with a thank-you message.',
        visual: <OnAirRecordingsPreview />,
      },
      {
        variant: 'explore',
        title: 'Why Roam On-Air?',
        itemMarker: 'bullet',
        items: [
          'Built for the creator-era — RSVP pages, social press kit, and an audience that feels alive.',
          'Anyone can host — no AV crew, no production engineer.',
          'Stadium Mode scales to 2,500 attendees without the thumbnail grid.',
          'Stereo claps, whisper rows, and Q&A mic give the audience a voice.',
          'Lives in your Virtual HQ — events show up on the map, so everyone feels the energy.',
          'Just $19.50/month per active member, bundled with 8 other products.',
        ],
      },
      {
        variant: 'explore',
        title: 'On-Air Use Cases',
        itemMarker: 'bullet',
        items: [
          'All-Hands — host the whole company in a real room with reactions that scale.',
          'Product Launches — drop the curtain, walk on, demo to a crowd that’s actually paying attention.',
          'Investor Updates — broadcast quarterly results to LPs and the board, with Q&A built in.',
          'Creator AMAs — open the doors, take live questions on the Q&A mic, blast a recording the next day.',
          'Town Halls — quiet by default, hands-up Q&A when the moment’s right.',
          'Conferences — multi-day, multi-track, all on the same map.',
        ],
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      {
        variant: 'columns',
        columnsStyle: 'cards',
        columns: [
          { title: 'Q&A Mic', desc: 'Audience members can pop up for an audio-only broadcast to the whole theater which the speaker can answer. Audience members wishing to address everyone can queue up in first-come, first-serve order behind the current speaker.' },
          { title: 'Walk On and Exit Music', desc: 'Nothing pumps you or your audience up like the right music at the right time. Set your own custom walk-on music to play when you enter the stage. Set different exit music. Pick a leitmotif by Wagner or a familiar tone from a Nintendo game. Make your entrance and mark your exits!' },
          { title: 'HLS Streaming', desc: 'Include high-quality video streaming using HLS encoding in your presentations. This is far superior to screensharing of a video, which is how alternative platforms work. Think of the difference in quality between watching a high-definition Netflix show vs. a choppier video conferencing screenshare with a low frame rate. The professional edge makes all the difference!' },
        ],
      },
      {
        variant: 'compare-table',
        columns: [
          { label: 'On-Air in Roam' },
          { label: 'Legacy Webinar Software' },
        ],
        rows: [
          { left: 'Creator-era RSVP page with a friendly URL.', right: 'Clunky registration form straight from 2005.' },
          { left: 'Press kit auto-generated for Instagram, TikTok, X, and LinkedIn.', right: 'Bring your own designer.' },
          { left: 'Audience claps, laughs, and boos in stereo. Whisper rows for side chat.', right: 'Monologue-style. Audience is muted by default.' },
          { left: 'Anyone can host — no IT admin required.', right: 'You need an IT admin to set up a webinar.' },
          { left: 'Stadium Mode scales to 2,500 in one room.', right: 'Hard caps long before you fill the room.' },
          { left: 'Bundled in the Virtual Office Super Bundle.', right: 'Separate seat license, billed annually.' },
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
  'mobile': {
    eyebrow: 'Mobile',
    title: 'Roam While You Roam',
    hero: 'iOS and Android apps are your Virtual HQ in your pocket. The full Roam experience — overworld, map, AInbox, theater, magic minutes, stories, and your On-It assistant — wherever you are.',
    visual: <MobilePreview />,
    sections: [
      {
        title: 'Fully Interactive Map',
        desc: 'See everything happening in your virtual office from your phone: who is there, who is meeting with who, and who will return at what time. Use the trackpad to navigate around the full map. Pinch and zoom to size to taste.',
        visual: <MobilePreview initialTab="roam" initialView="map" />,
      },
      {
        title: 'Never miss a moment with Live View',
        desc: "It's a dynamic view of your Virtual Office, right on your lockscreen. See everything as people come and go, meet with others.",
        visual: <MobilePreview lockscreen />,
      },
      {
        title: 'Drop-In Meetings',
        desc: 'Tap any room to drop into a voice or video meeting.',
        visual: <MobilePreview initialTab="roam" initialView="map" />,
      },
      {
        title: 'Switch Floors from the Elevator',
        desc: 'See the entire multi-floor company at a glance. Swipe up or down to scroll each floor. Tap to jump to any floor you want to visit.',
        visual: <MobilePreview initialTab="roam" initialView="map" initialPlatform="android" />,
      },
      {
        title: 'Theater',
        desc: "Attend a presentation in Roam's unique theater. In the audience you can whisper with others in your audience row and ask a question. You can also go backstage, and of course, join the stage as a presenter!",
        visual: <MobilePreview theater />,
      },
      {
        title: 'AInbox',
        desc: "DMs, group chats, threads, and replies in the same folders you've organized on desktop — in the palm of your hand.",
        visual: <MobilePreview initialTab="ainbox" />,
      },
      {
        title: 'Magic Minutes',
        desc: 'Get Magic Minutes from a meeting on your mobile device. Prompt your Magic Minutes with questions.',
        visual: <MagicMinutesPreview />,
      },
      {
        title: 'Guest Badges',
        desc: "Grant guest badges to your contacts to chat with people outside your organization and allow them to visit you in Roam. They're free!",
        visual: <MobilePreview initialTab="ainbox" />,
      },
      {
        title: 'Stories',
        desc: "Keep your co-workers up to date on what's up by posting short-form pictures and videos that last for 24 hours.",
        visual: <MobilePreview initialTab="camera" />,
      },
      {
        title: 'On-It is On-It!',
        desc: "On-It is your AI Assistant, included in Roam. Bring your On-It with you wherever you are. Tell your On-It to schedule a meeting, follow up with people, or run any routine it's been trained to do — right from your phone.",
        visual: <MobilePreview initialTab="ainbox" />,
      },
      {
        title: 'Apple Watch',
        desc: 'Watch from your Watch. The live view of your office appears right on your watch.',
        visual: (
          <div className="fp-mobile-image-stage">
            <img className="fp-mobile-image fp-mobile-image-watch" src="/mobile/apple-watch.png" alt="Apple Watch showing the live Roam office view" />
          </div>
        ),
      },
      {
        title: 'CarPlay',
        desc: "You're in the driver's seat. Vrrrrrrrrooooaaaaam! Your office in your car. Join meetings with audio while you drive. Watch the live office while you drive. Just keep your eyes on the road!",
        visual: (
          <div className="fp-mobile-image-stage">
            <img className="fp-mobile-image fp-mobile-image-carplay" src="/mobile/carplay.png" alt="CarPlay dashboard with the Roam office on screen" />
          </div>
        ),
      },
      {
        variant: 'explore',
        title: 'Why Roam Mobile?',
        itemMarker: 'bullet',
        items: [
          'Sales, Marketing, and Customer Success — your job often takes you on the road. Roam Mobile lets you Roam While You Roam, with your Virtual Office in your pocket.',
          "Share Your Story — Instagram, Snapchat, and TikTok proved short-form, time-boxed Stories are a powerful mobile format. Whether you're at a conference, with a customer, or at an event, Roam lets you share your story from mobile right to your desktop virtual office.",
          "Never Miss a Moment — heading to a meeting? Live View keeps you on top of everything happening in the office. And everyone in the office can see you're watching from the desktop map, so they know you're engaged.",
        ],
      },
      {
        variant: 'explore',
        title: 'Mobile, the way it should be',
        itemMarker: 'bullet',
        items: [
          'Live View on your lockscreen — your office is always one glance away.',
          'Pinch-and-zoom map navigation — fully interactive, just like desktop.',
          'Drop into rooms with a tap — voice or video, no extra setup.',
          'AInbox folders, DMs, and threads stay in sync between phone and desktop.',
          'Magic Minutes summaries and prompts in your pocket.',
          'Apple Watch and CarPlay support — your office on every screen.',
          'Bundled in the Virtual Office Super Bundle — no separate seat license.',
        ],
      },
      {
        variant: 'explore',
        title: 'Explore our Virtual Office Platform',
        desc: '9 products for the price of one:',
        items: [
          'Company Visualization with the Virtual Office',
          'Virtual Meeting Room with Drop-In Meetings',
          'All-Hands Presentations with Theater',
          'Enterprise Messaging with AInbox',
          'Meeting Scheduler with Lobby',
          'Screen Recorder with Magicast',
          'AI Meeting Summarization with Magic Minutes',
          'Your AI Assistant is On-It',
          'Immersive Events with On-Air',
        ],
      },
      { variant: 'reviews' },
      STANDARD_PRICING_COMPARE,
    ],
  },
};

export const FEATURE_ORDER = [
  'virtual-office',
  'video-conferencing',
  'theater',
  'ainbox',
  'magic-minutes',
  'lobby',
  'magicast',
  'on-it',
  'on-air',
  'mobile',
];

function CompareColumn({ side, data }) {
  return (
    <div className={`fp-compare-col fp-compare-col-${side}${data.featured ? ' fp-compare-col-featured' : ''}`}>
      <div className="fp-compare-head">
        {data.badge && <div className="fp-compare-badge">{data.badge}</div>}
        <h3 className="fp-compare-col-title">{data.title}</h3>
        <p className="fp-compare-col-sub">{data.subtitle}</p>
      </div>
      <ul className="fp-compare-rows">
        {data.rows.map((r, i) => {
          const content = (
            <>
              <span className="fp-compare-row-name">
                {r.name}
                {r.href && <span className="fp-compare-row-arrow" aria-hidden="true">↗</span>}
              </span>
              <span className="fp-compare-row-value">
                <span className="fp-compare-row-price">{r.value}</span>
                {r.note && <span className="fp-compare-row-note">{r.note}</span>}
              </span>
            </>
          );
          return (
            <li key={i} className={`fp-compare-row${r.href ? ' fp-compare-row-link' : ''}`}>
              {r.href ? (
                <a className="fp-compare-row-anchor" href={r.href}>{content}</a>
              ) : content}
            </li>
          );
        })}
        {data.total && (
          <li className={`fp-compare-row fp-compare-row-total fp-compare-row-${data.total.tone || 'neutral'}`}>
            <span className="fp-compare-row-name">{data.total.label}</span>
            <span className="fp-compare-row-price">{data.total.value}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

// Generates a URL-safe slug from a section title so each titled section can
// be deep-linked. "Laugh, Clap & Boo in Stereo" → "laugh-clap-and-boo-in-stereo"
const sectionSlug = (s) => String(s || '')
  .toLowerCase()
  .replace(/&amp;/g, 'and')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

// Inline link-copy button that appears next to a section title on hover and
// writes a sharable deep link to the clipboard when clicked.
function SectionLinkButton({ featureSlug, slug }) {
  const [copied, setCopied] = useState(false);
  if (!featureSlug || !slug) return null;
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#/feature/${featureSlug}/${slug}`;
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      className={`fp-section-link-btn ${copied ? 'fp-section-link-copied' : ''}`}
      onClick={handleClick}
      aria-label="Copy link to section"
      title={copied ? '' : 'Copy link to section'}
    >
      <img src="/icons/link.svg" alt="" width="16" height="16" />
      {copied && <span className="fp-section-link-toast">Copied</span>}
    </button>
  );
}

function FeatureSection({ eyebrow, title, subtitle, titleImage, desc, visual, icons, variant, cards, bullets, left, right, columns, columnsStyle, leadContent, items, itemMarker, flashcards, featureSlug, rows, body, subBullets, footer }) {
  if (variant === 'reviews') {
    return <HomepageReviews limit={items?.length || 6} />;
  }
  if (variant === 'flashcards' && flashcards && flashcards.length > 0) {
    return (
      <section className="fp-section fp-section-flashcards">
        {flashcards.map((c, i) => (
          <FlashCard key={i} supertitle={c.supertitle} title={c.title} media={c.media} back={c.back} />
        ))}
      </section>
    );
  }
  if (variant === 'explore' && items && items.length > 0) {
    const useBullet = itemMarker === 'bullet';
    return (
      <section className="fp-section fp-section-explore">
        <div className="fp-explore-text">
          <h2 className="fp-explore-title">{title}</h2>
          {desc && <p className="fp-explore-desc text-body">{desc}</p>}
        </div>
        <ul className={`fp-explore-list ${useBullet ? 'fp-explore-list-bullet' : ''}`}>
          {items.map((label, i) => (
            <li key={i} className="fp-explore-item">
              {useBullet ? (
                <span className="fp-explore-bullet" aria-hidden="true" />
              ) : (
                <svg className="fp-explore-chevron" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (variant === 'prose' && body && body.length > 0) {
    return (
      <section className="fp-section fp-section-explore fp-section-prose">
        <div className="fp-explore-text">
          <h2 className="fp-explore-title">{title}</h2>
        </div>
        <div className="fp-prose-body">
          {body.map((p, i) => (
            <p key={i} className="text-body">{p}</p>
          ))}
        </div>
      </section>
    );
  }
  if (variant === 'lead' && leadContent) {
    return (
      <section className="fp-section fp-section-lead">
        <p className="fp-lead">{leadContent}</p>
      </section>
    );
  }
  if (variant === 'cards-row' && cards && cards.length > 0) {
    return (
      <section className="fp-section fp-section-cards-row">
        <div className="fp-cards-row-head">
          <h2 className="fp-cards-row-title">{title}</h2>
          {desc && <p className="fp-cards-row-desc">{desc}</p>}
        </div>
        <div className={`fp-cards-row-grid fp-cards-row-grid-${cards.length}`}>
          {cards.map((c, i) => (
            <div key={i} className={`fp-cards-row-card ${c.negative ? 'fp-cards-row-card-negative' : ''}`}>
              {c.negative && (
                <span className="fp-cards-row-negative-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#ef5350" />
                    <path d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              )}
              <span className="fp-cards-row-card-text">{c.text}</span>
            </div>
          ))}
        </div>
        {footer && <p className="fp-cards-row-footer">{footer}</p>}
      </section>
    );
  }
  if (variant === 'columns' && columns && columns.length > 0) {
    return (
      <section className={`fp-section fp-section-columns${columnsStyle === 'cards' ? ' fp-section-columns-cards' : ''} fp-section-columns-${columns.length}`}>
        {columns.map((c, i) => (
          <div key={i} className="fp-col">
            {c.visual && <div className="fp-col-visual">{c.visual}</div>}
            {c.eyebrow && <div className="fp-col-eyebrow text-caption-strong">{c.eyebrow}</div>}
            <h2 className="fp-col-title">{c.title}</h2>
            {c.desc && <p className="fp-col-desc text-body">{c.desc}</p>}
            {c.ctas && c.ctas.length > 0 && (
              <div className="fp-cta-row">
                {c.ctas.map((label, j) => (
                  <button key={j} className="sc-promo-btn">{label}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    );
  }
  if (variant === 'compare' && left && right) {
    return (
      <section className="fp-section fp-section-compare">
        <CompareColumn side="left" data={left} />
        <CompareColumn side="right" data={right} />
      </section>
    );
  }
  if (variant === 'compare-table' && columns && rows) {
    const renderCell = (cell) => {
      if (cell && typeof cell === 'object' && Array.isArray(cell.items)) {
        return (
          <div className="fp-cmp-cell-stack">
            {cell.lead && <div className="fp-cmp-cell-lead">{cell.lead}</div>}
            <ul className="fp-cmp-cell-items">
              {cell.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        );
      }
      return <span className="fp-cmp-cell-text">{cell}</span>;
    };
    return (
      <section className="fp-section fp-section-compare-table">
        {title && <h2 className="fp-cmp-title">{title}</h2>}
        <div className="fp-cmp-table">
          <div className="fp-cmp-row fp-cmp-row-head">
            {columns.map((c, i) => (
              <div key={i} className="fp-cmp-head-cell">{c.label}</div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div key={ri} className="fp-cmp-row">
              <div className="fp-cmp-cell fp-cmp-cell-pos">
                <span className="fp-cmp-mark fp-cmp-mark-pos" aria-hidden="true">
                  <span className="fp-cmp-mark-glyph" style={mvMask('/magicast/cmp-checkmark.svg')} />
                </span>
                {renderCell(row.left)}
              </div>
              <div className="fp-cmp-cell fp-cmp-cell-neg">
                <span className="fp-cmp-mark fp-cmp-mark-neg" aria-hidden="true">
                  <span className="fp-cmp-mark-glyph" style={mvMask('/magicast/cmp-dismiss.svg')} />
                </span>
                {renderCell(row.right)}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (variant === 'split' && bullets && bullets.length > 0) {
    return (
      <section className="fp-section fp-section-split">
        <div className="fp-split-inner">
          <h2 className="fp-split-title text-title-1">{title}</h2>
          <ul className="fp-split-bullets">
            {bullets.map((b, i) => <li key={i} className="text-body">{b}</li>)}
          </ul>
        </div>
      </section>
    );
  }
  if (variant === 'cards' && cards && cards.length > 0) {
    return (
      <section className="fp-section fp-section-cards">
        {cards.map((c, i) => (
          <div key={i} className="fp-card">
            {c.icon && (
              <div className="fp-card-icon">
                <span
                  className="fp-card-icon-glyph"
                  style={{ WebkitMaskImage: `url(${c.icon})`, maskImage: `url(${c.icon})` }}
                  aria-hidden="true"
                />
              </div>
            )}
            <h3 className="fp-card-title text-title-4">{c.title}</h3>
            <p className="fp-card-desc text-body">{c.desc}</p>
          </div>
        ))}
      </section>
    );
  }
  const slug = title ? sectionSlug(title) : null;
  return (
    <section
      id={slug || undefined}
      className={`fp-section ${variant ? `fp-section-${variant}` : ''}`}
    >
      <div className="fp-section-text">
        {eyebrow && <div className="fp-section-eyebrow text-caption-strong">{eyebrow}</div>}
        {titleImage && <img className="fp-section-title-image" src={titleImage.src} alt={titleImage.alt || ''} />}
        {title && (
          <h2 className="fp-section-title">
            <span className="fp-section-title-text">{title}</span>
            <SectionLinkButton featureSlug={featureSlug} slug={slug} />
          </h2>
        )}
        {subtitle && <div className="fp-section-subtitle">{subtitle}</div>}
        <p className="fp-section-desc text-body">{desc}</p>
        {subBullets && subBullets.length > 0 && (
          <ul className="fp-section-sub-bullets text-body">
            {subBullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
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

function FeatureQuote({ quote, author, role }) {
  return (
    <section className="fp-quote">
      <div className="fp-quote-inner">
        <div className="fp-quote-author">{author}</div>
        {role && <div className="fp-quote-role">{role}</div>}
        <blockquote className="fp-quote-text">{quote}</blockquote>
      </div>
    </section>
  );
}

function FeaturePageInner({ slug }) {
  const feature = FEATURES[slug];
  // For the on-air page, pick a fresh event on each mount so reloads cycle
  // through World Cup / Music / Walt Disney. Other pages get the default.
  const onAirEvent = useMemo(
    () => (slug === 'on-air' ? pickOnAirEvent() : ONAIR_EVENTS[0]),
    [slug]
  );
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
    // If the URL points at a specific section (#/feature/<slug>/<section-slug>),
    // scroll to that section after layout settles. Otherwise jump to top.
    const m = window.location.hash.match(/^#\/feature\/[a-z0-9-]+\/([a-z0-9-]+)/i);
    if (m) {
      const id = m[1];
      // Wait two frames so section visuals have laid out before scrolling.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
      }));
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [slug]);
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('theme-switching');
    html.setAttribute('data-theme', theme);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => html.classList.remove('theme-switching'));
    });
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('theme-switching');
      html.removeAttribute('data-theme');
    };
  }, [theme]);
  if (!feature) return null;

  return (
    <OnAirEventContext.Provider value={onAirEvent}>
    <div className="sc-viewport fp-page" data-theme={theme} data-slug={slug}>
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
          <div className="fp-eyebrow text-caption-strong">{feature.eyebrow}</div>
          <h1 className="fp-hero-title">{feature.title}</h1>
          <p className="fp-hero-sub text-body">{feature.hero}</p>
          <div className="fp-cta-row">
            <button className="sc-promo-btn">Book Demo</button>
            <button className="sc-promo-btn">Free Trial</button>
          </div>
        </div>
      </div>

      <div className="fp-hero-visual">
        <div className="fp-hero-stage">{feature.visual}</div>
      </div>

      {feature.quote && <FeatureQuote {...feature.quote} />}

      {feature.sections.map((s, i) => (
        s.type === 'quote'
          ? <FeatureQuote key={i} {...s} />
          : <FeatureSection key={i} featureSlug={slug} {...s} />
      ))}

      <div className="fp-footer-cta">
        <div className="fp-footer-cta-inner">
          <div className="fp-footer-cta-lead">
            <img className="fp-footer-cta-icon" src="/icons/roam-gold-icon.png" alt="" />
            <div className="fp-footer-cta-text">
              <h2 className="fp-footer-cta-title">Ready to meet Roam?</h2>
              <p className="fp-footer-cta-sub text-body">Give your team an office that thinks. Book a demo or kick the tires for free.</p>
            </div>
          </div>
          <div className="fp-cta-row">
            <button className="sc-promo-btn">Book Demo</button>
            <button className="sc-promo-btn">Free Trial</button>
          </div>
        </div>
      </div>

      <Footer />

      <FloatingCTA />
    </div>
    </OnAirEventContext.Provider>
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
