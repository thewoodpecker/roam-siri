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

function PersonalAgentsPopup({ onClose, agents, title }) {
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
        agents={agents}
        title={title}
      />
    </div>
  );
}

function PersonalAgentsWindow({ onTitlebarMouseDown, onClose, agents: initialAgents, title }) {
  const seed = initialAgents || PERSONAL_AGENT_LIST;
  const [agents, setAgents] = useState(seed);
  const [selectedId, setSelectedId] = useState(seed[0]?.id);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [draft, setDraft] = useState('');
  const [composerScrolled, setComposerScrolled] = useState(false);
  const messagesRef = useRef(null);
  const selected = agents.find(a => a.id === selectedId);

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
        <div className="pa-title">{title || 'Personal Agents'}</div>
      </div>
      <div className="pa-body">
        <div className="pa-tabs">
          {agents.map(a => (
            <button
              key={a.id}
              type="button"
              className={`pa-tab ${a.id === selectedId ? 'pa-tab-active' : ''}`}
              onClick={() => { setSelectedId(a.id); setSelectedSessionId(null); }}
            >
              <span className="pa-tab-emoji" style={{ color: a.color }} aria-hidden="true">
                <AgentGlyph index={a.iconIndex} size={14} />
              </span>
              <span className="pa-tab-name">{a.name}</span>
            </button>
          ))}
          <button type="button" className="pa-tab-add" aria-label="Add agent">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
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
            </div>
            )}
          </main>
        </div>
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
  const [activeWorkroom, setActiveWorkroom] = useState(null);
  const [personalAgentsOpen, setPersonalAgentsOpen] = useState(false);

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

  // Per-department workrooms. Each dept becomes its own room on the map
  // and opens the PersonalAgentsWindow shell with just that dept's roster.
  const workroomsByDept = Object.fromEntries(
    enrichedDepartments.map(dept => [
      dept.name,
      dept.agents.map(a => ({
        id: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: a.name,
        color: a.color,
        iconIndex: a.iconIndex,
        sessions: [],
      })),
    ])
  );
  const activeWorkroomAgents = activeWorkroom ? workroomsByDept[activeWorkroom] : null;

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
    setActiveWorkroom(null);
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
          onPersonalAgentsClick={() => setPersonalAgentsOpen(true)}
          officeAgents={officeAgents}
          // Default editable layout — three offices centered in a row at the
          // top, Agent Workshop centered below. Coordinates are pixels
          // relative to the .sc-grid (which fills the .sc-content area).
          defaultLayout={{
            vo1:          { x: 152, y: 0,   w: 176, h: 96  }, // Brooke F.
            vo7:          { x: 344, y: 0,   w: 176, h: 96  }, // Jessica H.
            vo3:          { x: 536, y: 0,   w: 176, h: 96  }, // Sarah M.
            'ag-Support':   { x: 32,  y: 112, w: 144, h: 240 },
            'ag-Marketing': { x: 184, y: 112, w: 144, h: 240 },
            'ag-Sales':     { x: 336, y: 112, w: 144, h: 240 },
            'ag-R&D':       { x: 488, y: 112, w: 144, h: 240 },
            'ag-HR':        { x: 640, y: 112, w: 144, h: 240 },
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
            onClick: () => setActiveWorkroom(dept.name),
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

      {activeWorkroom && activeWorkroomAgents && (
        <PersonalAgentsPopup
          onClose={() => setActiveWorkroom(null)}
          agents={activeWorkroomAgents}
          title={activeWorkroom}
        />
      )}

      {personalAgentsOpen && (
        <PersonalAgentsPopup onClose={() => setPersonalAgentsOpen(false)} />
      )}
    </div>
  );
}
