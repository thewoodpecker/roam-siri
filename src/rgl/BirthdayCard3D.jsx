import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  getFoilMetal,
  bodyMaterialProps,
  paletteColorsFor,
  RGL_SUBJECT_SIZE,
} from './materials';
import { useLightRig } from './lightRig';
import { loadPossibilityFont, isPossibilityReady } from '../possibilityFont';
import {
  CARD_OPEN_STIFFNESS,
  FOLD_COMMIT_T,
  FOLD_FLICK_VT,
  HINGE_FOLLOW_ANGLE,
  HINGE_FOLLOW_STIFFNESS,
  HINGE_FOLLOW_YAW,
  PALETTE_LERP_STIFFNESS,
} from './cardMotion';

const LEAF_W = 0.96;
const LEAF_H = 1.34;
const LEAF_T = 0.004;
const NOTES_W = LEAF_W * 0.92;
const NOTES_H = LEAF_H * 0.92;
const CORNER = 0.036;
/** Cover fold when open — 120° so the card stays tented, not laid flat. */
const OPEN_ANGLE = (120 * Math.PI) / 180;
/** Outer metal rim sitting proud of the tray — unused on the flat card. */
const RIM_OUTER_INSET = 0.006;
const RIM_WIDTH = 0.018;
const RIM_DEPTH = 0.005;
const WELL_DEPTH = 0.004;
const WELL_LIFT = 0.001;
const WELL_RECESS = 0.006;
const FOIL_DISPLACE = 0;
/** Resting pose — cracked open so it reads as a card, not a slab. */
const REST_OPEN = 0.24;
const OPEN_GROW = 1.28;
const FIT_SCALE = (RGL_SUBJECT_SIZE * 0.7) / LEAF_H;
/** Match RGLStage SUBJECT_TIP so edge projection lands on the cursor. */
const CARD_STAGE_TIP = 0.04;
const FOLD_HANDLE_GEO = new THREE.BoxGeometry(0.28, LEAF_H * 1.02, 0.26);
const _foldEdge = new THREE.Vector3();

/**
 * Screen-space center of both leaves after hinge `theta` and yaw `phi`.
 * Uses the union AABB so an open tent sits in the middle of the frame,
 * not on the spine.
 */
function cardFocus(theta, phi = 0) {
  const tc = Math.cos(theta);
  const ts = Math.sin(theta);
  const pc = Math.cos(phi);
  const ps = Math.sin(phi);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  const add = (x, z) => {
    const wx = x * pc + z * ps;
    const wz = -x * ps + z * pc;
    if (wx < minX) minX = wx;
    if (wx > maxX) maxX = wx;
    if (wz < minZ) minZ = wz;
    if (wz > maxZ) maxZ = wz;
  };
  for (const x of [0, LEAF_W]) {
    for (const z of [-LEAF_T / 2, LEAF_T / 2]) add(x, z);
  }
  for (const lx of [0, LEAF_W]) {
    for (const lz of [0, LEAF_T]) {
      add(lx * tc + lz * ts, -lx * ts + lz * tc + LEAF_T / 2);
    }
  }
  return {
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
  };
}

const REST_FOCUS = cardFocus(-OPEN_ANGLE * REST_OPEN);

/** World position of the cover's free edge at open amount `t` (1 = open). */
function coverEdgeWorld(t, scale, out) {
  const peek = Math.max(0, Math.min(1, (t - REST_OPEN) / (1 - REST_OPEN)));
  const theta = -OPEN_ANGLE * t;
  const phi = peek * (OPEN_ANGLE / 2 - Math.PI / 2);
  const grow = 1 + (OPEN_GROW - 1) * peek;
  const sc = FIT_SCALE * scale * grow;
  const mid = cardFocus(theta, phi);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const hx = LEAF_W;
  const hz = LEAF_T / 2;
  const lx = hx * c + hz * s;
  const lz = -hx * s + hz * c + LEAF_T / 2;
  const pc = Math.cos(phi);
  const ps = Math.sin(phi);
  const rx = lx * pc + lz * ps;
  const rz = -lx * ps + lz * pc;
  const x = rx * sc - mid.x * sc;
  const z = rz * sc - mid.z * sc;
  const tipC = Math.cos(CARD_STAGE_TIP);
  const tipS = Math.sin(CARD_STAGE_TIP);
  out.set(x, -z * tipS, z * tipC);
  return out;
}

function solveCoverOpenT(ndcX, camera, scale) {
  coverEdgeWorld(REST_OPEN, scale, _foldEdge).project(camera);
  const xClosed = _foldEdge.x;
  coverEdgeWorld(1, scale, _foldEdge).project(camera);
  const xOpen = _foldEdge.x;
  const span = xClosed - xOpen;
  if (Math.abs(span) < 0.08) {
    return THREE.MathUtils.clamp(1 - (ndcX - xOpen) / 0.7, REST_OPEN, 1);
  }
  const target = THREE.MathUtils.clamp(ndcX, Math.min(xOpen, xClosed), Math.max(xOpen, xClosed));
  let lo = REST_OPEN;
  let hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    coverEdgeWorld(mid, scale, _foldEdge).project(camera);
    if (span > 0) {
      if (_foldEdge.x < target) hi = mid;
      else lo = mid;
    } else if (_foldEdge.x > target) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function ndcXFromEvent(e, el) {
  const r = el.getBoundingClientRect();
  if (r.width <= 0) return 0;
  return ((e.clientX - r.left) / r.width) * 2 - 1;
}
const TEX_W = 512;
const TEX_H = 704;
/** Cover art is authored at 512×704, then scaled onto this texture. */
const FOIL_DRAW_W = 512;
const FOIL_DRAW_H = 704;
const FOIL_W = 1024;
const FOIL_H = 1408;

const ZONE_COLS = 4;
const ZONE_ROWS = 8;

function zoneNoteUv(col, row) {
  return {
    u: (col + 0.08) / ZONE_COLS,
    v: 1 - (row + 0.08) / ZONE_ROWS,
  };
}

function zoneCornerLocals(col, row) {
  const w = NOTES_W / ZONE_COLS;
  const h = NOTES_H / ZONE_ROWS;
  const cx = ((col + 0.5) / ZONE_COLS - 0.5) * NOTES_W;
  const cy = (0.5 - (row + 0.5) / ZONE_ROWS) * NOTES_H;
  const hx = w * 0.46;
  const hy = h * 0.46;
  return [
    { x: cx - hx, y: cy + hy },
    { x: cx + hx, y: cy + hy },
    { x: cx - hx, y: cy - hy },
    { x: cx + hx, y: cy - hy },
  ];
}

function projectMeshPoint(mesh, camera, gl, local) {
  if (!mesh || !camera || !gl) return null;
  const v = new THREE.Vector3(local.x, local.y, 0);
  mesh.updateWorldMatrix(true, false);
  mesh.localToWorld(v);
  v.project(camera);
  const r = gl.domElement.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return {
    clientX: (v.x * 0.5 + 0.5) * r.width + r.left,
    clientY: (-v.y * 0.5 + 0.5) * r.height + r.top,
  };
}

function projectZoneTopLeft(mesh, camera, gl, col, row) {
  let best = null;
  for (const local of zoneCornerLocals(col, row)) {
    const p = projectMeshPoint(mesh, camera, gl, local);
    if (!p) continue;
    if (
      !best
      || p.clientX < best.clientX - 0.5
      || (Math.abs(p.clientX - best.clientX) < 0.5 && p.clientY < best.clientY)
    ) {
      best = p;
    }
  }
  return best;
}

function zoneFromUv(u, v) {
  const col = Math.min(ZONE_COLS - 1, Math.max(0, Math.floor(u * ZONE_COLS)));
  const row = Math.min(ZONE_ROWS - 1, Math.max(0, Math.floor((1 - v) * ZONE_ROWS)));
  return { col, row };
}

function zoneKey(page, col, row) {
  return `${page}-${col}-${row}`;
}

/** Printed greeting on the right page — keep those cells off-limits. */
const GREETING_ZONE_KEYS = (() => {
  const keys = [];
  for (let col = 0; col < ZONE_COLS; col++) {
    for (let row = 2; row <= 5; row++) {
      keys.push(zoneKey('right', col, row));
    }
  }
  return keys;
})();

function noteZone(note) {
  if (Number.isInteger(note.col) && Number.isInteger(note.row)) {
    return { page: note.page, col: note.col, row: note.row };
  }
  const { col, row } = zoneFromUv(note.u, note.v);
  return { page: note.page, col, row };
}

function occupiedZoneKeys(notes, exceptId) {
  const taken = new Set(GREETING_ZONE_KEYS);
  for (const note of notes) {
    if (!note || note.id === exceptId || note.id === '__draft') continue;
    const z = noteZone(note);
    taken.add(zoneKey(z.page, z.col, z.row));
  }
  return taken;
}

export const CARD_SEED_NOTES = [
  { id: 'chelsea', page: 'left', col: 0, row: 0, ...zoneNoteUv(0, 0), rotate: -6, name: 'Chelsea', text: 'Hope it’s a good one — save me a slice.' },
  { id: 'howard', page: 'left', col: 0, row: 3, ...zoneNoteUv(0, 3), rotate: 4, name: 'Howard', text: 'Another trip around the sun.' },
  { id: 'rob', page: 'left', col: 0, row: 7, ...zoneNoteUv(0, 7), rotate: -3, name: 'Rob', text: 'Get after it, Klas.' },
];

function shadeSmooth(geo) {
  geo.computeVertexNormals();
  return geo;
}

function roundedRectShape(w, h, r) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  if (rr < 0.0005) {
    s.moveTo(x, y);
    s.lineTo(x + w, y);
    s.lineTo(x + w, y + h);
    s.lineTo(x, y + h);
    s.closePath();
    return s;
  }
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  return s;
}

