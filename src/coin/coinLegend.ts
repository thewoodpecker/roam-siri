import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LEGEND_FONT } from "./coinLegendFont.ts";
import { nth, sampleContour } from "./coinMesh.ts";
import type { CoinShapeId } from "./shapes.ts";

/** Raised lettering just inside the rim. */
const LEGEND_FONT_SIZE = 0.118;
const LEGEND_INSET = 0.28;
const LEGEND_TRACKING = 0.42;
const LEGEND_DEPTH = 0.045;
const LEGEND_BEVEL = 0.008;
const BODY_SIZE = 2;

type LegendGlyph = { path: string; advance: number; xOffset: number };

type LegendLayout = {
  unitsPerEm: number;
  capHeight: number;
  glyphs: LegendGlyph[];
  advance: number;
};

type Loop = {
  pts: Array<{ x: number; y: number; nx: number; ny: number }>;
  cum: number[];
  total: number;
  clockwise: boolean;
};

type GlyphSpan = { lead: number; width: number };

const layoutLegend = (text: string): LegendLayout | null => {
  if (!text) return null;
  const glyphs: LegendGlyph[] = [];
  let advance = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!ch) continue;
    const source = LEGEND_FONT.glyphs[ch];
    if (!source) continue;
    const next = text[i + 1];
    const kern = next ? (LEGEND_FONT.kern[ch + next] ?? 0) : 0;
    const glyphAdvance = source.advance + kern;
    glyphs.push({ path: source.path, advance: glyphAdvance, xOffset: source.xOffset });
    advance += glyphAdvance;
  }
  if (!glyphs.length || advance <= 0) return null;
  return {
    unitsPerEm: LEGEND_FONT.unitsPerEm,
    capHeight: LEGEND_FONT.capHeight,
    glyphs,
    advance,
  };
};

const glyphShapes = (pathData: string) => {
  if (!pathData) return [];
  const loader = new SVGLoader();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${pathData}"/></svg>`;
  return loader.parse(svg).paths.flatMap((path) => path.toShapes());
};

const loopFromPoints = (pts: Loop["pts"]): Loop => {
  const cum = [0];
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = nth(pts, i);
    const b = nth(pts, (i + 1) % pts.length);
    cum.push(nth(cum, cum.length - 1) + Math.hypot(b.x - a.x, b.y - a.y));
    area += a.x * b.y - b.x * a.y;
  }
  return { pts, cum, total: nth(cum, cum.length - 1), clockwise: area < 0 };
};

const insetContour = (shape: CoinShapeId, cornerRadius: number, inset: number): Loop => {
  const samples = sampleContour(shape, cornerRadius, 420);
  return loopFromPoints(
    samples.map((sample) => ({
      x: sample.x - sample.nx * inset,
      y: sample.y - sample.ny * inset,
      nx: sample.nx,
      ny: sample.ny,
    }))
  );
};

/** Even ring, used for the scallop so the name does not ride the lobes. */
const circleLoop = (radius: number, count = 240): Loop => {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.PI / 2 - (i / count) * Math.PI * 2;
    const nx = Math.cos(theta);
    const ny = Math.sin(theta);
    pts.push({ x: nx * radius, y: ny * radius, nx, ny });
  }
  return loopFromPoints(pts);
};

const pointOnLoop = (loop: Loop, dist: number) => {
  const n = loop.pts.length;
  const d = ((dist % loop.total) + loop.total) % loop.total;
  let i = 0;
  for (; i < n - 1; i++) {
    if (nth(loop.cum, i + 1) >= d) break;
  }
  const span = nth(loop.cum, i + 1) - nth(loop.cum, i) || 1;
  const t = (d - nth(loop.cum, i)) / span;
  const a = nth(loop.pts, i);
  const b = nth(loop.pts, (i + 1) % n);
  const nx = a.nx + (b.nx - a.nx) * t;
  const ny = a.ny + (b.ny - a.ny) * t;
  const mag = Math.hypot(nx, ny) || 1;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    nx: nx / mag,
    ny: ny / mag,
    heading: Math.atan2(-nx, ny),
  };
};

