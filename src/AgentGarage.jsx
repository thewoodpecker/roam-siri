import React, { useEffect, useRef, useState } from 'react';
import ShowcaseMap from './ShowcaseMap';
import { AgentGarageWindow } from './AgentMap';
import { getAgentOrbDataUri } from './agentOrb.utils';
import AgentGlyph from './AgentGlyph';
import './MiniChat.css';
import './AInbox.css';
import './AgentGarage.css';

const AGENTS = [
  {
    id: 'designer', name: 'Design Agent', letter: 'D', color: '#C2185B',
    tag: 'Mockups & briefs', status: 'working', scope: 'personal',
    capabilities: [
      'Refines landing pages, marketing pages, and brand assets',
      'Generates A/B variants and explores nav, hero, and section ideas',
      'Maintains brand consistency across surfaces',
      'Hands off design tokens, components, and Figma frames',
    ],
    details: {
      title: 'ro.am landing refresh',
      summary: 'Iterating on the home hero, switching to the new brand wordmark, and prepping a few section variants for review.',
      recent: [
        { time: '6 min ago',  label: 'Shared hero variant D in your AInbox' },
        { time: '1 hr ago',   label: 'Polished nav using updated logo lockup' },
        { time: '2 hrs ago',  label: 'Imported the new brand color tokens' },
      ],
      inboxThread: 'Design Agent · ro.am refresh',
    },
  },
  {
    id: 'engineer', name: 'Engineering Agent', letter: 'E', color: '#835CE9',
    tag: 'PRs & code reviews', status: 'working', scope: 'shared',
    capabilities: [
      'Reviews pull requests end-to-end and flags risky changes',
      'Runs test suites locally and surfaces flaky tests',
      'Suggests refactors and small architecture improvements',
      'Auto-fixes lint, formatting, and trivial regressions',
    ],
    details: {
      title: 'PR #4812 — typing indicator ghost state',
      summary: 'Reviewing the typing indicator fix end-to-end: ran the test suite, traced the race condition, and queued comments for the author.',
      recent: [
        { time: '3 min ago',  label: 'Flagged flaky test: mm-thread-empty' },
        { time: '12 min ago', label: 'Approved 2 / 3 review comments' },
        { time: '25 min ago', label: 'Started PR #4812 review' },
      ],
      inboxThread: 'Engineering Agent · PR #4812',
    },
  },
  {
    id: 'pricing', name: 'Pricing Agent', letter: 'P', color: '#FFC107',
    tag: 'Influencer & deal pricing', status: 'working', scope: 'personal',
    capabilities: [
      'Builds rate cards and tiered pricing for deals or campaigns',
      'Cross-references public tier rates and recent campaign data',
      'Forecasts revenue impact under different pricing assumptions',
      'Surfaces creators or vendors who match a brief',
    ],
    details: {
      title: 'Q4 TikTok influencer rate sheet',
      summary: 'Mid-tier creators in food + lifestyle for the holiday push. Cross-referencing public tier rates, recent campaigns, and follower velocity.',
      recent: [
        { time: '6 min ago',  label: 'Drafted three-tier rate card' },
        { time: '20 min ago', label: 'Profiled 12 candidate creators' },
        { time: '1 hr ago',   label: 'Pulled campaign brief from AInbox' },
      ],
      inboxThread: 'Pricing Agent · Q4 TikTok rates',
    },
  },
  {
    id: 'writer', name: 'Writing Agent', letter: 'W', color: '#46D08F',
    tag: 'Meeting notes & drafts', status: 'working', scope: 'personal',
    capabilities: [
      'Drafts long-form documents from meeting recordings & transcripts',
      'Composes follow-up emails, status updates, and exec briefs',
      'Summarizes threads, decks, and research into clear narratives',
      'Maintains templates, glossaries, and tone for the team',
    ],
    details: {
      title: 'Q1 board update',
      summary: 'Compiling this morning’s exec sync into the Q1 board narrative. Working from the live transcript and last quarter’s metrics doc.',
      recent: [
        { time: '4 min ago',  label: 'Drafted Strategic Priorities section, v2' },
        { time: '18 min ago', label: 'Pulled meeting recording + transcript' },
        { time: '30 min ago', label: 'Indexed Q4 retro notes' },
      ],
      inboxThread: 'Writing Agent · Q1 board update',
    },
  },
  {
    id: 'sales', name: 'Sales Agent', letter: 'S', color: '#4DD0E1',
    tag: 'Leads & signals', status: 'idle', scope: 'shared',
    capabilities: [
      'Triages and routes inbound leads to the right rep',
      'Flags enterprise or high-intent signals for human review',
      'Sends follow-ups and reminders against your playbook',
      'Qualifies opportunities and updates the CRM',
    ],
    details: {
      title: 'Lead inbox',
      summary: 'Triaging inbound from the website, routing to the right rep, and flagging anything enterprise for human review.',
      recent: [
        { time: '8 min ago',  label: 'Routed @greenflag.io to Marcus' },
        { time: '22 min ago', label: 'Flagged 1 enterprise inquiry for review' },
        { time: '1 hr ago',   label: 'Closed loop on 3 cold contacts' },
        { time: 'This week',  label: '38 routed · 6 in triage' },
      ],
      inboxThread: 'Sales Agent · Lead inbox',
    },
  },
  {
    id: 'monitor', name: 'Monitoring Agent', letter: 'M', color: '#FF6F00',
    tag: 'Alerts & triggers', status: 'idle', scope: 'shared',
    capabilities: [
      'Watches deploy pipelines, error budgets, and latency dashboards',
      'Auto-resolves transient alerts and pings on-call when they aren’t',
      'Tracks SLO drift and surfaces emerging trends early',
      'Posts incident summaries into the AInbox',
    ],
    details: {
      title: 'Production health',
      summary: 'Watching deploy pipelines, error budgets, and latency dashboards. All systems are green over the last six hours.',
      recent: [
        { time: '12 min ago', label: 'Deploy d-2061 verified' },
        { time: '1 hr ago',   label: 'p95 latency dipped below 240ms' },
        { time: '3 hrs ago',  label: 'Auto-resolved alert on staging-eu' },
      ],
      inboxThread: 'Monitoring Agent · Production health',
    },
  },
];

const SAMPLE_THREADS = {
  designer: [
    { from: 'agent', text: 'Hey! 👋 I shared four hero variants for ro.am in your AInbox.' },
    { from: 'self',  text: 'Nice. Which one tested best?' },
    { from: 'agent', text: 'Variant D — the one with the wallpaper hero. Higher click-through on the “Sign in” CTA.' },
  ],
  engineer: [
    { from: 'agent', text: 'PR #4812 review queued. One flaky test: mm-thread-empty.' },
    { from: 'self',  text: 'Re-run it and tell me the failure mode.' },
    { from: 'agent', text: 'On it — running locally with --runs=20.' },
  ],
  pricing: [
    { from: 'agent', text: 'Q4 TikTok rate sheet draft ready. 12 mid-tier creators, three tiers.' },
    { from: 'self',  text: 'Did you cap CPM at $35?' },
    { from: 'agent', text: 'Yep — except two creators above the engagement threshold. Want me to include them?' },
  ],
  writer: [
    { from: 'agent', text: 'Drafted Strategic Priorities v2 from this morning’s sync.' },
    { from: 'self',  text: 'Tighten the EU residency section, it’s buried.' },
    { from: 'agent', text: 'Pulling it up. Will reframe as the lead bullet under Compliance.' },
  ],
  sales: [
    { from: 'agent', text: '12 leads routed today. One enterprise inquiry flagged for human review.' },
    { from: 'self',  text: 'Who’s the enterprise one?' },
    { from: 'agent', text: '@greenflag.io — they asked about SSO + custom retention. Routed to Marcus.' },
  ],
  monitor: [
    { from: 'agent', text: 'All clear on prod. p95 latency dipped under 240ms in the last hour.' },
    { from: 'self',  text: 'Anything weird on staging-eu?' },
    { from: 'agent', text: 'Auto-resolved alert at 14:02 UTC. Cause: brief upstream blip.' },
  ],
};

function agentAvatarUri(agent) {
  return getAgentOrbDataUri({ color: agent.color, name: agent.name });
}