function extrudeCentered(shape, depth, bevelSize, bevelThickness, bevelSegments = 3) {
  let geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevelSize > 0,
    bevelThickness,
    bevelSize,
    bevelOffset: 0,
    bevelSegments,
    curveSegments: 12,
    steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  geo = shadeSmooth(geo, 2e-4);
  return geo;
}

function roundedRectHole(w, h, r) {
  const pts = roundedRectShape(w, h, r).getPoints(24);
  pts.reverse();
  return new THREE.Path(pts);
}

function roundedRectRingShape(outerW, outerH, innerW, innerH, rOuter, rInner) {
  const ring = roundedRectShape(outerW, outerH, rOuter);
  ring.holes.push(roundedRectHole(innerW, innerH, rInner));
  return ring;
}

function wellSize() {
  const innerW = LEAF_W - (RIM_OUTER_INSET + RIM_WIDTH) * 2;
  const innerH = LEAF_H - (RIM_OUTER_INSET + RIM_WIDTH) * 2;
  return { innerW, innerH };
}

function makeLeafGeometry() {
  return extrudeCentered(
    roundedRectShape(LEAF_W, LEAF_H, CORNER),
    LEAF_T,
    0,
    0,
    1,
  );
}

function makeRimGeometry() {
  const outerW = LEAF_W - RIM_OUTER_INSET * 2;
  const outerH = LEAF_H - RIM_OUTER_INSET * 2;
  const { innerW, innerH } = wellSize();
  const rOuter = Math.max(0.006, CORNER - RIM_OUTER_INSET);
  const rInner = Math.max(0.004, rOuter - RIM_WIDTH * 0.45);
  return extrudeCentered(
    roundedRectRingShape(outerW, outerH, innerW, innerH, rOuter, rInner),
    RIM_DEPTH,
    0.0036,
    0.0032,
    3,
  );
}

function makeWellGeometry() {
  const { innerW, innerH } = wellSize();
  const gap = 0.003;
  const r = Math.max(0.004, CORNER - RIM_OUTER_INSET - RIM_WIDTH * 0.45 - gap * 0.3);
  return extrudeCentered(
    roundedRectShape(innerW - gap, innerH - gap, r),
    WELL_DEPTH,
    0.0024,
    0.002,
    4,
  );
}

let SHARED_CARD_GEOS = null;
function getCardGeos() {
  if (!SHARED_CARD_GEOS || SHARED_CARD_GEOS.t !== LEAF_T || SHARED_CARD_GEOS.r !== CORNER || !SHARED_CARD_GEOS.leaf) {
    const faceInset = Math.max(0.012, CORNER * 0.4);
    SHARED_CARD_GEOS = {
      t: LEAF_T,
      r: CORNER,
      leaf: makeLeafGeometry(),
      rim: makeRimGeometry(),
      well: makeWellGeometry(),
      greeting: new THREE.PlaneGeometry(LEAF_W - faceInset * 2, LEAF_H - faceInset * 2),
      notes: new THREE.PlaneGeometry(NOTES_W, NOTES_H),
      backCover: new THREE.PlaneGeometry(LEAF_W - faceInset * 2, LEAF_H - faceInset * 2),
    };
  }
  return SHARED_CARD_GEOS;
}

function isPureBlack(hex) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return hsl.s < 0.08 && hsl.l < 0.2;
}

const CARD_CHARCOAL = '#3D3D42';
const CARD_CHARCOAL_WELL = '#2A2A2E';

function brighterCardBody(hex, theme) {
  if (isPureBlack(hex)) return new THREE.Color(CARD_CHARCOAL);
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  const sat = Math.min(1, theme === 'light' ? hsl.s * 1.08 + 0.04 : hsl.s * 1.25 + 0.1);
  const lit = theme === 'light'
    ? Math.min(0.96, hsl.l + 0.04)
    : Math.min(0.5, hsl.l * 1.75 + 0.12);
  c.setHSL(hsl.h, sat, lit);
  return c;
}

function wellBodyColor(hex, theme) {
  if (isPureBlack(hex)) return new THREE.Color(CARD_CHARCOAL_WELL);
  const c = brighterCardBody(hex, theme);
  c.offsetHSL(0, theme === 'light' ? 0.02 : 0.06, theme === 'light' ? -0.07 : -0.1);
  return c;
}

