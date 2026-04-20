import React, { useState } from 'react';
import './MagicMinutes.css';

const VIDEO_PEOPLE = [
  { name: 'Lexi Bohonnon', img: '/headshots/lexi-bohonnon.jpg' },
  { name: 'Howard Lerman', img: '/headshots/howard-lerman.jpg' },
  { name: 'Grace Sutherland', img: '/headshots/grace-sutherland.jpg' },
  { name: 'Chelsea Turbin', img: '/headshots/chelsea-turbin.jpg' },
];

const TRANSCRIPT = [
  { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '00:12', text: "Alright, let's dive into the Q2 roadmap. The big theme this quarter is AI — specifically how we embed intelligence deeper into the Roam virtual office experience. Howard, want to kick us off with the vision?", active: false },
  { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '00:38', text: "Absolutely. The core idea is that Roam should feel like it anticipates what you need. AI-powered meeting summaries, smart room suggestions based on who you're collaborating with, and intelligent notifications that know when to interrupt you and when to stay quiet.", active: false },
  { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '01:05', text: "From a people perspective, the AI assistant features could be transformative. Imagine onboarding a new hire and the system automatically suggests which rooms to visit, who to meet, and surfaces relevant past conversations. That's a huge unlock for culture at scale.", active: false },
  { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '01:19', text: "On the product side, I think Magic Minutes is the flagship AI feature for Q2. Auto-generated meeting summaries, action items, and the ability to ask questions about past meetings privately — that's what our beta users are most excited about.", active: true },
  { name: 'Lexi Bohonnon', avatar: '/headshots/lexi-bohonnon.jpg', time: '01:59', text: "Technically we're looking at a hybrid approach — on-device transcription for privacy and low latency, with cloud-based summarization for the heavy lifting. We've been prototyping with Whisper for transcription and our own fine-tuned models for summarization. Early results are promising.", active: false },
  { name: 'Howard Lerman', avatar: '/headshots/howard-lerman.jpg', time: '02:34', text: "The competitive angle here is key. Zoom and Teams bolt AI on top. We're building it into the fabric of the virtual office — AI that understands spatial context, knows who's in which room, what projects they're working on, and can connect dots across conversations automatically.", active: false },
  { name: 'Grace Sutherland', avatar: '/headshots/grace-sutherland.jpg', time: '03:15', text: "We should also think about the AI coaching angle — helping managers understand collaboration patterns, identifying team members who might be siloed, and suggesting organic ways to build cross-functional relationships in the virtual office.", active: false },
  { name: 'Chelsea Turbin', avatar: '/headshots/chelsea-turbin.jpg', time: '03:40', text: "Agreed. I'll put together the detailed spec for the AI features tier — Magic Minutes as the hero, smart notifications as the foundation, and the coaching dashboard as the enterprise upsell. Let's reconvene mid-May to check progress against OKRs.", active: false },
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
  const minutes = [1, 2, 3, 4, null, 6];
  for (let m = 0; m < minutes.length; m++) {
    // 2 dots before each minute mark
    items.push(<div key={`d1-${m}`} className="mm-ruler-dot" />);
    items.push(<div key={`d2-${m}`} className="mm-ruler-dot" />);
    // tick
    items.push(<div key={`t-${m}`} className="mm-ruler-tick" />);
    // 2 dots after tick
    items.push(<div key={`d3-${m}`} className="mm-ruler-dot" />);
    items.push(<div key={`d4-${m}`} className="mm-ruler-dot" />);
    // minute label (or skip)
    if (minutes[m]) {
      items.push(<span key={`l-${m}`} className="mm-ruler-label">{minutes[m]}m</span>);
    }
    // 2 more dots
    items.push(<div key={`d5-${m}`} className="mm-ruler-dot" />);
    items.push(<div key={`d6-${m}`} className="mm-ruler-dot" />);
    // tick between groups
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

export default function MagicMinutes({ win, onDrag }) {
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  return (
    <div
      className={`mm-win ${!win.isFocused ? 'mm-win-unfocused' : ''} ${closing ? 'mm-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      {/* Header */}
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

      {/* Body */}
      <div className="mm-body">
        {/* Left panel — Summary */}
        <div className="mm-left">
          <div className="mm-left-header">
            <div className="mm-left-header-left">
              <span className="mm-left-title">Q2 Roadmap</span>
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
                  <span>11:30 AM - 12:00 PM</span>
                </div>
                <div className="mm-meta-row">
                  <span className="mm-meta-icon"><img src="/icons/mm-calendar.svg" alt="" width="16" height="16" /></span>
                  <span>Maps Standup</span>
                </div>
                <div className="mm-meta-row">
                  <span className="mm-meta-icon"><img src="/icons/mm-location.svg" alt="" width="16" height="16" /></span>
                  <span>Walt Disney</span>
                </div>
              </div>

              <div>
                <p className="mm-brief-title">Call Brief</p>
                <p className="mm-brief-text">
                  The team aligned on making AI the centerpiece of the Q2 roadmap for Roam's virtual office. Discussion covered three pillars: Magic Minutes as the flagship AI feature (auto-summaries, action items, private Q&A), smart notifications that understand spatial and collaboration context, and an AI coaching dashboard for enterprise. The group agreed on a hybrid architecture — on-device transcription for privacy with cloud-based summarization — and identified competitive differentiation through deeply integrated spatial AI rather than bolt-on features.
                </p>
              </div>

              <div className="mm-separator" />

              <div>
                <p className="mm-steps-title">Next Steps</p>
                <ul className="mm-steps-list">
                  <li>Ship Magic Minutes beta with auto-summaries and action item extraction to internal dogfood group by end of April. 00:12</li>
                  <li>Finalize hybrid AI architecture — on-device Whisper transcription paired with cloud summarization — and complete security review. 01:59</li>
                  <li>Build smart notification system that respects spatial context (room type, focus mode, collaboration signals). 02:34</li>
                  <li>Chelsea to spec the AI features tier: Magic Minutes hero, smart notifications foundation, coaching dashboard enterprise upsell. 03:40</li>
                  <li>Schedule mid-May check-in to assess progress against Q2 OKRs and adjust resourcing if enterprise pilots accelerate. 03:40</li>
                  <li>Coordinate with marketing on AI messaging and competitive positioning vs. Zoom/Teams bolt-on approach. 02:34</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="mm-transcript">
              {TRANSCRIPT.map((entry, i) => (
                <div key={i} className={`mm-transcript-entry ${entry.active ? 'mm-transcript-entry-active' : ''}`}>
                  <img src={entry.avatar} alt="" className="mm-transcript-avatar" />
                  <div className="mm-transcript-content">
                    <div className="mm-transcript-name">{entry.name}</div>
                    <p className="mm-transcript-text">
                      <span className="mm-transcript-time">{entry.time}</span>{' '}
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))}
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
          <div className="mm-video-area">
            <img src="/icons/mm-video-placeholder.png" alt="" className="mm-video-placeholder" />
            <div className="mm-play-btn">
              <PlayIcon />
            </div>
          </div>

          <div className="mm-controls">
            <div className="mm-controls-left">
              <button className="mm-control-btn"><img src="/icons/mm-play.svg" alt="" width="16" height="16" /></button>
              <span className="mm-controls-time">
                <span className="mm-controls-time-current">1:19 </span>
                <span className="mm-controls-time-total">/ 3:48</span>
              </span>
            </div>
            <div className="mm-controls-right">
              <button className="mm-control-btn"><img src="/icons/mm-trim.svg" alt="" width="16" height="16" /></button>
              <button className="mm-control-btn"><img src="/icons/mm-volume.svg" alt="" width="16" height="16" /></button>
              <button className="mm-control-btn"><img src="/icons/mm-stopwatch.svg" alt="" width="16" height="16" /></button>
              <button className="mm-control-btn"><img src="/icons/mm-arrow.svg" alt="" width="16" height="16" /></button>
            </div>
          </div>

          <div className="mm-timeline-section">
            <div className="mm-timeline-handle">
              <img src="/icons/mm-handle.svg" alt="" width="16" />
              <div className="mm-timeline-handle-line" />
            </div>
            <Ruler />
            <div className="mm-speakers">
              {/* Lexi Bohonnon — green */}
              <div className="mm-speaker">
                <div className="mm-speaker-header">
                  <div className="mm-speaker-dot-wrap">
                    <div className="mm-speaker-dot" style={{ background: '#46d08f' }} />
                  </div>
                  <span className="mm-speaker-name">Lexi Bohonnon</span>
                  <span className="mm-speaker-role">Engineering</span>
                </div>
                <div className="mm-speaker-track">
                  {KLAS_BARS.map((b, i) => (
                    <div key={i} className="mm-speaker-bar" style={{ left: b.left, width: b.width, background: '#46d08f' }} />
                  ))}
                </div>
              </div>

              {/* Howard Lerman — cyan */}
              <div className="mm-speaker">
                <div className="mm-speaker-header">
                  <div className="mm-speaker-dot-wrap">
                    <div className="mm-speaker-dot" style={{ background: '#4dd0e1' }} />
                  </div>
                  <span className="mm-speaker-name">Howard Lerman</span>
                  <span className="mm-speaker-role">CEO, Roam</span>
                </div>
                <div className="mm-speaker-track">
                  {HOWARD_BARS.map((b, i) => (
                    <div key={i} className="mm-speaker-bar" style={{ left: b.left, width: b.width, background: '#4dd0e1' }} />
                  ))}
                </div>
              </div>

              {/* Grace Sutherland — orange */}
              <div className="mm-speaker">
                <div className="mm-speaker-header">
                  <div className="mm-speaker-dot-wrap">
                    <div className="mm-speaker-dot" style={{ background: '#ffb74d' }} />
                  </div>
                  <span className="mm-speaker-name">Grace Sutherland</span>
                  <span className="mm-speaker-role">Chief of People</span>
                </div>
                <div className="mm-speaker-track">
                  {[
                    { left: '3%', width: '8%' },
                    { left: '18%', width: '5%' },
                    { left: '30%', width: '10%' },
                    { left: '48%', width: '4%' },
                    { left: '60%', width: '12%' },
                    { left: '82%', width: '6%' },
                  ].map((b, i) => (
                    <div key={i} className="mm-speaker-bar" style={{ left: b.left, width: b.width, background: '#ffb74d' }} />
                  ))}
                </div>
              </div>

              {/* Chelsea Turbin — purple */}
              <div className="mm-speaker">
                <div className="mm-speaker-header">
                  <div className="mm-speaker-dot-wrap">
                    <div className="mm-speaker-dot" style={{ background: '#b39ddb' }} />
                  </div>
                  <span className="mm-speaker-name">Chelsea Turbin</span>
                  <span className="mm-speaker-role">Product</span>
                </div>
                <div className="mm-speaker-track">
                  {[
                    { left: '5%', width: '4%' },
                    { left: '14%', width: '6%' },
                    { left: '27%', width: '3%' },
                    { left: '42%', width: '9%' },
                    { left: '58%', width: '5%' },
                    { left: '70%', width: '8%' },
                    { left: '88%', width: '7%' },
                  ].map((b, i) => (
                    <div key={i} className="mm-speaker-bar" style={{ left: b.left, width: b.width, background: '#b39ddb' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
