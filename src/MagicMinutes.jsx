import React, { useState, useEffect, useRef } from 'react';
import './MagicMinutes.css';

const VIDEO_PEOPLE = [
  { name: 'Lexi Bohonnon', img: '/headshots/lexi-bohonnon.jpg' },
  { name: 'Howard Lerman', img: '/headshots/howard-lerman.jpg' },
  { name: 'Grace Sutherland', img: '/headshots/grace-sutherland.jpg' },
  { name: 'Chelsea Turbin', img: '/headshots/chelsea-turbin.jpg' },
];

const DEFAULT_GRID_VIDEOS = [
  { video: '/videos/Female/ashley_brooks.mp4',     poster: '/videos/Female/ashley_brooks.png' },
  { video: '/videos/Female/lauren_hayes.mp4',      poster: '/videos/Female/lauren_hayes.png' },
  { video: '/videos/Male/ethan_bishop.mp4',        poster: '/videos/Male/ethan_bishop.png' },
  { video: '/videos/Female/sarah_mitchell.mp4',    poster: '/videos/Female/sarah_mitchell.png' },
];

function parseTime(t) {
  if (typeof t === 'number') return t;
  if (!t) return 0;
  const [m, s] = String(t).split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}

function formatTime(s) {
  const total = Math.max(0, Math.round(s));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const TRANSCRIPT = [
  { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '00:12', text: "Morning everyone — let's run the AI standup. I'll go first. Yesterday I shipped the on-device Whisper pipeline behind the dogfood flag. Today I'm wiring up the cloud summarizer fallback for meetings over 30 minutes. Blocker: I need a final call on whether we ship EU residency on day one or fast-follow.", active: false },
  { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '00:38', text: "Day one on EU residency. We can't sell into the enterprise pipeline without it — Acme and two others are gating their POCs on it. Park the fast-follow conversation. Lexi, what do you need from me to unblock that?", active: false },
  { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '01:05', text: "Just sign-off on the Frankfurt region spend. Ops has the quote already. If you can approve in Slack today, I can have the bucket provisioned by Thursday and the failover tested by Monday.", active: false },
  { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '01:19', text: "Product side — yesterday I closed the spec on the @MagicMinutes prompt UI in AInbox. Today I'm reviewing the summary template variants with design. The big open question is whether action items get assigned automatically or stay as suggestions until someone confirms.", active: false },
  { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '01:59', text: "Auto-assign with a one-click undo. The whole point is that nobody has to volunteer to take notes — same logic applies to who owns the action item. If we're wrong, the undo is free. If we're right, we just removed the friction.", active: false },
  { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '02:34', text: "From the people side — yesterday I drafted the rollout comms for the team. Today I'm running the privacy review with legal so we can publish the Stop & Shred docs alongside GA. Nothing blocking, but I'll need 30 minutes from Lexi later to confirm what the shred actually deletes downstream.", active: false },
  { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '03:15', text: "I'll send Grace the data-flow diagram after standup. Short version: shred wipes the recording, the transcript, the summary, and the auto-generated chat — full tombstone in under 60 seconds. Backups roll off in 7 days.", active: false },
  { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '03:40', text: "Last thing — I'll lock the GA launch checklist by Thursday and post it in #magic-minutes-launch. Anyone with risks, drop them in the thread before EOD Wednesday so we can triage live in Friday's review. That's it from me.", active: false },
];

const KLAS_BARS = [
  { left: 0, width: '5%' },
  { left: '8%', width: '3%' },
  { left: '15%', width: '3%' },
  { left: '35%', width: '14%' },
  { left: '55%', width: '5%' },
  { left: '65%', width: '20%' },
  { left: '90%', width: '7%' },
];

const HOWARD_BARS = [
  { left: 0, width: '5%' },
  { left: '8%', width: '3%' },
  { left: '15%', width: '3%' },
  { left: '25%', width: '3.5%' },
  { left: '33%', width: '7%' },
  { left: '45%', width: '3.5%' },
  { left: '53%', width: '5%' },
  { left: '63%', width: '5%' },
  { left: '73%', width: '3.5%' },
  { left: '80%', width: '17%' },
];

/* Icons as inline SVGs */
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 1V3M11 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 14C8 14 13 9.5 13 6.5C13 3.46 10.76 1 8 1C5.24 1 3 3.46 3 6.5C3 9.5 8 14 8 14Z" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M8 5V19L19 12L8 5Z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 2L7 9M14 2L10 14L7 9M14 2L2 6L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownSmall = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SidebarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 3V13" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 8.5L7.5 2V5.5C13 6.5 14.5 11 14.5 14C13 11 10 9.5 7.5 9.5V13L1 8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6.5 9.5L9.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9 11L11 9C12.1 7.9 12.1 6.1 11 5L11 5C9.9 3.9 8.1 3.9 7 5L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 5L5 7C3.9 8.1 3.9 9.9 5 11L5 11C6.1 12.1 7.9 12.1 9 11L11 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12V13H13V12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PopoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 3V2H14V10H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5 3V13M11 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TrimIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 3V13M11 3V13" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 6V10H5L9 13V3L5 6H2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M12 5.5C12.8 6.5 13.2 7.2 13.2 8C13.2 8.8 12.8 9.5 12 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const SpeedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 6V3H6M10 3H13V6M13 10V13H10M6 13H3V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Ruler builder */
function Ruler() {
  const items = [];
  const minutes = [1, 2, 3, 4, 5, 6];
  for (let m = 0; m < minutes.length; m++) {
    items.push(<div key={`d1-${m}`} className="mm-ruler-dot" />);
    items.push(<div key={`t-${m}`} className="mm-ruler-tick" />);
    items.push(<div key={`d2-${m}`} className="mm-ruler-dot" />);
    if (minutes[m]) {
      items.push(<span key={`l-${m}`} className="mm-ruler-label">{minutes[m]}m</span>);
    }
    items.push(<div key={`d3-${m}`} className="mm-ruler-dot" />);
    if (m < minutes.length - 1) {
      items.push(<div key={`t2-${m}`} className="mm-ruler-tick" />);
    }
  }
  return (
    <div className="mm-ruler">
      {items}
    </div>
  );
}

const TEMPLATES = [
  { id: 'auto', label: 'Auto' },
  { id: '1-1', label: 'One-on-One' },
  { id: 'team', label: 'Team Sync' },
  { id: 'standup', label: 'Stand-Up' },
  { id: 'kickoff', label: 'Project Kick Off' },
];

const TemplateAutoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L14.5 8L8 14.5L1.5 8L8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
const TemplateOneOnOneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="5.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="11" cy="6" r="1.7" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2 13C2 11 3.5 9.5 5.5 9.5C7.5 9.5 9 11 9 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M9.5 13C9.5 11.5 10.5 10.5 12 10.5C13.3 10.5 14 11.4 14 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const TemplateTeamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="3.5" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="12.5" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 13C4.5 11.2 6 9.5 8 9.5C10 9.5 11.5 11.2 11.5 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M1 12.5C1 11.2 1.8 10 3.3 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M15 12.5C15 11.2 14.2 10 12.7 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const TemplateStandupIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2 6.5H14" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 2V4M11 2V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const TemplateKickoffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M9.5 2.5C11.5 2.5 13.5 4.5 13.5 6.5L8 12L4 8L9.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="10" cy="6" r="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 12L2.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M3.5 8.5L2 9.5C2 11 3 12 4.5 12L5.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
const TemplateCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TEMPLATE_ICONS = {
  auto: TemplateAutoIcon,
  '1-1': TemplateOneOnOneIcon,
  team: TemplateTeamIcon,
  standup: TemplateStandupIcon,
  kickoff: TemplateKickoffIcon,
};

const TEMPLATE_LAYOUTS = {
  '1-1': [
    { type: 'brief', title: 'Call Brief', text: "Lexi and Howard ran their weekly 1:1 ahead of Magic Minutes GA. They walked through the EU residency timeline, Lexi's growth path into platform leadership, and Howard's expectations for the launch week." },
    { type: 'list', title: 'Updates', items: [
      "Whisper pipeline shipped behind the dogfood flag — moving onto cloud summarizer fallback this week.",
      "Speculative-decoding throughput on M4 Max tracking 2.4x — Inference Architecture Sync follow-up scheduled.",
      "EU residency unblocked — Frankfurt region provisioning starts Thursday.",
    ] },
    { type: 'list', title: 'Career & Growth', items: [
      "Howard endorsed Lexi for tech-lead scope across the inference stack post-launch.",
      "Goal: present platform roadmap to the board offsite in May.",
      "Read \"Staff Engineer\" by Tanya Reilly before next 1:1 — discuss the staff archetypes that fit the role.",
    ] },
    { type: 'list', title: 'Action Items', items: [
      "Howard to ratify Frankfurt region spend in Slack by EOD.",
      "Lexi to send the inference-stack roadmap doc by Friday.",
      "Schedule a working session with Klas on speculative-decoding evaluation harness.",
    ] },
  ],
  team: [
    { type: 'brief', title: 'Call Brief', text: "The Magic Minutes core team met to align on launch readiness. Engineering, design, and people-ops are all green for Friday's GA. Three cross-team blockers were resolved live; the team agreed on a 24-hour TTL default for confidential messages and locked the launch checklist for Thursday." },
    { type: 'list', title: 'Wins', items: [
      "On-device Whisper pipeline live behind dogfood flag.",
      "Stop & Shred privacy review passed legal.",
      "Activity-view onboarding flow approved for the launch tour.",
    ] },
    { type: 'list', title: 'Blockers', items: [
      "EU residency spend pending Howard's sign-off — unblocked in-meeting.",
      "Tokenizer alignment between draft and target — fix scoped to John Beutner.",
    ] },
    { type: 'list', title: 'Decisions', items: [
      "Default confidential messages to 24-hour TTL for launch.",
      "Auto-assign action items with one-click undo.",
      "Ship two compiled inference variants (M4 Max, M3 Pro) and runtime-switch.",
    ] },
    { type: 'list', title: 'Next Steps', items: [
      "Lock launch checklist by Thursday and post in #magic-minutes-launch.",
      "Triage launch risks live in Friday's review.",
      "Publish the new threading benchmark numbers in #ainbox-launch.",
    ] },
  ],
  standup: [
    { type: 'list', title: 'Yesterday', items: [
      "Lexi: Shipped on-device Whisper pipeline behind dogfood flag.",
      "Chelsea: Closed @MagicMinutes prompt-UI spec; got design sign-off on summary template variants.",
      "Grace: Drafted rollout comms; scheduled privacy review with legal.",
      "Howard: Approved EU residency spend; pinged top 10 enterprise accounts on the launch.",
    ] },
    { type: 'list', title: 'Today', items: [
      "Lexi: Wiring up the cloud summarizer fallback for meetings over 30 minutes.",
      "Chelsea: Reviewing summary template variants with design.",
      "Grace: Running privacy review with legal alongside Stop & Shred docs.",
      "Howard: Locking GA-week customer comms and demo-day script.",
    ] },
    { type: 'list', title: 'Blockers', items: [
      "Lexi: Needs a final call on EU residency day-one vs fast-follow — resolved in-meeting.",
      "Grace: Needs 30 minutes from Lexi on Stop & Shred deletion paths — scheduled for after standup.",
    ] },
  ],
  kickoff: [
    { type: 'brief', title: 'Project Brief', text: "Magic Minutes GA is the Q2 hero launch — AI meeting summarization native to every Roam call. The team will ship summaries, transcripts, action items, and a group chat per meeting, with on-device Whisper transcription and cloud summarization fallback for long calls." },
    { type: 'list', title: 'Goals', items: [
      "Ship Magic Minutes GA on Friday with EU residency on day one.",
      "Hit 60% adoption across active customers within 30 days of launch.",
      "Cut meeting note-taking time by 90% across the dogfood cohort.",
    ] },
    { type: 'list', title: 'Scope', items: [
      "Auto-summary, transcript, action items, group chat per meeting.",
      "Templates (Auto, 1:1, Team Sync, Stand-Up, Kick Off).",
      "Stop & Shred privacy controls and Magic PDF prompting.",
    ] },
    { type: 'list', title: 'Timeline', items: [
      "Mon: launch checklist live in #magic-minutes-launch.",
      "Wed EOD: launch risks triaged in the thread.",
      "Fri: GA goes live, customer comms ship, demo day.",
    ] },
    { type: 'list', title: 'Risks', items: [
      "Inference cost curve if model prices don't drop — mitigated by on-device Whisper.",
      "Sales-cycle drag from EU customers without residency — mitigated by day-one launch.",
      "Tokenizer alignment between draft and target models — owner: John Beutner.",
    ] },
    { type: 'list', title: 'Owners', items: [
      "Lexi — Inference architecture & on-device pipeline.",
      "Chelsea — Prompt UI, templates, summary variants.",
      "Grace — Privacy, legal, rollout comms.",
      "Howard — Customer comms and demo-day execution.",
    ] },
  ],
};

export function MagicMinutesBody({ meeting }) {
  const [activeTab, setActiveTab] = useState(meeting?.defaultTab || 'summary');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [templatesOpen, setTemplatesOpen] = useState(!!meeting?.defaultTemplatesOpen);
  const [activeTemplate, setActiveTemplate] = useState(meeting?.activeTemplate || 'auto');
  const timelineRef = useRef(null);
  const transcriptScrollRef = useRef(null);
  const activeEntryRef = useRef(null);
  const videoRefs = useRef([]);

  const title = meeting?.title || 'AI Standup';
  const whenLabel = meeting?.when || '9:30 AM - 9:45 AM';
  const calendarLabel = meeting?.calendarLabel || meeting?.title || 'Daily AI Standup';
  const locationLabel = meeting?.location || 'R&D';
  const audioOnly = !!meeting?.audioOnly;

  const briefText = meeting?.brief || "The AI team ran their daily standup ahead of the Magic Minutes GA launch. Lexi reported the on-device Whisper pipeline is shipped behind the dogfood flag and is moving onto the cloud summarizer fallback; Howard committed to EU residency on day one and approved the Frankfurt region spend. Chelsea closed the @MagicMinutes prompt UI spec and got a call from Howard to auto-assign action items with one-click undo. Grace is running privacy review with legal and confirmed Stop & Shred docs will publish alongside GA. Launch checklist locks Thursday with risks triaged in Friday's review.";

  const defaultNextSteps = [
    "Howard to approve Frankfurt region spend in Slack today so EU residency can ship on day one. 00:38",
    "Lexi to provision the EU bucket by Thursday and complete failover testing by Monday. 01:05",
    "Chelsea to ship @MagicMinutes prompt UI with auto-assigned action items and one-click undo. 01:19",
    "Lexi to send Grace the data-flow diagram covering Stop & Shred deletion paths after standup. 03:15",
    "Grace to complete privacy review with legal and publish Stop & Shred docs alongside GA. 02:34",
    "Chelsea to lock the GA launch checklist by Thursday and post in #magic-minutes-launch. 03:40",
    "Team to drop launch risks in the thread before EOD Wednesday for triage in Friday's review. 03:40",
  ];
  const nextSteps = meeting?.nextSteps?.length ? meeting.nextSteps : defaultNextSteps;
  const transcript = meeting?.transcript?.length ? meeting.transcript : TRANSCRIPT;

  const defaultSpeakers = [
    { name: 'Lexi Bohonnon',    role: 'Engineering',     color: '#46d08f', bars: KLAS_BARS },
    { name: 'Howard Lerman',    role: 'CEO, Roam',       color: '#4dd0e1', bars: HOWARD_BARS },
    { name: 'Grace Sutherland', role: 'Chief of People', color: '#ffb74d', bars: [
        { left: '3%', width: '8%' }, { left: '18%', width: '5%' }, { left: '30%', width: '10%' },
        { left: '48%', width: '4%' }, { left: '60%', width: '12%' }, { left: '82%', width: '6%' },
      ] },
    { name: 'Chelsea Turbin',   role: 'Product',         color: '#b39ddb', bars: [
        { left: '5%', width: '4%' }, { left: '14%', width: '6%' }, { left: '27%', width: '3%' },
        { left: '42%', width: '9%' }, { left: '58%', width: '5%' }, { left: '70%', width: '8%' },
        { left: '88%', width: '7%' },
      ] },
  ];
  const speakers = meeting?.speakers?.length ? meeting.speakers : defaultSpeakers;

  const duration = meeting?.duration || 228;
  const gridVideos = meeting?.gridVideos || (meeting?.gridFaces?.length ? null : DEFAULT_GRID_VIDEOS);

  const transcriptStarts = transcript.map((e) => parseTime(e.time));
  let activeIdx = -1;
  for (let i = 0; i < transcriptStarts.length; i++) {
    if (currentTime >= transcriptStarts[i]) activeIdx = i;
    else break;
  }

  useEffect(() => {
    const measure = () => {
      if (timelineRef.current) {
        setTimelineWidth(Math.max(0, timelineRef.current.clientWidth - 16));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (timelineRef.current) ro.observe(timelineRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setCurrentTime((t) => {
        const next = t + dt;
        if (next >= duration) return 0;
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, duration]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      if (isPlaying) v.play().catch(() => {});
      else v.pause();
    });
  }, [isPlaying, gridVideos]);

  useEffect(() => {
    if (activeTab !== 'transcript') return;
    const el = activeEntryRef.current;
    const scroller = transcriptScrollRef.current;
    if (!el || !scroller) return;
    const elTop = el.offsetTop;
    const elHeight = el.offsetHeight;
    const target = elTop - scroller.clientHeight / 2 + elHeight / 2;
    scroller.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [activeIdx, activeTab]);

  const handleX = duration > 0 ? (currentTime / duration) * timelineWidth : 0;

  const seekToClientX = (clientX) => {
    const container = timelineRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const max = Math.max(0, rect.width - 16);
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > max) x = max;
    const t = max > 0 ? (x / max) * duration : 0;
    setCurrentTime(t);
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
    seekToClientX(e.clientX);
    const onMove = (ev) => seekToClientX(ev.clientX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setIsPlaying(true);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTimelineClick = (e) => {
    if (e.target.closest('.mm-timeline-handle')) return;
    seekToClientX(e.clientX);
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  return (
    <div className={`mm-body ${audioOnly ? 'mm-body-audio-only' : ''}`}>
        {/* Left panel — Summary */}
        <div className="mm-left">
          <div className="mm-left-header">
            <div className="mm-left-header-left">
              <button
                type="button"
                className="mm-left-title-trigger"
                onClick={() => setTemplatesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={templatesOpen}
              >
                <span className="mm-left-title">{title}</span>
                <span className="mm-left-title-chevron"><ChevronDownSmall /></span>
              </button>
              {templatesOpen && (
                <>
                  <div className="mm-templates-backdrop" onClick={() => setTemplatesOpen(false)} />
                  <div className="mm-templates-menu" role="menu">
                    <div className="mm-templates-menu-header">Templates</div>
                    {TEMPLATES.map((t) => {
                      const isActive = activeTemplate === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`mm-templates-menu-item ${isActive ? 'mm-templates-menu-item-active' : ''}`}
                          onClick={() => { setActiveTemplate(t.id); setTemplatesOpen(false); }}
                        >
                          <span className="mm-templates-menu-label">{t.label}</span>
                          {isActive && <span className="mm-templates-menu-check"><TemplateCheckIcon /></span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="mm-left-tabs">
              <div
                className={`mm-left-tab ${activeTab === 'summary' ? 'mm-left-tab-active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </div>
              <div
                className={`mm-left-tab ${activeTab === 'transcript' ? 'mm-left-tab-active' : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                Transcript
              </div>
            </div>
          </div>

          {activeTab === 'summary' && (
            <div className="mm-summary">
              <div className="mm-meta">
                <div className="mm-meta-row">
                  <span className="mm-meta-icon"><img src="/icons/mm-clock.svg" alt="" width="16" height="16" /></span>
                  <span>{whenLabel}</span>
                </div>
                <div className="mm-meta-row">
                  <span className="mm-meta-icon"><img src="/icons/mm-calendar.svg" alt="" width="16" height="16" /></span>
                  <span>{calendarLabel}</span>
                </div>
                <div className="mm-meta-row">
                  <span className="mm-meta-icon"><img src="/icons/mm-location.svg" alt="" width="16" height="16" /></span>
                  <span>{locationLabel}</span>
                </div>
              </div>

              {(() => {
                const layout = TEMPLATE_LAYOUTS[activeTemplate];
                if (!layout) {
                  return (
                    <>
                      <div>
                        <p className="mm-brief-title">Call Brief</p>
                        <p className="mm-brief-text">{briefText}</p>
                      </div>
                      <div className="mm-separator" />
                      <div>
                        <p className="mm-steps-title">Next Steps</p>
                        <ul className="mm-steps-list">
                          {nextSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  );
                }
                return layout.map((section, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="mm-separator" />}
                    {section.type === 'brief' ? (
                      <div>
                        <p className="mm-brief-title">{section.title}</p>
                        <p className="mm-brief-text">{section.text}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="mm-steps-title">{section.title}</p>
                        <ul className="mm-steps-list">
                          {section.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </React.Fragment>
                ));
              })()}
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="mm-transcript" ref={transcriptScrollRef}>
              {transcript.map((entry, i) => {
                const isActive = i === activeIdx;
                return (
                  <div
                    key={i}
                    ref={isActive ? activeEntryRef : null}
                    className={`mm-transcript-entry ${isActive ? 'mm-transcript-entry-active' : ''}`}
                    onClick={() => setCurrentTime(parseTime(entry.time))}
                  >
                    <img src={entry.avatar} alt="" className="mm-transcript-avatar" />
                    <div className="mm-transcript-content">
                      <div className="mm-transcript-name">{entry.name}</div>
                      <p className="mm-transcript-text">
                        <span className="mm-transcript-time">{entry.time}</span>{' '}
                        {entry.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mm-ask">
            <div className="mm-ask-box">
              <span>Ask privately about the meeting</span>
              <span className="mm-ask-send"><img src="/icons/mm-send.svg" alt="" width="16" height="16" /></span>
            </div>
          </div>
        </div>

        {/* Right panel — Recording */}
        <div className="mm-right">
          {!audioOnly && (
            <div className="mm-video-area" onClick={togglePlay}>
              {meeting?.gridFaces?.length ? (
                <div className="mm-video-grid" data-count={meeting.gridFaces.length}>
                  {meeting.gridFaces.map((src, k) => (
                    <div key={k} className="mm-video-grid-cell">
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
              ) : gridVideos?.length ? (
                <div className="mm-video-grid" data-count={gridVideos.length}>
                  {gridVideos.map((p, k) => (
                    <div key={k} className="mm-video-grid-cell">
                      <video
                        ref={(el) => { videoRefs.current[k] = el; }}
                        src={p.video}
                        poster={p.poster}
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <img src="/icons/mm-video-placeholder.png" alt="" className="mm-video-placeholder" />
              )}
              {!isPlaying && (
                <div className="mm-play-btn">
                  <PlayIcon />
                </div>
              )}
            </div>
          )}

          <div className="mm-controls">
            <div className="mm-controls-left">
              <button className="mm-control-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                <img src={isPlaying ? '/icons/mm-pause.svg' : '/icons/mm-play.svg'} alt="" width="16" height="16" />
              </button>
              <span className="mm-controls-time">
                <span className="mm-controls-time-current">{formatTime(currentTime)} </span>
                <span className="mm-controls-time-total">/ {formatTime(duration)}</span>
              </span>
            </div>
            <div className="mm-controls-right">
              <button className="mm-control-btn"><img src="/icons/mm-trim.svg" alt="" width="16" height="16" /></button>
              <button className="mm-control-btn"><img src="/icons/mm-volume.svg" alt="" width="16" height="16" /></button>
              <button className="mm-control-btn"><img src="/icons/mm-stopwatch.svg" alt="" width="16" height="16" /></button>
              <button className="mm-control-btn"><img src="/icons/mm-arrow.svg" alt="" width="16" height="16" /></button>
            </div>
          </div>

          <div className="mm-timeline-section" ref={timelineRef} onMouseDown={handleTimelineClick}>
            <div
              className="mm-timeline-handle"
              style={{ left: handleX }}
              onMouseDown={handleDragStart}
            >
              <img src="/icons/mm-handle.svg" alt="" width="16" draggable={false} />
              <div className="mm-timeline-handle-line" />
            </div>
            <Ruler />
            <div className="mm-speakers">
              {speakers.map((s, idx) => (
                <div key={idx} className="mm-speaker">
                  <div className="mm-speaker-header">
                    <div className="mm-speaker-dot-wrap">
                      <div className="mm-speaker-dot" style={{ background: s.color }} />
                    </div>
                    <span className="mm-speaker-name">{s.name}</span>
                    <span className="mm-speaker-role">{s.role}</span>
                  </div>
                  <div className="mm-speaker-track">
                    {s.bars.map((b, i) => (
                      <div key={i} className="mm-speaker-bar" style={{ left: b.left, width: b.width, background: s.color }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

export default function MagicMinutes({ win, onDrag, meeting }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  useEffect(() => {
    if (win.closeRequestId) handleClose();
  }, [win.closeRequestId]);

  return (
    <div
      className={`mm-win ${!win.isFocused ? 'mm-win-unfocused' : ''} ${closing ? 'mm-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="mm-header" onMouseDown={onDrag}>
        <div className="mm-lights">
          <div className="mm-light mm-light-close" onClick={(e) => { e.stopPropagation(); handleClose(); }} />
          <div className="mm-light mm-light-min" />
          <div className="mm-light mm-light-max" />
        </div>

        <div className="mm-header-center">
          <div className="mm-search">
            <img src="/icons/mm-search.svg" alt="" width="16" height="16" />
            <span>Search</span>
          </div>
        </div>
      </div>

      <MagicMinutesBody meeting={meeting} />
    </div>
  );
}