function colorLuma(color) {
  const c = color?.isColor ? color : new THREE.Color(color);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/** Printed inside ink — dark on light/mid paper, foil only on charcoal/black. */
function insideWritingInk(paper, foilInk) {
  return colorLuma(paper) > 0.3 ? '#141414' : foilInk;
}

const _lerpColor = new THREE.Color();

function lerpScalar(current, target, k) {
  return current + (target - current) * k;
}

function lerpFoilMaterial(mat, props, k, roughnessCap) {
  if (!mat || !props) return;
  mat.color.lerp(_lerpColor.set(props.color), k);
  if (mat.emissive && props.emissive) mat.emissive.lerp(_lerpColor.set(props.emissive), k);
  if (props.metalness != null) mat.metalness = lerpScalar(mat.metalness, props.metalness, k);
  let roughness = props.roughness;
  if (roughnessCap != null) roughness = Math.min(roughness ?? 0.05, roughnessCap);
  if (roughness != null) mat.roughness = lerpScalar(mat.roughness, roughness, k);
  if (props.clearcoat != null) mat.clearcoat = lerpScalar(mat.clearcoat, props.clearcoat, k);
  if (props.clearcoatRoughness != null) {
    mat.clearcoatRoughness = lerpScalar(mat.clearcoatRoughness, props.clearcoatRoughness, k);
  }
  if (props.envMapIntensity != null) {
    mat.envMapIntensity = lerpScalar(mat.envMapIntensity, props.envMapIntensity, k);
  }
  if (props.emissiveIntensity != null) {
    mat.emissiveIntensity = lerpScalar(mat.emissiveIntensity, props.emissiveIntensity, k);
  }
  if (props.reflectivity != null) mat.reflectivity = lerpScalar(mat.reflectivity, props.reflectivity, k);
  if (props.specularIntensity != null) {
    mat.specularIntensity = lerpScalar(mat.specularIntensity ?? 1, props.specularIntensity, k);
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const NOTE_FONT = '700 22px Caveat, "Segoe Script", cursive';
const NOTE_SIGN_FONT = '700 24px Caveat, "Segoe Script", cursive';
const NOTE_LINE_H = 24;
const NOTE_SIGN_H = 30;
const NOTE_BOX_PAD = 8;

function isOwnNote(note) {
  return String(note?.id || '').startsWith('me-') || note?.id === '__draft';
}

function hasOwnMessage(notes) {
  return (notes || []).some((n) => n && isOwnNote(n) && n.id !== '__draft');
}

function markedZoneKeys(notes) {
  const keys = new Set();
  for (const note of notes) {
    if (!note || !isOwnNote(note)) continue;
    const z = noteZone(note);
    keys.add(zoneKey(z.page, z.col, z.row));
  }
  return keys;
}

function ownNoteInZone(notes, page, col, row) {
  return (notes || []).find((note) => {
    if (!note || !isOwnNote(note) || note.id === '__draft') return false;
    const z = noteZone(note);
    return z.page === page && z.col === col && z.row === row;
  }) || null;
}

function layoutNote(ctx, note, w, h) {
  const wrapW = w * (0.78 / ZONE_COLS);
  const edge = w * 0.04;
  ctx.font = NOTE_FONT;
  const lines = wrapText(ctx, note.text, wrapW);
  ctx.font = NOTE_SIGN_FONT;
  let textW = ctx.measureText(`— ${note.name}`).width;
  ctx.font = NOTE_FONT;
  for (const line of lines) {
    textW = Math.max(textW, ctx.measureText(line).width);
  }
  const z = noteZone(note);
  const pinToZone = isOwnNote(note) && Number.isInteger(z.col) && Number.isInteger(z.row);
  ctx.textBaseline = pinToZone ? 'alphabetic' : 'top';
  const ascent = pinToZone
    ? Math.ceil(ctx.measureText('Hg').actualBoundingBoxAscent || NOTE_LINE_H * 0.72)
    : 0;
  const blockH = (pinToZone ? ascent : 0) + lines.length * NOTE_LINE_H + NOTE_SIGN_H;
  const pad = NOTE_BOX_PAD;
  let x;
  let y;
  let angle;
  if (pinToZone) {
    const cellW = w / ZONE_COLS;
    const cellH = h / ZONE_ROWS;
    const inset = Math.min(cellW, cellH) * 0.1;
    x = z.col * cellW + inset;
    y = z.row * cellH + inset;
    angle = 0;
  } else {
    x = note.u * w;
    y = (1 - note.v) * h;
    angle = ((note.rotate || 0) * Math.PI) / 180;
    if (x - pad < edge) x = edge + pad;
    if (x + textW + pad > w - edge) x = Math.max(edge + pad, w - edge - textW - pad);
    if (y - pad < edge) y = edge + pad;
    if (y + blockH + pad > h - edge) y = Math.max(edge + pad, h - edge - blockH - pad);
  }
  return {
    x,
    y,
    textW,
    blockH,
    pad,
    lines,
    angle,
    ascent,
    pinToZone,
  };
}

function canvasFromUv(u, v, w, h) {
  return { x: u * w, y: (1 - v) * h };
}

function localOnNote(px, py, layout) {
  const cx = layout.x + layout.textW * 0.5;
  const cy = layout.y + layout.blockH * 0.5;
  const dx = px - cx;
  const dy = py - cy;
  const c = Math.cos(-layout.angle);
  const s = Math.sin(-layout.angle);
  return {
    x: dx * c - dy * s + layout.textW * 0.5,
    y: dx * s + dy * c + layout.blockH * 0.5,
  };
}

function hitOwnNote(ctx, note, u, v, w, h) {
  if (!isOwnNote(note)) return null;
  const layout = layoutNote(ctx, note, w, h);
  const p = canvasFromUv(u, v, w, h);
  const local = localOnNote(p.x, p.y, layout);
  if (
    local.x >= -layout.pad
    && local.x <= layout.textW + layout.pad
    && local.y >= -layout.pad
    && local.y <= layout.blockH + layout.pad
  ) {
    return { kind: 'move' };
  }
  return null;
}

function drawNote(ctx, note, w, h, ink = '#ffffff', selected = false) {
  const layout = layoutNote(ctx, note, w, h);
  ctx.save();
  ctx.translate(layout.x + layout.textW * 0.5, layout.y + layout.blockH * 0.5);
  ctx.rotate(layout.angle);
  ctx.translate(-layout.textW * 0.5, -layout.blockH * 0.5);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.textAlign = 'left';
  ctx.textBaseline = layout.pinToZone ? 'alphabetic' : 'top';
  ctx.font = NOTE_FONT;
  ctx.lineWidth = 1.1;
  const lineY = (i) => (layout.pinToZone ? layout.ascent : 0) + i * NOTE_LINE_H;
  layout.lines.forEach((line, i) => {
    const ly = lineY(i);
    ctx.strokeText(line, 0, ly);
    ctx.fillText(line, 0, ly);
  });
  ctx.font = NOTE_SIGN_FONT;
  ctx.lineWidth = 1.2;
  const sign = `— ${note.name}`;
  const signY = lineY(layout.lines.length) + 6;
  ctx.strokeText(sign, 0, signY);
  ctx.fillText(sign, 0, signY);
  ctx.restore();
}

function foilStar(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.34;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function foilBurst(ctx, x, y, r, rays = 14) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineCap = 'round';
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + 0.18;
    const wobble = 0.72 + (i % 5) * 0.07;
    const inner = r * 0.16;
    const outer = r * wobble;
    ctx.lineWidth = i % 2 === 0 ? 2.1 : 1.15;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Math.cos(a) * outer, Math.sin(a) * outer, i % 3 === 0 ? 2.3 : 1.35, 0, Math.PI * 2);
    ctx.fill();
  }
  foilStar(ctx, 0, 0, r * 0.2);
  ctx.restore();
}

export const COVER_DESIGNS = [
  { id: 'classic', name: 'Classic' },
  { id: 'script', name: 'Stars' },
  { id: 'quiet', name: 'Quiet' },
  { id: 'burst', name: 'Burst' },
  { id: 'sparks', name: 'Sparks' },
  { id: 'balloons', name: 'Balloons' },
  { id: 'cupcakes', name: 'Cupcakes' },
];

function paintName(ctx, name, y, size = 92) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px Caveat, "Segoe Script", cursive`;
  ctx.fillText(name, 256, y);
}

function paintCoverLettering(ctx, name) {
  if (isPossibilityReady()) {
    ctx.font = '700 22px "Possibility"';
    fillTrackedText(ctx, 'HAPPY BIRTHDAY', 256, 292, 4.8);
  }
  paintName(ctx, name, 384, 80);
}

function drawCoverClassic(ctx, name) {
  foilBurst(ctx, 92, 118, 58, 16);
  foilBurst(ctx, 424, 152, 46, 12);
  foilBurst(ctx, 86, 586, 50, 14);
  foilBurst(ctx, 428, 558, 62, 16);
  foilStar(ctx, 256, 86, 11);
  foilStar(ctx, 168, 198, 7);
  foilStar(ctx, 352, 186, 8);
  foilStar(ctx, 64, 320, 6);
  foilStar(ctx, 454, 348, 7);
  foilStar(ctx, 196, 512, 8);
  foilStar(ctx, 328, 498, 6);
  foilStar(ctx, 256, 628, 10);
  paintCoverLettering(ctx, name);
}

function drawCoverScript(ctx, name) {
  const stars = [
    [72, 72, 13], [256, 58, 15], [440, 78, 12],
    [108, 148, 9], [404, 136, 14],
    [64, 236, 8], [448, 224, 10],
    [80, 360, 11], [432, 348, 8],
    [76, 468, 9], [436, 456, 12],
    [112, 556, 14], [256, 616, 12], [400, 548, 9],
    [168, 92, 7], [344, 84, 6],
    [140, 632, 7], [372, 628, 8],
    [56, 520, 6], [456, 508, 7],
  ];
  stars.forEach(([x, y, r]) => foilStar(ctx, x, y, r));
  paintCoverLettering(ctx, name);
}

function drawCoverQuiet(ctx, name) {
  paintCoverLettering(ctx, name);
}

function drawCoverBurst(ctx, name) {
  foilBurst(ctx, 256, 108, 58, 16);
  foilStar(ctx, 118, 168, 6);
  foilStar(ctx, 394, 152, 7);
  paintCoverLettering(ctx, name);
}

function drawCoverSparks(ctx, name) {
  const stars = [
    [256, 64, 10], [88, 118, 6], [424, 98, 7], [148, 188, 5],
    [360, 176, 6], [52, 280, 5], [460, 300, 6], [120, 420, 5],
    [400, 438, 6], [80, 540, 7], [432, 568, 8], [256, 640, 9],
    [196, 88, 4], [318, 78, 4], [70, 200, 4], [448, 220, 4],
  ];
  stars.forEach(([x, y, r]) => foilStar(ctx, x, y, r));
  paintCoverLettering(ctx, name);
}

function foilBalloon(ctx, x, y, rx, ry, tilt = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-rx * 0.16, ry * 0.86);
  ctx.lineTo(0, ry * 1.12);
  ctx.lineTo(rx * 0.16, ry * 0.86);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2.4, rx * 0.085);
  ctx.beginPath();
  ctx.moveTo(-rx * 0.42, -ry * 0.06);
  ctx.quadraticCurveTo(-rx * 0.5, -ry * 0.42, -rx * 0.14, -ry * 0.56);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, ry * 1.12);
  ctx.quadraticCurveTo(rx * 0.35, ry * 1.7, 0, ry * 2.35);
  ctx.stroke();
  ctx.restore();
}

function drawCoverBalloons(ctx, name) {
  foilBalloon(ctx, 256, 128, 34, 46, 0);
  paintCoverLettering(ctx, name);
}

function foilCupcake(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-22, 6);
  ctx.lineTo(-16, 36);
  ctx.quadraticCurveTo(0, 42, 16, 36);
  ctx.lineTo(22, 6);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 1.7;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 7, 8);
    ctx.lineTo(i * 5.2, 34);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-26, 8);
  ctx.quadraticCurveTo(-18, -6, -8, 2);
  ctx.quadraticCurveTo(0, -16, 8, 2);
  ctx.quadraticCurveTo(18, -6, 26, 8);
  ctx.quadraticCurveTo(12, 16, 0, 12);
  ctx.quadraticCurveTo(-12, 16, -26, 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -14, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(0, -34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(8, -30);
  ctx.lineTo(0, -26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCoverCupcakes(ctx, name) {
  foilCupcake(ctx, 256, 158, 1.15);
  paintCoverLettering(ctx, name);
}

const COVER_PAINTERS = {
  classic: drawCoverClassic,
  script: drawCoverScript,
  quiet: drawCoverQuiet,
  burst: drawCoverBurst,
  sparks: drawCoverSparks,
  balloons: drawCoverBalloons,
  cupcakes: drawCoverCupcakes,
};

function drawCoverFoil(ctx, name, coverId = 'classic') {
  const sx = ctx.canvas.width / FOIL_DRAW_W;
  const sy = ctx.canvas.height / FOIL_DRAW_H;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const paint = COVER_PAINTERS[coverId] ?? drawCoverClassic;
  paint(ctx, name);
  ctx.restore();
}

export const DEFAULT_BACK_TEXT = 'THE OFFICE OF THE FUTURE';

export const BACK_DESIGNS = [
  { id: 'text', name: 'Text' },
  { id: 'cupcake', name: 'Cupcake' },
  { id: 'balloon', name: 'Balloon' },
  { id: 'firework', name: 'Firework' },
];

function paintBackLettering(ctx, text) {
  const copy = String(text || '').trim();
  if (!copy || !isPossibilityReady()) return;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px "Possibility"';
  const lines = wrapText(ctx, copy, 400);
  const lineH = 24;
  const startY = 634 - (lines.length - 1) * lineH;
  lines.forEach((line, i) => {
    fillTrackedText(ctx, line, 256, startY + i * lineH, 2.2);
  });
}

function drawBackFoil(ctx, backId = 'text', text = DEFAULT_BACK_TEXT) {
  const sx = ctx.canvas.width / FOIL_DRAW_W;
  const sy = ctx.canvas.height / FOIL_DRAW_H;
  ctx.save();
  ctx.scale(sx, sy);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (backId === 'cupcake') {
    foilCupcake(ctx, 256, 598, 0.85);
  } else if (backId === 'balloon') {
    foilBalloon(ctx, 256, 562, 20, 28, 0);
  } else if (backId === 'firework') {
    foilBurst(ctx, 256, 600, 40, 16);
    foilStar(ctx, 200, 558, 3);
    foilStar(ctx, 316, 566, 3);
    foilStar(ctx, 214, 640, 2.5);
    foilStar(ctx, 308, 634, 3);
  } else {
    paintBackLettering(ctx, text);
  }
  ctx.restore();
}

function makeFoilTexture(draw, width = FOIL_W, height = FOIL_H) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function fillTrackedText(ctx, text, cx, cy, tracking = 1.6) {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, cy);
    x += widths[i] + tracking;
  }
}

function drawFrontTexture(name, coverId = 'classic') {
  return makeFoilTexture((ctx) => drawCoverFoil(ctx, name, coverId));
}

function drawBackTexture(backId = 'text', text = DEFAULT_BACK_TEXT) {
  return makeFoilTexture((ctx) => drawBackFoil(ctx, backId, text));
}

function hexRgba(hex, alpha) {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`;
}