function AgentMiniChat({ agent, position, onClose, onFocus, zIndex }) {
  // Unassigned agents (opened from the Agents room) start the thread with a
  // single rich agent bubble showing the capability prompt — i.e. the agent
  // is asking the user what to work on.
  const [messages, setMessages] = useState(() => {
    if (agent.unassigned) {
      return [{ id: 1, self: false, type: 'capabilities', capabilities: agent.capabilities || [] }];
    }
    const thread = SAMPLE_THREADS[agent.id] || [];
    return thread.map((m, i) => ({ id: i + 1, self: m.from === 'self', text: m.text }));
  });
  const [input, setInput] = useState('');
  const [pos, setPos] = useState(position);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    const id = Date.now();
    setMessages(prev => [...prev, { id, self: true, text: t }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: id + 1, self: false, text: 'Got it — let me look into that and report back.' }]);
    }, 700);
  };

  const handleDrag = (e) => {
    if (e.target.closest('.mc-light-close')) return;
    if (e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...pos };
    const onMove = (ev) => {
      setPos({ x: Math.max(0, startPos.x + ev.clientX - startX), y: Math.max(0, startPos.y + ev.clientY - startY) });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="mc-window"
      style={{ left: pos.x, top: pos.y, zIndex: zIndex || 30 }}
      onMouseDown={() => { onFocus?.(agent.id); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50); }}
    >
      <div className="mc-header" onMouseDown={handleDrag}>
        <div className="mc-traffic-lights">
          <button
            type="button"
            aria-label="Close"
            className="mc-light mc-light-close"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span aria-hidden="true" className="mc-light mc-light-minimize" />
          <span aria-hidden="true" className="mc-light mc-light-maximize" />
        </div>
        <div className="mc-header-center">
          <img src={agentAvatarUri(agent)} alt="" className="mc-header-avatar" />
          <span className="mc-header-name">{agent.name}</span>
        </div>
      </div>

      <div className="mc-body">
        <div className="mc-messages" ref={messagesRef}>
          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const isFirstInGroup = !prev || prev.self !== msg.self;
            const radiusIn  = isFirstInGroup ? '18px 18px 18px 4px' : '4px 18px 18px 4px';
            const radiusOut = isFirstInGroup ? '20px 20px 4px 20px' : '20px 4px 4px 20px';
            const isCaps = msg.type === 'capabilities';
            return (
              <div key={msg.id} className={`mc-msg ${msg.self ? 'mc-msg-self' : ''} ${!isFirstInGroup ? 'mc-msg-consecutive' : ''}`}>
                <div
                  className={`mc-msg-bubble ${msg.self ? 'mc-msg-bubble-self' : ''} ${isCaps ? 'agc-msg-capabilities' : ''}`}
                  style={{ borderRadius: msg.self ? radiusOut : radiusIn }}
                >
                  {isCaps ? (
                    <>
                      <div className="agc-prompt-title">What do you want me to do?</div>
                      <div className="agc-prompt-sub">Here are some things I'm good at</div>
                      {msg.capabilities?.length > 0 && (
                        <ul className="agc-capabilities">
                          {msg.capabilities.map((cap, idx) => (
                            <li key={idx} className="agc-capability">{cap}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ainbox-composer">
          <div className="ainbox-composer-box agc-composer-box">
            <div className="ainbox-composer-field">
              <input
                ref={inputRef}
                placeholder={agent.unassigned ? 'Tell me what to work on…' : 'Write a Message...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
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
                  title="Send"
                  onClick={send}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GaragePopup({ onClose, departments, onAgentClick }) {
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const draggingRef = useRef(false);

  const onTitlebarMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.am-light-close')) return;
    e.preventDefault();
    draggingRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { x: pos.x, y: pos.y };
    const onMove = (ev) => {
      if (!draggingRef.current) return;
      setPos({
        x: Math.max(0, startPos.x + ev.clientX - startX),
        y: Math.max(0, startPos.y + ev.clientY - startY),
      });
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="ag-garage-popup"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ControlRoomWindow
        onTitlebarMouseDown={onTitlebarMouseDown}
        onClose={onClose}
        departments={departments}
        onAgentClick={onAgentClick}
      />
    </div>
  );
}

// Roam-themed issues shown when "Issues" is selected in the sidebar.
const ROAM_ISSUE_PROJECTS = {
  app:    { name: 'Roam App',       color: '#46D08F' },
  site:   { name: 'Roam Site',      color: '#9C5CE9' },
  ainbox: { name: 'AInbox',         color: '#E91E63' },
  mm:     { name: 'Magic Minutes',  color: '#2196F3' },
};

const ROAM_ISSUES = [
  {
    id: 'ROAM-127',
    title: 'Add 24-hour Theater on-air recording playback',
    status: 'in-progress',
    project: ROAM_ISSUE_PROJECTS.app,
    assignee: { initials: 'CT', name: 'CTO' },
    live: true,
    started: 'Feb 25, 2026',
    created: 'Feb 25, 2026',
    updated: '6m ago',
    priority: 'Medium',
    description: "Here's the idea:\n\nWe should record any On-Air event in Theater for the full 24 hours after it ends, so people can scrub back. Storage budget is set, just need the playback UI on the Theater window — scrub bar, jump-to-reaction markers, share-clip button.",
    comments: [
      { from: 'You', initials: 'YO', date: 'Feb 25, 2026, 2:25 PM', body: "We already have a basic stub in /theater/recordings — we need full bidirectional scrubbing and a 24-hr trim window. Make sure the on-air tag flips back to off as soon as the event ends." },
      { from: 'CTO', initials: 'CT', date: 'Feb 25, 2026, 2:31 PM', body: "Picking this up. I'll wire up the scrub bar first, then layer the reaction markers on top. Pulling waveform from Magic Minutes' transcription pipeline so we don't double-encode." },
      { from: 'CMO', initials: 'CM', date: 'Feb 25, 2026, 2:48 PM', body: "Can we make sure the shareable clip embeds with our brand frame? The Q1 launch deck has examples of the look." },
    ],
    runs: [
      { id: '9f7d5857', agent: 'CTO', initials: 'CT', state: 'running', output: 'Waiting for run output…' },
    ],
  },
  {
    id: 'ROAM-126',
    title: 'Build Magic Minutes per-room mute toggle',
    status: 'todo',
    project: ROAM_ISSUE_PROJECTS.mm,
    assignee: null,
    started: null,
    created: 'Feb 25, 2026',
    updated: '1h ago',
    priority: 'Low',
    description: "When a user mutes Magic Minutes inside a meeting room, only that room's transcription should pause. Right now the toggle is global. Behavior should mirror the per-room On-Air toggle.",
    comments: [],
    runs: [],
  },
  {
    id: 'ROAM-8',
    title: 'Deploy AInbox push notifications to production',
    status: 'blocked',
    project: ROAM_ISSUE_PROJECTS.ainbox,
    assignee: null,
    started: null,
    created: 'Feb 20, 2026',
    updated: '2d ago',
    priority: 'High',
    description: 'Web push works in staging. Blocked on legal review of the notification copy + the new privacy disclosure. Owner: legal@roam.',
    comments: [],
    runs: [],
  },
  {
    id: 'ROAM-45',
    title: 'Plan the Roam Garage launch announcement',
    status: 'blocked',
    project: ROAM_ISSUE_PROJECTS.site,
    assignee: null,
    started: null,
    created: 'Feb 21, 2026',
    updated: '4d ago',
    priority: 'Medium',
    description: 'Blocked on the AI Control Room being feature-complete. Once that ships, we draft the launch post + Theater event.',
    comments: [],
    runs: [],
  },
];

const ISSUE_STATUS_META = {
  'in-progress': { label: 'In Progress', color: '#FFC107' },
  'todo':        { label: 'Todo',        color: '#2196F3' },
  'blocked':     { label: 'Blocked',     color: '#FF453A' },
};

function IssueStatusIcon({ status, size = 14 }) {
  const meta = ISSUE_STATUS_META[status];
  if (!meta) return null;
  const r = size / 2 - 1.2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} stroke={meta.color} strokeWidth="1.4" />
    </svg>
  );
}

function IssuesList({ issues, onIssueClick }) {
  const order = ['in-progress', 'todo', 'blocked'];
  const grouped = order.reduce((acc, s) => ({ ...acc, [s]: issues.filter(i => i.status === s) }), {});
  return (
    <>
      <div className="cr-main-toolbar">
        <button type="button" className="cr-toolbar-btn cr-toolbar-btn-primary">
          <span className="cr-toolbar-btn-plus" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          New Issue
        </button>
        <div className="cr-toolbar-spacer" />
        <button type="button" className="cr-toolbar-btn cr-toolbar-btn-icon" aria-label="List view">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <button type="button" className="cr-toolbar-btn cr-toolbar-btn-icon" aria-label="Board view">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2.5" y="2.5" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="9.5" y="2.5" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </button>
        <button type="button" className="cr-toolbar-btn cr-toolbar-btn-active">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2.5h8L7 6.5v3l-2 1V6.5L2 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
          Filters: 1
          <span className="cr-toolbar-btn-x">✕</span>
        </button>
        <button type="button" className="cr-toolbar-btn">↑↓ Sort</button>
        <button type="button" className="cr-toolbar-btn">≡ Group</button>
      </div>
      <div className="cr-issues-list">
        {order.map(status => (
          <section key={status} className="cr-issues-group">
            <div className="cr-issues-group-head">
              <span className="cr-issues-group-name">{ISSUE_STATUS_META[status].label.toUpperCase()}</span>
              <button type="button" className="cr-issues-group-add" aria-label="Add issue">+</button>
            </div>
            {grouped[status].map((issue, idx) => (
              <button
                type="button"
                key={issue.id}
                className={`cr-issues-row ${idx > 0 ? 'cr-issues-row-bordered' : ''}`}
                onClick={() => onIssueClick(issue)}
              >
                <IssueStatusIcon status={issue.status} />
                <span className="cr-issues-id">{issue.id}</span>
                <span className="cr-issues-title">{issue.title}</span>
                <span className="cr-issues-row-spacer" />
                <span className="cr-issues-assignee">
                  {issue.assignee ? (
                    <>
                      <span className="cr-issues-assignee-avatar">{issue.assignee.initials}</span>
                      <span className="cr-issues-assignee-name">{issue.assignee.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="cr-issues-assignee-avatar cr-issues-assignee-empty" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1"/><path d="M2 9c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5" stroke="currentColor" strokeWidth="1"/></svg>
                      </span>
                      <span className="cr-issues-assignee-name cr-issues-assignee-name-empty">Assignee</span>
                    </>
                  )}
                </span>
                {issue.live && (
                  <span className="cr-issues-live">
                    <span className="cr-issues-live-dot" /> Live
                  </span>
                )}
                <span className="cr-issues-date">{issue.created}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

function IssueDetail({ issue, onBack }) {
  const [propsOpen, setPropsOpen] = useState(true);
  return (
    <div className={`cr-issue-detail ${propsOpen ? '' : 'cr-issue-detail-no-props'}`}>
      <div className="cr-issue-main">
        <div className="cr-issue-head">
          <IssueStatusIcon status={issue.status} size={16} />
          <span className="cr-issue-id">— {issue.id}</span>
          <span className="cr-issue-project">
            <span className="cr-issue-project-dot" style={{ background: issue.project.color }} />
            {issue.project.name}
          </span>
          <div className="cr-issue-head-spacer" />
          <button type="button" className="cr-issue-more" aria-label="More" onClick={onBack}>⋯</button>
        </div>
        <h2 className="cr-issue-title">{issue.title}</h2>
        <div className="cr-issue-desc">
          {issue.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <div className="cr-issue-section">
          <div className="cr-issue-section-head">
            <span className="cr-issue-section-label">Attachments</span>
            <button type="button" className="cr-toolbar-btn cr-issue-attach-btn">📎 Upload image</button>
          </div>
          <div className="cr-issue-attach-empty">No attachments yet.</div>
        </div>
        {issue.runs.length > 0 && (
          <div className="cr-issue-runs">
            <div className="cr-issue-runs-head">
              <span className="cr-issue-runs-title"><span className="cr-issue-runs-dot" /> Live issue runs ({issue.runs.length})</span>
              <span className="cr-issue-runs-spacer" />
              <span className="cr-issue-stop"><span className="cr-issue-stop-dot" /> Stop</span>
              <a className="cr-issue-runs-link">Open run ↗</a>
            </div>
            <pre className="cr-issue-runs-output">{issue.runs[0].output}</pre>
            <div className="cr-issue-runs-foot">
              <span className="cr-issue-stop"><span className="cr-issue-stop-dot" /> Stop</span>
              <span className="cr-issue-runs-agent">
                <span className="cr-issue-runs-agent-avatar">{issue.runs[0].initials}</span>
                {issue.runs[0].agent}
                <code className="cr-issue-runs-hash">{issue.runs[0].id}</code>
                <span>↗</span>
              </span>
            </div>
          </div>
        )}
        <div className="cr-issue-tabs">
          <button type="button" className="cr-issue-tab cr-issue-tab-active">💬 Comments</button>
          <button type="button" className="cr-issue-tab">≡ Sub-issues</button>
          <button type="button" className="cr-issue-tab">~ Activity</button>
        </div>
        <div className="cr-issue-comments">
          <div className="cr-issue-comments-count">Comments ({issue.comments.length})</div>
          {issue.comments.map((c, i) => (
            <div key={i} className="cr-issue-comment">
              <div className="cr-issue-comment-head">
                <span className="cr-issue-comment-avatar">{c.initials}</span>
                <span className="cr-issue-comment-author">{c.from}</span>
                <span className="cr-issue-comment-spacer" />
                <span className="cr-issue-comment-date">{c.date}</span>
              </div>
              <div className="cr-issue-comment-body">{c.body}</div>
            </div>
          ))}
        </div>
      </div>
      {propsOpen && (
        <aside className="cr-issue-properties">
          <div className="cr-issue-properties-head">
            <span className="cr-issue-properties-title">Properties</span>
            <button type="button" className="cr-issue-properties-close" onClick={() => setPropsOpen(false)} aria-label="Close properties">✕</button>
          </div>
          <div className="cr-issue-properties-list">
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Status</span>
              <span className="cr-issue-prop-value">
                <IssueStatusIcon status={issue.status} size={14} />
                {ISSUE_STATUS_META[issue.status].label}
              </span>
            </div>
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Priority</span>
              <span className="cr-issue-prop-value cr-issue-prop-muted">— {issue.priority}</span>
            </div>
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Labels</span>
              <span className="cr-issue-prop-value cr-issue-prop-muted">⌖ No labels</span>
            </div>
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Assignee</span>
              <span className="cr-issue-prop-value">
                {issue.assignee ? (
                  <>
                    <span className="cr-issues-assignee-avatar">{issue.assignee.initials}</span>
                    {issue.assignee.name} ↗
                  </>
                ) : (
                  <span className="cr-issue-prop-muted">No assignee</span>
                )}
              </span>
            </div>
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Project</span>
              <span className="cr-issue-prop-value">
                <span className="cr-issue-project-dot" style={{ background: issue.project.color }} />
                {issue.project.name} ↗
              </span>
            </div>
            <div className="cr-issue-prop-divider" />
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Started</span>
              <span className="cr-issue-prop-value">{issue.started || '—'}</span>
            </div>
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Created</span>
              <span className="cr-issue-prop-value">{issue.created}</span>
            </div>
            <div className="cr-issue-prop">
              <span className="cr-issue-prop-label">Updated</span>
              <span className="cr-issue-prop-value">{issue.updated}</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

// Personal agents — own by an individual, opened from the toolbar pill.
// Each agent has its own session list (idle / working) and a prompt
// surface for kicking off a new run.
const PERSONAL_AGENT_LIST = [
  {
    id: 'pricing',
    name: 'Pricing Agent',
    iconIndex: 13,
    color: '#FFC107',
    sessions: [
      {
        id: 's1', name: 'we need to price out te...', state: 'idle',
        messages: [
          { from: 'user',  text: 'we need to price out the team plan upgrade — what do you think we should charge?' },
          { from: 'agent', thought: 'Thought for 3s', text: 'For a team plan that includes the AI Control Room + per-seat agent pool, I\'d anchor at **$28/seat/mo** annual, **$32/seat/mo** monthly. Reasoning:\n\n- Comp set: Linear ($16/seat for the work-tracking core), Notion ($20 for AI plan), Zoom Team Chat ($21).\n- Roam adds the AI Control Room + agent pool — that\'s the differentiator. Premium 25–30% over the work-tracking comp set is defensible.\n- $28 × 12 = $336/seat/yr → keeps annual prepay attractive while leaving room for usage-based add-ons later.' },
          { from: 'user',  text: 'how does that look against the SMB conversion forecast?' },
          { from: 'agent', thought: 'Thought for 5s', text: 'Forecast says **38% of SMB free trials** convert at $28/seat. That\'s within +/-2% of the $24 anchor we modeled in Q3. The drop-off concentrates at the 5-seat boundary — teams of 4 convert at 51%, teams of 6+ at 33%. Suggests the team plan should include a small per-seat discount past 5 seats.' },
        ],
      },
      {
        id: 's2', name: 'what do you think?', state: 'idle',
        messages: [
          { from: 'user',  text: 'what do you think? worth shipping the new tier this quarter?' },
          { from: 'agent', thought: 'Thought for 4s', text: 'Yes — but only if the AI Control Room is the headline. Otherwise it reads as a price hike. Bundling the agent pool + Control Room into a clear "AI" tier upgrade gives the sales team a story.' },
        ],
      },
      {
        id: 's3', name: '5/5/2026, 11:21:38 AM', state: 'idle',
        messages: [],
      },
    ],
  },
  {
    id: 'task-friend',
    name: 'Task Friend',
    iconIndex: 19,
    color: '#46D08F',
    sessions: [
      {
        id: 't1', name: 'Sweep this morning\'s sync', state: 'working',
        messages: [
          { from: 'user',  text: 'sweep this morning\'s sync and pull action items' },
          { from: 'agent', thought: 'Thought for 4s', text: 'Got it. Pulled the recording + transcript. Three action items landed:\n\n- **Joe**: finalize the Magic Minutes 2.0 launch checklist by Friday.\n- **Howard**: schedule Q1 board prep with Rob and Jeff before next week.\n- **Klas**: ship the Drop-In knock animation fix to staging today.\n\nWant me to push these to your AInbox or open issues in the Control Room?' },
          { from: 'user',  text: 'open issues' },
        ],
      },
    ],
  },
];

// Sample files in the user's personal "agent project". The kind drives
// the preview rendering — text shows a TEXT badge, chart-bar renders a
// mini bar chart, table shows a small data grid, pdf shows a
// document-style preview with a PDF badge.
const PERSONAL_FILES = [
  { id: 'price-increase', name: 'Price Increase', desc: '2 lines', kind: 'text' },
  { id: 'sales-process',  name: 'Sales Process',  desc: '1 line',  kind: 'text' },
  { id: 'the-goal',       name: 'The Goal',       desc: '1 line',  kind: 'text' },
  { id: 'q1-forecast',    name: 'Q1 Forecast',    desc: 'chart',   kind: 'chart-blue',
    bars: [4, 7, 5, 8, 6, 9, 7, 10, 8, 11, 9, 12] },
  { id: 'daily-users',    name: 'Daily Users',    desc: 'chart',   kind: 'chart-green',
    bars: [3, 5, 4, 6, 5, 7, 8, 6, 9, 7, 10, 8, 11, 9, 12, 10, 13, 11, 14, 12] },
  { id: 'measure-values', name: 'Measure Values', desc: 'table',   kind: 'table' },
  { id: 'onboarding-pipeline', name: 'Onboarding Pipeline', desc: 'pdf', kind: 'pdf' },
];

function FilesView() {
  return (
    <div className="pa-files">
      <div className="pa-files-head">
        <h3 className="pa-files-title">Files</h3>
        <button type="button" className="pa-files-upload">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 9.5V2M7 2L3.5 5.5M7 2l3.5 3.5M2.5 11.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Upload file</span>
        </button>
      </div>
      <div className="pa-files-grid">
        {PERSONAL_FILES.map(f => (
          <div key={f.id} className="pa-file">
            <div className="pa-file-name">{f.name}</div>
            <div className="pa-file-meta">{f.desc}</div>
            <div className={`pa-file-preview pa-file-preview-${f.kind}`}>
              {f.kind === 'text' && <span className="pa-file-badge">TEXT</span>}
              {f.kind === 'pdf' && (
                <>
                  <div className="pa-file-pdf-lines" aria-hidden="true">
                    {Array.from({ length: 9 }).map((_, i) => <div key={i} />)}
                  </div>
                  <span className="pa-file-badge">PDF</span>
                </>
              )}
              {(f.kind === 'chart-blue' || f.kind === 'chart-green') && (
                <svg className="pa-file-chart" viewBox={`0 0 ${f.bars.length * 8} 48`} preserveAspectRatio="none">
                  {f.bars.map((v, i) => (
                    <rect
                      key={i}
                      x={i * 8 + 1}
                      y={48 - v * 3.2}
                      width={6}
                      height={v * 3.2}
                      fill={f.kind === 'chart-blue' ? '#3B82F6' : '#22C55E'}
                      rx={1}
                    />
                  ))}
                </svg>
              )}
              {f.kind === 'table' && (
                <div className="pa-file-table" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, r) => (
                    <div key={r} className="pa-file-table-row">
                      {Array.from({ length: 5 }).map((_, c) => (
                        <span key={c} className="pa-file-table-cell" />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalAgentsPopup({ onClose, rooms, currentRoomId, onRoomChange, pinnedAgentIds, onTogglePin }) {
  const [pos, setPos] = useState({ x: 80, y: 60 });
  const draggingRef = useRef(false);

  const onTitlebarMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.pa-light-close, button, input, textarea')) return;
    e.preventDefault();
    draggingRef.current = true;
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...pos };
    const onMove = (ev) => {
      if (!draggingRef.current) return;
      setPos({
        x: Math.max(0, startPos.x + ev.clientX - startX),
        y: Math.max(0, startPos.y + ev.clientY - startY),
      });
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className="pa-popup"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <PersonalAgentsWindow
        onTitlebarMouseDown={onTitlebarMouseDown}
        onClose={onClose}
        rooms={rooms}
        currentRoomId={currentRoomId}
        onRoomChange={onRoomChange}
        pinnedAgentIds={pinnedAgentIds}
        onTogglePin={onTogglePin}
      />
    </div>
  );
}

function PersonalAgentsWindow({ onTitlebarMouseDown, onClose, rooms, currentRoomId, onRoomChange, pinnedAgentIds = [], onTogglePin }) {
  // Per-room state — agents (with their sessions) keyed by roomId so
  // switching rooms via the dropdown preserves any sessions/messages the
  // user added in each room.
  const [agentsByRoom, setAgentsByRoom] = useState(() => {
    const map = {};
    rooms.forEach(r => { map[r.id] = r.agents; });
    return map;
  });
  const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0];
  const baseAgents = agentsByRoom[currentRoom.id] || [];

  // For the Personal room only: append shared agents the user has pinned.
  // Pinned entries are looked up across all dept rooms so they keep their
  // original color/iconIndex.
  const pinnedAgents = currentRoom.id === 'personal'
    ? pinnedAgentIds
        .map(id => {
          for (const r of rooms) {
            if (r.id === 'personal') continue;
            const a = (agentsByRoom[r.id] || r.agents).find(x => x.id === id);
            if (a) return a;
          }
          return null;
        })
        .filter(Boolean)
    : [];
  const agents = currentRoom.id === 'personal' ? [...baseAgents, ...pinnedAgents] : baseAgents;
  const setAgents = (updater) => {
    setAgentsByRoom(prev => ({
      ...prev,
      [currentRoom.id]: typeof updater === 'function' ? updater(prev[currentRoom.id] || []) : updater,
    }));
  };

  const [selectedId, setSelectedId] = useState(agents[0]?.id);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [draft, setDraft] = useState('');
  const [composerScrolled, setComposerScrolled] = useState(false);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [addAgentMenuOpen, setAddAgentMenuOpen] = useState(false);
  // Personal-room only: when 'files' view is active, the entire body
  // (sidebar + main pane) is replaced with the FilesView component.
  const [view, setView] = useState('agent');
  const messagesRef = useRef(null);

  // When the room changes (via dropdown OR external click), reset selection
  // to that room's first agent and clear the active session.
  useEffect(() => {
    const list = currentRoom.id === 'personal' ? [...(agentsByRoom[currentRoom.id] || []), ...pinnedAgents] : (agentsByRoom[currentRoom.id] || []);
    setSelectedId(list[0]?.id);
    setSelectedSessionId(null);
    setView('agent');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoom.id]);

  // When the room changes, selectedId is briefly stale (still the prior
  // room's agent) until the effect below runs. Fall back to the first
  // agent in the current room so selected is always defined.
  const selected = agents.find(a => a.id === selectedId) || agents[0];

  // Auto-scroll to the bottom whenever the active session's messages change.
  const activeMessages = selected?.sessions.find(s => s.id === selectedSessionId)?.messages || [];
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [activeMessages.length, selectedSessionId]);

  // Toggle a class on the composer bar once messages scroll under it, so we
  // can show a hairline border-top only when there's content behind it.
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const update = () => {
      setComposerScrolled(el.scrollHeight - el.clientHeight > 1);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [selectedSessionId, selectedId]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');

    if (selectedSessionId) {
      // Append to the active session.
      setAgents(prev => prev.map(a => a.id !== selectedId ? a : ({
        ...a,
        sessions: a.sessions.map(s => s.id !== selectedSessionId ? s : ({
          ...s,
          state: 'working',
          messages: [...s.messages, { from: 'user', text }],
        })),
      })));
      // Simulated agent response.
      setTimeout(() => {
        setAgents(prev => prev.map(a => a.id !== selectedId ? a : ({
          ...a,
          sessions: a.sessions.map(s => s.id !== selectedSessionId ? s : ({
            ...s,
            state: 'idle',
            messages: [...s.messages, { from: 'agent', thought: 'Thought for 2s', text: "Got it — picking that up now. I'll surface anything that needs a decision back to you here." }],
          })),
        })));
      }, 1400);
      return;
    }

    // No session selected — spin up a new one with the prompt as its first
    // message and select it.
    const newId = `s-${Date.now()}`;
    const trimmedTitle = text.length > 32 ? text.slice(0, 32) + '…' : text;
    const newSession = {
      id: newId,
      name: trimmedTitle,
      state: 'working',
      messages: [{ from: 'user', text }],
    };
    setAgents(prev => prev.map(a => a.id !== selectedId ? a : ({
      ...a,
      sessions: [newSession, ...a.sessions],
    })));
    setSelectedSessionId(newId);
    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id !== selectedId ? a : ({
        ...a,
        sessions: a.sessions.map(s => s.id !== newId ? s : ({
          ...s,
          state: 'idle',
          messages: [...s.messages, { from: 'agent', thought: 'Thought for 3s', text: "On it. I'll set up the work and report back here." }],
        })),
      })));
    }, 1400);
  };

  const onComposerKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="pa-window" onMouseDown={(e) => e.stopPropagation()}>
      <div className="pa-titlebar" onMouseDown={onTitlebarMouseDown} style={{ cursor: 'grab' }}>
        <div className="pa-traffic">
          <button
            type="button"
            aria-label="Close"
            className="pa-light pa-light-close"
            onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
          />
          <span className="pa-light pa-light-min" />
          <span className="pa-light pa-light-max" />
        </div>
        <button
          type="button"
          className="pa-title pa-title-dropdown"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setRoomMenuOpen(v => !v)}
        >
          <span>{currentRoom.id === 'personal' ? 'Personal Agents' : currentRoom.name}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2.5 4l2.5 2.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {roomMenuOpen && (
          <>
            <div
              className="pa-room-menu-backdrop"
              onMouseDown={(e) => { e.stopPropagation(); setRoomMenuOpen(false); }}
            />
            <div className="pa-room-menu" onMouseDown={(e) => e.stopPropagation()}>
              {rooms.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className="pa-room-menu-item"
                  onClick={() => { onRoomChange(r.id); setRoomMenuOpen(false); }}
                >
                  <span className="pa-room-menu-label">{r.id === 'personal' ? 'Personal Agents' : r.name}</span>
                  {r.id === currentRoom.id && (
                    <svg className="pa-room-menu-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="pa-body">
        <div className="pa-tabs-row">
        <div className="pa-tabs">
          {currentRoom.id === 'personal' && (
            <button
              type="button"
              className={`pa-tab pa-tab-files ${view === 'files' ? 'pa-tab-active' : ''}`}
              onClick={() => setView('files')}
            >
              <span className="pa-tab-emoji" aria-hidden="true">
                <span
                  className="pa-tab-folder"
                  style={{ WebkitMaskImage: 'url(/icons/folder.svg)', maskImage: 'url(/icons/folder.svg)' }}
                />
              </span>
              <span className="pa-tab-name">Files</span>
            </button>
          )}
          {agents.map(a => {
            const isPersonal = PERSONAL_AGENT_LIST.some(p => p.id === a.id);
            return (
            <button
              key={a.id}
              type="button"
              className={`pa-tab ${a.id === selectedId && view === 'agent' ? 'pa-tab-active' : ''}`}
              onClick={() => { setSelectedId(a.id); setSelectedSessionId(null); setView('agent'); }}
            >
              <span
                className="pa-tab-emoji"
                style={{ color: isPersonal ? 'var(--icon-primary)' : a.color }}
                aria-hidden="true"
              >
                <AgentGlyph index={a.iconIndex} size={14} />
              </span>
              <span className="pa-tab-name">{a.name}</span>
            </button>
            );
          })}
          </div>
          <button
            type="button"
            className="pa-tab-add"
            aria-label="Add agent"
            onClick={() => setAddAgentMenuOpen(v => !v)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          {addAgentMenuOpen && currentRoom.id === 'personal' && (
            <>
              <div className="pa-room-menu-backdrop" onClick={() => setAddAgentMenuOpen(false)} />
              <div className="pa-room-menu pa-add-agent-menu">
                {rooms.filter(r => r.id !== 'personal').flatMap(r =>
                  (agentsByRoom[r.id] || r.agents).map(a => ({ ...a, _roomName: r.name }))
                ).map(a => {
                  const pinned = pinnedAgentIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="pa-room-menu-item pa-add-agent-item"
                      onClick={() => onTogglePin(a.id)}
                    >
                      <span className="pa-add-agent-glyph" style={{ color: a.color }} aria-hidden="true">
                        <AgentGlyph index={a.iconIndex} size={14} />
                      </span>
                      <span className="pa-room-menu-label">{a.name}</span>
                      <span className="pa-add-agent-room">{a._roomName}</span>
                      {pinned && (
                        <svg className="pa-room-menu-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {view === 'files' ? <FilesView /> : (
        <div className="pa-content">
          <aside className="pa-sidebar">
            <button
              type="button"
              className="pa-sidebar-head"
              onClick={() => setSelectedSessionId(null)}
            >
              <span className="pa-sidebar-head-plus" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="pa-sidebar-head-label">New Session</span>
            </button>
            {selected.sessions.map(s => (
              <button
                key={s.id}
                type="button"
                className={`pa-session pa-session-row ${selectedSessionId === s.id ? 'pa-session-active' : ''}`}
                onClick={() => setSelectedSessionId(s.id)}
              >
                <span className="pa-session-name">{s.name}</span>
                <span className={`pa-session-tag pa-session-tag-${s.state}`}>{s.state}</span>
              </button>
            ))}
          </aside>
          <main className="pa-main">
            {selectedSessionId ? (
              <div className="pa-chat">
                <div className="pa-messages" ref={messagesRef}>
                  {(selected.sessions.find(s => s.id === selectedSessionId)?.messages || []).map((m, i) => (
                    m.from === 'user' ? (
                      <div key={i} className="pa-msg pa-msg-user">
                        <div className="pa-msg-bubble">{m.text}</div>
                      </div>
                    ) : (
                      <div key={i} className="pa-msg pa-msg-agent">
                        {m.thought && (
                          <div className="pa-msg-thought">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 1.5a3 3 0 0 0-1.6 5.5v1.4h3.2V7a3 3 0 0 0-1.6-5.5z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round"/>
                              <path d="M4.6 9.4h2.8M5 10.5h2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
                            </svg>
                            {m.thought}
                          </div>
                        )}
                        <div className="pa-msg-body">
                          {m.text.split('\n\n').map((para, idx) => (
                            <p key={idx} dangerouslySetInnerHTML={{
                              __html: para
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n- /g, '<br>• '),
                            }} />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
                <div className={`pa-chat-composer-bar ${composerScrolled ? 'pa-chat-composer-bar-scrolled' : ''}`}>
                  <div className="pa-chat-composer">
                  <div className="pa-input">
                    <button type="button" className="pa-input-icon" aria-label="Add attachment">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="text"
                      className="pa-input-field"
                      placeholder="Ask anything…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onComposerKey}
                    />
                    <button
                      type="button"
                      className="pa-send-icon"
                      disabled={!draft.trim()}
                      onClick={sendMessage}
                      aria-label="Send"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 14.5V3.5M9 3.5L4 8.5M9 3.5l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="pa-prompt">
              <h3 className="pa-prompt-title">What should the agent work on?</h3>
              <div className="pa-composer">
                <textarea
                  className="pa-composer-text"
                  placeholder="Describe the work…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onComposerKey}
                  rows={3}
                />
                <div className="pa-composer-bar">
                  <button type="button" className="pa-composer-icon" aria-label="Add attachment">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <div className="pa-composer-bar-end">
                    <button type="button" className="pa-composer-model" aria-haspopup="listbox">
                      <span className="pa-composer-model-name">Opus 4.7</span>
                      <span className="pa-composer-model-mode">Adaptive</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="pa-send-icon"
                      disabled={!draft.trim()}
                      onClick={sendMessage}
                      aria-label="Send"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 14.5V3.5M9 3.5L4 8.5M9 3.5l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pa-prompt-spacer" aria-hidden="true" />
            </div>
            )}
          </main>
        </div>
        )}
      </div>
    </div>
  );
}

// Detail view shown in the Control Room's main pane when an agent is
// clicked from the agents list.
function AgentDetail({ agent }) {
  return (
    <div className="cr-agent-detail">
      <div className="cr-agent-detail-main">
        <div className="cr-agent-detail-head">
          <span className="cr-agent-detail-mark" style={{ '--agent-color': agent.deptColor }} aria-hidden="true">
            <AgentGlyph index={agent.iconIndex} size={28} className="cr-agent-detail-mark-icon" />
          </span>
          <div className="cr-agent-detail-titles">
            <div className="cr-agent-detail-meta">
              <span className="cr-agent-detail-dept" style={{ color: agent.deptColor }}>
                <span className="cr-agent-detail-dept-dot" style={{ background: agent.deptColor }} />
                {agent.deptName}
              </span>
              <span className="cr-agent-detail-status">
                <span className="cr-agent-detail-status-dot" /> Working
              </span>
            </div>
            <h2 className="cr-agent-detail-name">{agent.name}</h2>
          </div>
        </div>
        {agent.summary && (
          <div className="cr-agent-detail-summary">{agent.summary}</div>
        )}
        {agent.capabilities?.length > 0 && (
          <div className="cr-agent-detail-section">
            <div className="cr-agent-detail-section-label">Capabilities</div>
            <ul className="cr-agent-detail-capabilities">
              {agent.capabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="cr-agent-detail-section">
          <div className="cr-agent-detail-section-label">Recent activity</div>
          <ul className="cr-agent-detail-activity">
            <li>
              <span className="cr-agent-detail-activity-time">6 min ago</span>
              <span>Posted update to AInbox</span>
            </li>
            <li>
              <span className="cr-agent-detail-activity-time">42 min ago</span>
              <span>Completed run · agent <code>9f7d5857</code></span>
            </li>
            <li>
              <span className="cr-agent-detail-activity-time">2 hr ago</span>
              <span>Started run from CTO</span>
            </li>
          </ul>
        </div>
        <div className="cr-agent-detail-actions">
          <button type="button" className="cr-toolbar-btn cr-toolbar-btn-primary">Open chat</button>
          <button type="button" className="cr-toolbar-btn">Edit instructions</button>
        </div>
      </div>
    </div>
  );
}

// Static org tree shown when "Org" is selected in the sidebar. Agents
// alternate between Claude and Codex so both brands show up.
const ORG_TREE = {
  name: 'CEO', role: 'CEO', agent: 'Claude', icon: 'crown',
  children: [
    { name: 'COO',  role: 'Chief Operating Officer',  agent: 'Codex',  icon: 'briefcase' },
    { name: 'CMO',  role: 'Chief Marketing Officer',  agent: 'Claude', icon: 'globe' },
    {
      name: 'CTO', role: 'Chief Technology Officer', agent: 'Codex', icon: 'doc',
      children: [
        { name: 'ClaudeCoder', role: 'Software Engineer',          agent: 'Claude', icon: 'code' },
        { name: 'CodexCoder',  role: 'Software Engineer (Codex)',  agent: 'Codex',  icon: 'code' },
      ],
    },
  ],
};

function OrgIcon({ name }) {
  const stroke = 'currentColor';
  if (name === 'crown') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 5l2 6h8l2-6-3 2-3-4-3 4-3-2z" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
  if (name === 'briefcase') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="8" rx="1.5" stroke={stroke} strokeWidth="1.2"/>
      <path d="M6 5V3.5A1 1 0 0 1 7 2.5h2a1 1 0 0 1 1 1V5" stroke={stroke} strokeWidth="1.2"/>
    </svg>
  );
  if (name === 'globe') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={stroke} strokeWidth="1.2"/>
      <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" stroke={stroke} strokeWidth="1.2"/>
    </svg>
  );
  if (name === 'doc') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h6l4 4v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9 2v4h4" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
  if (name === 'code') return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

function OrgCard({ node, x, y }) {
  return (
    <div className="cr-org-card" style={{ left: x, top: y }}>
      <div className="cr-org-card-mark">
        <OrgIcon name={node.icon} />
      </div>
      <div className="cr-org-card-body">
        <div className="cr-org-card-name">{node.name}</div>
        <div className="cr-org-card-role">{node.role}</div>
        <div className="cr-org-card-agent">{node.agent}</div>
      </div>
    </div>
  );
}

// Hard-coded layout — simple 3-row org tree with line connectors. The
// canvas is pannable: click+drag the empty space to translate the chart.
function OrgChart() {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const onPanStart = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.cr-org-card, .cr-org-controls')) return;
    e.preventDefault();
    draggingRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    const onMove = (ev) => {
      if (!draggingRef.current) return;
      setPan({
        x: startRef.current.px + ev.clientX - startRef.current.x,
        y: startRef.current.py + ev.clientY - startRef.current.y,
      });
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Card centers (used to draw SVG connectors).
  const CARD_W = 200;
  const CARD_H = 88;
  const positions = {
    ceo:    { x: 400 - CARD_W / 2, y: 30  },
    coo:    { x: 110,              y: 200 },
    cmo:    { x: 330,              y: 200 },
    cto:    { x: 550,              y: 200 },
    claude: { x: 460,              y: 380 },
    codex:  { x: 680,              y: 380 },
  };
  const center = (p) => ({ x: p.x + CARD_W / 2, y: p.y + CARD_H / 2 });
  const ceo = center(positions.ceo);
  const coo = center(positions.coo);
  const cmo = center(positions.cmo);
  const cto = center(positions.cto);
  const claude = center(positions.claude);
  const codex = center(positions.codex);

  const ceoBottom    = positions.ceo.y + CARD_H;
  const midTop       = positions.coo.y;
  const midBranchY   = (ceoBottom + midTop) / 2;

  const ctoBottom    = positions.cto.y + CARD_H;
  const leafTop      = positions.claude.y;
  const leafBranchY  = (ctoBottom + leafTop) / 2;

  return (
    <div className="cr-org-canvas" onMouseDown={onPanStart}>
      <div className="cr-org-pan" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        <svg className="cr-org-lines" viewBox="0 0 920 500" preserveAspectRatio="xMidYMid meet">
          <line x1={ceo.x} y1={ceoBottom} x2={ceo.x} y2={midBranchY} stroke="var(--border)" strokeWidth="1" />
          <line x1={coo.x} y1={midBranchY} x2={cto.x} y2={midBranchY} stroke="var(--border)" strokeWidth="1" />
          <line x1={coo.x} y1={midBranchY} x2={coo.x} y2={midTop}    stroke="var(--border)" strokeWidth="1" />
          <line x1={cmo.x} y1={midBranchY} x2={cmo.x} y2={midTop}    stroke="var(--border)" strokeWidth="1" />
          <line x1={cto.x} y1={midBranchY} x2={cto.x} y2={midTop}    stroke="var(--border)" strokeWidth="1" />
          <line x1={cto.x} y1={ctoBottom} x2={cto.x} y2={leafBranchY} stroke="var(--border)" strokeWidth="1" />
          <line x1={claude.x} y1={leafBranchY} x2={codex.x} y2={leafBranchY} stroke="var(--border)" strokeWidth="1" />
          <line x1={claude.x} y1={leafBranchY} x2={claude.x} y2={leafTop} stroke="var(--border)" strokeWidth="1" />
          <line x1={codex.x}  y1={leafBranchY} x2={codex.x}  y2={leafTop} stroke="var(--border)" strokeWidth="1" />
        </svg>
        <OrgCard node={ORG_TREE} x={positions.ceo.x} y={positions.ceo.y} />
        <OrgCard node={ORG_TREE.children[0]} x={positions.coo.x} y={positions.coo.y} />
        <OrgCard node={ORG_TREE.children[1]} x={positions.cmo.x} y={positions.cmo.y} />
        <OrgCard node={ORG_TREE.children[2]} x={positions.cto.x} y={positions.cto.y} />
        <OrgCard node={ORG_TREE.children[2].children[0]} x={positions.claude.x} y={positions.claude.y} />
        <OrgCard node={ORG_TREE.children[2].children[1]} x={positions.codex.x} y={positions.codex.y} />
      </div>
      <div className="cr-org-controls">
        <button type="button" className="cr-org-control" aria-label="Zoom in" onClick={(e) => e.stopPropagation()}>+</button>
        <button type="button" className="cr-org-control" aria-label="Zoom out" onClick={(e) => e.stopPropagation()}>−</button>
        <button type="button" className="cr-org-control cr-org-control-fit" onClick={(e) => { e.stopPropagation(); setPan({ x: 0, y: 0 }); }}>Fit</button>
      </div>
    </div>
  );
}

// Linear-style window listing every agent in the AI Control Room. Sidebar
// navigates departments; main pane shows grouped agent rows or org chart.
function ControlRoomWindow({ onTitlebarMouseDown, onClose, departments, onAgentClick }) {
  const [view, setView] = useState('agents'); // 'agents' | 'org' | 'issues'
  const [selectedDept, setSelectedDept] = useState(null); // null = All
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const showBack = !!(selectedIssue || selectedAgent);
  const handleBack = () => { setSelectedIssue(null); setSelectedAgent(null); };
  const visible = selectedDept
    ? departments.filter(d => d.name === selectedDept)
    : departments;
  const total = departments.reduce((n, d) => n + d.agents.length, 0);

  return (
    <div className="cr-window" onMouseDown={(e) => e.stopPropagation()}>
      <div className="cr-titlebar" onMouseDown={onTitlebarMouseDown} style={{ cursor: 'grab' }}>
        <div className="cr-traffic">
          <button
            type="button"
            aria-label="Close"
            className="cr-light cr-light-close am-light-close"
            onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
          />
          <span className="cr-light cr-light-min" />
          <span className="cr-light cr-light-max" />
        </div>
        {showBack && (
          <button
            type="button"
            className="cr-back-btn"
            onClick={(e) => { e.stopPropagation(); handleBack(); }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Back"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="cr-title">AI Control Room</div>
        <div className="cr-titlebar-spacer" />
      </div>
      <div className="cr-body">
        <aside className="cr-sidebar">
          <div className="cr-sidebar-section">
            <div className="cr-sidebar-section-head">
              <span className="cr-sidebar-section-label">PROJECTS</span>
              <button type="button" className="cr-sidebar-section-add" aria-label="Add project">+</button>
            </div>
            <button type="button" className="cr-sidebar-item">
              <span className="cr-sidebar-dot" style={{ background: '#E91E63' }} aria-hidden="true" />
              <span className="cr-sidebar-item-name">Documentation</span>
            </button>
            <button type="button" className="cr-sidebar-item">
              <span className="cr-sidebar-dot" style={{ background: '#2196F3' }} aria-hidden="true" />
              <span className="cr-sidebar-item-name">ClipHub</span>
            </button>
            <button type="button" className="cr-sidebar-item">
              <span className="cr-sidebar-dot" style={{ background: '#46D08F' }} aria-hidden="true" />
              <span className="cr-sidebar-item-name">App</span>
            </button>
            <button type="button" className="cr-sidebar-item">
              <span className="cr-sidebar-dot" style={{ background: '#9C5CE9' }} aria-hidden="true" />
              <span className="cr-sidebar-item-name">Website</span>
            </button>
          </div>

          <div className="cr-sidebar-section">
            <div className="cr-sidebar-section-head">
              <span className="cr-sidebar-section-label">WORK</span>
            </div>
            <button
              type="button"
              className={`cr-sidebar-item ${view === 'issues' ? 'cr-sidebar-item-active' : ''}`}
              onClick={() => { setView('issues'); setSelectedIssue(null); }}
            >
              <span className="cr-sidebar-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="8" cy="8" r="1.6" fill="currentColor"/>
                </svg>
              </span>
              <span className="cr-sidebar-item-name">Issues</span>
            </button>
            <button type="button" className="cr-sidebar-item">
              <span className="cr-sidebar-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                </svg>
              </span>
              <span className="cr-sidebar-item-name">Goals</span>
            </button>
          </div>

          <div className="cr-sidebar-section">
            <div className="cr-sidebar-section-head">
              <span className="cr-sidebar-section-label">AGENTS</span>
            </div>
            <button
              type="button"
              className={`cr-sidebar-item ${view === 'agents' && selectedDept === null ? 'cr-sidebar-item-active' : ''}`}
              onClick={() => { setView('agents'); setSelectedDept(null); }}
            >
              <span className="cr-sidebar-dot" style={{ background: 'var(--text-secondary)' }} aria-hidden="true" />
              <span className="cr-sidebar-item-name">All Agents</span>
              <span className="cr-sidebar-item-count">{total}</span>
            </button>
            {departments.map(dept => (
              <button
                key={dept.name}
                type="button"
                className={`cr-sidebar-item ${view === 'agents' && selectedDept === dept.name ? 'cr-sidebar-item-active' : ''}`}
                onClick={() => { setView('agents'); setSelectedDept(dept.name); }}
              >
                <span className="cr-sidebar-dot" style={{ background: dept.color }} aria-hidden="true" />
                <span className="cr-sidebar-item-name">{dept.name}</span>
                <span className="cr-sidebar-item-count">{dept.agents.length}</span>
              </button>
            ))}
          </div>

          <div className="cr-sidebar-section">
            <div className="cr-sidebar-section-head">
              <span className="cr-sidebar-section-label">COMPANY</span>
            </div>
            <button
              type="button"
              className={`cr-sidebar-item ${view === 'org' ? 'cr-sidebar-item-active' : ''}`}
              onClick={() => setView('org')}
            >
              <span className="cr-sidebar-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="3.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="12.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 4.5v3.5m0 0H4.5m3.5 0h3.5m-7 0v2.5m7-2.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="cr-sidebar-item-name">Org</span>
            </button>
          </div>
        </aside>
        <main className="cr-main">
          {selectedAgent ? (
            <AgentDetail agent={selectedAgent} />
          ) : view === 'org' ? (
            <OrgChart />
          ) : view === 'issues' ? (
            selectedIssue ? (
              <IssueDetail issue={selectedIssue} onBack={() => setSelectedIssue(null)} />
            ) : (
              <IssuesList issues={ROAM_ISSUES} onIssueClick={setSelectedIssue} />
            )
          ) : (
            <>
          <div className="cr-main-toolbar">
            <button type="button" className="cr-toolbar-btn cr-toolbar-btn-primary">
              <span className="cr-toolbar-btn-plus" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
              New Agent
            </button>
            <div className="cr-toolbar-spacer" />
            <button type="button" className="cr-toolbar-btn">Filters</button>
            <button type="button" className="cr-toolbar-btn">Sort</button>
            <button type="button" className="cr-toolbar-btn">Group</button>
          </div>
          <div className="cr-list">
            {visible.map(dept => (
              <section key={dept.name} className="cr-list-group">
                <div className="cr-list-group-head">
                  <span className="cr-list-group-name">{dept.name}</span>
                  <span className="cr-list-group-count">{dept.agents.length}</span>
                </div>
                {dept.agents.map(agent => (
                  <button
                    type="button"
                    key={agent.name}
                    className="cr-list-row"
                    onClick={() => setSelectedAgent({ ...agent, deptColor: dept.color, deptName: dept.name })}
                  >
                    <span className="cr-row-mark" style={{ '--agent-color': dept.color }} aria-hidden="true">
                      <AgentGlyph index={agent.iconIndex} size={14} className="cr-row-mark-icon-svg" />
                    </span>
                    <span className="cr-row-id">{agent.letter}</span>
                    <span className="cr-row-name">{agent.name}</span>
                    <span className="cr-row-summary">{agent.summary}</span>
                    <span className="cr-row-status">
                      <span className="cr-row-status-dot" />
                      Working
                    </span>
                  </button>
                ))}
              </section>
            ))}
          </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// 20 agents grouped into 5 departments for the Agent Workroom.
// Colors are chosen per-department so the squircles read as a cohort.
const DEPT_AGENTS = [
  {
    name: 'Support',
    color: '#FF6F00',
    agents: [
      { name: 'Customer Onboarding', letter: 'CO', task: 'Day-3 nudges · 4 customers',           status: 'working' },
      { name: 'Support Manager',     letter: 'SM', task: 'Triaging 6 open tickets',              status: 'working' },
      { name: 'Referral Analyzer',   letter: 'RA', task: 'Cohort lift — November referrals',     status: 'idle'    },
    ],
  },
  {
    name: 'Marketing',
    color: '#C2185B',
    agents: [
      { name: 'X Scanner',              letter: 'XS', task: 'Watching @ro_am · 12 mentions',     status: 'working' },
      { name: 'TikTok Pricing Analyzer',letter: 'TP', task: 'Q4 creator rate sheet',             status: 'working' },
      { name: 'G2 Review Notification', letter: 'G2', task: 'New 5★ — flagged for amplify',      status: 'working', attention: 'New review' },
      { name: 'Reddit Scanner',         letter: 'RS', task: 'r/productivity · 3 hot threads',    status: 'working' },
      { name: 'Blog Post Generator',    letter: 'BG', task: 'Drafting "Drop-In, deeper"',        status: 'working' },
      { name: 'Keyword Researcher',     letter: 'KR', task: '"ai meeting notes" cluster',        status: 'idle'    },
    ],
  },
  {
    name: 'Sales',
    color: '#4DD0E1',
    agents: [
      { name: 'Sales Coordinator', letter: 'SC', task: '38 routed · 6 in triage',                status: 'idle', attention: 'New lead' },
      { name: 'Meeting Analyzer',  letter: 'MA', task: 'Win/loss across 14 calls',               status: 'working' },
      { name: 'Meeting Coach',     letter: 'MC', task: 'Coaching Q1 reps · 3 sessions',          status: 'working' },
    ],
  },
  {
    name: 'R&D',
    color: '#835CE9',
    agents: [
      { name: 'Build Manager',     letter: 'BM', task: 'Watching CI · 3 in queue',                status: 'working' },
      { name: 'Alert Triage',      letter: 'AT', task: '1 fired alert · staging-eu',              status: 'working', attention: 'New alert' },
      { name: 'Bug Investigator',  letter: 'BI', task: 'Reproducing #4812 ghost state',           status: 'working' },
      { name: 'Code Reviewer',     letter: 'CR', task: 'Reviewing 2 PRs · 18 comments',           status: 'working' },
      { name: 'RFC Drafter',       letter: 'RD', task: 'Drafting RFC: meeting-room grid v3',      status: 'working' },
    ],
  },
  {
    name: 'HR',
    color: '#46D08F',
    agents: [
      { name: 'Employee Onboarding',    letter: 'EO', task: 'Day-1 kit for 2 hires',              status: 'working' },
      { name: 'Resume Triage',          letter: 'RT', task: '38 candidates · 6 to highlight',     status: 'working' },
      { name: 'Recruiting Coordinator', letter: 'RC', task: 'Scheduling 9 interviews',            status: 'idle'    },
    ],
  },
];

// Agents inside the AI Control Room — grouped by department. Each agent
// renders as a small square tile (initials, dept-colored bg) with a hover
// popover showing its summary + capabilities.
const CONTROL_ROOM_DEPTS = [
  {
    name: 'Support', color: '#FF6F00',
    agents: [
      { name: 'Customer Onboarding', summary: 'Welcomes new customers and runs first-week setup.', capabilities: ['Day-1 setup checklist', 'Activation nudges', 'First-week health checks'] },
      { name: 'Support Manager',     summary: 'Triages tickets and routes to specialists.',         capabilities: ['Ticket triage + routing', 'SLA breach alerts', 'Sentiment escalation'] },
      { name: 'Referral Analyzer',   summary: 'Tracks referral cohorts and channel lift.',          capabilities: ['Cohort lift tracking', 'Channel attribution', 'Top-referrer leaderboards'] },
    ],
  },
  {
    name: 'Marketing', color: '#C2185B',
    agents: [
      { name: 'Lead Researcher',         summary: 'Profiles inbound accounts and surfaces signal.', capabilities: ['Account profiling', 'Buying-intent signals', 'Org chart enrichment'] },
      { name: 'Content Drafter',         summary: 'Drafts on-brand long-form content from briefs.', capabilities: ['Blog + launch drafts', 'Tone matched to brand', 'Headline A/B variants'] },
      { name: 'Social Manager',          summary: 'Plans + posts across social platforms.',         capabilities: ['Multi-platform scheduler', 'Optimal-time picker', 'Engagement analytics'] },
      { name: 'X Scanner',               summary: 'Watches X for brand + competitor mentions.',     capabilities: ['Brand-mention watchlist', 'Competitor signals', 'Sentiment tagging'] },
      { name: 'TikTok Pricing Analyzer', summary: 'Builds rate cards from creator data.',           capabilities: ['Creator rate cards', 'Tiered pricing models', 'Campaign forecasting'] },
      { name: 'G2 Review Notification',  summary: 'Surfaces new G2 reviews and flags to amplify.',  capabilities: ['Watch G2 reviews', 'Sentiment scoring', 'Amplification flags'] },
      { name: 'Reddit Scanner',          summary: 'Monitors relevant subreddits for hot threads.',  capabilities: ['Subreddit watchlist', 'Hot-thread alerts', 'Audience insights'] },
      { name: 'Blog Post Generator',     summary: 'Drafts long-form posts from briefs.',            capabilities: ['Long-form drafts', 'SEO outlines', 'Internal-link suggestions'] },
      { name: 'Web Traffic Analyzer',    summary: 'Reports on traffic + funnel performance.',       capabilities: ['Funnel analytics', 'Source attribution', 'Drop-off insights'] },
      { name: 'Keyword Researcher',      summary: 'Builds keyword clusters and intent maps.',       capabilities: ['Keyword clusters', 'Search intent grouping', 'Competitive gap analysis'] },
    ],
  },
  {
    name: 'Sales', color: '#4DD0E1',
    agents: [
      { name: 'Sales Coordinator', summary: 'Routes leads and keeps pipeline hygiene.',     capabilities: ['Lead routing', 'Pipeline hygiene', 'Enterprise-flag escalation'] },
      { name: 'Meeting Analyzer',  summary: 'Win/loss analysis on recorded calls.',          capabilities: ['Win/loss analysis', 'Talk-time ratios', 'Objection patterns'] },
      { name: 'Meeting Coach',     summary: 'Coaches reps with feedback after calls.',       capabilities: ['Post-call feedback', 'Talk-track suggestions', 'Coaching plans'] },
    ],
  },
  {
    name: 'R&D', color: '#835CE9',
    agents: [
      { name: 'Build Manager',     summary: 'Watches CI, queues retries, flags flaky builds.', capabilities: ['CI watching', 'Auto-retry flakes', 'Build trend reports'] },
      { name: 'Alert Triage',      summary: 'Triages prod alerts, pages on-call when needed.', capabilities: ['Alert triage', 'On-call paging', 'Auto-resolve transients'] },
      { name: 'Bug Investigator',  summary: 'Reproduces bug reports and isolates root cause.', capabilities: ['Bug reproduction', 'Root-cause analysis', 'Regression hunting'] },
      { name: 'Code Reviewer',     summary: 'Reviews PRs end-to-end with comments.',           capabilities: ['PR review', 'Style + safety checks', 'Test-coverage flags'] },
      { name: 'RFC Drafter',       summary: 'Drafts technical RFCs from project notes.',       capabilities: ['RFC drafting', 'Architecture proposals', 'Trade-off analysis'] },
    ],
  },
  {
    name: 'HR', color: '#46D08F',
    agents: [
      { name: 'Employee Onboarding',    summary: 'Day-1 kits + scheduling for new hires.',     capabilities: ['Day-1 setup kits', 'IT provisioning', 'Welcome scheduling'] },
      { name: 'Resume Triage',          summary: 'Screens incoming resumes, ranks by fit.',    capabilities: ['Resume screening', 'Fit scoring', 'Highlight summary'] },
      { name: 'Recruiting Coordinator', summary: 'Schedules interviews + manages pipeline.',   capabilities: ['Interview scheduling', 'Candidate pipeline', 'Feedback aggregation'] },
    ],
  },
];

// Seed sessions per workroom agent so dept rooms aren't empty on first
// open. State of `working` shows the agent is mid-task; `idle` shows a
// completed thread the user can scroll back through.
const WORKROOM_SESSIONS = {
  // ── Support ──────────────────────────────────────────────────────────
  'Customer Onboarding': [
    { id: 'co-1', name: 'Acme welcome flow', state: 'working',
      messages: [
        { from: 'user',  text: 'Acme just signed — kick off their week-1 onboarding plan.' },
        { from: 'agent', thought: 'Thought for 3s', text: 'On it. Pulled their seat list (12) and admin contacts. Day-1 emails go out at 8am ET tomorrow with their workspace URL + one-click setup. I\'ll watch activation through Friday and ping you if any seats stall.' },
      ],
    },
    { id: 'co-2', name: 'Brightline first-week health', state: 'idle',
      messages: [
        { from: 'user',  text: 'How is Brightline tracking on activation?' },
        { from: 'agent', thought: 'Thought for 2s', text: '8/10 seats activated, 2 stalled at SSO. I sent a nudge with a Loom walkthrough — both should land by EOD. Their workspace usage is 2.3× the cohort median for week 1.' },
      ],
    },
    { id: 'co-3', name: 'Day-1 checklist refresh', state: 'idle', messages: [] },
  ],
  'Support Manager': [
    { id: 'sm-1', name: 'SLA breach roll-up', state: 'working',
      messages: [
        { from: 'user',  text: 'Anything breaching SLA right now?' },
        { from: 'agent', thought: 'Thought for 1s', text: 'Three tickets within 30 min of breach: TKT-2841 (Magic Minutes export), TKT-2849 (knock dialog stuck on iOS 17), TKT-2855 (calendar sync 401). Routed all three to the on-call engineer + flagged the iOS one as P1.' },
      ],
    },
    { id: 'sm-2', name: 'Friday triage', state: 'idle',
      messages: [
        { from: 'user',  text: 'Sweep this week\'s ticket backlog and group by theme.' },
        { from: 'agent', thought: 'Thought for 5s', text: 'Top themes (62 tickets):\n- **Theater playback** (18) — most resolved by the v3.4 fix.\n- **AInbox sync** (14) — points to a token refresh edge case, see TKT-2811.\n- **Magic Minutes share** (10) — already in the Friday hotfix.\n- **Misc** (20) — handled inline.' },
      ],
    },
  ],
  'Referral Analyzer': [
    { id: 'ra-1', name: 'Q1 channel lift', state: 'idle',
      messages: [
        { from: 'user',  text: 'Which referral channel had the biggest lift in Q1?' },
        { from: 'agent', thought: 'Thought for 4s', text: 'Customer-to-customer DMs (in-product invite) drove **34% of new signups**, up from 18% in Q4. Twitter/X mentions held steady at 22%. The new "invite a teammate" prompt added in March is the largest single contributor — 2.1× lift on that surface alone.' },
      ],
    },
    { id: 'ra-2', name: 'Top referrer dashboard', state: 'working', messages: [
      { from: 'user', text: 'Build a leaderboard of our top 25 referrers this quarter.' },
    ] },
  ],

  // ── Marketing ────────────────────────────────────────────────────────
  'Lead Researcher': [
    { id: 'lr-1', name: 'Series-B fintechs to target', state: 'idle',
      messages: [
        { from: 'user',  text: 'Find me 20 series-B fintechs that match our ICP and have remote-first cultures.' },
        { from: 'agent', thought: 'Thought for 7s', text: 'Pulled 23 from Crunchbase + LinkedIn. Top 5 by fit score:\n- **Mercury** (1,200 employees, 92% remote)\n- **Ramp** (1,800, hybrid w/ remote-friendly engineering)\n- **Pilot** (~600, fully remote)\n- **Brex** (1,100, hybrid)\n- **Modern Treasury** (~400, remote-first)\nFull list w/ contacts in the attached CSV.' },
      ],
    },
    { id: 'lr-2', name: 'Acme intent signals', state: 'working',
      messages: [
        { from: 'user',  text: 'Acme keeps showing up in our docs traffic — pull intent signals.' },
        { from: 'agent', thought: 'Thought for 6s', text: 'Tracked 48 Acme employees viewing /pricing and /security in the last 14 days. Three of them visited the integrations docs >5 times each — looks like an evaluation in progress. Suggesting a warm outreach to their VP Eng (Mira Patel) with a security-focused pitch.' },
      ],
    },
    { id: 'lr-3', name: 'Org-chart enrichment', state: 'idle', messages: [] },
  ],
  'Content Drafter': [
    { id: 'cd-1', name: 'Drop-In meetings launch post', state: 'idle',
      messages: [
        { from: 'user',  text: 'Draft the launch post for Drop-In meetings. Tone: confident, casual.' },
        { from: 'agent', thought: 'Thought for 8s', text: '**Title options:**\n1. "Drop in. Don\'t schedule."\n2. "The end of \'Got 5 minutes?\'"\n3. "Knock first, then talk."\n\nDraft body in the attached doc. Hooked the intro to the calendar-fatigue stat we used in the Q4 deck. Three CTA placements; final one nudges toward a free-trial signup.' },
      ],
    },
    { id: 'cd-2', name: 'AInbox case study', state: 'working',
      messages: [
        { from: 'user',  text: 'Spin up a case study from the Spotify AInbox usage data.' },
      ],
    },
    { id: 'cd-3', name: 'Newsletter — May edition', state: 'idle', messages: [] },
  ],
  'Social Manager': [
    { id: 'sm-1', name: 'This week\'s schedule', state: 'idle',
      messages: [
        { from: 'user',  text: 'Lay out the social schedule for the week of May 12.' },
        { from: 'agent', thought: 'Thought for 3s', text: '7 posts queued across X/LinkedIn:\n- Mon 9am ET: Drop-In launch teaser\n- Tue 11am: customer quote (Brightline)\n- Wed 2pm: short product demo (Theater)\n- Thu 9am: design-team thread\n- Fri 4pm: weekend recap\nAll auto-published; I\'ll pause if engagement drops 30% below baseline.' },
      ],
    },
    { id: 'sm-2', name: 'Engagement dip on X', state: 'working',
      messages: [
        { from: 'user',  text: 'Engagement on X dropped 40% last week — what changed?' },
      ],
    },
  ],
  'X Scanner': [
    { id: 'xs-1', name: 'Competitor mentions today', state: 'idle',
      messages: [
        { from: 'user',  text: 'What are people saying about us vs Loom on X right now?' },
        { from: 'agent', thought: 'Thought for 2s', text: '47 mentions in the last 24h. Sentiment:\n- 64% positive (mostly Magic Minutes praise)\n- 12% negative (3 complaints about iOS knock animation)\n- 24% neutral comparisons\nLoom mentions skewing more negative this week — pricing change pushback. Worth a comparison post.' },
      ],
    },
    { id: 'xs-2', name: 'Brand-mention watchlist', state: 'working', messages: [
      { from: 'user', text: 'Add @sahilbloom and @swyx to the watchlist.' },
    ] },
  ],
  'TikTok Pricing Analyzer': [
    { id: 'tk-1', name: 'Creator rate card v2', state: 'idle',
      messages: [
        { from: 'user',  text: 'Refresh our creator rate card with last quarter\'s data.' },
        { from: 'agent', thought: 'Thought for 5s', text: 'Updated tiers:\n- Micro (10–50k): $1.2k–$2.5k flat + 1.5% rev share\n- Mid (50–250k): $3k–$8k + 2% rev share\n- Top (250k+): negotiate, base $12k floor\nFloor moved up 8% from Q4 due to category competition. Ready to share with the partnerships team.' },
      ],
    },
    { id: 'tk-2', name: 'May campaign forecast', state: 'working', messages: [
      { from: 'user', text: 'Forecast reach for the May 6 creators we just signed.' },
    ] },
  ],
  'G2 Review Notification': [
    { id: 'g2-1', name: '5★ from Mercury — amplify?', state: 'idle',
      messages: [
        { from: 'user',  text: 'New 5★ G2 review from Mercury came in.' },
        { from: 'agent', thought: 'Thought for 1s', text: 'Yes — review highlights Magic Minutes specifically. Drafted a quote card and a thread thread variant. Suggested amplification: LinkedIn (best fit for B2B fintech), with the customer-success team\'s permission. Want me to queue it?' },
      ],
    },
  ],
  'Reddit Scanner': [
    { id: 'rs-1', name: 'r/remotework hot thread', state: 'working',
      messages: [
        { from: 'user',  text: 'Anything popping in r/remotework today?' },
        { from: 'agent', thought: 'Thought for 4s', text: 'One thread at 1.2k upvotes asking "what\'s the best video tool that doesn\'t feel like a meeting?" — three top comments mention us by name (positive). Two suggest Loom. Worth a CMO-level chime-in; drafting a non-promotional reply that leans into the Drop-In angle.' },
      ],
    },
  ],
  'Blog Post Generator': [
    { id: 'bg-1', name: '"How async DMs save meetings" draft', state: 'idle',
      messages: [
        { from: 'user',  text: 'Draft a 1,500-word post on how AInbox async DMs reduce meeting load.' },
        { from: 'agent', thought: 'Thought for 9s', text: 'Outline + draft attached. Hook: a stat that 38% of internal meetings could be async. Sections: (1) the meeting-tax problem, (2) how AInbox flips the default, (3) three Roam customer stories. Internal-link suggestions to /features/ainbox and /pricing.' },
      ],
    },
    { id: 'bg-2', name: 'Theater on-air SEO post', state: 'working', messages: [
      { from: 'user', text: 'Need a long-form post targeting "all-hands meeting tools".' },
    ] },
  ],
  'Web Traffic Analyzer': [
    { id: 'wt-1', name: 'Drop-In landing performance', state: 'idle',
      messages: [
        { from: 'user',  text: 'How is the new /drop-in landing converting?' },
        { from: 'agent', thought: 'Thought for 3s', text: 'CTR from organic landed at **6.4%** (vs site avg 3.1%). Trial-start rate from /drop-in is 11%, ahead of /features avg of 8%. Biggest drop-off is mid-page near the pricing comparison — recommend tightening the first paragraph + moving the CTA up.' },
      ],
    },
  ],
  'Keyword Researcher': [
    { id: 'kw-1', name: '"Async standup" cluster', state: 'idle',
      messages: [
        { from: 'user',  text: 'Build a keyword cluster around "async standup".' },
        { from: 'agent', thought: 'Thought for 6s', text: '32 queries in the cluster. Big hits: "async standup tool" (2.4k/mo, low difficulty), "standup without meeting" (880, low), "remote standup template" (1.6k, mid). Three competitor pages dominating but none matching our Magic Minutes angle. Strong opening here.' },
      ],
    },
  ],

  // ── Sales ────────────────────────────────────────────────────────────
  'Sales Coordinator': [
    { id: 'sc-1', name: 'Inbound from Stripe', state: 'working',
      messages: [
        { from: 'user',  text: 'Stripe inquiry came in via /contact — route it.' },
        { from: 'agent', thought: 'Thought for 2s', text: 'Routed to Marc (enterprise west). Flagged as "tier-1 strategic" since contact is their head of internal tools. I\'ve queued the prep doc with their public security FAQ + a comparison sheet vs their current stack.' },
      ],
    },
    { id: 'sc-2', name: 'Pipeline hygiene', state: 'idle',
      messages: [
        { from: 'user',  text: 'Find stale deals in the pipeline.' },
        { from: 'agent', thought: 'Thought for 4s', text: '14 deals haven\'t had activity in 21+ days. 6 are likely closed-lost, 4 need a follow-up nudge, 4 have an answer pending from us. Sent the rep summaries with suggested next steps.' },
      ],
    },
  ],
  'Meeting Analyzer': [
    { id: 'ma-1', name: 'Brightline win debrief', state: 'idle',
      messages: [
        { from: 'user',  text: 'What worked in the Brightline win call?' },
        { from: 'agent', thought: 'Thought for 5s', text: 'Three things stood out:\n1. The rep let the buyer talk for 71% of the call (vs our 60% baseline).\n2. Pricing was anchored to ROI specifically tied to their Q3 OKR.\n3. Demo focused on Magic Minutes, not the full product. Recommend documenting this as a play.' },
      ],
    },
    { id: 'ma-2', name: 'Loss patterns this month', state: 'working', messages: [
      { from: 'user', text: 'Any common patterns in our 4 closed-lost deals last month?' },
    ] },
  ],
  'Meeting Coach': [
    { id: 'mc-1', name: 'Coaching plan — Sam', state: 'idle',
      messages: [
        { from: 'user',  text: 'Build a coaching plan for Sam based on his last 5 calls.' },
        { from: 'agent', thought: 'Thought for 6s', text: 'Two main areas:\n- **Discovery depth** — talk-time at 58%; he\'s answering objections too quickly. Practice: "tell me more" pause drills.\n- **Pricing framing** — he leads with cost. Recommend reframing around value via the ROI calc.\nBoth fixable in 2–3 weeks. Drafted role-play scripts for tomorrow\'s 1:1.' },
      ],
    },
  ],

  // ── R&D ──────────────────────────────────────────────────────────────
  'Build Manager': [
    { id: 'bm-1', name: 'CI flakes this week', state: 'idle',
      messages: [
        { from: 'user',  text: 'What\'s flaky in CI right now?' },
        { from: 'agent', thought: 'Thought for 2s', text: 'Two suites consistently flaking:\n- `theater.spec.ts` — 14% failure rate, race in the recording-finalize step.\n- `ainbox-sync.spec.ts` — 9%, looks like the test seeds before the DB migration completes.\nAuto-retried both; opened ROAM-201 and ROAM-202 with reproduction.' },
      ],
    },
    { id: 'bm-2', name: 'Build time trend', state: 'working', messages: [
      { from: 'user', text: 'Build times went up 18% this week — figure out why.' },
    ] },
  ],
  'Alert Triage': [
    { id: 'at-1', name: 'Pager — staging DB', state: 'idle',
      messages: [
        { from: 'user',  text: 'Got paged on staging DB connection spikes — anything actionable?' },
        { from: 'agent', thought: 'Thought for 3s', text: 'It was a noisy alert — connection pool transient. Didn\'t affect prod. Auto-resolved at 02:14 UTC. I lowered the threshold for staging from 50→80 connections to cut the noise. Want me to keep it that way or revert in 7 days?' },
      ],
    },
    { id: 'at-2', name: 'P1 — Theater on-air down', state: 'working',
      messages: [
        { from: 'user',  text: 'Theater on-air is failing for ~3% of users.' },
        { from: 'agent', thought: 'Thought for 4s', text: 'Paging on-call. Looks like the recording-finalize service is throwing on long sessions (>2hr). Workaround: split the session into chunks. I\'ll keep monitoring; ETA on fix from oncall is 30 min.' },
      ],
    },
  ],
  'Bug Investigator': [
    { id: 'bi-1', name: 'Knock dialog stuck on iOS 17', state: 'idle',
      messages: [
        { from: 'user',  text: 'Customers reporting the knock dialog freezes on iOS 17 in low power mode.' },
        { from: 'agent', thought: 'Thought for 7s', text: 'Reproduced. Root cause: our pulse animation uses `requestAnimationFrame` which is throttled to 1Hz under low-power. The dialog never reaches steady state. Fix: detect low-power via `prefers-reduced-motion` proxy and swap to a CSS-only pulse. Patch ready at PR #4421.' },
      ],
    },
    { id: 'bi-2', name: 'Magic Minutes export 500', state: 'working', messages: [
      { from: 'user', text: 'Export-to-PDF is 500ing on long meetings.' },
    ] },
  ],
  'Code Reviewer': [
    { id: 'cr-1', name: 'PR #4421 — knock fix review', state: 'idle',
      messages: [
        { from: 'user',  text: 'Review PR #4421.' },
        { from: 'agent', thought: 'Thought for 5s', text: 'Looks good with two suggestions:\n1. The `prefers-reduced-motion` check should be a memoized hook so it doesn\'t re-evaluate every render.\n2. Add a regression test for low-power state. I drafted one — see inline comment.\nStyle + safety pass: clean. Approving with optional changes.' },
      ],
    },
    { id: 'cr-2', name: 'PR #4435 — RFC scaffolding', state: 'working', messages: [
      { from: 'user', text: 'Take a pass on #4435, especially the migration plan.' },
    ] },
  ],
  'RFC Drafter': [
    { id: 'rd-1', name: 'Federated workspaces RFC', state: 'idle',
      messages: [
        { from: 'user',  text: 'Draft an RFC for the federated workspaces project.' },
        { from: 'agent', thought: 'Thought for 11s', text: 'Drafted 12-page RFC. Sections: motivation, current vs proposed architecture, identity model, data residency, migration plan, open questions. Three trade-offs called out:\n- single tenancy vs cell-based\n- read-after-write semantics\n- compliance regimes per region\nReady for the architecture review on Friday.' },
      ],
    },
  ],

  // ── HR ───────────────────────────────────────────────────────────────
  'Employee Onboarding': [
    { id: 'eo-1', name: 'Day-1 kit for May 13 cohort', state: 'working',
      messages: [
        { from: 'user',  text: '6 new hires starting May 13. Get day-1 kits ready.' },
        { from: 'agent', thought: 'Thought for 4s', text: 'IT provisioning queued for all 6, equipment ships May 9. Welcome emails scheduled, calendar invites for orientation + buddy 1:1s sent. Each gets a custom kit based on role. Three engineers, two designers, one ops.' },
      ],
    },
  ],
  'Resume Triage': [
    { id: 'rt-1', name: 'Senior FE — 47 resumes', state: 'idle',
      messages: [
        { from: 'user',  text: 'Triage the 47 senior FE resumes from this week.' },
        { from: 'agent', thought: 'Thought for 8s', text: 'Top 8 by fit score (≥85):\n- 4 strong React + design-systems backgrounds\n- 2 with explicit prior remote-first experience\n- 2 from related design-tool companies (good cultural fit)\nOne maybe-pile of 12 worth a phone screen. Auto-rejected 27 with kind, specific declines.' },
      ],
    },
  ],
  'Recruiting Coordinator': [
    { id: 'rc-1', name: 'Schedule onsites', state: 'working',
      messages: [
        { from: 'user',  text: 'Schedule onsites for the 8 senior FE finalists.' },
        { from: 'agent', thought: 'Thought for 3s', text: 'Booking interviewer panels across May 19–23. Each candidate gets 5 sessions: hiring manager, system design, coding, design review, exec chat. Travel + hotel queued for the 2 in-person finalists.' },
      ],
    },
  ],
};

function controlRoomInitials(name) {
  const words = name.split(/\s+/).filter(Boolean);
  // Treat short tokens like 'G2' or 'X' as canonical (use as-is when ≤ 2 chars).
  if (words[0]?.length <= 2) {
    return words.length > 1 && words[0].length === 1
      ? (words[0] + words[1][0]).toUpperCase()
      : words[0].toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Personal Claude / Codex agents docked beneath each populated office.
const PERSONAL_AGENTS = {
  claude: { id: 'claude', name: 'Claude', color: '#EB6139', icon: '/icons/claude.svg', task: 'Coding session', status: 'working' },
  codex:  { id: 'codex',  name: 'Codex',  color: '#0000FF', icon: '/icons/codex-white.svg', task: 'Coding session', status: 'working' },
};

const OFFICE_DOCK = {
  'Howard L.': ['claude', 'codex'],
  'Joe W.':    ['claude', 'codex'],
  'Will H.':   ['claude', 'codex'],
};

export default function AgentGarageView() {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'dark' : 'dark'
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const [openAgents, setOpenAgents] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  // Unified agent window — one window for both Personal Agents and any
  // workroom. `roomId` is 'personal' or a dept name. null means closed.
  const [agentsWindow, setAgentsWindow] = useState(null);
  const [pinnedAgentIds, setPinnedAgentIds] = useState([]);
  const togglePin = (id) =>
    setPinnedAgentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Show only one story bubble on the embedded map.
  useEffect(() => {
    const apply = () => {
      const bubbles = document.querySelectorAll('.ag-shell .sc-story-bubble');
      bubbles.forEach((b, i) => {
        b.style.display = i === 0 ? '' : 'none';
      });
    };
    apply();
    const observer = new MutationObserver(apply);
    const root = document.querySelector('.ag-shell');
    if (root) observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const toggleAgent = (agent) => {
    setOpenAgents(prev => {
      if (prev.find(a => a.id === agent.id)) {
        return prev.filter(a => a.id !== agent.id);
      }
      const offset = prev.length * 332;
      const x = Math.max(24, window.innerWidth - 320 - 24 - offset);
      return [...prev, { ...agent, position: { x, y: 100 } }];
    });
    setFocusedId(agent.id);
  };
  const closeAgent = (id) => {
    setOpenAgents(prev => prev.filter(a => a.id !== id));
  };

  // Build a renderable agent shape for ShowcaseMap (color, letter, status,
  // onClick). Mini-chat is opened with the agent's full record.
  const toMapAgent = (agent) => ({
    id: agent.id,
    name: agent.name,
    letter: agent.letter,
    color: agent.color,
    icon: agent.icon,
    status: agent.status,
    task: agent.task,
    attention: agent.attention,
    onClick: () => toggleAgent({
      ...agent,
      // For mini-chat: open with the capabilities prompt since these aren't
      // pre-existing assignments in the AgentGarageWindow database.
      unassigned: true,
      capabilities: agent.capabilities || [],
    }),
  });

  // Enriched departments — agents inflated with letters + dept color +
  // a unique iconIndex so each agent gets its own variant of the cog
  // glyph (see AgentGlyph). Reused by both the in-map AgentWorkshopCard
  // and the Control Room window.
  let _iconIdx = 0;
  const enrichedDepartments = CONTROL_ROOM_DEPTS.map(dept => ({
    name: dept.name,
    color: dept.color,
    agents: dept.agents.map(a => ({
      name: a.name,
      letter: controlRoomInitials(a.name),
      color: dept.color,
      summary: a.summary,
      capabilities: a.capabilities,
      iconIndex: _iconIdx++,
    })),
  }));

  // Helper — find an enriched control-room agent record by name.
  const findAgent = (name) => {
    for (const dept of enrichedDepartments) {
      const a = dept.agents.find(x => x.name === name);
      if (a) return { ...a, deptColor: dept.color };
    }
    return null;
  };

  // Unified rooms registry — Personal + every dept workroom. Each room is
  // {id, name, agents}. Personal seeds from PERSONAL_AGENT_LIST; dept rooms
  // seed from their flattened control-room agents.
  const rooms = [
    { id: 'personal', name: 'Personal', agents: PERSONAL_AGENT_LIST },
    ...enrichedDepartments.map(dept => ({
      id: dept.name,
      name: dept.name,
      agents: dept.agents.map(a => ({
        id: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: a.name,
        color: a.color,
        iconIndex: a.iconIndex,
        sessions: WORKROOM_SESSIONS[a.name] || [],
      })),
    })),
  ];

  // Per-office agent docks — pick 1-2 control-room agents working with each
  // human. Renders below the human's avatar in their private office card.
  const officeAgentAssignments = {
    'Brooke F.': ['Customer Onboarding', 'Lead Researcher'],
    'Jessica H.': ['Sales Coordinator'],
    'Sarah M.':  ['Code Reviewer', 'Bug Investigator'],
  };
  const officeAgents = Object.fromEntries(
    Object.entries(officeAgentAssignments).map(([office, names]) => [
      office,
      names.map(findAgent).filter(Boolean).map(a => ({
        id: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: a.name,
        letter: a.letter,
        color: a.color,
        iconIndex: a.iconIndex,
        status: 'working',
        onClick: () => handleControlRoomAgentClick(a),
      })),
    ])
  );

  const handleControlRoomAgentClick = (agent) => {
    toggleAgent({
      id: agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: agent.name,
      letter: agent.letter,
      color: agent.color,
      tag: agent.summary,
      capabilities: agent.capabilities || [],
      details: { title: agent.name, summary: agent.summary },
      unassigned: true,
    });
    setAgentsWindow(null);
  };

  return (
    <div className="ag-shell">
      <div className="ag-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }} />

      <div className="ag-map-host">
        <ShowcaseMap
          embedded
          initialFloor="VirtualOffice"
          hideElevator={true}
          editable={true}
          onPersonalAgentsClick={() => setAgentsWindow({ roomId: 'personal' })}
          officeAgents={officeAgents}
          // Default editable layout — three offices centered in a row at the
          // top, Agent Workshop centered below. Coordinates are pixels
          // relative to the .sc-grid (which fills the .sc-content area).
          defaultLayout={{
            vo1:          { x: 160, y: 0,   w: 176, h: 96  }, // Brooke F.
            vo7:          { x: 344, y: 0,   w: 176, h: 96  }, // Jessica H.
            vo3:          { x: 528, y: 0,   w: 176, h: 96  }, // Sarah M.
            'ag-Support':   { x: 56,  y: 104, w: 144, h: 88  },
            'ag-Marketing': { x: 208, y: 104, w: 144, h: 208 },
            'ag-Sales':     { x: 360, y: 104, w: 144, h: 88  },
            'ag-R&D':       { x: 512, y: 104, w: 144, h: 128 },
            'ag-HR':        { x: 664, y: 104, w: 144, h: 88  },
          }}
          // Show only 3 offices — vo1 (Brooke F.), vo3 (Sarah M.), vo7 (Jessica H.).
          hiddenRooms={[
            'vo2', 'vo4', 'vo5', 'vo6', 'vo8', 'vo9', 'vo10',
            'vo11', 'vo12', 'vo13', 'vo14',
            'vo-pitch', 'vo-brainstorm', 'vo-snack',
            'vo-theater', 'vo-demo', 'vo-reading',
          ]}
          extraRooms={enrichedDepartments.map((dept, i) => ({
            id: `ag-${dept.name}`,
            type: 'agent-workshop',
            name: dept.name,
            people: [],
            pos: { col: i, row: 2 },
            colSpan: 1,
            rowSpan: 3,
            departments: [dept],
            onClick: () => setAgentsWindow({ roomId: dept.name }),
          }))}
        />
      </div>

      {openAgents.map(agent => (
        <AgentMiniChat
          key={agent.id}
          agent={agent}
          position={agent.position}
          zIndex={focusedId === agent.id ? 40 : 30}
          onFocus={setFocusedId}
          onClose={() => closeAgent(agent.id)}
        />
      ))}

      {agentsWindow && (
        <PersonalAgentsPopup
          onClose={() => setAgentsWindow(null)}
          rooms={rooms}
          currentRoomId={agentsWindow.roomId}
          onRoomChange={(roomId) => setAgentsWindow({ ...agentsWindow, roomId })}
          pinnedAgentIds={pinnedAgentIds}
          onTogglePin={togglePin}
        />
      )}
    </div>
  );
}