const angleDelta = (a: number, b: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};

const sharpCornerZones = (loop: Loop, dir: number) => {
  const n = 480;
  const step = loop.total / n;
  const hot: boolean[] = [];
  const turn: number[] = [];
  for (let i = 0; i < n; i++) {
    const d = dir * i * step;
    const delta = Math.abs(
      angleDelta(pointOnLoop(loop, d).heading, pointOnLoop(loop, d + dir * step).heading)
    );
    turn.push(delta);
    hot.push(delta > step * 2.2);
  }

  const zones: Array<{ start: number; end: number }> = [];
  let i = 0;
  while (i < n) {
    if (!hot[i]) {
      i++;
      continue;
    }
    const from = i;
    let accum = 0;
    while (i < n && hot[i]) {
      accum += nth(turn, i);
      i++;
    }
    if (accum > 0.4) zones.push({ start: from * step, end: i * step });
  }
  if (zones.length > 1 && hot[0] && hot[n - 1]) {
    const first = nth(zones, 0);
    const last = nth(zones, zones.length - 1);
    if (first.start <= step && last.end >= loop.total - step) {
      zones[0] = { start: last.start - loop.total, end: first.end };
      zones.pop();
    }
  }
  return zones;
};

const overlapsZone = (
  start: number,
  end: number,
  zone: { start: number; end: number },
  total: number
) => {
  const zoneRanges: Array<[number, number]> =
    zone.start < 0
      ? [
          [zone.start + total, total],
          [0, zone.end],
        ]
      : [[zone.start, zone.end]];
  const glyphRanges: Array<[number, number]> =
    end > total
      ? [
          [start, total],
          [0, end - total],
        ]
      : [[start, end]];
  for (const [gs, ge] of glyphRanges) {
    for (const [zs, ze] of zoneRanges) {
      if (gs < ze && ge > zs) return true;
    }
  }
  return false;
};

const glyphSpans = (
  glyphs: Array<{ advance: number }>,
  s: number,
  inward: number,
  loop: Loop,
  dir: number,
  origin = 0
): GlyphSpan[] => {
  const widths = glyphs.map((glyph) => {
    const advance = Math.max(glyph.advance * s, 0.001);
    return advance * (1 + LEGEND_TRACKING);
  });
  const margin = Math.max(0.08, inward * 2);
  const zones = sharpCornerZones(loop, dir).map((zone) => ({
    start: zone.start - margin,
    end: zone.end + margin,
  }));
  let cursor = origin;
  return widths.map((width) => {
    const base = ((cursor % loop.total) + loop.total) % loop.total;
    let at = base;
    let unwrapped = base;
    for (let guard = 0; guard < zones.length + 1; guard++) {
      let jumped = false;
      for (const zone of zones) {
        if (!overlapsZone(at, at + width, zone, loop.total)) continue;
        const dest = zone.end <= at ? zone.end + loop.total : zone.end;
        if (dest > unwrapped) {
          unwrapped = dest;
          at = ((unwrapped % loop.total) + loop.total) % loop.total;
          jumped = true;
        }
      }
      if (!jumped) break;
    }
    const lead = Math.max(0, unwrapped - base);
    cursor += lead + width;
    return { lead, width };
  });
};

