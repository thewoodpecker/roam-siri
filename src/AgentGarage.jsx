import React, { useEffect, useRef, useState } from 'react';
import ShowcaseMap from './ShowcaseMap';
import { AgentGarageWindow } from './AgentMap';
import { getAgentOrbDataUri } from './agentOrb.utils';
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

function GaragePopup({ onClose }) {
  const [pos, setPos] = useState({ x: 32, y: 32 });
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
      <AgentGarageWindow onTitlebarMouseDown={onTitlebarMouseDown} onClose={onClose} />
    </div>
  );
}

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
  const [garageOpen, setGarageOpen] = useState(false);

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

  // Build the agents room data for ShowcaseMap. Each agent person gets the
  // letter-monogram avatar so the GameHex renders the right colored circle.
  const agentsRoom = {
    replacesId: 'hp-demo',
    name: 'Agents',
    leaderboardLabel: 'Agent Garage',
    onLeaderboardClick: () => setGarageOpen(true),
    people: AGENTS.map(a => ({
      name: a.name,
      fullName: a.name,
      avatar: agentAvatarUri(a),
      _agentId: a.id,
      _hoverInfo: {
        name: a.name,
        task: a.details?.title || a.tag,
        status: a.status || 'idle',
      },
    })),
    onPersonClick: (person) => {
      const agent = AGENTS.find(a => a.id === person._agentId);
      if (agent) toggleAgent({ ...agent, unassigned: true });
    },
  };

  // Per-office agent assignments — these agents sit next to their assignee
  // in that person's private office on the map. Map names match what's in
  // FLOORS data (e.g. "Howard L." for the homepage hp7 office).
  const OFFICE_ASSIGNMENT_MAP = {
    'Howard L.': ['writer'],
    'Joe W.':    ['designer'],
  };
  const officeAgents = {};
  for (const [mapName, kinds] of Object.entries(OFFICE_ASSIGNMENT_MAP)) {
    officeAgents[mapName] = kinds.map(kind => {
      const a = AGENTS.find(x => x.id === kind);
      if (!a) return null;
      return {
        name: a.name,
        fullName: a.name,
        avatar: agentAvatarUri(a),
        _agentId: a.id,
        _onAgentClick: () => toggleAgent(a),
        _hoverInfo: {
          name: a.name,
          task: a.details?.title || a.tag,
          status: a.status || 'working',
        },
      };
    }).filter(Boolean);
  }

  return (
    <div className="ag-shell">
      <div className="ag-wallpaper" style={{ backgroundImage: `url(/wallpapers/wallpaper-${theme}.png)` }} />

      <div className="ag-map-host">
        <ShowcaseMap embedded initialFloor="Homepage" agentsRoom={agentsRoom} officeAgents={officeAgents} />
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

      {garageOpen && (
        <GaragePopup onClose={() => setGarageOpen(false)} />
      )}
    </div>
  );
}
