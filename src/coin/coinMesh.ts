import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildCoinLegendGeometry } from "./coinLegend.ts";
import type { CoinShapeId } from "./shapes.ts";

export const nth = <T>(items: readonly T[], index: number): T => {
  const value = items[index];
  if (value === undefined) throw new Error("Missing value");
  return value;
};

const BODY_SIZE = 2;
const BODY_BEVEL = 0.04;
const BODY_BEVEL_SIZE = 0.045;
const DEPTH = 0.11;
const MARK_DEPTH = 0.045;
/** One mark size for every shape. Matches the circle and still clears the sparkle waist. */
const MARK_SCALE = 0.4;
/** Nudge the mark toward the visual center of uneven shapes. */
const MARK_OFFSET_Y: Partial<Record<CoinShapeId, number>> = {
  kite: 0.08,
  heart: 0.18,
  star: -0.06,
  trefoil: -0.12,
};
const MARK_TARGET = 1.28;
const LOGO_EMBED = 0.014;
const MARK_GOLD = "#E0BE4E";

const CORNER: Record<CoinShapeId, number> = {
  squircle: 0.86,
  circle: 1,
  hexagon: 0.2,
  star: 0.28,
  scallop: 1,
  trefoil: 1,
  heart: 1,
  quatrefoil: 1,
  cross: 0.12,
  kite: 0.16,
  frame: 0,
  sparkle: 0,
};

export const COIN_SCALE = 2.75;
export const COIN_TILT = 0.2;
export const COIN_YAW = 0.8;

const shadeSmooth = (geo: THREE.BufferGeometry, tolerance = 1e-4) => {
  geo.deleteAttribute("normal");
  const welded = mergeVertices(geo, tolerance);
  if (welded !== geo) geo.dispose();
  welded.computeVertexNormals();
  return welded;
};

const reverseWinding = (geo: THREE.BufferGeometry) => {
  const index = geo.index;
  if (!index) return;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    index.setX(i, index.getX(i + 2));
    index.setX(i + 2, a);
  }
  index.needsUpdate = true;
};

const squircleExponent = (cornerRadius: number) => {
  const t = Math.min(1, Math.max(0, cornerRadius));
  return 2 + Math.pow(1 - t, 1.6) * 28;
};