/** Name repeated around the coin, with a middle dot between copies. */
export const buildCoinLegendGeometry = (
  rawName: string,
  shape: CoinShapeId,
  cornerRadius: number
) => {
  const name = rawName.trim().replace(/\s+/g, " ").toLocaleUpperCase();
  if (!name) return null;
  const unit = `${name} \u00B7 `;
  const unitLayout = layoutLegend(unit);
  const nameLayout = layoutLegend(name);
  if (!unitLayout || !nameLayout || unitLayout.advance <= 0) return null;

  const loop =
    shape === "scallop"
      ? circleLoop(BODY_SIZE / 2 - LEGEND_INSET)
      : insetContour(shape, cornerRadius, LEGEND_INSET);
  if (loop.total < 0.2) return null;

  const dir = loop.clockwise ? 1 : -1;
  const inwardOf = (size: number) => unitLayout.capHeight * 0.55 * (size / unitLayout.unitsPerEm);

  let fontSize = LEGEND_FONT_SIZE;
  let layout = unitLayout;
  let spans: GlyphSpan[] = [];
  let needed = 0;

  for (let attempt = 0; attempt < 4; attempt++) {
    const unitSpans = glyphSpans(
      unitLayout.glyphs,
      fontSize / unitLayout.unitsPerEm,
      inwardOf(fontSize),
      loop,
      dir
    );
    const unitNeeded = unitSpans.reduce((sum, span) => sum + span.lead + span.width, 0);
    let repeats = unitNeeded > loop.total ? 1 : Math.max(1, Math.floor(loop.total / unitNeeded));
    while (repeats >= 1) {
      const next = repeats === 1 ? unitLayout : layoutLegend(unit.repeat(repeats));
      if (!next || next.advance <= 0) return null;
      const sTry = fontSize / next.unitsPerEm;
      spans = glyphSpans(next.glyphs, sTry, next.capHeight * 0.55 * sTry, loop, dir);
      needed = spans.reduce((sum, span) => sum + span.lead + span.width, 0);
      layout = next;
      if (needed <= loop.total) break;
      repeats -= 1;
    }
    if (needed <= loop.total) break;
    fontSize *= loop.total / Math.max(needed, 0.001);
  }

  const s = fontSize / layout.unitsPerEm;
  let origin = 0;
  for (let pass = 0; pass < 2; pass++) {
    const count = Math.min(nameLayout.glyphs.length, spans.length);
    let nameExpanded = 0;
    for (let i = 0; i < count; i++) nameExpanded += nth(spans, i).lead + nth(spans, i).width;
    origin = -nameExpanded / 2;
    spans = glyphSpans(layout.glyphs, s, layout.capHeight * 0.55 * s, loop, dir, origin);
  }

  const cornerGap = spans.some((span) => span.lead > 0.001);
  const used = spans.reduce((sum, span) => sum + span.lead + span.width, 0);
  const slack = Math.max(0, loop.total - used);
  if (!cornerGap && slack > 0 && spans.length > 0) {
    const pad = slack / spans.length;
    for (const span of spans) span.width += pad;
  }

  const depth = LEGEND_DEPTH / s;
  const bevel = Math.min(LEGEND_BEVEL / s, depth * 0.4);
  const bases = new Map<string, THREE.BufferGeometry>();
  const pieces: THREE.BufferGeometry[] = [];
  let cursor = origin;

  for (let i = 0; i < layout.glyphs.length; i++) {
    const glyph = nth(layout.glyphs, i);
    const span = nth(spans, i);
    const center = cursor + span.lead + span.width / 2;
    cursor += span.lead + span.width;
    const along = dir * center;
    if (!glyph.path) continue;
    let base = bases.get(glyph.path);
    if (base === undefined) {
      const shapes = glyphShapes(glyph.path);
      base = shapes.length
        ? new THREE.ExtrudeGeometry(shapes, {
            depth,
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelSegments: 2,
            curveSegments: 8,
            steps: 1,
          })
        : undefined;
      if (base) bases.set(glyph.path, base);
    }
    if (!base) continue;
    const spot = pointOnLoop(loop, along);
    const piece = base.clone();
    piece.translate(glyph.xOffset - glyph.advance / 2, -layout.capHeight * 0.46, 0);
    piece.scale(s, s, s);
    piece.rotateZ(Math.atan2(-spot.nx, spot.ny));
    piece.translate(spot.x, spot.y, 0);
    pieces.push(piece);
  }

  for (const base of bases.values()) base.dispose();
  if (!pieces.length) return null;
  const merged = mergeGeometries(pieces, false);
  for (const piece of pieces) piece.dispose();
  if (!merged) return null;
  merged.computeVertexNormals();
  return merged;
};