function makeFoilDecalMaterial(alphaMap, displace = 0, foilProps = getFoilMetal().props) {
  return new THREE.MeshPhysicalMaterial({
    ...foilProps,
    alphaMap,
    displacementMap: displace ? alphaMap : null,
    displacementScale: displace,
    displacementBias: 0,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: true,
  });
}

function makeInsidePageTexture(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d');
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 1;
  tex.needsUpdate = true;
  return tex;
}

/** Inside writing — unlit so left/right pages share the same ink. */
function makeInsidePageMaterial(map, ink = '#ffffff') {
  return new THREE.MeshBasicMaterial({
    color: ink,
    map,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.FrontSide,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -8,
    toneMapped: false,
  });
}

function paintInsideGreeting(ctx, name, w, h) {
  const cx = w / 2;
  const cy = h * 0.46;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const paint = (size, text, x, y, stroke) => {
    ctx.font = `700 ${size}px Caveat, "Segoe Script", cursive`;
    ctx.lineWidth = stroke;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  };

  paint(26, `Dear ${name},`, cx, cy - 118, 1.2);
  paint(34, 'Happy Birthday', cx, cy - 74, 1.5);

  const lines = [
    'Another trip around the sun.',
    'The map’s a little quieter today —',
    'go enjoy the cake. We’ll keep',
    'the lights on for you.',
  ];
  lines.forEach((line, i) => {
    paint(24, line, cx, cy + 6 + i * 30, 1.2);
  });

  paint(24, 'With love, Roam HQ', cx, cy + 148, 1.2);
}

function paintInsidePage(ctx, side, notes, name, selectedId) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (side === 'right') {
    paintInsideGreeting(ctx, name || 'Klas', ctx.canvas.width, ctx.canvas.height);
  }
  notes
    .filter((n) => n.page === side)
    .forEach((note) => {
      drawNote(
        ctx,
        note,
        ctx.canvas.width,
        ctx.canvas.height,
        '#ffffff',
        note.id === selectedId && isOwnNote(note),
      );
    });
}

function drawInsidePage(side, notes, name, selectedId) {
  return makeInsidePageTexture((ctx) => paintInsidePage(ctx, side, notes, name, selectedId));
}

function pageNotesStamp(notes, side, selectedId) {
  let stamp = '';
  for (const note of notes) {
    if (note.page !== side) continue;
    stamp += `${note.id}:${note.col}:${note.row}:${note.u}:${note.v}:${note.rotate}:${note.id === selectedId ? 1 : 0}|`;
  }
  return stamp;
}

function paintPageTexture(mesh, side, notes, name, selectedId) {
  const tex = mesh?.material?.map;
  const ctx = tex?.image?.getContext?.('2d');
  if (!ctx) return;
  paintInsidePage(ctx, side, notes, name, selectedId);
  tex.needsUpdate = true;
}

function useInsideNotesMat(side, notes, fontsReady, name, selectedId, skipPaintRef, ink) {
  const mat = useMemo(() => {
    const tex = drawInsidePage(side, [], name, selectedId);
    return makeInsidePageMaterial(tex, ink);
  }, [side, name]);
  const stamp = pageNotesStamp(notes, side, selectedId);
  useLayoutEffect(() => {
    mat.color.set(ink);
  }, [mat, ink]);
  useLayoutEffect(() => {
    if (skipPaintRef?.current) return;
    const tex = mat.map;
    if (!tex?.image) return;
    const ctx = tex.image.getContext('2d');
    paintInsidePage(ctx, side, notes, name, selectedId);
    tex.needsUpdate = true;
  }, [mat, side, notes, fontsReady, name, selectedId, stamp, skipPaintRef]);
  return mat;
}

function makeZoneMarkTexture(ink) {
  const size = 256;
  const radius = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = hexRgba(ink, 0.16);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1;
  ctx.setLineDash([16, 10]);
  ctx.beginPath();
  ctx.roundRect(0.5, 0.5, size - 1, size - 1, radius);
  ctx.fill();
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeZoneDismissTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = '#f2f2f3';
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  const s = 22;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx + s, cy + s);
  ctx.moveTo(cx + s, cy - s);
  ctx.lineTo(cx - s, cy + s);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const JINGLE_BEAT = 0.34;
const JINGLE_NOTES = [
  [261.63, 0.0, 0.5], [261.63, 0.5, 0.5], [293.66, 1.0, 1], [261.63, 2.0, 1], [349.23, 3.0, 1], [329.63, 4.0, 2],
  [261.63, 6.0, 0.5], [261.63, 6.5, 0.5], [293.66, 7.0, 1], [261.63, 8.0, 1], [392.0, 9.0, 1], [349.23, 10.0, 2],
  [261.63, 12.0, 0.5], [261.63, 12.5, 0.5], [523.25, 13.0, 1], [440.0, 14.0, 1], [349.23, 15.0, 1], [329.63, 16.0, 1], [293.66, 17.0, 2],
  [466.16, 19.0, 0.5], [466.16, 19.5, 0.5], [440.0, 20.0, 1], [349.23, 21.0, 1], [392.0, 22.0, 1], [349.23, 23.0, 2],
];

let jingleCtx = null;
let jingleNodes = [];
let jingleTimer = 0;

function stopBirthdayJingle() {
  window.clearTimeout(jingleTimer);
  jingleTimer = 0;
  for (const node of jingleNodes) {
    try {
      node.stop?.();
      node.disconnect?.();
    } catch {
      /* already stopped */
    }
  }
  jingleNodes = [];
}

function unlockBirthdayJingle() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!jingleCtx) jingleCtx = new AC();
  return jingleCtx.resume?.();
}

function startBell(ctx, dest, { freq, start, peak, ring = 1.35 }) {
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const out = ctx.createGain();
  car.type = 'sine';
  mod.type = 'sine';
  car.frequency.setValueAtTime(freq, start);
  mod.frequency.setValueAtTime(freq * 3.5, start);
  modGain.gain.setValueAtTime(freq * 2.4, start);
  modGain.gain.exponentialRampToValueAtTime(freq * 0.2, start + 0.18);
  modGain.gain.exponentialRampToValueAtTime(0.0001, start + ring);
  out.gain.setValueAtTime(0.0001, start);
  out.gain.exponentialRampToValueAtTime(peak, start + 0.006);
  out.gain.exponentialRampToValueAtTime(peak * 0.28, start + 0.22);
  out.gain.exponentialRampToValueAtTime(0.0001, start + ring);
  mod.connect(modGain);
  modGain.connect(car.frequency);
  car.connect(out);
  out.connect(dest);
  car.start(start);
  mod.start(start);
  car.stop(start + ring + 0.05);
  mod.stop(start + ring + 0.05);
  jingleNodes.push(car, mod, modGain, out);

  const partial = ctx.createOscillator();
  const pGain = ctx.createGain();
  partial.type = 'sine';
  partial.frequency.setValueAtTime(freq * 2.76, start);
  pGain.gain.setValueAtTime(0.0001, start);
  pGain.gain.exponentialRampToValueAtTime(peak * 0.16, start + 0.005);
  pGain.gain.exponentialRampToValueAtTime(0.0001, start + ring * 0.45);
  partial.connect(pGain);
  pGain.connect(dest);
  partial.start(start);
  partial.stop(start + ring * 0.5);
  jingleNodes.push(partial, pGain);
}

function startTine(ctx, dest, { freq, start, peak, ring = 0.55 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + ring);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + ring + 0.03);
  jingleNodes.push(osc, gain);
}

function startBirthdayJingle(onEnded) {
  stopBirthdayJingle();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    onEnded?.();
    return;
  }
  if (!jingleCtx) jingleCtx = new AC();
  const ctx = jingleCtx;
  ctx.resume?.();

  const master = ctx.createGain();
  master.gain.value = 0.22;
  const sparkle = ctx.createBiquadFilter();
  sparkle.type = 'highshelf';
  sparkle.frequency.value = 2400;
  sparkle.gain.value = 5;
  master.connect(sparkle);
  sparkle.connect(ctx.destination);

  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.22;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  const delayTone = ctx.createBiquadFilter();
  delayTone.type = 'highpass';
  delayTone.frequency.value = 900;
  wet.connect(delay);
  delay.connect(delayTone);
  delayTone.connect(feedback);
  feedback.connect(delay);
  delayTone.connect(master);

  jingleNodes.push(master, sparkle, wet, delay, feedback, delayTone);

  const t0 = ctx.currentTime + 0.06;
  let last = 0;

  for (const [freq, startBeat, durBeats] of JINGLE_NOTES) {
    const start = t0 + startBeat * JINGLE_BEAT;
    const ring = Math.max(durBeats * JINGLE_BEAT * 1.7, 1.15);
    last = Math.max(last, startBeat * JINGLE_BEAT + ring);
    const bell = freq * 2;
    startBell(ctx, master, { freq: bell, start, peak: 0.42, ring });
    startBell(ctx, wet, { freq: bell, start, peak: 0.18, ring: ring * 1.15 });
    startTine(ctx, master, { freq: bell * 2, start, peak: 0.22, ring: 0.42 });
    if (durBeats >= 1) {
      startBell(ctx, master, {
        freq: bell * 1.5,
        start: start + 0.03,
        peak: 0.12,
        ring: ring * 0.8,
      });
    }
    if (durBeats >= 2) {
      startTine(ctx, wet, { freq: bell * 3, start: start + 0.08, peak: 0.1, ring: 0.7 });
      startBell(ctx, wet, { freq: bell * 2, start: start + 0.12, peak: 0.08, ring: 0.9 });
    }
  }

  jingleTimer = window.setTimeout(() => {
    stopBirthdayJingle();
    onEnded?.();
  }, last * 1000 + 180);
}

