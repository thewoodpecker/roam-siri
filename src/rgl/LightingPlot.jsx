import { useEffect, useRef } from 'react';
import { GLEAM_LIGHT } from './materials';
import { moveLight, useLightRig } from './lightRig';

const VB_W = 248;
const VB_H = 208;
const CX = 124;
const CY = 96;
const SCALE = 12.2;
/** Card glyph is slightly oversized so the tent reads at this size. */
const CARD_LEAF = 1.85;
const OPEN_RAD = (120 * Math.PI) / 180;
const LABEL_SHIFT = {
  key: [10, 3],
  fill: [-10, 3],
  rim: [0, -10],
  front: [20, 2],
};

function plotX(x) {
  return CX + x * SCALE;
}

function plotY(z) {
  return CY + z * SCALE;
}

function clientToWorld(svg, clientX, clientY) {
  const r = svg.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  const x = ((clientX - r.left) / r.width) * VB_W;
  const y = ((clientY - r.top) / r.height) * VB_H;
  return {
    x: (x - CX) / SCALE,
    z: (y - CY) / SCALE,
  };
}

export default function LightingPlot({
  open = false,
  gleamColor = '#ffe7a4',
  canvasHostRef,
}) {
  const { studio, open: openLights } = useLightRig();
  const svgRef = useRef(null);
  const gleamRef = useRef(null);
  const gleamHaloRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    const gleam = gleamRef.current;
    const halo = gleamHaloRef.current;
    if (!gleam || !halo) return undefined;

    const place = (wx, wz, on) => {
      const x = plotX(wx);
      const y = plotY(wz);
      gleam.setAttribute('cx', String(x));
      gleam.setAttribute('cy', String(y));
      halo.setAttribute('cx', String(x));
      halo.setAttribute('cy', String(y));
      const opacity = on ? (open ? '1' : '0.55') : '0';
      gleam.setAttribute('opacity', opacity);
      halo.setAttribute('opacity', on ? (open ? '0.55' : '0.22') : '0');
    };

    const onMove = (e) => {
      if (drag.current) {
        const svg = svgRef.current;
        if (!svg) return;
        const world = clientToWorld(svg, e.clientX, e.clientY);
        if (!world) return;
        moveLight(drag.current.group, drag.current.id, world.x, world.z);
        return;
      }
      const host = canvasHostRef?.current;
      const el = host?.querySelector('canvas') ?? host;
      if (!el) {
        place(0, GLEAM_LIGHT.zClosed, false);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      const over = nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1;
      const gx = Math.max(-1, Math.min(1, nx)) * GLEAM_LIGHT.spanX;
      const gz = GLEAM_LIGHT.zClosed - GLEAM_LIGHT.zOpenDrop * (open ? 1 : 0);
      place(gx, gz, over);
    };

    const onUp = () => {
      drag.current = null;
    };

    place(0, GLEAM_LIGHT.zClosed - GLEAM_LIGHT.zOpenDrop * (open ? 1 : 0), false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [open, canvasHostRef]);

  const startDrag = (group, id) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    drag.current = { group, id };
    const svg = svgRef.current;
    if (svg) {
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {
        /* capture can throw if the pointer is already released */
      }
    }
    const world = clientToWorld(svg, e.clientX, e.clientY);
    if (world) moveLight(group, id, world.x, world.z);
  };

  const coverTip = {
    x: CARD_LEAF * Math.cos(-OPEN_RAD),
    z: -CARD_LEAF * Math.sin(-OPEN_RAD),
  };
  const coverEnd = open
    ? coverTip
    : { x: CARD_LEAF * 0.12, z: CARD_LEAF * 0.04 };
  const rightEnd = { x: CARD_LEAF, z: 0 };

  const studioLights = studio.filter((light) => light.position);
  const namedOpen = openLights.filter((light) => light.position);

  return (
    <svg
      ref={svgRef}
      className="rgl-light-plot"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      aria-label="Top-down lighting plot. Drag a light to move it in the scene. Camera at the bottom."
    >
      <rect className="rgl-light-plot-floor" x="0" y="0" width={VB_W} height={VB_H} rx="6" />
      <line className="rgl-light-plot-axis" x1={CX} y1="18" x2={CX} y2={VB_H - 28} />
      <line className="rgl-light-plot-axis" x1="22" y1={CY} x2={VB_W - 22} y2={CY} />

      {studioLights.map((light) => {
        const [x, , z] = light.position;
        const px = plotX(x);
        const py = plotY(z);
        const [dx, dy] = LABEL_SHIFT[light.id] || [8, 0];
        const lx = px + dx;
        const ly = py + dy;
        const anchor = dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle';
        return (
          <g
            key={`studio-${light.id}`}
            className="rgl-light-plot-handle is-studio"
            onPointerDown={startDrag('studio', light.id)}
          >
            <line
              className="rgl-light-plot-ray"
              x1={px}
              y1={py}
              x2={CX}
              y2={CY}
              stroke={light.color || '#fff'}
            />
            <circle className="rgl-light-plot-hit" cx={px} cy={py} r="12" />
            <circle
              className="rgl-light-plot-studio"
              cx={px}
              cy={py}
              r="4.5"
              fill={light.color || '#fff'}
            />
            <text
              className="rgl-light-plot-label"
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {light.label || light.id}
            </text>
            <title>{light.label || light.id}</title>
          </g>
        );
      })}

      <g className={`rgl-light-plot-open${open ? ' is-on' : ''}`}>
        {namedOpen.map((light) => {
          const [x, , z] = light.position;
          const px = plotX(x);
          const py = plotY(z);
          const [dx, dy] = LABEL_SHIFT[light.id] || [0, 0];
          const lx = px + dx;
          const ly = py + dy;
          const anchor = dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle';
          return (
            <g
              key={light.id}
              className="rgl-light-plot-handle"
              onPointerDown={startDrag('open', light.id)}
            >
              <line
                className="rgl-light-plot-ray"
                x1={px}
                y1={py}
                x2={CX}
                y2={CY}
                stroke={light.color}
              />
              <circle className="rgl-light-plot-hit" cx={px} cy={py} r="12" />
              <circle cx={px} cy={py} r="4.5" fill={light.color} />
              <text
                className="rgl-light-plot-label"
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
              >
                {light.label}
              </text>
              <title>{light.label}</title>
            </g>
          );
        })}
      </g>

      <g className="rgl-light-plot-card">
        <line
          x1={plotX(0)}
          y1={plotY(0)}
          x2={plotX(rightEnd.x)}
          y2={plotY(rightEnd.z)}
        />
        <line
          x1={plotX(0)}
          y1={plotY(0)}
          x2={plotX(coverEnd.x)}
          y2={plotY(coverEnd.z)}
        />
        <circle cx={plotX(0)} cy={plotY(0)} r="2.2" />
      </g>

      <circle
        ref={gleamHaloRef}
        className="rgl-light-plot-gleam-halo"
        r="11"
        fill={gleamColor}
        opacity="0"
      />
      <circle
        ref={gleamRef}
        className="rgl-light-plot-gleam"
        r="3.4"
        fill={gleamColor}
        opacity="0"
      />

      <polygon
        className="rgl-light-plot-cam"
        points={`${CX - 5},${VB_H - 22} ${CX + 5},${VB_H - 22} ${CX},${VB_H - 14}`}
      />
      <text
        className="rgl-light-plot-cam-label"
        x={CX}
        y={VB_H - 6}
        textAnchor="middle"
      >
        cam
      </text>
    </svg>
  );
}
