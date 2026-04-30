import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Calendar.css';

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const SLOT_PX = 56;

// Static demo events for today's grid. Times are in 24h.
const EVENTS = [
  { id: 'e1', title: 'Design Review — Dock v3', start: 9, end: 10, attendees: ['Ava L.', 'Michael W.', 'Emily C.'], location: 'Design Review', organizer: 'Ava L.' },
  { id: 'e2', title: 'R&D Standup', start: 10.25, end: 10.75, attendees: ['Garima K.', 'Ava L.', 'Mia C.', 'Sarah M.', 'Daniel R.'], location: 'Daily Standup', organizer: 'Garima K.' },
  { id: 'e3', title: 'Roam Strategy Sync', start: 11, end: 11.75, attendees: ['Howard L.', 'Klas L.', 'Keegan L.', 'Joe W.'], location: 'Howard L.', organizer: 'Howard L.' },
  { id: 'e4', title: 'Lunch w/ Jon', start: 12.5, end: 13.25, attendees: ['Jon B.'], location: 'BER ↔ NYC', organizer: 'Jon B.' },
  { id: 'e5', title: 'Pricing tiers v2 — review', start: 14, end: 15, attendees: ['Jessica H.', 'Ava L.', 'Mattias L.', 'Joe W.'], location: 'Engineering Pods', organizer: 'Jessica H.' },
  { id: 'e6', title: 'Customer call — Acme', start: 15.5, end: 16, attendees: ['Lexi B.', 'Will H.'], location: 'Sales Floor', organizer: 'Lexi B.' },
  { id: 'e7', title: 'On-Air: Q2 All-Hands', start: 17, end: 18, attendees: ['Howard L.', 'Klas L.', 'Joe W.', '…everyone'], location: 'Theater', organizer: 'Klas L.' },
];

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

function fmtHour(h) {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayH = ((hour + 11) % 12) + 1;
  return min === 0 ? `${displayH} ${period}` : `${displayH}:${String(min).padStart(2, '0')} ${period}`;
}

function fmtTimeRange(start, end) {
  return `${fmtHour(start).replace(' ', '')} – ${fmtHour(end).replace(' ', '')}`;
}

function todayHeader() {
  const d = new Date();
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  const day = d.getDate();
  return { weekday, label: `${month} ${day}` };
}