const squircleShape = (size: number, n = 5, segments = 96) => {
  const shape = new THREE.Shape();
  const r = size / 2;
  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI / 2 - (i / segments) * Math.PI * 2;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const x = r * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = r * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

const roundedPolygonShape = (radius: number, sides: number, cornerT: number, rotation: number) => {
  const verts: THREE.Vector2[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2;
    verts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
  }
  const edge = nth(verts, 0).distanceTo(nth(verts, 1));
  const fillet = Math.min(edge * 0.48, Math.max(0, cornerT) * radius * 0.42);
  const shape = new THREE.Shape();
  if (fillet < 1e-4) {
    shape.moveTo(nth(verts, 0).x, nth(verts, 0).y);
    for (let i = 1; i < sides; i++) shape.lineTo(nth(verts, i).x, nth(verts, i).y);
    shape.closePath();
    return shape;
  }
  for (let i = 0; i < sides; i++) {
    const prev = nth(verts, (i - 1 + sides) % sides);
    const curr = nth(verts, i);
    const next = nth(verts, (i + 1) % sides);
    const toPrev = prev.clone().sub(curr).normalize();
    const toNext = next.clone().sub(curr).normalize();
    const start = curr.clone().addScaledVector(toPrev, fillet);
    const end = curr.clone().addScaledVector(toNext, fillet);
    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(curr.x, curr.y, end.x, end.y);
  }
  shape.closePath();
  return shape;
};

const filletedShape = (verts: THREE.Vector2[], fillet: number) => {
  const shape = new THREE.Shape();
  const count = verts.length;
  if (fillet < 1e-4) {
    shape.moveTo(nth(verts, 0).x, nth(verts, 0).y);
    for (let i = 1; i < count; i++) shape.lineTo(nth(verts, i).x, nth(verts, i).y);
    shape.closePath();
    return shape;
  }
  for (let i = 0; i < count; i++) {
    const prev = nth(verts, (i - 1 + count) % count);
    const curr = nth(verts, i);
    const next = nth(verts, (i + 1) % count);
    const toPrev = prev.clone().sub(curr).normalize();
    const toNext = next.clone().sub(curr).normalize();
    const reach = Math.min(fillet, prev.distanceTo(curr) * 0.45, curr.distanceTo(next) * 0.45);
    const start = curr.clone().addScaledVector(toPrev, reach);
    const end = curr.clone().addScaledVector(toNext, reach);
    if (i === 0) shape.moveTo(start.x, start.y);
    else shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(curr.x, curr.y, end.x, end.y);
  }
  shape.closePath();
  return shape;
};

const shapeFromPoints = (pts: Array<{ x: number; y: number }>, size: number) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const s = size / span;
  const shape = new THREE.Shape();
  pts.forEach((p, i) => {
    const x = (p.x - cx) * s;
    const y = (p.y - cy) * s;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
};

const circleClusterShape = (size: number, centers: Array<{ x: number; y: number }>) => {
  const placed = centers.map((c) => ({ x: c.x, y: c.y, r: 1 }));
  const bins = 180;
  const best: Array<{ x: number; y: number; rad: number }> = [];
  for (let i = 0; i < bins; i++) best.push({ x: 0, y: 0, rad: -1 });
  for (const c of placed) {
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const x = c.x + Math.cos(a);
      const y = c.y + Math.sin(a);
      const inside = placed.some(
        (o) => o !== c && (x - o.x) * (x - o.x) + (y - o.y) * (y - o.y) < o.r * o.r * 0.992
      );
      if (inside) continue;
      const ang = Math.atan2(y, x);
      const rad = Math.hypot(x, y);
      const bin = Math.round(((ang + Math.PI) / (Math.PI * 2)) * bins) % bins;
      if (rad > nth(best, bin).rad) best[bin] = { x, y, rad };
    }
  }
  const pts = best.filter((p) => p.rad > 0);
  pts.sort((a, b) => Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x));
  return shapeFromPoints(pts, size);
};

const scallopWave = (theta: number, lobes: number) => {
  const notch = (1 - Math.cos(lobes * theta)) / 2;
  return 1 - 2 * Math.pow(notch, 1.75);
};

/** Corner brackets and a center square. */
const FRAME_ARM = 33 / 123;
const FRAME_THICK = 11 / 123;
const FRAME_HUB = 54 / 123;
const FRAME_RIM = 0.028;

const pushLoop = (path: THREE.Path, points: Array<[number, number]>) => {
  points.forEach(([x, y], index) => {
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.closePath();
};

const loopShape = (points: Array<[number, number]>, hole?: Array<[number, number]>) => {
  const shape = new THREE.Shape();
  pushLoop(shape, points);
  if (hole) {
    const path = new THREE.Path();
    pushLoop(path, [...hole].reverse());
    shape.holes.push(path);
  }
  return shape;
};

const cornerLoop = (
  size: number,
  sx: 1 | -1,
  sy: 1 | -1,
  inset: number
): Array<[number, number]> => {
  const h = size / 2;
  const t = size * FRAME_THICK;
  const a = size * FRAME_ARM;
  const local: Array<[number, number]> = [
    [h - inset, h - inset],
    [h - inset, h - a + inset],
    [h - t + inset, h - a + inset],
    [h - t + inset, h - t + inset],
    [h - a + inset, h - t + inset],
    [h - a + inset, h - inset],
  ];
  const signed = local.map(([x, y]): [number, number] => [x * sx, y * sy]);
  return sx === sy ? signed : signed.reverse();
};

const hubLoop = (size: number, inset: number): Array<[number, number]> => {
  const c = (size * FRAME_HUB) / 2 - inset;
  return [
    [-c, -c],
    [c, -c],
    [c, c],
    [-c, c],
  ];
};

const FRAME_SIGNS = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
] as const;

const frameLoops = (size: number, inset: number) => [
  ...FRAME_SIGNS.map(([sx, sy]) => cornerLoop(size, sx, sy, inset)),
  hubLoop(size, inset),
];

const frameShapes = (size: number) => frameLoops(size, 0).map((loop) => loopShape(loop));

const frameBands = (size: number, outerInset: number, innerInset: number) => {
  const outer = frameLoops(size, outerInset);
  const inner = frameLoops(size, innerInset);
  return outer.map((loop, index) => loopShape(loop, nth(inner, index)));
};

/** Four-point sparkle. */
const sparkleShape = (size: number) => {
  const exponent = 0.58;
  const count = 128;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.PI / 2 - (i / count) * Math.PI * 2;
    const c = Math.abs(Math.cos(theta));
    const s = Math.abs(Math.sin(theta));
    const radius = 1 / Math.pow(Math.pow(c, exponent) + Math.pow(s, exponent), 1 / exponent);
    pts.push({ x: Math.cos(theta) * radius, y: Math.sin(theta) * radius });
  }
  return shapeFromPoints(pts, size);
};

