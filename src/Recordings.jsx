import React, { useState } from 'react';
import './Recordings.css';
import { MagicMinutesBody } from './MagicMinutes';

const TABS = ['Meetings', 'Magicasts', 'On-Air'];


const MAGICAST_CHIPS = ['Date', 'Customer', 'People'];
const MEETING_CHIPS = ['Date', 'Participants', 'In', 'Template', 'Has Video'];

const ONAIR = [
  {
    section: 'Today',
    items: [
      {
        title: 'World Cup 2026 Final Watch Party — Live from Roam Stadium',
        subtitle: 'Joe Woodward & Will Hou',
        when: 'Today · 7:00 pm',
        thumb: '/on-air/on-air-blue-landscape.png',
        avatars: ['/headshots/joe-woodward.jpg', '/headshots/will-hou.jpg'],
      },
      {
        title: 'The Future of Remote Work',
        subtitle: 'Howard Lerman',
        when: 'Apr 20, 2026 · 2:00 pm',
        thumb: '/on-air/static-landscape-red.png',
        avatar: '/headshots/howard-lerman.jpg',
      },
    ],
  },
  {
    section: 'Last Week',
    items: [
      {
        title: 'Designing with AI',
        subtitle: 'Joe Woodward',
        when: 'Apr 16, 2026 · 11:00 am',
        thumb: '/on-air/static-landscape-purple.png',
        avatar: '/headshots/joe-woodward.jpg',
      },
      {
        title: 'AI-First Products',
        subtitle: 'Klas Leino',
        when: 'Apr 14, 2026 · 3:00 pm',
        thumb: '/on-air/static-landscape-green.png',
        avatar: '/headshots/klas-leino.jpg',
      },
      {
        title: 'Roam Creator Summit',
        subtitle: 'Chelsea Turbin',
        when: 'Apr 12, 2026 · 1:00 pm',
        thumb: '/on-air/static-landscape-orange.png',
        avatar: '/headshots/chelsea-turbin.jpg',
      },
    ],
  },
  {
    section: 'Last Month',
    items: [
      {
        title: 'Engineering All-Hands',
        subtitle: 'Derek Cicerone',
        when: 'Mar 28, 2026 · 10:00 am',
        thumb: '/on-air/static-landscape-black.png',
        avatar: '/headshots/derek-cicerone.jpg',
      },
      {
        title: 'The Future of Remote Work',
        subtitle: 'Howard Lerman',
        when: 'Mar 15, 2026 · 2:00 pm',
        thumb: '/on-air/on-air-blue-landscape.png',
        avatar: '/headshots/howard-lerman.jpg',
      },
    ],
  },
];

const MAGICASTS = [
  {
    section: 'Today',
    items: [
      {
        title: 'Debugging Video Party',
        subtitle: 'Willow Ainsley',
        when: 'Jan 30, 2026 · 2:30 pm',
        thumb: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=260&fit=crop',
        avatar: '/headshots/grace-sutherland.jpg',
      },
    ],
  },
  {
    section: 'Last Week',
    items: [
      {
        title: 'Customizing and Sharing Magic Minutes',
        subtitle: 'Klas Yundt',
        when: 'May 02, 2026 · 11:00 am',
        thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=260&fit=crop',
        avatar: '/headshots/klas-leino.jpg',
      },
      {
        title: 'Active Speaker View Update',
        subtitle: 'Tim Burton',
        when: 'May 01, 2026 · 9:00 am',
        thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=260&fit=crop',
        avatar: '/headshots/howard-lerman.jpg',
      },
      {
        title: 'UI/UX Review for Wayfarer App',
        subtitle: 'Amelia Earhart',
        when: 'Apr 28, 2026 · 4:30 pm',
        thumb: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=260&fit=crop',
        avatar: '/headshots/ava-lee.jpg',
      },
    ],
  },
  {
    section: 'Last Month',
    items: [
      {
        title: 'Willow/Santiago: Wayfarer/AHC System Overview',
        subtitle: 'Louisa Delaware',
        when: 'Apr 27, 2026 · 10:30 am',
        thumb: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=260&fit=crop',
        avatar: '/headshots/chelsea-turbin.jpg',
      },
      {
        title: 'Willow/Santiago: Wayfarer/AHC System Overview',
        subtitle: 'Willow Ainsley + Santiago Lopez',
        when: 'Feb 14, 2026 · 10:00 am',
        thumb: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=260&fit=crop',
        avatar: '/headshots/lexi-bohonnon.jpg',
      },
    ],
  },
];