export default function Calendar({ win, onDrag }) {
  const [closing, setClosing] = useState(false);
  const [selectedId, setSelectedId] = useState('e3');
  const gridRef = useRef(null);
  const { weekday, label } = todayHeader();

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => win.close(), 200);
  };

  const selected = useMemo(() => EVENTS.find(e => e.id === selectedId) || null, [selectedId]);

  // Live "now" indicator position (within the visible time range only).
  const [nowTop, setNowTop] = useState(() => {
    const d = new Date();
    return (d.getHours() + d.getMinutes() / 60 - DAY_START_HOUR) * SLOT_PX;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNowTop((d.getHours() + d.getMinutes() / 60 - DAY_START_HOUR) * SLOT_PX);
    }, 30000);
    return () => clearInterval(id);
  }, []);
  const showNow = nowTop >= 0 && nowTop <= (DAY_END_HOUR - DAY_START_HOUR) * SLOT_PX;

  // Auto-scroll so the now-line (or the selected event) is in view.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const target = showNow ? nowTop : selected ? (selected.start - DAY_START_HOUR) * SLOT_PX : 0;
    grid.scrollTop = Math.max(0, target - 120);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`cal-win ${!win.isFocused ? 'cal-win-unfocused' : ''} ${closing ? 'cal-win-closing' : ''}`}
      style={{ left: win.position.x, top: win.position.y, zIndex: win.zIndex }}
      onMouseDown={() => win.focus()}
    >
      <div className="cal-header" onMouseDown={onDrag}>
        <div className="cal-lights">
          <button
            type="button"
            aria-label="Close"
            className="unbutton cal-light cal-light-close"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <span aria-hidden="true" className="cal-light cal-light-min" />
          <span aria-hidden="true" className="cal-light cal-light-max" />
        </div>
        <div className="cal-header-title">
          <span className="cal-header-weekday">{weekday}</span>
          <span className="cal-header-date">{label}</span>
        </div>
        <div className="cal-header-actions" onMouseDown={(e) => e.stopPropagation()}>
          <button className="cal-icon-btn" type="button" aria-label="Previous day">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="cal-today-btn" type="button">Today</button>
          <button className="cal-icon-btn" type="button" aria-label="Next day">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div className="cal-body">
        <div className="cal-grid" ref={gridRef} onClick={() => setSelectedId(null)}>
          <div className="cal-grid-inner" style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * SLOT_PX }}>
            {HOURS.map((h, i) => (
              <div key={h} className="cal-row" style={{ top: i * SLOT_PX }}>
                <div className="cal-time">{fmtHour(h)}</div>
                <div className="cal-row-line" />
              </div>
            ))}

            {EVENTS.map(ev => {
              const top = (ev.start - DAY_START_HOUR) * SLOT_PX;
              const height = (ev.end - ev.start) * SLOT_PX;
              const isSelected = ev.id === selectedId;
              const isShort = (ev.end - ev.start) <= 0.5;
              return (
                <button
                  key={ev.id}
                  type="button"
                  className={`cal-event ${isSelected ? 'cal-event-selected' : ''} ${isShort ? 'cal-event-short' : ''}`}
                  style={{ top, height }}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(ev.id); }}
                >
                  <span className="cal-event-title">{ev.title}</span>
                  <span className="cal-event-time">{fmtTimeRange(ev.start, ev.end)}</span>
                </button>
              );
            })}

            {showNow && (
              <div className="cal-now" style={{ top: nowTop }}>
                <div className="cal-now-dot" />
                <div className="cal-now-line" />
              </div>
            )}
          </div>
        </div>

        <div className="cal-detail">
          {selected ? (
            <>
              <div className="cal-detail-header">
                <div className="cal-detail-title">{selected.title}</div>
                <div className="cal-detail-time">{fmtTimeRange(selected.start, selected.end)}</div>
              </div>

              <div className="cal-section">
                <div className="cal-section-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.24 1.5 3 3.74 3 6.5C3 10.25 8 14.5 8 14.5C8 14.5 13 10.25 13 6.5C13 3.74 10.76 1.5 8 1.5ZM8 8.25C7.03 8.25 6.25 7.47 6.25 6.5C6.25 5.53 7.03 4.75 8 4.75C8.97 4.75 9.75 5.53 9.75 6.5C9.75 7.47 8.97 8.25 8 8.25Z" fill="currentColor" /></svg>
                </div>
                <div className="cal-section-body">
                  <div className="cal-section-name">Location</div>
                  <div className="cal-section-value">{selected.location}</div>
                </div>
              </div>

              <div className="cal-section">
                <div className="cal-section-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 8C9.66 8 11 6.66 11 5C11 3.34 9.66 2 8 2C6.34 2 5 3.34 5 5C5 6.66 6.34 8 8 8ZM8 9.5C5.79 9.5 2 10.6 2 12.75V14H14V12.75C14 10.6 10.21 9.5 8 9.5Z" fill="currentColor" /></svg>
                </div>
                <div className="cal-section-body">
                  <div className="cal-section-name">Organizer</div>
                  <div className="cal-section-value cal-section-value-secondary">{selected.organizer}</div>
                </div>
              </div>

              <div className="cal-section">
                <div className="cal-section-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.5 7.5C6.6 7.5 7.5 6.6 7.5 5.5C7.5 4.4 6.6 3.5 5.5 3.5C4.4 3.5 3.5 4.4 3.5 5.5C3.5 6.6 4.4 7.5 5.5 7.5ZM10.5 7.5C11.6 7.5 12.5 6.6 12.5 5.5C12.5 4.4 11.6 3.5 10.5 3.5C9.4 3.5 8.5 4.4 8.5 5.5C8.5 6.6 9.4 7.5 10.5 7.5ZM5.5 8.75C3.95 8.75 1 9.55 1 11.13V12.5H10V11.13C10 9.55 7.05 8.75 5.5 8.75ZM10.5 8.75C10.31 8.75 10.09 8.76 9.86 8.79C10.6 9.36 11.13 10.13 11.13 11.13V12.5H15V11.13C15 9.55 12.05 8.75 10.5 8.75Z" fill="currentColor" /></svg>
                </div>
                <div className="cal-section-body">
                  <div className="cal-section-name">Attendees</div>
                  <div className="cal-attendees">
                    {selected.attendees.map(a => (
                      <div key={a} className="cal-attendee">
                        <span className="cal-attendee-name">{a}</span>
                        <span className="cal-attendee-status" aria-label="Accepted">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" /><path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cal-detail-footer">
                <button type="button" className="cal-copy-link">Copy Meeting Link</button>
              </div>
            </>
          ) : (
            <div className="cal-empty">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>Select an event for details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