function makeJingleButtonTexture(playing) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  if (playing) {
    const bw = 12;
    const bh = 36;
    const gap = 10;
    ctx.fillRect(cx - gap - bw, cy - bh / 2, bw, bh);
    ctx.fillRect(cx + gap, cy - bh / 2, bw, bh);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 22);
    ctx.lineTo(cx + 24, cy);
    ctx.lineTo(cx - 14, cy + 22);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const JINGLE_BTN_SIZE = 0.1;

function InsideJingleButton({ ink }) {
  const { gl } = useThree();
  const [playing, setPlaying] = useState(true);
  const wantPlay = useRef(true);
  const playMap = useMemo(() => makeJingleButtonTexture(false), []);
  const pauseMap = useMemo(() => makeJingleButtonTexture(true), []);
  const geo = useMemo(
    () => new THREE.PlaneGeometry(JINGLE_BTN_SIZE, JINGLE_BTN_SIZE),
    [],
  );
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: ink,
        map: pauseMap,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        toneMapped: false,
      }),
    [pauseMap],
  );

  useEffect(() => {
    mat.color.set(ink);
  }, [mat, ink]);

  useEffect(() => {
    mat.map = playing ? pauseMap : playMap;
    mat.needsUpdate = true;
  }, [mat, playing, playMap, pauseMap]);

  useEffect(() => {
    let cancelled = false;
    unlockBirthdayJingle();
    const delay = window.setTimeout(() => {
      if (cancelled || !wantPlay.current) return;
      startBirthdayJingle(() => {
        if (cancelled) return;
        wantPlay.current = false;
        setPlaying(false);
      });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(delay);
      stopBirthdayJingle();
      geo.dispose();
      playMap.dispose();
      pauseMap.dispose();
      mat.dispose();
    };
  }, [geo, playMap, pauseMap, mat]);

  return (
    <mesh
      geometry={geo}
      material={mat}
      position={[NOTES_W * 0.5 - 0.072, -NOTES_H * 0.5 + 0.072, 0.006]}
      renderOrder={14}
      onPointerOver={(e) => {
        e.stopPropagation();
        setStageCursor(gl, 'pointer');
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setStageCursor(gl, '');
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopPropagation?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopPropagation?.();
        e.nativeEvent?.stopImmediatePropagation?.();
        if (wantPlay.current) {
          wantPlay.current = false;
          stopBirthdayJingle();
          setPlaying(false);
          return;
        }
        wantPlay.current = true;
        startBirthdayJingle(() => {
          wantPlay.current = false;
          setPlaying(false);
        });
        setPlaying(true);
      }}
    />
  );
}

const ZONE_CELL_W = NOTES_W / ZONE_COLS;
const ZONE_CELL_H = NOTES_H / ZONE_ROWS;
const ZONE_DISMISS_SIZE = Math.min(ZONE_CELL_W, ZONE_CELL_H) * 0.28;