const PEOPLE = {
  '/headshots/howard-lerman.jpg':      { name: 'Howard Lerman',      role: 'CEO, Roam',      gender: 'm' },
  '/headshots/lexi-bohonnon.jpg':      { name: 'Lexi Bohonnon',      role: 'Engineering',    gender: 'f' },
  '/headshots/grace-sutherland.jpg':   { name: 'Grace Sutherland',   role: 'Chief of People',gender: 'f' },
  '/headshots/chelsea-turbin.jpg':     { name: 'Chelsea Turbin',     role: 'Product',        gender: 'f' },
  '/headshots/klas-leino.jpg':         { name: 'Klas Leino',         role: 'Research',       gender: 'm' },
  '/headshots/ava-lee.jpg':            { name: 'Ava Lee',            role: 'Design',         gender: 'f' },
  '/headshots/derek-cicerone.jpg':     { name: 'Derek Cicerone',     role: 'Engineering',    gender: 'm' },
  '/headshots/arnav-bansal.jpg':       { name: 'Arnav Bansal',       role: 'Engineering',    gender: 'm' },
  '/headshots/aaron-wadhwa.jpg':       { name: 'Aaron Wadhwa',       role: 'Growth',         gender: 'm' },
  '/headshots/garima-kewlani.jpg':     { name: 'Garima Kewlani',     role: 'Design',         gender: 'f' },
  '/headshots/jeff-grossman.jpg':      { name: 'Jeff Grossman',      role: 'Sales',          gender: 'm' },
  '/headshots/john-beutner.jpg':       { name: 'John Beutner',       role: 'Engineering',    gender: 'm' },
  '/headshots/john-huffsmith.jpg':     { name: 'John Huffsmith',     role: 'Engineering',    gender: 'm' },
  '/headshots/john-moffa.jpg':         { name: 'John Moffa',         role: 'Product',        gender: 'm' },
  '/headshots/jon-brod.jpg':           { name: 'Jon Brod',           role: 'Partnerships',   gender: 'm' },
  '/headshots/keegan-lanzillotta.jpg': { name: 'Keegan Lanzillotta', role: 'Marketing',      gender: 'm' },
  '/headshots/mattias-leino.jpg':      { name: 'Mattias Leino',      role: 'Engineering',    gender: 'm' },
  '/headshots/michael-miller.jpg':     { name: 'Michael Miller',     role: 'Finance',        gender: 'm' },
  '/headshots/michael-walrath.jpg':    { name: 'Michael Walrath',    role: 'Board',          gender: 'm' },
  '/headshots/peter-lerman.jpg':       { name: 'Peter Lerman',       role: 'Operations',     gender: 'm' },
  '/headshots/rob-figueiredo.jpg':     { name: 'Rob Figueiredo',     role: 'Engineering',    gender: 'm' },
  '/headshots/sean-macisaac.jpg':      { name: 'Sean MacIsaac',      role: 'Engineering',    gender: 'm' },
  '/headshots/thomas-grapperon.jpg':   { name: 'Thomas Grapperon',   role: 'Engineering',    gender: 'm' },
  '/headshots/tom-dixon.jpg':          { name: 'Tom Dixon',          role: 'Design',         gender: 'm' },
  '/headshots/will-hou.jpg':           { name: 'Will Hou',           role: 'Engineering',    gender: 'm' },
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function facesFor(participants) {
  const usedByGender = { m: new Set(), f: new Set() };
  return participants.slice(0, 4).map((avatar) => {
    const p = PEOPLE[avatar] || { gender: 'm' };
    const gender = p.gender === 'f' ? 'f' : 'm';
    const poolSize = gender === 'f' ? 6 : 4;
    const used = usedByGender[gender];
    let idx = hashStr(avatar) % poolSize;
    for (let attempt = 0; attempt < poolSize && used.has(idx); attempt++) {
      idx = (idx + 1) % poolSize;
    }
    used.add(idx);
    const n = String(idx + 1).padStart(2, '0');
    return `/meeting-room/${gender === 'f' ? 'woman' : 'man'}-${n}.png`;
  });
}

const SPEAKER_COLORS = ['#46d08f', '#4dd0e1', '#ffb74d', '#b39ddb', '#f48fb1'];

const SPEAKER_BAR_PATTERNS = [
  [
    { left: 0, width: '5%' }, { left: '8%', width: '3%' }, { left: '15%', width: '3%' },
    { left: '35%', width: '14%' }, { left: '55%', width: '5%' }, { left: '65%', width: '20%' },
    { left: '90%', width: '7%' },
  ],
  [
    { left: 0, width: '5%' }, { left: '8%', width: '3%' }, { left: '15%', width: '3%' },
    { left: '25%', width: '3.5%' }, { left: '33%', width: '7%' }, { left: '45%', width: '3.5%' },
    { left: '53%', width: '5%' }, { left: '63%', width: '5%' }, { left: '73%', width: '3.5%' },
    { left: '80%', width: '17%' },
  ],
  [
    { left: '3%', width: '8%' }, { left: '18%', width: '5%' }, { left: '30%', width: '10%' },
    { left: '48%', width: '4%' }, { left: '60%', width: '12%' }, { left: '82%', width: '6%' },
  ],
  [
    { left: '5%', width: '4%' }, { left: '14%', width: '6%' }, { left: '27%', width: '3%' },
    { left: '42%', width: '9%' }, { left: '58%', width: '5%' }, { left: '70%', width: '8%' },
    { left: '88%', width: '7%' },
  ],
];

const AVATARS = [
  '/headshots/howard-lerman.jpg',
  '/headshots/lexi-bohonnon.jpg',
  '/headshots/grace-sutherland.jpg',
  '/headshots/chelsea-turbin.jpg',
  '/headshots/klas-leino.jpg',
  '/headshots/ava-lee.jpg',
  '/headshots/derek-cicerone.jpg',
  '/headshots/arnav-bansal.jpg',
  '/headshots/aaron-wadhwa.jpg',
  '/headshots/garima-kewlani.jpg',
  '/headshots/jeff-grossman.jpg',
  '/headshots/john-beutner.jpg',
  '/headshots/john-huffsmith.jpg',
  '/headshots/john-moffa.jpg',
  '/headshots/jon-brod.jpg',
  '/headshots/keegan-lanzillotta.jpg',
  '/headshots/mattias-leino.jpg',
  '/headshots/michael-miller.jpg',
  '/headshots/michael-walrath.jpg',
  '/headshots/peter-lerman.jpg',
  '/headshots/rob-figueiredo.jpg',
  '/headshots/sean-macisaac.jpg',
  '/headshots/thomas-grapperon.jpg',
  '/headshots/tom-dixon.jpg',
  '/headshots/will-hou.jpg',
];

const MEETINGS = [
  {
    section: 'Last Week',
    items: [
      {
        title: 'Designing the AI Onboarding Flow',
        participants: [AVATARS[3], AVATARS[1], AVATARS[2], AVATARS[5]],
        when: 'Thursday, April 16 at 5:34 PM',
        video: true,
        seed: 17,
        brief: "Kickoff for the redesigned first-run experience. The group aligned on a three-step onboarding: intent capture, spatial tour, and personalized next-actions powered by the AI assistant. Chelsea framed the north-star metric as time-to-first-meaningful-room (TTFMR), and the team agreed the AI should suggest rooms, teammates, and Magic Minutes templates within the first 5 minutes of signup.",
        nextSteps: [
          "Ava to ship hi-fi mocks for the intent capture step by Monday.",
          "Lexi to prototype the spatial tour with the new guided-pointer component.",
          "Grace to draft copy for the three personalized next-action cards.",
          "Chelsea to instrument TTFMR in Amplitude and set up a dashboard.",
          "Reconvene next Thursday to review mocks end-to-end and lock scope.",
        ],
        transcript: [
          { t: '00:12', text: "Let's start with the problem — brand new users bounce before they ever enter a room. We need onboarding that pulls them into the office, not through a checklist." },
          { t: '00:38', text: "From a design standpoint, I want to lean into motion and spatial cues. The moment the user lands, they should feel like someone's holding the door open for them." },
          { t: '01:05', text: "The AI can do a lot here — ask two or three intent questions, then suggest rooms and teammates. But we have to be careful it doesn't feel like a survey." },
          { t: '01:19', text: "Agreed. Intent capture should feel conversational, not interrogative. Two questions max, and one of them should let them skip." },
          { t: '01:59', text: "Technically we can drive the spatial tour with the existing guided-pointer primitive. I'll have a prototype up by Monday." },
          { t: '02:34', text: "From a people-side, we should have the AI surface a buddy — someone in a similar role who's been here six months. That social anchor matters." },
          { t: '03:15', text: "I'll instrument time-to-first-meaningful-room as the north-star. If we can get the median under five minutes, we've won." },
          { t: '03:40', text: "Let's sync again Thursday with the full flow in Figma. I want to pressure-test the AI suggestions with real new-hire data.", active: true },
        ],
      },
      {
        title: 'Organic Growth Engine and Website AEO',
        participants: [AVATARS[5], AVATARS[3], AVATARS[9]],
        when: 'Wednesday, April 15 at 10:45 AM',
        brief: "Working session on the Answer Engine Optimization strategy for roam.com. Garima walked through which pages are and aren't getting cited by Perplexity and ChatGPT, and the team agreed that the fastest wins are on the comparison pages (vs. Zoom, vs. Gather) where our content is currently too marketing-heavy. The group committed to a content refactor that leads with specific, quotable facts.",
        nextSteps: [
          "Garima to audit the top 20 most-cited competitor pages and extract their answer patterns.",
          "Ava to restructure the vs. Zoom and vs. Gather pages with an AEO-first template.",
          "Chelsea to write 8 new FAQ pages targeting high-volume zero-click queries.",
          "Spin up weekly tracking of citations across ChatGPT, Perplexity, and Claude.",
          "Review progress in two weeks.",
        ],
        transcript: [
          { t: '00:08', text: "Okay so I pulled the citation data — we're basically invisible on Perplexity for 'best virtual office' and we're losing to Gather on ChatGPT cites too." },
          { t: '00:31', text: "That tracks. Our pages are written for humans scrolling, not for models extracting facts. We need to lead with the answer and then sell." },
          { t: '00:58', text: "I can restructure the vs. pages first — those are the highest-leverage because they convert warm intent." },
          { t: '01:22', text: "Let's use an AEO template: one-line answer, three supporting facts, then the rest. If a model can grab the first 300 words, we've done our job." },
          { t: '01:55', text: "I'll also write eight new FAQ pages — I already have the query list from the SEO tool, we're just not ranking for any of it." },
          { t: '02:30', text: "Good. And we should track citations weekly across the three big models so we can see if this is working without waiting for organic traffic lag." },
          { t: '03:00', text: "Two weeks from now let's review. If the vs. pages move, we'll know the template works and we can roll it out.", active: true },
        ],
      },
    ],
  },
  {
    section: '2 Weeks Ago',
    items: [
      {
        title: 'Magic Minutes: Beta Feedback Synthesis',
        participants: [AVATARS[1], AVATARS[9], AVATARS[2]],
        when: 'Thursday, April 9 at 5:34 PM',
        video: true,
        seed: 83,
        brief: "The team reviewed 47 pieces of beta feedback on Magic Minutes. Two themes dominated: users want to edit the summary before it's sent to the group chat, and the transcript search is too slow on long meetings. Lexi confirmed the search latency is an index issue we can fix this sprint. Garima sketched a lightweight edit-before-send flow that doesn't break the zero-friction promise.",
        nextSteps: [
          "Lexi to land the transcript search index fix by Friday.",
          "Garima to mock the edit-before-send sheet — must be dismissible in one tap.",
          "Grace to send a thank-you note to the 12 most engaged beta users.",
          "Pick 5 users for a moderated follow-up this week.",
          "Plan next beta cohort to include international users.",
        ],
        transcript: [
          { t: '00:10', text: "Forty-seven pieces of feedback in two weeks. The biggest pain point is clear: people want to edit before the summary posts." },
          { t: '00:34', text: "I can design an edit sheet that appears for fifteen seconds with a dismiss. Zero-friction for the 80% who don't care, power for the 20% who do." },
          { t: '01:02', text: "On the search — it's not the model, it's the index. We're doing a linear scan on long transcripts. I'll push the fix this week." },
          { t: '01:28', text: "Good. Let's also personally reach out to the top 12 most-engaged beta users. We'll learn more from a 20-minute call than from 50 survey responses." },
          { t: '01:52', text: "I'll handle that. And we should make the next cohort more international — all the current feedback is North American." },
          { t: '02:20', text: "Agreed. Accents and non-English transcripts are where we'll see the real quality gap.", active: true },
        ],
      },
    ],
  },
  {
    section: '3 Weeks Ago',
    items: [
      {
        title: 'Visual Language Refresh: Dock v3',
        participants: [AVATARS[2], AVATARS[5], AVATARS[0]],
        when: 'Thursday, April 2 at 5:31 PM',
        brief: "Ava walked the group through three directions for the Dock v3 redesign: a minimal monochrome bar, a glass-morphism treatment with subtle colored accents, and a 'liquid' direction that animates on hover. Howard pushed for the glass direction — it reinforces the virtual-office metaphor without feeling gimmicky. Grace flagged accessibility concerns around low-contrast glass and the team committed to a parallel contrast audit before the final pick.",
        nextSteps: [
          "Ava to refine the glass direction with an AA-contrast pass by Monday.",
          "Ava to pair with engineering on the hover-motion spec — 120ms ease-out, no bounce.",
          "Grace to run a quick accessibility check with three screen-reader users.",
          "Howard to share the final pick with the exec team at the Monday standup.",
          "Target ship for Dock v3: end of April alongside the Magic Minutes GA.",
        ],
        transcript: [
          { t: '00:08', text: "Okay, three directions for Dock v3 — monochrome, glass with accent, and the liquid motion one. Here's the Figma." },
          { t: '00:30', text: "The liquid one is fun but it feels like a tech demo, not a product. The glass treatment reads the most 'virtual office' to me." },
          { t: '00:58', text: "I like glass too, but I want to be careful — if we lean too translucent, contrast drops and the dock becomes hard to scan." },
          { t: '01:24', text: "Totally fair. I can push the glass to AA contrast while keeping the depth feel. It's a real constraint, not a blocker." },
          { t: '01:50', text: "Also the hover motion matters more than people think. Right now it's 250ms and it feels sluggish. I want 120ms, ease-out, no bounce." },
          { t: '02:18', text: "Agreed on motion. Let's also run a short check with a few screen-reader users — if glass breaks for them, we rethink.", active: true },
          { t: '02:45', text: "Perfect. I'll refine glass by Monday and we pick the final direction. Target ship is end of April with Magic Minutes GA." },
        ],
      },
    ],
  },
  {
    section: '4 Weeks Ago',
    items: [
      {
        title: 'Q3 Product OKRs & Ship List',
        participants: [AVATARS[3], AVATARS[9], AVATARS[1], AVATARS[5]],
        when: 'Thursday, March 26 at 5:34 PM',
        video: true,
        seed: 142,
        brief: "Planning session for Q3. The team prioritized three bets: Magic Minutes GA, the redesigned mobile app, and an AI-powered meeting prep feature. Chelsea held the line that we can't do all three at once — the group landed on Magic Minutes GA as the must-ship, mobile as the stretch, and meeting prep as a Q4 setup. Lexi flagged that mobile needs a new platform lead before it can move.",
        nextSteps: [
          "Chelsea to draft the Q3 OKRs doc by end of week for exec review.",
          "Lexi to post the mobile platform lead role externally.",
          "Ava to finalize the Magic Minutes GA design system by mid-April.",
          "Garima to scope the meeting-prep feature as a Q4 investigation.",
          "Lock OKRs at the April 9 leadership offsite.",
        ],
        transcript: [
          { t: '00:11', text: "We can't ship three flagship features in a quarter. I'd rather ship one great thing than three mediocre ones." },
          { t: '00:38', text: "I agree. Magic Minutes GA has the highest user pull right now. Every beta session ends with 'when can everyone use this.'" },
          { t: '01:04', text: "Mobile is the one I'm worried about. We don't have a platform lead, and we can't realistically ship a redesign without one." },
          { t: '01:30', text: "Then let's post the role this week and treat Q3 mobile as a stretch, not a commitment." },
          { t: '01:58', text: "Meeting prep is exciting but it's early. Let's make Q3 a scoping quarter for it and land it in Q4." },
          { t: '02:25', text: "I can drive the scoping. Three weeks to validate whether it's even the right shape of feature." },
          { t: '02:55', text: "Good. Chelsea, can you have the OKR draft ready for the April 9 offsite? We'll lock it there.", active: true },
          { t: '03:20', text: "Yes. I'll circulate on Monday and we lock at the offsite." },
        ],
      },
    ],
  },
];

const ChevronDownSmall = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default function Recordings({ win, onDrag, initialTab = 'Meetings', onAirRecording = null }) {
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [collapsed, setCollapsed] = useState({});
  const [openedMeeting, setOpenedMeeting] = useState(null);

  const toggleSection = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  // When an `onAirRecording` is supplied (from the on-air feature page) replace
  // the first item of the Today section with it so the active event always
  // appears at the top.
  const onAirSections = onAirRecording
    ? ONAIR.map((s, i) => i === 0
        ? { ...s, items: [onAirRecording, ...s.items.slice(1)] }
        : s)
    : ONAIR;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  return (
    <div
      className={`rec-win ${!win.isFocused ? 'rec-win-unfocused' : ''} ${closing ? 'rec-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      {/* Header */}
      <div className="rec-header" onMouseDown={onDrag}>
        <div className="rec-lights">
          <button
            type="button"
            aria-label="Close"
            className="unbutton rec-light rec-light-close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span aria-hidden="true" className="rec-light rec-light-min" />
          <span aria-hidden="true" className="rec-light rec-light-max" />
        </div>

        {openedMeeting && (
          <button
            className="rec-back-btn"
            onClick={(e) => { e.stopPropagation(); setOpenedMeeting(null); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <div className="rec-header-center">
          <div className="rec-search">
            <img src="/icons/mm-search.svg" alt="" width="16" height="16" />
            <span>Search</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="rec-body">
        {openedMeeting ? (
          <MagicMinutesBody meeting={openedMeeting} />
        ) : (
          <>
        <div className="rec-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={activeTab === t}
              className={`unbutton rec-tab ${activeTab === t ? 'rec-tab-active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              <span className="rec-tab-label" data-text={t}>{t}</span>
            </button>
          ))}
        </div>

        {activeTab === 'Meetings' && (
          <div className="rec-chips">
            {MEETING_CHIPS.map((c) => (
              <div key={c} className="rec-chip">
                <span>{c}</span>
                {c !== 'Has Video' && <ChevronDownSmall />}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Magicasts' && (
          <div className="rec-list">
            {MAGICASTS.map((section) => (
              <React.Fragment key={section.section}>
                <div className="rec-section-header">{section.section}</div>
                {section.items.map((item, i) => (
                  <div key={i} className="rec-call">
                    <div className="rec-thumb">
                      <img src={item.thumb} alt="" />
                      {item.avatar && <img src={item.avatar} alt="" className="rec-thumb-avatar" />}
                    </div>
                    <div className="rec-call-body">
                      <div>
                        <div className="rec-call-title">{item.title}</div>
                        <div className="rec-call-subtitle">{item.subtitle}</div>
                      </div>
                      <div className="rec-call-when">{item.when}</div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}

        {activeTab === 'Meetings' && (
          <div className="rec-list">
            {MEETINGS.map((section) => {
              const isCollapsed = !!collapsed[section.section];
              return (
                <React.Fragment key={section.section}>
                  <button
                    type="button"
                    aria-expanded={!isCollapsed}
                    className={`unbutton rec-section-header rec-section-header-collapsible ${isCollapsed ? 'rec-section-collapsed' : ''}`}
                    onClick={() => toggleSection(section.section)}
                  >
                    <span className="rec-section-chevron" aria-hidden="true"><ChevronDownSmall /></span>
                    {section.section}
                  </button>
                  {!isCollapsed && section.items.map((item, i) => (
                    <div
                      key={i}
                      className="rec-meeting"
                      onClick={() => {
                        const speakers = item.participants.map((avatar, idx) => {
                          const p = PEOPLE[avatar] || { name: 'Guest', role: '' };
                          return {
                            avatar,
                            name: p.name,
                            role: p.role,
                            color: SPEAKER_COLORS[idx % SPEAKER_COLORS.length],
                            bars: SPEAKER_BAR_PATTERNS[idx % SPEAKER_BAR_PATTERNS.length],
                          };
                        });
                        const gridFaces = item.video ? facesFor(item.participants) : null;
                        const transcript = item.transcript?.map((t, i) => {
                          const avatar = item.participants[i % item.participants.length];
                          const p = PEOPLE[avatar] || { name: 'Guest' };
                          return { name: p.name, avatar, time: t.t, text: t.text, active: !!t.active };
                        });
                        setOpenedMeeting({ ...item, audioOnly: !item.video, speakers, gridFaces, transcript });
                      }}
                    >
                      <div className={`rec-meeting-thumb ${item.video ? 'rec-meeting-thumb-video' : ''}`}>
                        {item.video ? (
                          (() => {
                            const faces = facesFor(item.participants);
                            return (
                              <div className="rec-meeting-grid" data-count={faces.length}>
                                {faces.map((src, k) => (
                                  <div key={k} className="rec-meeting-grid-cell">
                                    <img src={src} alt="" />
                                  </div>
                                ))}
                              </div>
                            );
                          })()
                        ) : (
                          <img src="/icons/magic-quill.svg" alt="" width="24" height="24" />
                        )}
                      </div>
                      <div className="rec-meeting-body">
                        <div className="rec-meeting-top">
                          <div className="rec-meeting-title">{item.title}</div>
                          <div className="rec-avatars">
                            {item.participants.map((p, j) => (
                              <img key={j} src={p} alt="" className="rec-avatar" />
                            ))}
                          </div>
                        </div>
                        <div className="rec-meeting-when">{item.when}</div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {activeTab === 'On-Air' && (
          <div className="rec-list">
            {onAirSections.map((section) => (
              <React.Fragment key={section.section}>
                <div className="rec-section-header">{section.section}</div>
                {section.items.map((item, i) => (
                  <div key={i} className="rec-call">
                    <div className="rec-thumb">
                      <img src={item.thumb} alt="" />
                      {item.avatars ? (
                        <div className="rec-thumb-avatars">
                          {item.avatars.map((src, j) => (
                            <img key={j} src={src} alt="" className="rec-thumb-avatar rec-thumb-avatar-stacked" />
                          ))}
                        </div>
                      ) : item.avatar && (
                        <img src={item.avatar} alt="" className="rec-thumb-avatar rec-thumb-avatar-centered" />
                      )}
                    </div>
                    <div className="rec-call-body">
                      <div>
                        <div className="rec-call-title">{item.title}</div>
                        <div className="rec-call-subtitle">{item.subtitle}</div>
                      </div>
                      <div className="rec-call-when">{item.when}</div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
