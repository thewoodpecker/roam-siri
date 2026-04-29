import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ShowcaseMap, { HomepageReviews, OnItFeatureChat } from './ShowcaseMap';
import { EditMapView } from './App';

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

function AInboxPreview({ overrides = false, view = 'thread', chatId = null, mmAutoPrompt = false, threadView = null, mmPrompts = null, initialSidebarView = 'inbox' } = {}) {
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

function RecordingsPreview() {
  return (
    <div className="fp-rec-preview">
      <Recordings win={noopWin('recordings')} onDrag={() => {}} />
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

function LobbyPreview() {
  return <Lobby win={noopWin('lobby')} onDrag={() => {}} />;
}

function OnAirPreview() {
  return <OnAir win={noopWin('onair')} onDrag={() => {}} demo />;
}

function TodoPreview({ label = 'TODO' } = {}) {
  return (
    <div className="fp-todo-preview">
      <span className="fp-todo-label">{label}</span>
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

function MapPreview({ spotifyAlwaysOpen = false, githubAlwaysOpen = false, figmaAlwaysOpen = false, hideOnIt = false, onItAutoOpen = false, autoKnock = false, shelfAutoOpen = false, shareAutoOpen = false, initialFloor = 'Preview', showSidebar = false, autoCycleFloors = false, autoCycleDms = false, showPhysicalTags = false, spotlightSearch = false, children = null } = {}) {
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
      <ShowcaseMap embedded autoKnock={autoKnock} initialFloor={initialFloor} spotifyAlwaysOpen={spotifyAlwaysOpen} githubAlwaysOpen={githubAlwaysOpen} figmaAlwaysOpen={figmaAlwaysOpen} hideOnIt={hideOnIt} onItAutoOpen={onItAutoOpen} shelfAutoOpen={shelfAutoOpen} shareAutoOpen={shareAutoOpen} theme={pageTheme} autoCycleFloors={autoCycleFloors} autoCycleDms={autoCycleDms} showPhysicalTags={showPhysicalTags} />
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
        variant: 'flashcards',
        flashcards: [
          { supertitle: 'Room Type', title: 'Private Office', back: 'Each member is assigned a Private Office, an audio-only home base to hold meetings and showcase your favorite books, movies, awards, articles, and more on their personal shelf.', media: { type: 'image', src: '/feature/flashcards/flash-card-private-office-front.png', src2x: '/feature/flashcards/flash-card-private-office-front@2x.png' } },
          { supertitle: 'Room Type', title: 'Meeting Room', back: 'Dedicated video-enabled room to share your screen, collaborate on a shared whiteboard, record Magic Minutes, react with Roamoji, and more.', media: { type: 'image', src: '/feature/flashcards/flash-card-meeting-room-front.png', src2x: '/feature/flashcards/flash-card-meeting-room-front@2x.png' } },
          { supertitle: 'Room Type', title: 'Theater', back: 'Hold all-hands meetings, presentations, and large-scale events for up to 3,000 people.', media: { type: 'image', src: '/feature/flashcards/flash-card-theater-front.png', src2x: '/feature/flashcards/flash-card-theater-front@2x.png' } },
          { supertitle: 'Privacy', title: 'Do Not Disturb', back: 'If someone is doing deep work or otherwise doesn’t want to be bothered, they can set Do Not Disturb. Roam even automatically detects if someone is on a video conferencing call from Zoom or Google Meet and automatically puts that person in DND on Roam.', media: { type: 'image', src: '/feature/flashcards/flash-card-dnd-front.png', src2x: '/feature/flashcards/flash-card-dnd-front@2x.png' } },
          { supertitle: 'Team Collaboration', title: '3D Chat', back: 'See chats and typing indicators from all groups as people message you. 3D chats visualize everyone who is messaging you right from the map at the same time.', media: { type: 'image', src: '/feature/flashcards/flash-card-3d-chat-front.png', src2x: '/feature/flashcards/flash-card-3d-chat-front@2x.png' } },
          { supertitle: 'Team Culture', title: 'Stories', back: 'Share short video stories with your team as you work in the familiar social format beloved by millions. Stories are viewable for 24 hours but the good ones last forever.', media: { type: 'video', src: '/feature/flashcards/flash-card-stories-front.mp4', src2x: '/feature/flashcards/flash-card-stories-front@2x.mp4' } },
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
        variant: 'flashcards',
        flashcards: [
          { supertitle: 'Team Collaboration', title: 'GitHub', back: 'A new era of handling PR requests. When you submit a PR request to your fellow dev, it appears next to your office right on the map until it’s done. PR review wait times drop drastically.', media: { type: 'video', src: '/feature/flashcards/flash-card-github-front.mp4', src2x: '/feature/flashcards/flash-card-github-front@2x.mp4' } },
          { supertitle: 'Team Collaboration', title: 'Figma', back: 'Your Figma conversations appear right on the Roam floor map. Whenever you reply or comment on a Figma file, the Figma logo shows right next to your office. Click to instantly open the comment in Figma.', media: { type: 'image', src: '/feature/flashcards/flash-card-figma-front.png', src2x: '/feature/flashcards/flash-card-figma-front@2x.png' } },
          { supertitle: 'Team Culture', title: 'Spotify', back: 'Stay in tune with your team by sharing what you’re playing on Spotify or Apple Music, right in your own office, right on the map.', media: { type: 'video', src: '/feature/flashcards/flash-card-spotify-front.mp4', src2x: '/feature/flashcards/flash-card-spotify-front@2x.mp4' } },
          { supertitle: 'Room Type', title: 'Game Room', back: 'Increase employee engagement, build better culture, and ramp new teams in your Game Room. Teams that play together win together.', media: { type: 'image', src: '/feature/flashcards/flash-card-game-room-front.png', src2x: '/feature/flashcards/flash-card-game-room-front@2x.png' } },
          { supertitle: 'Privacy', title: 'Out of Roam', back: 'If you’re out of the office for multiple days, your return date shows on your office.', media: { type: 'image', src: '/feature/flashcards/flash-card-out-of-roam-front.png', src2x: '/feature/flashcards/flash-card-out-of-roam-front@2x.png' } },
          { supertitle: 'Privacy', title: 'Will Return', back: 'If you’re stepping away but returning today just set your Will Return time and a clock appears.', media: { type: 'image', src: '/feature/flashcards/flash-card-will-return-front.png', src2x: '/feature/flashcards/flash-card-will-return-front@2x.png' } },
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
          {
            title: 'Global',
            desc: 'Magic Minutes is available in 30+ languages including English, Spanish, Chinese, Portuguese, French, and many more!',
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
  'virtual-office',
  'video-conferencing',
  'theater',
  'ainbox',
  'magic-minutes',
  'lobby',
  'magicast',
  'on-air',
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

function FeatureSection({ eyebrow, title, subtitle, titleImage, desc, visual, icons, variant, cards, bullets, left, right, columns, columnsStyle, leadContent, items, itemMarker, flashcards, featureSlug }) {
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
  if (variant === 'lead' && leadContent) {
    return (
      <section className="fp-section fp-section-lead">
        <p className="fp-lead">{leadContent}</p>
      </section>
    );
  }
  if (variant === 'columns' && columns && columns.length > 0) {
    return (
      <section className={`fp-section fp-section-columns${columnsStyle === 'cards' ? ' fp-section-columns-cards' : ''}`}>
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
            <div className="fp-card-icon">
              <span
                className="fp-card-icon-glyph"
                style={{ WebkitMaskImage: `url(${c.icon})`, maskImage: `url(${c.icon})` }}
                aria-hidden="true"
              />
            </div>
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