function SignZoneOverlay({ page, hoverRef, notesRef, active, ink, onRemoveNote }) {
  const { gl } = useThree();
  const meshes = useRef([]);
  const dismissRef = useRef(null);
  const dismissHot = useRef(false);
  const pinned = useRef(null);
  const geo = useMemo(
    () => new THREE.PlaneGeometry(ZONE_CELL_W, ZONE_CELL_H),
    [],
  );
  const dismissGeo = useMemo(
    () => new THREE.PlaneGeometry(ZONE_DISMISS_SIZE, ZONE_DISMISS_SIZE),
    [],
  );
  const map = useMemo(() => makeZoneMarkTexture(ink), [ink]);
  const dismissMap = useMemo(() => makeZoneDismissTexture(), []);
  useEffect(
    () => () => {
      geo.dispose();
      dismissGeo.dispose();
      map.dispose();
      dismissMap.dispose();
    },
    [geo, dismissGeo, map, dismissMap],
  );

  useFrame(() => {
    const list = meshes.current;
    const dismiss = dismissRef.current;
    if (!active) {
      for (let i = 0; i < list.length; i++) {
        if (list[i]) list[i].visible = false;
      }
      if (dismiss) dismiss.visible = false;
      pinned.current = null;
      return;
    }
    const hover = hoverRef.current;
    const notes = notesRef.current || [];
    const taken = occupiedZoneKeys(notes);
    const marked = markedZoneKeys(notes);
    const canSign = !hasOwnMessage(notes);
    const hoveredOwn =
      hover?.page === page
        ? ownNoteInZone(notes, page, hover.col, hover.row)
        : null;
    if (hoveredOwn) {
      pinned.current = { col: hover.col, row: hover.row, id: hoveredOwn.id };
    }
    let i = 0;
    for (let row = 0; row < ZONE_ROWS; row++) {
      for (let col = 0; col < ZONE_COLS; col++) {
        const mesh = list[i++];
        if (!mesh) continue;
        const key = zoneKey(page, col, row);
        const hovering =
          canSign
          && hover?.page === page
          && hover.col === col
          && hover.row === row
          && !taken.has(key);
        const show = marked.has(key) || hovering;
        mesh.visible = show;
        if (show) mesh.material.opacity = 1;
      }
    }
    const pin = pinned.current;
    const showDismiss = !!(onRemoveNote && pin && (hoveredOwn || dismissHot.current));
    if (!showDismiss) {
      if (!dismissHot.current && !hoveredOwn) pinned.current = null;
      if (dismiss) dismiss.visible = false;
      return;
    }
    if (!dismiss) return;
    const col = pin.col;
    const row = pin.row;
    dismiss.visible = true;
    dismiss.position.set(
      ((col + 0.5) / ZONE_COLS - 0.5) * NOTES_W + ZONE_CELL_W / 2 - ZONE_DISMISS_SIZE * 0.62,
      (0.5 - (row + 0.5) / ZONE_ROWS) * NOTES_H + ZONE_CELL_H / 2 - ZONE_DISMISS_SIZE * 0.62,
      0.004,
    );
  });

  const cells = [];
  let i = 0;
  for (let row = 0; row < ZONE_ROWS; row++) {
    for (let col = 0; col < ZONE_COLS; col++) {
      const idx = i++;
      const x = ((col + 0.5) / ZONE_COLS - 0.5) * NOTES_W;
      const y = (0.5 - (row + 0.5) / ZONE_ROWS) * NOTES_H;
      cells.push(
        <mesh
          key={`${col}-${row}`}
          ref={(node) => {
            meshes.current[idx] = node;
          }}
          geometry={geo}
          position={[x, y, 0.001]}
          visible={false}
          raycast={() => {}}
        >
          <meshBasicMaterial
            map={map}
            transparent
            opacity={0.32}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>,
      );
    }
  }
  return (
    <group>
      {cells}
      <mesh
        ref={dismissRef}
        geometry={dismissGeo}
        visible={false}
        renderOrder={12}
        onPointerOver={(e) => {
          e.stopPropagation();
          dismissHot.current = true;
          const pin = pinned.current;
          if (pin && hoverRef) hoverRef.current = { page, col: pin.col, row: pin.row };
          setStageCursor(gl, 'pointer');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          dismissHot.current = false;
          setStageCursor(gl, '');
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          e.nativeEvent?.stopImmediatePropagation?.();
          const id = pinned.current?.id;
          if (id) onRemoveNote?.(id);
        }}
      >
        <meshBasicMaterial
          map={dismissMap}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function CardFace({
  raised,
  inset = false,
  rimGeo,
  wellGeo,
  rimMat,
  wellMat,
  greetingGeo,
  greetingMat,
  notesGeo,
  notesMat,
  notes,
  selectedId,
  name,
  page,
  interactive,
  onPick,
  onSelectNote,
  onNoteChange,
  onRemoveNote,
  draggingRef,
  pageMeshes,
  hoverRef,
  notesRef,
  ink,
  children,
}) {
  const notesZ = 0.0005;
  const greetZ = 0.0008;

  return (
    <group>
      {inset && (
        <>
          <mesh geometry={rimGeo} material={rimMat} position={[0, 0, rimZ]} raycast={() => {}} />
          <mesh geometry={wellGeo} material={wellMat} position={[0, 0, wellZ]} raycast={() => {}} />
        </>
      )}
      {greetingMat && greetingGeo && (
        <mesh
          geometry={greetingGeo}
          material={greetingMat}
          position={[0, 0, greetZ]}
          raycast={() => {}}
        />
      )}
      {notesMat && notesGeo && (
        <group position={[0, 0, notesZ]}>
          <InsidePage
            geometry={notesGeo}
            material={notesMat}
            page={page}
            interactive={interactive}
            notes={notes}
            selectedId={selectedId}
            name={name}
            onPick={onPick}
            onSelectNote={onSelectNote}
            onNoteChange={onNoteChange}
            draggingRef={draggingRef}
            pageMeshes={pageMeshes}
            hoverRef={hoverRef}
            notesRef={notesRef}
            ink={ink}
          />
          {interactive && (
            <SignZoneOverlay
              page={page}
              hoverRef={hoverRef}
              notesRef={notesRef}
              active={interactive}
              ink={ink}
              onRemoveNote={onRemoveNote}
            />
          )}
          {page === 'right' && interactive && <InsideJingleButton ink={ink} />}
        </group>
      )}
      {children}
    </group>
  );
}

function usePrefersReducedMotion() {
  const reduce = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduce.current = mq.matches;
    const onChange = () => {
      reduce.current = mq.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

function InsidePage({
  geometry,
  material,
  page,
  interactive,
  notes,
  selectedId,
  name,
  onPick,
  onSelectNote,
  onNoteChange,
  draggingRef,
  pageMeshes,
  hoverRef,
  notesRef,
  ink,
}) {
  const mesh = useRef(null);
  const down = useRef(null);
  const drag = useRef(null);
  const pendingNote = useRef(null);
  const noteRaf = useRef(0);
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const fns = useRef({});

  fns.current = {
    notes: notesRef?.current || notes,
    material,
    onNoteChange,
    onSelectNote,
    selectedId,
    camera,
    gl,
    page,
    name,
    pageMeshes,
    hoverRef,
    notesRef,
    ink,
  };

  const setMesh = (node) => {
    mesh.current = node;
    if (pageMeshes?.current) pageMeshes.current[page] = node;
  };

  const hitFromClient = (clientX, clientY, onlyPage) => {
    const el = gl.domElement;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const pages = fns.current.pageMeshes?.current || {};
    let targets = onlyPage
      ? [pages[onlyPage]].filter(Boolean)
      : [pages.left, pages.right].filter(Boolean);
    if (targets.length === 0 && mesh.current) targets = [mesh.current];
    const hit = raycaster.intersectObjects(targets, false)[0];
    if (!hit?.uv) return null;
    const hitPage = hit.object === pages.left ? 'left' : hit.object === pages.right ? 'right' : page;
    return { page: hitPage, u: hit.uv.x, v: hit.uv.y };
  };

  const pageCtx = () => fns.current.material?.map?.image?.getContext?.('2d') ?? null;

  const hitAtUv = (u, v) => {
    const ctx = pageCtx();
    if (!ctx) return null;
    const own = (fns.current.notesRef?.current || fns.current.notes).filter(
      (n) => n.page === page && isOwnNote(n),
    );
    for (let i = own.length - 1; i >= 0; i--) {
      const hit = hitOwnNote(ctx, own[i], u, v, TEX_W, TEX_H);
      if (hit) return { note: own[i], ...hit };
    }
    return null;
  };

  const setCursor = (kind) => {
    const el = fns.current.gl.domElement;
    if (kind === 'move') el.style.cursor = 'grab';
    else if (kind === 'grabbing') el.style.cursor = 'grabbing';
    else if (kind === 'sign') el.style.cursor = 'pointer';
    else el.style.cursor = '';
  };

  const onWinMove = useRef((e) => {
    const session = drag.current;
    if (!session) return;
    if (draggingRef) draggingRef.current = true;
    const hit = hitFromClient(e.clientX, e.clientY);
    if (!hit) return;
    const { col, row } = zoneFromUv(hit.u, hit.v);
    const taken = occupiedZoneKeys(fns.current.notesRef?.current || fns.current.notes, session.id);
    if (taken.has(zoneKey(hit.page, col, row))) return;
    const uv = zoneNoteUv(col, row);
    const patch = { page: hit.page, col, row, u: uv.u, v: uv.v };
    const href = fns.current.hoverRef;
    if (href) href.current = { page: hit.page, col, row };
    pendingNote.current = { id: session.id, patch };
    session.lastPatch = patch;
    const prevPage = session.page;
    if (patch.page) session.page = patch.page;
    const live = fns.current.notesRef;
    if (live) {
      live.current = live.current.map((n) => (n.id === session.id ? { ...n, ...patch } : n));
      fns.current.notes = live.current;
    }
    if (!noteRaf.current) {
      noteRaf.current = requestAnimationFrame(() => {
        noteRaf.current = 0;
        const job = pendingNote.current;
        pendingNote.current = null;
        if (!job) return;
        const from = prevPage;
        const to = job.patch.page || from;
        const pages = from === to ? [from] : [from, to];
        const cardName = fns.current.name;
        const selectedId = fns.current.selectedId;
        const meshes = fns.current.pageMeshes?.current || {};
        const notesNow = fns.current.notesRef?.current || fns.current.notes;
        pages.forEach((side) => {
          paintPageTexture(meshes[side], side, notesNow, cardName, selectedId);
        });
      });
    }
  }).current;

  const onWinUp = useRef(() => {
    if (noteRaf.current) {
      cancelAnimationFrame(noteRaf.current);
      noteRaf.current = 0;
    }
    const job = pendingNote.current;
    pendingNote.current = null;
    if (job) {
      fns.current.onNoteChange?.(job.id, job.patch);
    } else if (drag.current?.lastPatch) {
      fns.current.onNoteChange?.(drag.current.id, drag.current.lastPatch);
    }
    drag.current = null;
    if (draggingRef) draggingRef.current = false;
    setCursor(null);
    window.removeEventListener('pointermove', onWinMove);
    window.removeEventListener('pointerup', onWinUp);
  }).current;

  const onPointerDown = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    down.current = { x: e.clientX, y: e.clientY };
    if (!e.uv) return;
    const hit = hitAtUv(e.uv.x, e.uv.y);
    if (!hit) {
      drag.current = null;
      return;
    }
    fns.current.onSelectNote?.(hit.note.id);
    drag.current = {
      id: hit.note.id,
      kind: 'move',
      note: hit.note,
      page: hit.note.page,
    };
    setCursor('grabbing');
    window.addEventListener('pointermove', onWinMove);
    window.addEventListener('pointerup', onWinUp);
  };

  const onPointerMove = (e) => {
    if (!interactive || !e.uv) return;
    const { col, row } = zoneFromUv(e.uv.x, e.uv.y);
    const href = fns.current.hoverRef;
    if (href) href.current = { page, col, row };
    if (drag.current) return;
    const hit = hitAtUv(e.uv.x, e.uv.y);
    if (hit) {
      setCursor(hit.kind);
      return;
    }
    const notesNow = fns.current.notesRef?.current || fns.current.notes;
    if (hasOwnMessage(notesNow)) {
      setCursor(null);
      return;
    }
    const taken = occupiedZoneKeys(notesNow);
    setCursor(taken.has(zoneKey(page, col, row)) ? null : 'sign');
  };

  const onPointerOut = () => {
    if (drag.current) return;
    setCursor(null);
    const href = fns.current.hoverRef;
    if (href?.current?.page === page) href.current = null;
  };

  const onClick = (e) => {
    if (!interactive || !e.uv) return;
    const start = down.current;
    down.current = null;
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    e.nativeEvent?.stopImmediatePropagation?.();
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
    const { col, row } = zoneFromUv(e.uv.x, e.uv.y);
    const notesNow = fns.current.notesRef?.current || fns.current.notes;
    const ownHit = hitAtUv(e.uv.x, e.uv.y)?.note
      || notesNow.find((n) => {
        if (n.page !== page || !isOwnNote(n) || n.id === '__draft') return false;
        const z = noteZone(n);
        return z.col === col && z.row === row;
      });
    const pickCol = ownHit?.col ?? col;
    const pickRow = ownHit?.row ?? row;
    const pickPage = ownHit?.page || page;
    const anchor = projectZoneTopLeft(
      mesh.current,
      camera,
      gl,
      pickCol,
      pickRow,
    ) || { clientX: e.clientX, clientY: e.clientY };
    if (ownHit) {
      onSelectNote?.(ownHit.id);
      const uv = zoneNoteUv(pickCol, pickRow);
      onPick?.({
        page: pickPage,
        col: pickCol,
        row: pickRow,
        u: ownHit.u ?? uv.u,
        v: ownHit.v ?? uv.v,
        clientX: anchor.clientX,
        clientY: anchor.clientY,
        noteId: ownHit.id,
        text: ownHit.text,
      });
      return;
    }
    if (hasOwnMessage(notesNow) || occupiedZoneKeys(notesNow).has(zoneKey(page, col, row))) {
      onSelectNote?.(null);
      return;
    }
    onSelectNote?.(null);
    const uv = zoneNoteUv(col, row);
    onPick?.({
      page,
      col,
      row,
      u: uv.u,
      v: uv.v,
      clientX: anchor.clientX,
      clientY: anchor.clientY,
    });
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', onWinMove);
    window.removeEventListener('pointerup', onWinUp);
  }, [onWinMove, onWinUp]);

  return (
    <mesh
      ref={setMesh}
      geometry={geometry}
      material={material}
      renderOrder={10}
      frustumCulled={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
      onClick={onClick}
    />
  );
}

async function loadCardFonts() {
  await loadPossibilityFont();
  if (!document.fonts) return;
  try {
    await document.fonts.load('700 92px Caveat');
  } catch {
    /* Inside notes still fall back to cursive. */
  }
}

const ENV_INTENSITY_CLOSED = 1.35;
const ENV_INTENSITY_OPEN = 0.72;
const STUDIO_LIGHT_OPEN = 0.55;

function OpenCardLights({ amountRef }) {
  const { open: openLights } = useLightRig();
  const rig = useRef({});
  const openLightsRef = useRef(openLights);
  openLightsRef.current = openLights;
  const studioBase = useRef(new Map());
  const { scene } = useThree();
  useFrame(() => {
    const a = amountRef.current;
    scene.environmentIntensity =
      ENV_INTENSITY_CLOSED + (ENV_INTENSITY_OPEN - ENV_INTENSITY_CLOSED) * a;
    const own = rig.current;
    scene.traverse((obj) => {
      if (!obj.isLight) return;
      for (const id of Object.keys(own)) {
        if (own[id] === obj) return;
      }
      if (!studioBase.current.has(obj)) studioBase.current.set(obj, obj.intensity);
      const base = studioBase.current.get(obj);
      obj.intensity = base * (1 - (1 - STUDIO_LIGHT_OPEN) * a);
    });
    for (const light of openLightsRef.current) {
      const node = own[light.id];
      if (!node) continue;
      node.intensity = light.intensity * a;
      if (light.position) node.position.set(...light.position);
    }
  });
  useEffect(
    () => () => {
      scene.environmentIntensity = ENV_INTENSITY_CLOSED;
      studioBase.current.forEach((base, obj) => {
        if (obj) obj.intensity = base;
      });
      studioBase.current.clear();
    },
    [scene],
  );
  return (
    <>
      {openLights.map((light) => (
        <directionalLight
          key={light.id}
          ref={(node) => {
            rig.current[light.id] = node;
          }}
          position={light.position}
          color={light.color}
        />
      ))}
    </>
  );
}

function setStageCursor(gl, value) {
  gl.domElement.style.cursor = value;
  const host = gl.domElement.parentElement;
  if (host) host.style.cursor = value;
}

/** Invisible front/back/inside hit target — closed card only. */
function FaceClickCatcher({ enabled, onActivate }) {
  const { gl } = useThree();
  const down = useRef(null);
  const unbind = useRef(null);

  useEffect(
    () => () => {
      unbind.current?.();
      unbind.current = null;
      setStageCursor(gl, 'pointer');
    },
    [gl],
  );

  if (!enabled || !onActivate) return null;

  return (
    <mesh
      position={[0, 0, 0.03]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setStageCursor(gl, 'pointer');
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setStageCursor(gl, 'grab');
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        down.current = [e.clientX, e.clientY];
        unbind.current?.();
        const onUp = (ev) => {
          unbind.current?.();
          unbind.current = null;
          const start = down.current;
          down.current = null;
          if (!start) return;
          const dx = ev.clientX - start[0];
          const dy = ev.clientY - start[1];
          if (dx * dx + dy * dy > 36) return;
          onActivate();
        };
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        unbind.current = () => {
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
        };
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopPropagation?.();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
    >
      <planeGeometry args={[LEAF_W - 0.028, LEAF_H - 0.028]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CoverFoldHandle({
  enabled,
  scale,
  openT,
  foldDrag,
  noteDragging,
  onClose,
  onGrabStart,
}) {
  const { gl, camera } = useThree();
  const hovering = useRef(false);
  const unbind = useRef(null);

  const restoreCursor = () => {
    if (foldDrag.current) return;
    setStageCursor(gl, enabled ? 'pointer' : 'default');
  };

  useEffect(
    () => () => {
      unbind.current?.();
      unbind.current = null;
      setStageCursor(gl, 'pointer');
    },
    [gl],
  );

  if (!enabled) return null;

  const onPointerDown = (e) => {
    if (noteDragging?.current) return;
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    onGrabStart?.();
    const t = openT.current;
    foldDrag.current = {
      t,
      lastT: t,
      lastAt: performance.now(),
      vt: 0,
    };
    setStageCursor(gl, 'grabbing');

    const onMove = (ev) => {
      if (!foldDrag.current) return;
      const next = solveCoverOpenT(ndcXFromEvent(ev, gl.domElement), camera, scale);
      const now = performance.now();
      const dt = Math.max(0.008, (now - foldDrag.current.lastAt) / 1000);
      foldDrag.current.vt = (next - foldDrag.current.lastT) / dt;
      foldDrag.current.lastT = next;
      foldDrag.current.lastAt = now;
      foldDrag.current.t = next;
    };
    const onUp = () => {
      unbind.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      const drag = foldDrag.current;
      foldDrag.current = null;
      const tNow = drag?.t ?? openT.current;
      const flickClose = (drag?.vt ?? 0) < -FOLD_FLICK_VT;
      const commit = tNow <= FOLD_COMMIT_T || flickClose;
      setStageCursor(gl, hovering.current && !commit ? 'grab' : 'pointer');
      if (commit) onClose?.();
    };
    unbind.current?.();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    unbind.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  };

  return (
    <mesh
      geometry={FOLD_HANDLE_GEO}
      position={[LEAF_W / 2 + 0.06, 0, 0]}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovering.current = true;
        if (!foldDrag.current) setStageCursor(gl, 'grab');
      }}
      onPointerOut={() => {
        hovering.current = false;
        restoreCursor();
      }}
    >
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Birthday greeting card — same studio materials as the pack gifts,
 * two thin leaves hinged at the spine. `open` drives the fold.
 */
export default function BirthdayCard3D({
  open = false,
  followPointer = true,
  name = 'Klas',
  notes = CARD_SEED_NOTES,
  draft = null,
  theme = 'dark',
  paletteId = 'gold',
  scale = 1,
  selectedNoteId = null,
  coverId = 'classic',
  backId = 'text',
  backText = DEFAULT_BACK_TEXT,
  onInsidePick,
  onSelectNote,
  onNoteChange,
  onRemoveNote,
  onClose,
  onGrabStart,
  onFrontClick,
  onBackClick,
  onInsideClick,
}) {
  const reduceMotion = usePrefersReducedMotion();
  const openT = useRef(open ? 1 : REST_OPEN);
  const hinge = useRef(null);
  const root = useRef(null);
  const pointerX = useRef(0);
  const pointer = useRef({ x: 0, y: 0, over: false });
  const followX = useRef(0);
  const noteDragging = useRef(false);
  const foldDrag = useRef(null);
  const pageMeshes = useRef({ left: null, right: null });
  const zoneHoverRef = useRef(null);
  const liveNotesRef = useRef(CARD_SEED_NOTES);
  const openPeek = useRef(open ? 1 : 0);
  const { gl } = useThree();
  const colors = paletteColorsFor(theme, paletteId);
  const pureBlack = isPureBlack(colors.body);
  const foilMetal = getFoilMetal('silver');
  const foilInk = foilMetal.ink;
  const paperColor = brighterCardBody(colors.body, theme);
  const writingInk = insideWritingInk(paperColor, foilInk);
  const paletteGoal = useRef({
    body: brighterCardBody(colors.body, theme),
    well: wellBodyColor(colors.body, theme),
    black: pureBlack ? 1 : 0,
    foil: foilMetal.props,
  });
  paletteGoal.current = {
    body: brighterCardBody(colors.body, theme),
    well: wellBodyColor(colors.body, theme),
    black: pureBlack ? 1 : 0,
    foil: foilMetal.props,
  };
  const blackMix = useRef(pureBlack ? 1 : 0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCardFonts().then(() => {
      requestAnimationFrame(() => {
        if (!cancelled && isPossibilityReady()) setFontsReady(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const el = gl.domElement;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      const over = nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1;
      pointer.current.x = Math.max(-1, Math.min(1, nx));
      pointer.current.y = Math.max(-1, Math.min(1, ny));
      pointer.current.over = over;
      pointerX.current = pointer.current.x;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [gl]);

  const geos = getCardGeos();
  const leafGeo = geos.leaf;
  const rimGeo = geos.rim;
  const wellGeo = geos.well;
  const greetingGeo = geos.greeting;
  const notesGeo = geos.notes;
  const backCoverGeo = geos.backCover;

  const outsideMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...bodyMaterialProps,
        color: brighterCardBody(colors.body, theme),
        roughness: pureBlack ? 0.42 : 0.52,
        metalness: 0,
        clearcoat: 0,
        clearcoatRoughness: 0.5,
        reflectivity: 0.08,
        envMapIntensity: 0.65,
        side: THREE.DoubleSide,
      }),
    [theme],
  );
  const wellMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...bodyMaterialProps,
        color: wellBodyColor(colors.body, theme),
        roughness: 0.2,
        metalness: pureBlack ? 0 : 0.05,
        clearcoat: pureBlack ? 0 : 0.18,
        clearcoatRoughness: 0.22,
        envMapIntensity: 1.3,
        side: THREE.DoubleSide,
      }),
    [theme],
  );
  const foilMat = useMemo(
    () => new THREE.MeshPhysicalMaterial(foilMetal.props),
    [theme],
  );

  const frontTex = useMemo(() => drawFrontTexture(name, coverId), [name, coverId, fontsReady]);
  const backTex = useMemo(() => drawBackTexture(backId, backText), [backId, backText, fontsReady]);
  const frontDecalMat = useMemo(
    () => makeFoilDecalMaterial(frontTex, FOIL_DISPLACE, foilMetal.props),
    [frontTex],
  );
  const backDecalMat = useMemo(
    () => makeFoilDecalMaterial(backTex, FOIL_DISPLACE, foilMetal.props),
    [backTex],
  );

  const paintedNotes = useMemo(() => {
    if (!draft) return notes;
    if (draft.noteId) {
      return notes.map((n) => (n.id === draft.noteId ? { ...n, text: draft.text } : n));
    }
    const text = draft.text?.trim();
    if (!text) return notes;
    return [
      ...notes,
      {
        id: '__draft',
        page: draft.page,
        col: draft.col,
        row: draft.row,
        u: draft.u,
        v: draft.v,
        rotate: 0,
        name: draft.name || 'Joe',
        text,
      },
    ];
  }, [notes, draft]);

  useLayoutEffect(() => {
    if (!noteDragging.current) liveNotesRef.current = paintedNotes;
  }, [paintedNotes]);

  const insideLeftMat = useInsideNotesMat(
    'left',
    paintedNotes,
    fontsReady,
    name,
    selectedNoteId,
    noteDragging,
    writingInk,
  );
  const insideRightMat = useInsideNotesMat(
    'right',
    paintedNotes,
    fontsReady,
    name,
    selectedNoteId,
    noteDragging,
    writingInk,
  );

  useEffect(() => () => outsideMat.dispose(), [outsideMat]);
  useEffect(() => () => wellMat.dispose(), [wellMat]);
  useEffect(() => () => foilMat.dispose(), [foilMat]);
  useEffect(() => () => frontTex.dispose(), [frontTex]);
  useEffect(() => () => backTex.dispose(), [backTex]);
  useEffect(() => () => frontDecalMat.dispose(), [frontDecalMat]);
  useEffect(() => () => backDecalMat.dispose(), [backDecalMat]);

  useFrame((_, dt) => {
    const dragging = !!foldDrag.current;
    const target = dragging ? foldDrag.current.t : open ? 1 : REST_OPEN;
    const clampedDt = Math.min(dt, 0.05);
    if (dragging) {
      openT.current = target;
      followX.current = 0;
    } else if (reduceMotion.current) {
      openT.current = target;
      followX.current = 0;
    } else {
      const kOpen = 1 - Math.exp(-CARD_OPEN_STIFFNESS * clampedDt);
      openT.current += (target - openT.current) * kOpen;
      if (Math.abs(target - openT.current) < 0.0008) openT.current = target;

      const want = followPointer && openT.current > 0.9 && !noteDragging.current
        ? pointerX.current
        : 0;
      const kFollow = 1 - Math.exp(-HINGE_FOLLOW_STIFFNESS * clampedDt);
      followX.current += (want - followX.current) * kFollow;
      if (Math.abs(want - followX.current) < 0.0008) followX.current = want;
    }
    const t = openT.current;
    const u = (t - REST_OPEN) / (1 - REST_OPEN);
    const peek = Math.max(0, Math.min(1, u));
    openPeek.current = peek;
    const grow = 1 + (OPEN_GROW - 1) * peek;
    const x = followX.current * peek;
    const theta = -OPEN_ANGLE * t - x * HINGE_FOLLOW_ANGLE;
    const phi = peek * (OPEN_ANGLE / 2 - Math.PI / 2) - x * HINGE_FOLLOW_YAW;
    if (hinge.current) {
      hinge.current.rotation.y = theta;
    }
    if (root.current) {
      const sc = FIT_SCALE * scale * grow;
      const mid = cardFocus(theta, phi);
      root.current.scale.setScalar(sc);
      root.current.rotation.y = phi;
      root.current.position.x = -mid.x * sc;
      root.current.position.z = -mid.z * sc;
    }
    const kPalette = reduceMotion.current ? 1 : 1 - Math.exp(-PALETTE_LERP_STIFFNESS * clampedDt);
    const goal = paletteGoal.current;
    blackMix.current = lerpScalar(blackMix.current, goal.black, kPalette);
    const mix = blackMix.current;
    outsideMat.color.lerp(goal.body, kPalette);
    wellMat.color.lerp(goal.well, kPalette);
    outsideMat.metalness = lerpScalar(outsideMat.metalness, 0, kPalette);
    outsideMat.roughness = lerpScalar(outsideMat.roughness, 0.52 - 0.1 * mix, kPalette);
    outsideMat.clearcoatRoughness = lerpScalar(outsideMat.clearcoatRoughness, 0.5, kPalette);
    outsideMat.reflectivity = lerpScalar(outsideMat.reflectivity, 0.08, kPalette);
    wellMat.metalness = lerpScalar(wellMat.metalness, 0.05 * (1 - mix), kPalette);
    wellMat.clearcoat = lerpScalar(wellMat.clearcoat, 0.18 * (1 - mix), kPalette);
    outsideMat.envMapIntensity = lerpScalar(outsideMat.envMapIntensity, 0.65, kPalette);
    wellMat.envMapIntensity = lerpScalar(wellMat.envMapIntensity, 1.3, kPalette);
    outsideMat.clearcoat = lerpScalar(outsideMat.clearcoat, 0, kPalette);
    lerpFoilMaterial(foilMat, goal.foil, kPalette);
    lerpFoilMaterial(frontDecalMat, goal.foil, kPalette);
    lerpFoilMaterial(backDecalMat, goal.foil, kPalette);
  });

  const faceZ = LEAF_T / 2;
  const insideZ = -LEAF_T / 2;

  const faceProps = {
    rimGeo,
    wellGeo,
    rimMat: foilMat,
    wellMat,
    greetingGeo,
    notesGeo,
    notes: paintedNotes,
    selectedId: selectedNoteId,
    name,
    onSelectNote,
    onNoteChange,
    onRemoveNote,
    draggingRef: noteDragging,
    pageMeshes,
    hoverRef: zoneHoverRef,
    notesRef: liveNotesRef,
    ink: writingInk,
  };

  return (
    <>
      <OpenCardLights amountRef={openPeek} />
      <group
      ref={root}
      scale={FIT_SCALE * scale}
      position={[-REST_FOCUS.x * FIT_SCALE * scale, 0, -REST_FOCUS.z * FIT_SCALE * scale]}
    >
      <group position={[LEAF_W / 2, 0, 0]}>
        <mesh geometry={leafGeo} material={outsideMat} />
        <group position={[0, 0, faceZ]}>
          <CardFace
            {...faceProps}
            inset={false}
            notesMat={insideRightMat}
            page="right"
            interactive={open}
            onPick={onInsidePick}
          />
          <FaceClickCatcher enabled={!open} onActivate={onInsideClick} />
        </group>
        <group position={[0, 0, insideZ]} rotation={[0, Math.PI, 0]}>
          <CardFace
            {...faceProps}
            raised
            greetingGeo={backCoverGeo}
            greetingMat={backDecalMat}
          />
          <FaceClickCatcher enabled={!open} onActivate={onBackClick} />
        </group>
      </group>

      <group ref={hinge} position={[0, 0, LEAF_T / 2]} rotation={[0, -OPEN_ANGLE * REST_OPEN, 0]}>
        <group position={[LEAF_W / 2, 0, LEAF_T / 2]}>
          <mesh geometry={leafGeo} material={outsideMat} />
          <group position={[0, 0, faceZ]}>
            <CardFace {...faceProps} raised greetingMat={frontDecalMat} />
            <FaceClickCatcher enabled={!open} onActivate={onFrontClick} />
          </group>
          <group position={[0, 0, insideZ]} rotation={[0, Math.PI, 0]}>
            <CardFace
              {...faceProps}
              inset={false}
              notesMat={insideLeftMat}
              page="left"
              interactive={open}
              onPick={onInsidePick}
            />
            <FaceClickCatcher enabled={!open} onActivate={onInsideClick} />
          </group>
          <CoverFoldHandle
            enabled={open}
            scale={scale}
            openT={openT}
            foldDrag={foldDrag}
            noteDragging={noteDragging}
            onClose={onClose}
            onGrabStart={onGrabStart}
          />
        </group>
      </group>
    </group>
    </>
  );
}

const MAX_MESSAGE = 140;

export function CardOpenButton({ open, visible, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`rgl-card-toggle${visible ? ' is-visible' : ''}`}
      disabled={disabled}
      aria-pressed={open}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!open) unlockBirthdayJingle();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        if (!open) unlockBirthdayJingle();
        onClick?.();
      }}
    >
      {open ? 'Close' : 'Open'}
    </button>
  );
}

/** Product dismiss chip — Figma Dismiss, top-left of the app window. */
export function CardWindowClose({ disabled, dismissing, onClick }) {
  return (
    <button
      type="button"
      className={`rgl-window-close${dismissing ? ' is-dismissing' : ''}`}
      disabled={disabled}
      aria-label="Dismiss card"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onClick?.();
      }}
    >
      <span className="rgl-window-close-icon" aria-hidden="true" />
    </button>
  );
}