const coinContour = (size: number, shapeId: CoinShapeId, cornerRadius: number): THREE.Shape => {
  switch (shapeId) {
    case "circle":
      return squircleShape(size, 2, 96);
    case "hexagon":
      return roundedPolygonShape(size / 2, 6, cornerRadius, Math.PI / 6);
    case "star": {
      const outer = size / 2;
      const inner = outer * 0.46;
      const verts: THREE.Vector2[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = Math.PI / 2 - (i / 10) * Math.PI * 2;
        const radius = i % 2 === 0 ? outer : inner;
        verts.push(new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
      }
      const edge = nth(verts, 0).distanceTo(nth(verts, 1));
      const fillet = Math.min(edge * 0.38, Math.max(0, cornerRadius) * outer * 0.22);
      return filletedShape(verts, fillet);
    }
    case "scallop": {
      const lobes = 16;
      const amplitude = 0.05;
      const base = size / 2;
      const shape = new THREE.Shape();
      const segments = lobes * 24;
      for (let i = 0; i <= segments; i++) {
        const theta = Math.PI / 2 - (i / segments) * Math.PI * 2;
        const wave = scallopWave(theta, lobes);
        const r = base * (1 - amplitude * (1 - wave));
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return shape;
    }
    case "trefoil": {
      const d = 1.58;
      const h = d / Math.sqrt(3);
      return circleClusterShape(size, [
        { x: 0, y: h },
        { x: d / 2, y: -h / 2 },
        { x: -d / 2, y: -h / 2 },
      ]);
    }
    case "heart": {
      const pts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 96; i++) {
        const t = (i / 96) * Math.PI * 2;
        pts.push({
          x: 16 * Math.sin(t) ** 3,
          y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
        });
      }
      return shapeFromPoints(pts, size);
    }
    case "quatrefoil": {
      const d = 1.08;
      return circleClusterShape(size, [
        { x: 0, y: d },
        { x: d, y: 0 },
        { x: 0, y: -d },
        { x: -d, y: 0 },
      ]);
    }
    case "cross": {
      const outer = size / 2;
      const arm = outer * 0.4;
      const verts = [
        [arm, outer],
        [arm, arm],
        [outer, arm],
        [outer, -arm],
        [arm, -arm],
        [arm, -outer],
        [-arm, -outer],
        [-arm, -arm],
        [-outer, -arm],
        [-outer, arm],
        [-arm, arm],
        [-arm, outer],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const fillet = Math.min((outer - arm) * 0.42, Math.max(0, cornerRadius) * outer * 0.2);
      return filletedShape(verts, fillet);
    }
    case "kite": {
      const h = size / 2;
      const w = h * 0.875;
      const shoulder = h * 0.24;
      const verts = [
        new THREE.Vector2(0, h),
        new THREE.Vector2(w, shoulder),
        new THREE.Vector2(0, -h),
        new THREE.Vector2(-w, shoulder),
      ];
      const edge = nth(verts, 0).distanceTo(nth(verts, 1));
      const fillet = Math.min(edge * 0.22, Math.max(0, cornerRadius) * h * 0.2);
      return filletedShape(verts, fillet);
    }
    case "frame":
      return loopShape(hubLoop(size, 0));
    case "sparkle":
      return sparkleShape(size);
    case "squircle":
    default:
      return squircleShape(size, squircleExponent(cornerRadius), 96);
  }
};

const samplePoints = (raw: THREE.Vector2[], count: number) => {
  const points =
    raw.length > 1 && nth(raw, 0).distanceTo(nth(raw, raw.length - 1)) < 1e-4
      ? raw.slice(0, -1)
      : raw;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p = nth(points, i);
    const q = nth(points, (i + 1) % points.length);
    area += p.x * q.y - q.x * p.y;
  }
  const outward = area < 0 ? 1 : -1;
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const len = nth(points, i).distanceTo(nth(points, (i + 1) % points.length));
    segLen.push(len);
    total += len;
  }
  const samples: Array<{ x: number; y: number; nx: number; ny: number }> = [];
  for (let i = 0; i < count; i++) {
    const target = (i / count) * total;
    let acc = 0;
    for (let s = 0; s < points.length; s++) {
      const len = nth(segLen, s);
      if (acc + len < target && s < points.length - 1) {
        acc += len;
        continue;
      }
      const t = len === 0 ? 0 : (target - acc) / len;
      const p = nth(points, s);
      const q = nth(points, (s + 1) % points.length);
      const tx = q.x - p.x;
      const ty = q.y - p.y;
      const mag = Math.hypot(tx, ty) || 1;
      samples.push({
        x: p.x + tx * t,
        y: p.y + ty * t,
        nx: (-ty / mag) * outward,
        ny: (tx / mag) * outward,
      });
      break;
    }
  }
  return samples;
};

