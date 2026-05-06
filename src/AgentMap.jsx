import React, { useEffect, useState } from 'react';
import AgentOrb from './AgentOrb';
import './AgentMap.css';

const ROAM_AGENTS = {
  designer:   { name: 'Design Agent',     color: '#C2185B' },
  engineer:   { name: 'Engineering Agent', color: '#835CE9' },
  researcher: { name: 'Research Agent',   color: '#FFC107' },
  pricing:    { name: 'Pricing Agent',    color: '#FFC107' },
  writer:     { name: 'Writing Agent',    color: '#46D08F' },
  sales:      { name: 'Sales Agent',      color: '#4DD0E1' },
  monitor:    { name: 'Monitoring Agent', color: '#FF6F00' },
};

// Order shown in the "Available agents" column on the left of the garage.
const KIND_LIST = ['designer', 'engineer', 'researcher', 'pricing', 'writer', 'sales', 'monitor'];

const PEOPLE = [
  { id: 'howard', name: 'Howard Lerman',   role: 'CEO',         avatar: '/headshots/howard-lerman.jpg' },
  { id: 'joe',    name: 'Joe Woodward',    role: 'Design',      avatar: '/headshots/joe-woodward.jpg' },
  { id: 'shelby', name: 'Shelby',          role: 'Marketing',   avatar: '/headshots/shelby.jpg' },
  { id: 'will',   name: 'Will Hou',        role: 'Engineering', avatar: '/headshots/will-hou.jpg' },
  { id: 'peter',  name: 'Peter Lerman',    role: 'Operations',  avatar: '/headshots/peter-lerman.jpg' },
  { id: 'lexi',   name: 'Lexi Bohonnon',   role: 'Marketing',   avatar: '/headshots/lexi-bohonnon.jpg' },
];