export function CardSignPop({ draft, value, onChange, onSign, onCancel }) {
  const inputRef = useRef(null);
  const aim = Number.isFinite(draft?.x) && Number.isFinite(draft?.y);

  useEffect(() => {
    if (!draft) return undefined;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [draft]);

  return (
    <div
      className={`rgl-face-dock rgl-face-dock-sign${draft ? ' is-on' : ''}${aim ? ' is-aimed' : ''}`}
      aria-hidden={!draft}
      style={
        aim
          ? { '--sign-x': `${draft.x}px`, '--sign-y': `${draft.y}px` }
          : undefined
      }
      onPointerDown={(e) => e.stopPropagation()}
    >
      <form
        className="rgl-face-dock-panel"
        role="dialog"
        aria-modal={draft ? 'true' : undefined}
        aria-labelledby="bday-sign-title"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSign();
        }}
      >
        <p id="bday-sign-title" className="rgl-face-dock-label">
          {draft?.noteId ? 'Edit' : 'Message'}
        </p>
        <textarea
          ref={inputRef}
          className="rgl-face-dock-note"
          value={value}
          maxLength={MAX_MESSAGE}
          rows={3}
          placeholder="Happy birthday…"
          tabIndex={draft ? 0 : -1}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              onCancel();
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              if (value.trim()) onSign();
            }
          }}
        />
        <div className="rgl-face-dock-actions">
          <button
            type="submit"
            className="rgl-face-dock-action is-primary"
            disabled={!draft || !value.trim()}
          >
            {draft?.noteId ? 'Save' : 'Sign'}
          </button>
          <button
            type="button"
            className="rgl-face-dock-action"
            tabIndex={draft ? 0 : -1}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
      <svg className="rgl-face-dock-lead" viewBox="0 0 72 24" aria-hidden="true">
        <line x1="0" y1="12" x2="58" y2="12" />
        <circle cx="64" cy="12" r="3" />
      </svg>
    </div>
  );
}