export const sampleContour = (shapeId: CoinShapeId, cornerRadius: number, count: number) => {
  const raw = coinContour(BODY_SIZE, shapeId, cornerRadius).getPoints(Math.max(count * 6, 180));
  return samplePoints(raw, count);
};

const reedRibbon = (
  samples: Array<{ x: number; y: number; nx: number; ny: number }>,
  amp: number
) => {
  const outline = new THREE.Shape();
  samples.forEach((p, i) => {
    const crest = i % 4 === 1 || i % 4 === 2;
    const x = p.x + p.nx * (crest ? amp : 0.012);
    const y = p.y + p.ny * (crest ? amp : 0.012);
    if (i === 0) outline.moveTo(x, y);
    else outline.lineTo(x, y);
  });
  outline.closePath();
  const hole = new THREE.Path();
  for (let i = samples.length - 1; i >= 0; i--) {
    const p = nth(samples, i);
    const x = p.x - p.nx * 0.05;
    const y = p.y - p.ny * 0.05;
    if (i === samples.length - 1) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  outline.holes.push(hole);
  return outline;
};

const loopLength = (points: Array<[number, number]>) => {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = nth(points, i);
    const b = nth(points, (i + 1) % points.length);
    total += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return total;
};

const extrudeReeds = (shapes: THREE.Shape[]) => {
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: Math.max(0.04, DEPTH * 0.72),
    bevelEnabled: false,
    curveSegments: 1,
    steps: 1,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
};

const reededEdge = (shapeId: CoinShapeId, cornerRadius: number) => {
  if (shapeId === "frame") {
    const circle = Math.PI * BODY_SIZE;
    const ribbons = frameLoops(BODY_SIZE, 0).map((loop) => {
      const reeds = Math.max(8, Math.round((loopLength(loop) / circle) * 84));
      return reedRibbon(
        samplePoints(
          loop.map(([x, y]) => new THREE.Vector2(x, y)),
          reeds * 4
        ),
        0.055
      );
    });
    return extrudeReeds(ribbons);
  }
  const reeds = shapeId === "scallop" ? 112 : 84;
  const amp = shapeId === "scallop" ? 0.05 : 0.055;
  return extrudeReeds([reedRibbon(sampleContour(shapeId, cornerRadius, reeds * 4), amp)]);
};

const extrudeBody = (shapeId: CoinShapeId, cornerRadius: number) => {
  let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(
    shapeId === "frame" ? frameShapes(BODY_SIZE) : coinContour(BODY_SIZE, shapeId, cornerRadius),
    {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: Math.min(0.04, DEPTH * 0.28),
      bevelSize: BODY_BEVEL_SIZE,
      bevelOffset: 0,
      bevelSegments: 8,
      curveSegments: 12,
      steps: 1,
    }
  );
  geo.center();
  geo = shadeSmooth(geo);
  geo.computeBoundingBox();
  return geo;
};

const extrudeRim = (shapeId: CoinShapeId, cornerRadius: number) => {
  if (shapeId === "frame") {
    let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(frameBands(BODY_SIZE, 0, FRAME_RIM), {
      depth: DEPTH + 0.04,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.012,
      bevelOffset: 0,
      bevelSegments: 5,
      curveSegments: 4,
      steps: 1,
    });
    geo.center();
    geo = shadeSmooth(geo, 2e-4);
    return geo;
  }
  const outer = coinContour(BODY_SIZE * 0.97, shapeId, cornerRadius);
  const holePts = coinContour(BODY_SIZE * 0.88, shapeId, cornerRadius).getPoints(96);
  holePts.reverse();
  outer.holes.push(new THREE.Path(holePts));
  let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(outer, {
    depth: DEPTH + 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.012,
    bevelOffset: 0,
    bevelSegments: 5,
    curveSegments: 12,
    steps: 1,
  });
  geo.center();
  geo = shadeSmooth(geo, 2e-4);
  return geo;
};

const pathFill = (path: { userData?: { style?: { fill?: unknown } } }) => {
  const fill = path.userData?.style?.fill;
  return typeof fill === "string" ? fill : undefined;
};

const markHasFill = (fill: string | undefined) =>
  fill !== undefined && fill !== "none" && !fill.startsWith("url");

const strokeJoin = (value: unknown) =>
  value === "round" || value === "bevel" || value === "miter" ? value : "round";

const strokeCap = (value: unknown) =>
  value === "round" || value === "square" || value === "butt" ? value : "round";

const extrudeShapes = (shapes: THREE.Shape[]) => {
  const box = new THREE.Box2();
  for (const shape of shapes) {
    for (const p of shape.getPoints(8)) box.expandByPoint(p);
  }
  const size = new THREE.Vector2();
  box.getSize(size);
  const span = Math.max(size.x, size.y, 0.001);
  const s = MARK_TARGET / span;
  const bevelSize = Math.min(0.055 / s, span * 0.02);
  const bevelThickness = Math.min(0.05, MARK_DEPTH * 0.45) * 0.25;
  return new THREE.ExtrudeGeometry(shapes, {
    depth: MARK_DEPTH,
    bevelEnabled: true,
    bevelThickness,
    bevelSize: bevelSize * 0.25,
    bevelSegments: 2,
    curveSegments: 8,
    steps: 1,
  });
};

const pointKey = (x: number, y: number) => `${x.toFixed(3)},${y.toFixed(3)}`;

const loopArea = (loop: Array<{ x: number; y: number }>) => {
  let area = 0;
  for (let i = 0; i < loop.length; i++) {
    const p = nth(loop, i);
    const q = nth(loop, (i + 1) % loop.length);
    area += p.x * q.y - q.x * p.y;
  }
  return area;
};

const loopContains = (loop: Array<{ x: number; y: number }>, x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const a = nth(loop, i);
    const b = nth(loop, j);
    const crosses = a.y > y !== b.y > y;
    if (crosses && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
};

const traceLoop = (target: THREE.Path, loop: Array<{ x: number; y: number }>) => {
  const first = nth(loop, 0);
  target.moveTo(first.x, first.y);
  for (let i = 1; i < loop.length; i++) {
    const point = nth(loop, i);
    target.lineTo(point.x, point.y);
  }
  target.closePath();
};

/** Outline of a stroked path, so it can be extruded flat like a filled mark. */
const strokeShapes = (path: {
  userData?: { style?: Record<string, unknown> };
  subPaths: Array<{ getPoints: (divisions?: number) => THREE.Vector2[] }>;
}) => {
  const style = path.userData?.style;
  const stroke = style?.stroke;
  const strokeWidth = Number(style?.strokeWidth ?? 0);
  if (!style || typeof stroke !== "string" || stroke === "none" || !(strokeWidth > 0)) return [];
  const strokeStyle = SVGLoader.getStrokeStyle(
    strokeWidth,
    "#000",
    strokeJoin(style.strokeLineJoin),
    strokeCap(style.strokeLineCap),
    Number(style.strokeMiterLimit ?? 4)
  );
  const shapes: THREE.Shape[] = [];
  for (const sub of path.subPaths) {
    const points = sub.getPoints(16);
    if (points.length < 2) continue;
    const flat = SVGLoader.pointsToStroke(points, strokeStyle, 6, 0.001);
    if (!flat) continue;
    const loops = boundaryLoops(flat).sort((a, b) => Math.abs(loopArea(b)) - Math.abs(loopArea(a)));
    const used = new Set<number>();
    loops.forEach((loop, index) => {
      if (used.has(index)) return;
      const shape = new THREE.Shape();
      traceLoop(shape, loop);
      const outerArea = loopArea(loop);
      loops.forEach((inner, innerIndex) => {
        if (innerIndex === index || used.has(innerIndex)) return;
        const probe = nth(inner, 0);
        if (Math.abs(loopArea(inner)) >= Math.abs(outerArea)) return;
        if (!loopContains(loop, probe.x, probe.y)) return;
        const hole = loopArea(inner) * outerArea > 0 ? [...inner].reverse() : inner;
        const holePath = new THREE.Path();
        traceLoop(holePath, hole);
        shape.holes.push(holePath);
        used.add(innerIndex);
      });
      shapes.push(shape);
      used.add(index);
    });
    flat.dispose();
  }
  return shapes;
};

const boundaryLoops = (flat: THREE.BufferGeometry) => {
  const src = flat.getAttribute("position");
  const edges = new Map<string, { a: string; b: string; n: number }>();
  const coords = new Map<string, { x: number; y: number }>();
  const touch = (x: number, y: number) => {
    const id = pointKey(x, y);
    if (!coords.has(id)) coords.set(id, { x, y });
    return id;
  };
  const addEdge = (a: string, b: string) => {
    if (a === b) return;
    const id = a < b ? `${a}|${b}` : `${b}|${a}`;
    const prev = edges.get(id);
    if (prev) prev.n += 1;
    else edges.set(id, { a, b, n: 1 });
  };
  for (let i = 0; i < src.count; i += 3) {
    const a = touch(src.getX(i), src.getY(i));
    const b = touch(src.getX(i + 1), src.getY(i + 1));
    const c = touch(src.getX(i + 2), src.getY(i + 2));
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }
  const next = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    const list = next.get(a);
    if (list) list.push(b);
    else next.set(a, [b]);
  };
  for (const edge of edges.values()) {
    if (edge.n !== 1) continue;
    link(edge.a, edge.b);
    link(edge.b, edge.a);
  }
  const used = new Set<string>();
  const edgeId = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const loops: Array<Array<{ x: number; y: number }>> = [];
  for (const [start, neighbors] of next) {
    for (const first of neighbors) {
      if (used.has(edgeId(start, first))) continue;
      const origin = coords.get(start);
      if (!origin) continue;
      const loop = [origin];
      used.add(edgeId(start, first));
      let prev = start;
      let cur = first;
      let closed = false;
      for (let guard = 0; guard < 8000; guard++) {
        if (cur === start) {
          closed = true;
          break;
        }
        const at = coords.get(cur);
        if (!at) break;
        loop.push(at);
        const options = next.get(cur) ?? [];
        const step = options.find((id) => id !== prev && !used.has(edgeId(cur, id)));
        if (!step) break;
        used.add(edgeId(cur, step));
        prev = cur;
        cur = step;
      }
      if (closed && loop.length >= 3) loops.push(loop);
    }
  }
  return loops;
};

const fitMark = (geo: THREE.BufferGeometry) => {
  geo.scale(1, -1, 1);
  reverseWinding(geo);
  geo.computeBoundingBox();
  const bounds = geo.boundingBox;
  if (!bounds) return geo;
  const span3 = Math.max(bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y, 0.001);
  const fit = MARK_TARGET / span3;
  geo.translate(-(bounds.min.x + bounds.max.x) / 2, -(bounds.min.y + bounds.max.y) / 2, 0);
  geo.scale(fit, fit, 1);
  const shaded = shadeSmooth(geo);
  shaded.computeBoundingBox();
  return shaded;
};

const extrudeMark = (svg: string) => {
  const loader = new SVGLoader();
  const paths = loader.parse(svg).paths;
  const shapes: THREE.Shape[] = [];
  for (const path of paths) {
    const fill = pathFill(path);
    if (markHasFill(fill)) shapes.push(...path.toShapes());
    else shapes.push(...strokeShapes(path));
  }
  if (!shapes.length) return null;
  return fitMark(extrudeShapes(shapes));
};

export type CoinMeshes = {
  body: THREE.BufferGeometry;
  reeds: THREE.BufferGeometry;
  rim: THREE.BufferGeometry;
  mark: THREE.BufferGeometry | null;
  legend: THREE.BufferGeometry | null;
  faceZ: number;
  markScale: number;
  markOffsetY: number;
};

export const buildCoinMeshes = (
  shapeId: CoinShapeId,
  svg: string | undefined,
  name = ""
): CoinMeshes => {
  const corner = CORNER[shapeId];
  const body = extrudeBody(shapeId, corner);
  const faceZ = (body.boundingBox?.max.z ?? DEPTH / 2) - BODY_BEVEL * 0.85;
  return {
    body,
    reeds: reededEdge(shapeId, corner),
    rim: extrudeRim(shapeId, corner),
    mark: svg ? extrudeMark(svg) : null,
    legend: shapeId === "circle" ? buildCoinLegendGeometry(name, shapeId, corner) : null,
    faceZ,
    markScale: MARK_SCALE,
    markOffsetY: MARK_OFFSET_Y[shapeId] ?? 0,
  };
};

export const faceMaterial = (color: string) =>
  new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.82,
    roughness: 0.38,
    clearcoat: 0.28,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.55,
    side: THREE.DoubleSide,
  });