const INITIAL_INSTANCES = [
  {
    id: 'writer-howard', kind: 'writer', assigneeId: 'howard', scope: 'personal',
    task: 'Drafting Q1 board update from this morning’s meeting', status: 'working',
    details: {
      title: 'Q1 board update',
      summary: 'Compiling this morning’s exec sync into the Q1 board narrative. Working from the live transcript and last quarter’s metrics doc.',
      recent: [
        { time: '4 min ago',  label: 'Drafted Strategic Priorities section, v2' },
        { time: '18 min ago', label: 'Pulled meeting recording + transcript' },
        { time: '30 min ago', label: 'Indexed Q4 retro notes' },
      ],
      files: [
        { name: 'q1-board-narrative.docx', size: '48 KB', type: 'doc' },
        { name: 'meeting-transcript.txt',  size: '32 KB', type: 'txt' },
        { name: 'metrics-doc.pdf',         size: '212 KB', type: 'pdf' },
      ],
      inboxThread: 'Writing Agent · Q1 board update',
    },
  },
  {
    id: 'designer-joe', kind: 'designer', assigneeId: 'joe', scope: 'personal',
    task: 'Refining the ro.am landing page mocks', status: 'working',
    details: {
      title: 'ro.am landing refresh',
      summary: 'Iterating on the home hero, switching to the new brand wordmark, and prepping a few section variants for review.',
      recent: [
        { time: '6 min ago',  label: 'Shared hero variant D in your AInbox' },
        { time: '1 hr ago',   label: 'Polished nav using updated logo lockup' },
        { time: '2 hrs ago',  label: 'Imported the new brand color tokens' },
      ],
      files: [
        { name: 'hero-variant-d.fig',  size: '4.2 MB', type: 'fig' },
        { name: 'nav-lockup.png',      size: '1.1 MB', type: 'img' },
        { name: 'brand-tokens.json',   size: '12 KB',  type: 'json' },
      ],
      inboxThread: 'Design Agent · ro.am refresh',
    },
  },
  {
    id: 'pricing-shelby', kind: 'pricing', assigneeId: 'shelby', scope: 'personal',
    task: 'Q4 TikTok influencer rate sheet', status: 'working', attention: 'Question',
  },
  {
    id: 'engineer-will', kind: 'engineer', assigneeId: 'will', scope: 'personal',
    task: 'Refactoring the meeting-room grid to use grid-template-areas', status: 'working',
    details: {
      title: 'Meeting-room grid refactor',
      summary: 'Tearing out the legacy flex layout, moving to grid-template-areas so future room types slot in cleanly. Running the visual regression suite per change.',
      recent: [
        { time: '7 min ago',  label: 'Migrated MeetingWindow grid' },
        { time: '24 min ago', label: 'Captured baseline screenshots' },
        { time: '1 hr ago',   label: 'Audited every consumer of the old grid' },
      ],
      inboxThread: 'Engineering Agent · Meeting-room grid',
    },
  },
  {
    id: 'researcher-peter', kind: 'researcher', assigneeId: 'peter', scope: 'personal',
    task: 'Q1 vendor renewals + price diffs', status: 'idle', attention: 'Approval needed',
    details: {
      title: 'Q1 vendor renewals',
      summary: 'Compiled the renewal stack for Q1 with year-over-year price diffs and SLAs. Two vendors are above the 20% increase threshold and need your sign-off before I respond.',
      recent: [
        { time: '40 min ago', label: 'Flagged Snowflake +24% renewal' },
        { time: '1 hr ago',   label: 'Pulled prior-year contracts from Drive' },
        { time: '2 hrs ago',  label: 'Indexed all active vendors' },
      ],
      inboxThread: 'Research Agent · Q1 vendor renewals',
    },
  },
  {
    id: 'writer-lexi', kind: 'writer', assigneeId: 'lexi', scope: 'personal',
    task: 'Drafting the launch newsletter for Magic Minutes 2.0', status: 'working',
    details: {
      title: 'Magic Minutes 2.0 launch newsletter',
      summary: 'Composing the launch announcement, three customer pull-quotes, and the in-app drip sequence. Pulling the screenshots from the latest staging build.',
      recent: [
        { time: '11 min ago', label: 'Drafted intro + headline variants' },
        { time: '35 min ago', label: 'Pulled three customer quotes from Gainsight' },
        { time: '1 hr ago',   label: 'Synced with brand tokens' },
      ],
      inboxThread: 'Writing Agent · MM 2.0 launch',
    },
  },
  {
    id: 'sales-shared', kind: 'sales', assigneeId: null, scope: 'shared',
    task: 'Watching the lead inbox — 12 routed today', status: 'idle', attention: 'New lead',
    watchers: ['/headshots/howard-lerman.jpg', '/headshots/shelby.jpg'],
    attentionDetail: {
      type: 'lead',
      title: '@greenflag.io',
      subtitle: 'Enterprise inquiry · 8 min ago',
      message: '“We need SSO and custom retention windows before Q2. Can we get on a call this week to scope?”',
      meta: [
        { label: 'Source',      value: 'Website contact form' },
        { label: 'Company size', value: '120 employees' },
        { label: 'Industry',    value: 'Climate tech' },
        { label: 'Routed to',   value: 'Marcus' },
      ],
      actions: [
        { label: 'Reply',  primary: true },
        { label: 'Hand off' },
        { label: 'Dismiss' },
      ],
    },
    details: {
      title: 'Lead inbox',
      summary: 'Triaging inbound from the website, routing to the right rep, and flagging anything enterprise for human review.',
      recent: [
        { time: '8 min ago',  label: 'Routed @greenflag.io to Marcus' },
        { time: '22 min ago', label: 'Flagged 1 enterprise inquiry for review' },
        { time: '1 hr ago',   label: 'Closed loop on 3 cold contacts' },
        { time: 'This week',  label: '38 routed · 6 in triage' },
      ],
      files: [
        { name: 'routed-leads.csv',   size: '24 KB', type: 'csv' },
        { name: 'weekly-summary.md',  size: '6 KB',  type: 'doc' },
      ],
      inboxThread: 'Sales Agent · Lead inbox',
    },
  },
  {
    id: 'monitor-shared', kind: 'monitor', assigneeId: null, scope: 'shared',
    task: 'Monitoring deploy alerts — all clear', status: 'idle',
    watchers: ['/headshots/will-hou.jpg', '/headshots/peter-lerman.jpg', '/headshots/joe-woodward.jpg'],
    details: {
      title: 'Production health',
      summary: 'Watching deploy pipelines, error budgets, and latency dashboards. All systems are green over the last six hours.',
      recent: [
        { time: '12 min ago', label: 'Deploy d-2061 verified' },
        { time: '1 hr ago',   label: 'p95 latency dipped below 240ms' },
        { time: '3 hrs ago',  label: 'Auto-resolved alert on staging-eu' },
      ],
      files: [
        { name: 'incident-log.md',     size: '18 KB', type: 'doc' },
        { name: 'latency-snapshot.json', size: '8 KB', type: 'json' },
      ],
      inboxThread: 'Monitoring Agent · Production health',
    },
  },
  {
    id: 'engineer-shared', kind: 'engineer', assigneeId: null, scope: 'shared',
    task: 'Reviewing PR #4812 — typing indicator fix', status: 'working',
    watchers: ['/headshots/joe-woodward.jpg', '/headshots/will-hou.jpg'],
    details: {
      title: 'PR #4812 — typing indicator ghost state',
      summary: 'Reviewing the typing indicator fix end-to-end: ran the test suite, traced the race condition, and queued comments for the author.',
      recent: [
        { time: '3 min ago',  label: 'Flagged flaky test: mm-thread-empty' },
        { time: '12 min ago', label: 'Approved 2 / 3 review comments' },
        { time: '25 min ago', label: 'Started PR #4812 review' },
      ],
      files: [
        { name: 'pr-4812.diff',     size: '14 KB', type: 'doc' },
        { name: 'test-output.log',  size: '46 KB', type: 'txt' },
      ],
      inboxThread: 'Engineering Agent · PR #4812',
    },
  },
];

