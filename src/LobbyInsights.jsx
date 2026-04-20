import React, { useId, useMemo, useRef, useState, useCallback } from 'react';

const ACCENT = '#6e31e7';
const GREEN = '#46d08f';
const BLUE = '#2c80ff';
const RED = '#ef5350';
const YELLOW = '#ffc107';

function catmullRomToBezier(points) {
  if (points.length < 2) return '';
  if (points.length === 2) return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;
  const pts = [points[0], ...points, points[points.length - 1]];
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
    const cp1x = p1.x + ((p2.x - p0.x) * 0.5) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * 0.5) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * 0.5) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * 0.5) / 6;
    d += `C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
  }
  return d;
}

function TrendLineChart({ data, lines, height = 200, xKey = 'date' }) {
  const baseId = useId();
  const gradientIds = lines.map((l) => `gradient-${l.dataKey}-${baseId}`);
  const [hoverIndex, setHoverIndex] = useState(null);
  const overlayRef = useRef(null);

  const PADDING = { top: 12, right: 8, bottom: 4, left: 8 };
  const VIEW_WIDTH = 600;
  const PLOT_HEIGHT = height - PADDING.top - PADDING.bottom;
  const PLOT_WIDTH = VIEW_WIDTH - PADDING.left - PADDING.right;

  const computed = useMemo(() => {
    if (data.length < 2) return null;
    let globalMin = Infinity, globalMax = -Infinity;
    for (const line of lines) for (const d of data) {
      const v = d[line.dataKey];
      if (v < globalMin) globalMin = v;
      if (v > globalMax) globalMax = v;
    }
    const range = globalMax - globalMin || 1;
    const minVal = globalMin - range * 0.05;
    const maxVal = globalMax + range * 0.1;
    const adjustedRange = maxVal - minVal;
    const lineData = lines.map((line) => {
      const points = data.map((d, i) => ({
        x: PADDING.left + (i / (data.length - 1)) * PLOT_WIDTH,
        y: PADDING.top + PLOT_HEIGHT * (1 - (d[line.dataKey] - minVal) / adjustedRange),
      }));
      const linePath = catmullRomToBezier(points);
      const baseline = PADDING.top + PLOT_HEIGHT;
      const areaPath = `${linePath}L${points[points.length - 1].x},${baseline}L${points[0].x},${baseline}Z`;
      return { points, linePath, areaPath };
    });
    const tickIndices = [0, Math.floor(data.length / 2), data.length - 1];
    return { lineData, tickIndices };
  }, [data, lines, PLOT_HEIGHT, PLOT_WIDTH, PADDING.left, PADDING.top]);

  const handlePointerMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xFraction = (e.clientX - rect.left) / rect.width;
    const nearest = Math.round(xFraction * (data.length - 1));
    setHoverIndex(Math.max(0, Math.min(nearest, data.length - 1)));
  }, [data.length]);

  if (!computed) return null;
  const { lineData, tickIndices } = computed;
  const hoverXPercent = hoverIndex !== null ? (hoverIndex / (data.length - 1)) * 100 : 0;

  return (
    <div className="lbi-chart">
      <div className="lbi-chart-plot" style={{ height }}>
        <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} className="lbi-chart-svg" preserveAspectRatio="none">
          <defs>
            {lines.map((line, i) => (
              <linearGradient key={i} id={gradientIds[i]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {[0.25, 0.5, 0.75].map((frac) => (
            <line key={frac}
              x1={PADDING.left} y1={PADDING.top + PLOT_HEIGHT * frac}
              x2={PADDING.left + PLOT_WIDTH} y2={PADDING.top + PLOT_HEIGHT * frac}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          ))}
          {lineData.map((ld, i) => (
            <path key={`area-${i}`} d={ld.areaPath} fill={`url(#${gradientIds[i]})`} />
          ))}
          {lineData.map((ld, i) => (
            <path key={`line-${i}`} d={ld.linePath} fill="none" stroke={lines[i].color}
              strokeWidth={lines[i].strokeWidth ?? 1.5} />
          ))}
        </svg>
        {hoverIndex !== null && (
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} className="lbi-chart-dots" preserveAspectRatio="none">
            {lineData.map((ld, li) => {
              const pt = ld.points[hoverIndex];
              return (
                <ellipse key={li} cx={pt.x} cy={pt.y}
                  rx={3 * (VIEW_WIDTH / 600)} ry={3 * (height / 200)}
                  fill={lines[li].color} stroke="#1d1e20"
                  strokeWidth={Math.max(VIEW_WIDTH / 600, height / 200) * 1.5} />
              );
            })}
          </svg>
        )}
        <div ref={overlayRef} className="lbi-chart-overlay"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}>
          {hoverIndex !== null && (
            <div className="lbi-chart-cursor" style={{ left: `${hoverXPercent}%` }} />
          )}
          {hoverIndex !== null && (
            <div className="lbi-chart-tooltip" style={{ left: `${hoverXPercent}%` }}>
              <div className="lbi-chart-tooltip-date">{data[hoverIndex][xKey]}</div>
              <div className="lbi-chart-tooltip-rows">
                {lines.map((line) => (
                  <div key={line.dataKey} className="lbi-chart-tooltip-row">
                    <div className="lbi-legend-dot" style={{ background: line.color }} />
                    <span>{data[hoverIndex][line.dataKey]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lbi-chart-xaxis">
        {tickIndices.map((idx) => (
          <span key={idx} className="lbi-chart-xlabel">{data[idx][xKey]}</span>
        ))}
      </div>
    </div>
  );
}

const eventTrendsChartData = [
  { date: 'Jan 5',  booked: 14, completed: 12, rescheduled: 1, cancelled: 2 },
  { date: 'Jan 12', booked: 16, completed: 14, rescheduled: 2, cancelled: 1 },
  { date: 'Jan 19', booked: 12, completed: 10, rescheduled: 1, cancelled: 2 },
  { date: 'Jan 26', booked: 18, completed: 16, rescheduled: 3, cancelled: 1 },
  { date: 'Feb 2',  booked: 15, completed: 13, rescheduled: 2, cancelled: 1 },
  { date: 'Feb 9',  booked: 20, completed: 18, rescheduled: 1, cancelled: 2 },
  { date: 'Feb 16', booked: 22, completed: 20, rescheduled: 2, cancelled: 1 },
  { date: 'Feb 23', booked: 26, completed: 24, rescheduled: 3, cancelled: 2 },
  { date: 'Mar 2',  booked: 30, completed: 28, rescheduled: 2, cancelled: 1 },
];

const dropInChartData = [
  { date: 'Jan 5',  attempted: 5, accepted: 4 },
  { date: 'Jan 12', attempted: 7, accepted: 6 },
  { date: 'Jan 19', attempted: 6, accepted: 5 },
  { date: 'Jan 26', attempted: 8, accepted: 7 },
  { date: 'Feb 2',  attempted: 7, accepted: 6 },
  { date: 'Feb 9',  attempted: 9, accepted: 8 },
  { date: 'Feb 16', attempted: 10, accepted: 9 },
  { date: 'Feb 23', attempted: 12, accepted: 11 },
  { date: 'Mar 2',  attempted: 14, accepted: 12 },
];

const lobbyLinks = [
  { name: 'May I Meet You?',     slug: 'ro.am/howard',           booked: 89, showRate: 91, showColor: GREEN,  dropIns: 24 },
  { name: 'Hour with Howard',    slug: 'ro.am/howard/hour',      booked: 42, showRate: 88, showColor: YELLOW, dropIns: 8  },
  { name: "Howard's Lobby",      slug: 'ro.am/howard/next',      booked: 67, showRate: 94, showColor: GREEN,  dropIns: 31 },
  { name: 'Onboard Your Company',slug: 'ro.am/howard/roamgineer',booked: 38, showRate: 97, showColor: GREEN,  dropIns: 5  },
];

const people = [
  { avatar: '/headshots/howard-lerman.jpg',   name: 'Howard L.',  booked: 89, completed: 78, cancelled: 6, showRate: 88, showColor: YELLOW, dropIns: 34 },
  { avatar: '/headshots/chelsea-turbin.jpg',  name: 'Chelsea T.', booked: 52, completed: 46, cancelled: 4, showRate: 88, showColor: YELLOW, dropIns: 15 },
  { avatar: '/headshots/john-huffsmith.jpg',  name: 'Huffy S.',   booked: 44, completed: 37, cancelled: 2, showRate: 84, showColor: YELLOW, dropIns: 15 },
];

function StatCard({ label, value, change, changeColor = 'green' }) {
  return (
    <div className="lbi-card lbi-stat">
      <span className="lbi-mono-label">{label}</span>
      <span className="lbi-stat-value">{value}</span>
      <span className={`lbi-mono-small ${changeColor === 'green' ? 'lbi-green' : 'lbi-red'}`}>{change}</span>
    </div>
  );
}

function PerfCard({ label, value, valueColor, subtitle }) {
  return (
    <div className="lbi-card lbi-stat">
      <span className="lbi-mono-label">{label}</span>
      <span className="lbi-stat-value" style={{ color: valueColor }}>{value}</span>
      <span className="lbi-mono-small">{subtitle}</span>
    </div>
  );
}

function LegendChip({ color, label }) {
  return (
    <div className="lbi-legend-chip">
      <div className="lbi-legend-dot" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

export default function LobbyInsights() {
  return (
    <div className="lbi-wrap">
      <div className="lbi-section-label">Events</div>
      <div className="lbi-grid-2x2">
        <StatCard label="Meetings Booked"    value="185" change="▲ 22% from last period" />
        <StatCard label="Meetings Completed" value="161" change="▲ 18% from last period" />
        <StatCard label="Rescheduled"        value="12"  change="▲ 8% from last period"  />
        <StatCard label="Cancelled"          value="12"  change="▼ 15% from last period" changeColor="red" />
      </div>

      <div className="lbi-section-label">Performance</div>
      <div className="lbi-row">
        <PerfCard label="No-Show (Host)"  value="2"  valueColor={RED}    subtitle="1.2% of completed" />
        <PerfCard label="No-Show (Guest)" value="10" valueColor={YELLOW} subtitle="6.2% of completed" />
        <PerfCard label="Drop-Ins"        value="64" valueColor={GREEN}  subtitle="74 attempted · 86% accepted" />
      </div>

      <div className="lbi-card">
        <div className="lbi-card-header">
          <span className="lbi-mono-label">Event Trends</span>
          <div className="lbi-legend-chips">
            <LegendChip color={ACCENT} label="Booked" />
            <LegendChip color={GREEN}  label="Completed" />
            <LegendChip color={BLUE}   label="Rescheduled" />
            <LegendChip color={RED}    label="Cancelled" />
          </div>
        </div>
        <TrendLineChart
          data={eventTrendsChartData}
          lines={[
            { dataKey: 'booked',      color: ACCENT, strokeWidth: 1.5 },
            { dataKey: 'completed',   color: GREEN,  strokeWidth: 1.5 },
            { dataKey: 'rescheduled', color: BLUE,   strokeWidth: 1 },
            { dataKey: 'cancelled',   color: RED,    strokeWidth: 1 },
          ]}
          height={200}
        />
      </div>

      <div className="lbi-card">
        <div className="lbi-card-header">
          <span className="lbi-mono-label">Drop-In Activity</span>
          <div className="lbi-legend-chips">
            <LegendChip color={BLUE}  label="Attempted" />
            <LegendChip color={GREEN} label="Accepted" />
          </div>
        </div>
        <TrendLineChart
          data={dropInChartData}
          lines={[
            { dataKey: 'attempted', color: BLUE,  strokeWidth: 1.5 },
            { dataKey: 'accepted',  color: GREEN, strokeWidth: 1.5 },
          ]}
          height={180}
        />
      </div>

      <div className="lbi-section-label">By Lobby Link</div>
      <div className="lbi-table-wrap">
        <table className="lbi-table">
          <thead>
            <tr><th>Lobby</th><th>Booked</th><th>Show Rate</th><th>Drop-Ins</th></tr>
          </thead>
          <tbody>
            {lobbyLinks.map((link, i) => (
              <tr key={i}>
                <td>
                  <div className="lbi-table-name">{link.name}</div>
                  <div className="lbi-table-slug">{link.slug}</div>
                </td>
                <td className="lbi-num">{link.booked}</td>
                <td>
                  <div className="lbi-showrate">
                    <div className="lbi-showrate-track">
                      <div className="lbi-showrate-fill" style={{ width: `${link.showRate}%`, background: link.showColor }} />
                    </div>
                    <span style={{ color: link.showColor }}>{link.showRate}%</span>
                  </div>
                </td>
                <td style={{ color: BLUE }}>{link.dropIns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lbi-section-label">By Person</div>
      <div className="lbi-table-wrap">
        <table className="lbi-table">
          <thead>
            <tr><th>Person</th><th>Booked</th><th className="lbi-col-hide-sm">Completed</th><th className="lbi-col-hide-sm">Cancelled</th><th>Show Rate</th><th>Drop-Ins</th></tr>
          </thead>
          <tbody>
            {people.map((person, i) => (
              <tr key={i}>
                <td>
                  <div className="lbi-person">
                    <img src={person.avatar} alt={person.name} />
                    <span>{person.name}</span>
                  </div>
                </td>
                <td className="lbi-num">{person.booked}</td>
                <td className="lbi-num lbi-col-hide-sm">{person.completed}</td>
                <td className="lbi-num lbi-col-hide-sm">{person.cancelled}</td>
                <td>
                  <div className="lbi-showrate">
                    <div className="lbi-showrate-track">
                      <div className="lbi-showrate-fill" style={{ width: `${person.showRate}%`, background: person.showColor }} />
                    </div>
                    <span style={{ color: person.showColor }}>{person.showRate}%</span>
                  </div>
                </td>
                <td style={{ color: BLUE }}>{person.dropIns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