export const edgeMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#F4F5F8",
    metalness: 1,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    reflectivity: 1,
    envMapIntensity: 1.45,
    side: THREE.DoubleSide,
  });

/** Raised mark and rim text. Black and white faces keep the gold strike. */
export const strikeColor = (body: string) => {
  const hex = body.trim().toLowerCase();
  if (hex === "#fff" || hex === "#ffffff" || hex === "#000" || hex === "#000000") return MARK_GOLD;
  return body;
};

export const reliefMaterial = () =>
  new THREE.MeshPhysicalMaterial({
    color: MARK_GOLD,
    metalness: 1,
    roughness: 0.22,
    clearcoat: 0.95,
    clearcoatRoughness: 0.06,
    reflectivity: 1,
    envMapIntensity: 1.25,
    side: THREE.DoubleSide,
  });

/** Three concentric rings in the Roam mark's coordinate space. */
const ROAM_RINGS = [
  { cx: 27, cy: 21, R: 5 },
  { cx: 24, cy: 21, R: 8 },
  { cx: 21, cy: 21, R: 11.1 },
] as const;
const ROAM_TUBE = 0.95;

export const createRoamRings = (
  faceZ: number,
  markScale: number,
  markOffsetY: number,
  material: THREE.Material
) => {
  const s = (MARK_TARGET / 24) * markScale;
  const z = faceZ + BODY_BEVEL * 0.85 - ROAM_TUBE * s * 0.2;
  const geos: THREE.BufferGeometry[] = [];
  const root = new THREE.Group();
  root.position.set(0, markOffsetY, z);
  root.scale.setScalar(s);
  const shift = new THREE.Group();
  shift.position.set(-21, 21, 0);
  root.add(shift);
  for (const ring of ROAM_RINGS) {
    const geo = new THREE.TorusGeometry(ring.R, ROAM_TUBE, 24, 96);
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(ring.cx, -ring.cy, 0);
    shift.add(mesh);
  }
  return { root, geos };
};

export const markZ = (faceZ: number, mark: THREE.BufferGeometry) =>
  faceZ - LOGO_EMBED - (mark.boundingBox?.min.z ?? 0);

/** Half-height of the orthographic frame. */
export const viewHalf = () => {
  const bodyHalf = (BODY_SIZE / 2 + BODY_BEVEL_SIZE) * 1.028;
  const depthHalf = DEPTH / 2 + BODY_BEVEL;
  const hx = bodyHalf * COIN_SCALE;
  const hz = depthHalf * COIN_SCALE;
  return Math.hypot(hx, hx, hz) * 1.02;
};