// Deprecated placeholder kept so the file still compiles cleanly during refactor;
// nothing reads from it now.
const ROOMS = [
  {
    id: 'howard',
    name: 'Howard Lerman',
    role: 'CEO',
    type: 'personal',
    occupant: '/headshots/howard-lerman.jpg',
    agents: [
      {
        id: 'writer-howard', kind: 'writer', scope: 'personal',
        task: 'Drafting Q1 board update from this morning’s meeting', status: 'working',
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
    ],
  },
  {
    id: 'joe',
    name: "Joe Woodward",
    role: 'Design',
    type: 'personal',
    occupant: '/headshots/joe-woodward.jpg',
    agents: [
      {
        id: 'designer-joe', kind: 'designer', scope: 'personal',
        task: 'Refining the ro.am landing page mocks', status: 'working',
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
    ],
  },
  {
    id: 'shelby',
    name: 'Shelby',
    role: 'Marketing',
    type: 'personal',
    occupant: '/headshots/shelby.jpg',
    agents: [
      { id: 'pricing-shelby', kind: 'pricing', scope: 'personal', task: 'Q4 TikTok influencer rate sheet', status: 'working', attention: 'Question', primary: true },
    ],
  },
  {
    id: 'workroom',
    name: 'Agent Workroom',
    type: 'shared',
    agents: [
      {
        id: 'sales-shared', kind: 'sales', scope: 'shared',
        task: 'Watching the lead inbox — 12 routed today', status: 'idle', attention: 'New lead',
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
        id: 'monitor-shared', kind: 'monitor', scope: 'shared',
        task: 'Monitoring deploy alerts — all clear', status: 'idle',
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
      {
        id: 'engineer-shared', kind: 'engineer', scope: 'shared',
        task: 'Reviewing PR #4812 — typing indicator fix', status: 'working',
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
    ],
  },
];

const TIKTOK_TASK = {
  title: 'Q4 TikTok influencer rate sheet',
  brief: 'Mid-tier creators in food + lifestyle for the holiday push. Cross-referencing public tier rates, recent campaigns, and follower velocity.',
  status: 'Working',
  updated: '6 min ago',
  files: [
    { name: 'campaign-brief.pdf',     size: '124 KB', type: 'pdf'   },
    { name: 'influencers.csv',        size: '38 KB',  type: 'csv'   },
    { name: 'rate-card-draft.xlsx',   size: '92 KB',  type: 'sheet' },
  ],
  influencers: [
    { handle: '@maya.cooks',   followers: '1.2M', niche: 'Food',      rate: '$4.5k–6k'  },
    { handle: '@dadtok.dave',  followers: '820K', niche: 'Lifestyle', rate: '$3k–4k'    },
    { handle: '@sundayhaul',   followers: '610K', niche: 'Fashion',   rate: '$2.5k–3.5k'},
    { handle: '@coffeegrove',  followers: '480K', niche: 'Coffee',    rate: '$2k–3k'    },
  ],
  thread: [
    { from: 'shelby', text: 'Pull rates for the Q4 push — focus on food + lifestyle, mid-tier creators.' },
    { from: 'agent',  text: 'On it. I have 12 candidates so far. Should I cap CPM at $35 or use the team standard?' },
    { from: 'shelby', text: 'Cap at $35 unless engagement is >2.5x average.' },
    { from: 'agent',  text: 'Got it. Drafting the rate card now — three tiers, EOD.', pending: true },
  ],
};

function AgentChip({ agent, onClick, large = false }) {
  const meta = ROAM_AGENTS[agent.kind];
  return (
    <button className={`am-chip ${large ? 'am-chip-large' : ''} ${agent.primary ? 'am-chip-primary' : ''}`} onClick={onClick}>
      <span className="am-chip-avatar">
        {meta.avatar ? (
          <img src={meta.avatar} alt="" />
        ) : (
          <span className="am-chip-letter" style={{ background: meta.color }}>{meta.letter}</span>
        )}
      </span>
      <span className="am-chip-body">
        <span className="am-chip-name">{meta.name}</span>
        <span className="am-chip-task">{agent.task}</span>
      </span>
      {agent.attention && (
        <span className="am-chip-attention">
          <span className="am-chip-attention-dot" aria-hidden="true" />
          {agent.attention}
        </span>
      )}
    </button>
  );
}

function Room({ room, onAgentClick }) {
  if (room.type === 'personal') {
    return (
      <div className="am-room am-room-personal">
        <div className="am-room-header">
          <img className="am-room-occupant" src={room.occupant} alt="" />
          <div className="am-room-titles">
            <div className="am-room-name">{room.name}</div>
            <div className="am-room-sub">{room.role}</div>
          </div>
        </div>
        <div className="am-room-agents">
          {room.agents.map(a => (
            <AgentChip key={a.id} agent={a} onClick={() => onAgentClick(a)} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="am-room am-room-workroom">
      <div className="am-room-header">
        <div className="am-room-mark" aria-hidden="true">
          <img src="/icons/home.svg" width="14" height="14" alt="" />
        </div>
        <div className="am-room-titles">
          <div className="am-room-name">{room.name}</div>
          <div className="am-room-sub">Shared — anyone on the team can use these</div>
        </div>
      </div>
      <div className="am-room-agents am-room-agents-row">
        {room.agents.map(a => (
          <AgentChip key={a.id} agent={a} onClick={() => onAgentClick(a)} large />
        ))}
      </div>
    </div>
  );
}

function AgentPanel({ agent, visible, onClose }) {
  if (!agent) return null;
  const meta = ROAM_AGENTS[agent.kind];
  const isTikTok = agent.id === 'pricing-shelby';

  return (
    <aside className={`am-panel ${visible ? 'am-panel-visible' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
      <div className="am-panel-head">
        <div className="am-panel-agent">
          <AgentOrb color={meta.color} name={meta.name} size={32} className="am-panel-avatar" />
          <div>
            <div className="am-panel-name">{meta.name}</div>
            <div className="am-panel-status">
              <span className="am-panel-dot" style={{ background: agent.status === 'working' ? meta.color : 'var(--text-tertiary, #999)' }} />
              {agent.status === 'working' ? 'Working' : 'Idle'} · {agent.scope === 'personal' ? 'Personal' : 'Shared'} agent
            </div>
          </div>
        </div>
        <button className="am-panel-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {isTikTok ? (
        <div className="am-panel-body">
          <div className="am-panel-title">{TIKTOK_TASK.title}</div>
          <div className="am-panel-meta">{TIKTOK_TASK.status} · updated {TIKTOK_TASK.updated}</div>
          <p className="am-panel-brief">{TIKTOK_TASK.brief}</p>

          <div className="am-panel-section">
            <div className="am-panel-section-label">Recent outputs</div>
            <div className="am-files">
              {TIKTOK_TASK.files.map(f => (
                <div key={f.name} className="am-file">
                  <span className={`am-file-mark am-file-${f.type}`}>{f.type.toUpperCase()}</span>
                  <span className="am-file-name">{f.name}</span>
                  <span className="am-file-size">{f.size}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="am-panel-section">
            <div className="am-panel-section-label">Top creators ({TIKTOK_TASK.influencers.length})</div>
            <div className="am-influencers">
              {TIKTOK_TASK.influencers.map(i => (
                <div key={i.handle} className="am-influencer">
                  <div className="am-influencer-handle">{i.handle}</div>
                  <div className="am-influencer-meta">{i.followers} · {i.niche}</div>
                  <div className="am-influencer-rate">{i.rate}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="am-panel-section">
            <div className="am-panel-section-label">Session</div>
            <div className="am-thread">
              {TIKTOK_TASK.thread.map((m, i) => (
                <div key={i} className={`am-msg am-msg-${m.from === 'agent' ? 'agent' : 'user'} ${m.pending ? 'am-msg-pending' : ''}`}>
                  <span className="am-msg-from">{m.from === 'agent' ? meta.name : 'Shelby'}</span>
                  <span className="am-msg-text">{m.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="am-panel-actions">
            <button className="am-btn am-btn-primary">Open session</button>
            <button className="am-btn">Ask a question</button>
          </div>
        </div>
      ) : (
        <div className="am-panel-body">
          {agent.attentionDetail && (
            <div className={`am-attention-card am-attention-card-${agent.attentionDetail.type || 'alert'}`}>
              <div className="am-attention-head">
                <span className="am-attention-dot" aria-hidden="true" />
                <span className="am-attention-label">{agent.attention || 'Needs attention'}</span>
                <span className="am-attention-time">{agent.attentionDetail.subtitle?.split(' · ').slice(-1)[0]}</span>
              </div>
              <div className="am-attention-title">{agent.attentionDetail.title}</div>
              {agent.attentionDetail.subtitle && (
                <div className="am-attention-sub">{agent.attentionDetail.subtitle.split(' · ').slice(0, -1).join(' · ') || agent.attentionDetail.subtitle}</div>
              )}
              {agent.attentionDetail.message && (
                <p className="am-attention-message">{agent.attentionDetail.message}</p>
              )}
              {agent.attentionDetail.meta?.length > 0 && (
                <dl className="am-attention-meta">
                  {agent.attentionDetail.meta.map((m, i) => (
                    <div key={i} className="am-attention-meta-row">
                      <dt>{m.label}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {agent.attentionDetail.actions?.length > 0 && (
                <div className="am-attention-actions">
                  {agent.attentionDetail.actions.map((a, i) => (
                    <button key={i} type="button" className={`am-btn ${a.primary ? 'am-btn-primary' : ''}`}>{a.label}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="am-panel-title">{agent.details?.title || agent.task}</div>
          <div className="am-panel-meta">{agent.status === 'working' ? 'Working' : 'Idle'} · {agent.scope === 'personal' ? 'Personal' : 'Shared'} agent</div>
          {agent.details?.summary && <p className="am-panel-brief">{agent.details.summary}</p>}

          {agent.watchers?.length > 0 && (
            <div className="am-panel-section">
              <div className="am-panel-section-label">Watching this agent</div>
              <div className="am-watchers-row">
                {agent.watchers.map((src, i) => (
                  <img key={i} className="ag-watcher-avatar am-watcher-large" src={src} alt="" />
                ))}
              </div>
            </div>
          )}

          {agent.details?.recent?.length > 0 && (
            <div className="am-panel-section">
              <div className="am-panel-section-label">Recent activity</div>
              <div className="am-recent">
                {agent.details.recent.map((item, i) => (
                  <div key={i} className="am-recent-item">
                    <span className="am-recent-time">{item.time}</span>
                    <span className="am-recent-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agent.details?.files?.length > 0 && (
            <div className="am-panel-section">
              <div className="am-panel-section-label">Files</div>
              <div className="am-files">
                {agent.details.files.map(f => (
                  <div key={f.name} className="am-file">
                    <span className={`am-file-mark am-file-${f.type}`}>{f.type.toUpperCase()}</span>
                    <span className="am-file-name">{f.name}</span>
                    <span className="am-file-size">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="am-panel-section">
            <div className="am-panel-section-label">Continue in AInbox</div>
            <button className="am-inbox-link">
              <span className="am-inbox-icon" aria-hidden="true">
                <img src="/icons/chat.svg" width="16" height="16" alt="" />
              </span>
              <span className="am-inbox-text">
                <span className="am-inbox-title">Open thread in AInbox</span>
                <span className="am-inbox-sub">{agent.details?.inboxThread || `${meta.name} · ${agent.task}`}</span>
              </span>
              <span className="am-inbox-chevron" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>

          <div className="am-panel-actions">
            <button className="am-btn am-btn-primary">Open session</button>
            <button className="am-btn">Edit instructions</button>
          </div>
        </div>
      )}
    </aside>
  );
}

export function AgentGarageWindow({ onTitlebarMouseDown, onClose }) {
  const [instances, setInstances] = useState(INITIAL_INSTANCES);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [assignKind, setAssignKind] = useState(null);
  const [personFilter, setPersonFilter] = useState(null); // null = all people

  const openPanel = (agent) => {
    setSelectedAgent(agent);
    setPanelMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setPanelVisible(true)));
  };
  const closePanel = () => {
    setPanelVisible(false);
    setTimeout(() => {
      setPanelMounted(false);
      setSelectedAgent(null);
    }, 280);
  };

  const handleAssign = ({ kind, assigneeId, task }) => {
    setInstances(prev => [...prev, {
      id: `${kind}-${assigneeId}-${Date.now()}`,
      kind,
      assigneeId,
      scope: 'personal',
      status: 'working',
      task: task?.trim() || 'Just assigned',
    }]);
    setAssignKind(null);
  };

  return (
    <div className="agent-map-window" onMouseDown={(e) => e.stopPropagation()}>
      <div className="agent-map-titlebar" onMouseDown={onTitlebarMouseDown} style={onTitlebarMouseDown ? { cursor: 'grab' } : undefined}>
        <div className="am-traffic">
          <span
            className="am-light am-light-close"
            style={onClose ? { cursor: 'pointer' } : undefined}
            onMouseDown={onClose ? (e) => { e.stopPropagation(); onClose(); } : undefined}
          />
          <span className="am-light am-light-min" />
          <span className="am-light am-light-max" />
        </div>
        <div className="agent-map-title">Agent Garage</div>
        <div className="agent-map-titlebar-spacer" />
      </div>

      <div className="agent-map-floor ag-garage-body">
        <aside className="ag-available-col">
          <div className="ag-col-label">Available agents</div>
          <div className="ag-available-list">
            {KIND_LIST.map(kind => {
              const meta = ROAM_AGENTS[kind];
              return (
                <button
                  key={kind}
                  type="button"
                  className="ag-available-row"
                  onClick={() => setAssignKind(kind)}
                >
                  <AgentOrb color={meta.color} name={meta.name} size={28} />
                  <span className="ag-available-name">{meta.name}</span>
                </button>
              );
            })}
          </div>

        </aside>

        <div className="ag-personal-pane">
          <div className="ag-personal-head">
            <div className="ag-col-label">Personal agents</div>
            <div className="ag-person-filters">
              <button
                type="button"
                className={`ag-person-filter ${personFilter === null ? 'ag-person-filter-active' : ''}`}
                onClick={() => setPersonFilter(null)}
              >
                All
              </button>
              {PEOPLE.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`ag-person-filter ag-person-filter-chip ${personFilter === p.id ? 'ag-person-filter-active' : ''}`}
                  onClick={() => setPersonFilter(personFilter === p.id ? null : p.id)}
                  title={p.name}
                >
                  <img className="ag-person-filter-avatar" src={p.avatar} alt="" />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ag-instance-list">
            {(() => {
              const personalInstances = instances.filter(i => i.scope === 'personal' && (personFilter == null || i.assigneeId === personFilter));
              if (personalInstances.length === 0) {
                return <div className="ag-instance-empty">No agents{personFilter ? ' for this person' : ' yet'} — pick one from Available agents on the left.</div>;
              }
              // Sort: attention first, then working, then idle, then by name
              const sorted = [...personalInstances].sort((a, b) => {
                const aHas = a.attention ? 0 : 1;
                const bHas = b.attention ? 0 : 1;
                if (aHas !== bHas) return aHas - bHas;
                const aWork = a.status === 'working' ? 0 : 1;
                const bWork = b.status === 'working' ? 0 : 1;
                if (aWork !== bWork) return aWork - bWork;
                return ROAM_AGENTS[a.kind].name.localeCompare(ROAM_AGENTS[b.kind].name);
              });
              return sorted.map(inst => {
                const meta = ROAM_AGENTS[inst.kind];
                const assignee = PEOPLE.find(p => p.id === inst.assigneeId);
                return (
                  <button key={inst.id} className="ag-instance-row" onClick={() => openPanel(inst)}>
                    <AgentOrb color={meta.color} name={meta.name} size={32} />
                    <span className="ag-instance-body">
                      <span className="ag-instance-name">{meta.name}</span>
                      <span className="ag-instance-task">{inst.task}</span>
                    </span>
                    {assignee && (
                      <span className="ag-instance-assignee" title={assignee.name}>
                        <img className="ag-instance-assignee-avatar" src={assignee.avatar} alt="" />
                        <span className="ag-instance-assignee-name">{assignee.name.split(' ')[0]}</span>
                      </span>
                    )}
                    {inst.attention ? (
                      <span className="am-chip-attention">
                        <span className="am-chip-attention-dot" aria-hidden="true" />
                        {inst.attention}
                      </span>
                    ) : (
                      <span className={`ag-instance-status ag-instance-status-${inst.status || 'idle'}`}>
                        <span className="ag-instance-status-dot" />
                        {inst.status === 'working' ? 'Working' : 'Idle'}
                      </span>
                    )}
                  </button>
                );
              });
            })()}
          </div>

          <div className="ag-col-label ag-col-label-shared">Shared agents</div>
          <div className="ag-instance-list">
            {instances.filter(i => i.scope === 'shared').map(inst => {
              const meta = ROAM_AGENTS[inst.kind];
              return (
                <button key={inst.id} className="ag-instance-row" onClick={() => openPanel(inst)}>
                  <AgentOrb color={meta.color} name={meta.name} size={32} />
                  <span className="ag-instance-body">
                    <span className="ag-instance-name">{meta.name}</span>
                    <span className="ag-instance-task">{inst.task}</span>
                  </span>
                  {inst.watchers?.length > 0 && (
                    <span className="ag-watchers" aria-label="People watching this agent">
                      {inst.watchers.slice(0, 3).map((src, i) => (
                        <img key={i} className="ag-watcher-avatar" src={src} alt="" />
                      ))}
                    </span>
                  )}
                  {inst.attention ? (
                    <span className="am-chip-attention">
                      <span className="am-chip-attention-dot" aria-hidden="true" />
                      {inst.attention}
                    </span>
                  ) : (
                    <span className={`ag-instance-status ag-instance-status-${inst.status || 'idle'}`}>
                      <span className="ag-instance-status-dot" />
                      {inst.status === 'working' ? 'Working' : 'Idle'}
                    </span>
                  )}
                </button>
              );
            })}
            {instances.filter(i => i.scope === 'shared').length === 0 && (
              <div className="ag-instance-empty">No shared agents yet.</div>
            )}
          </div>
        </div>
      </div>

      {panelMounted && (
        <>
          <div
            className={`am-scrim ${panelVisible ? 'am-scrim-visible' : ''}`}
            onMouseDown={(e) => { e.stopPropagation(); closePanel(); }}
            aria-hidden="true"
          />
          <AgentPanel agent={selectedAgent} visible={panelVisible} onClose={closePanel} />
        </>
      )}

      {assignKind && (
        <AssignDialog
          kind={assignKind}
          onAssign={handleAssign}
          onClose={() => setAssignKind(null)}
        />
      )}
    </div>
  );
}

function AssignDialog({ kind, onAssign, onClose }) {
  const meta = ROAM_AGENTS[kind];
  const [task, setTask] = useState('');
  const [assigneeId, setAssigneeId] = useState(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = PEOPLE.find(p => p.id === assigneeId);
  const filtered = PEOPLE.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const pick = (p) => {
    setAssigneeId(p.id);
    setQuery(p.name);
    setOpen(false);
  };

  const submit = () => {
    if (!assigneeId) return;
    onAssign({ kind, assigneeId, task });
  };

  return (
    <div className="ag-assign-overlay" onMouseDown={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="ag-assign-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ag-assign-head">
          <AgentOrb color={meta.color} name={meta.name} size={36} />
          <div className="ag-assign-titles">
            <div className="ag-assign-title">Assign {meta.name}</div>
            <div className="ag-assign-sub">Pick someone and tell it what to work on.</div>
          </div>
          <button className="am-panel-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="ag-assign-body">
          <div className="ag-assign-section">
            <label className="ag-assign-label" htmlFor="ag-assign-input">Assign to</label>
            <div className="ag-assign-input-wrap">
              {selected && <img className="ag-assign-input-avatar" src={selected.avatar} alt="" />}
              <input
                id="ag-assign-input"
                className="ag-assign-input"
                type="text"
                placeholder="Type a name…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setAssigneeId(null);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                autoComplete="off"
              />
              {open && filtered.length > 0 && (
                <div className="ag-assign-suggestions">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="ag-assign-suggestion"
                      onMouseDown={(e) => { e.preventDefault(); pick(p); }}
                    >
                      <img src={p.avatar} alt="" />
                      <span className="ag-assign-suggestion-name">{p.name}</span>
                      <span className="ag-assign-suggestion-role">{p.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ag-assign-section">
            <label className="ag-assign-label" htmlFor="ag-assign-task">Task</label>
            <textarea
              id="ag-assign-task"
              className="ag-assign-task"
              placeholder={`Describe what you'd like ${meta.name} to do…`}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="ag-assign-actions">
          <button type="button" className="am-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="am-btn am-btn-primary" onClick={submit} disabled={!assigneeId}>Assign</button>
        </div>
      </div>
    </div>
  );
}

export default function AgentMapView() {
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

  return (
    <div className="agent-map-view">
      <div className="agent-map-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }} />
      <AgentGarageWindow />
    </div>
  );
}
