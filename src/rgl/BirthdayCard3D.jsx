import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  getFoilMetal,
  getCardFinish,
  resolveCardFinish,
  bodyMaterialProps,
  paletteColorsFor,
  RGL_SUBJECT_SIZE,
} from './materials';
import { useLightRig } from './lightRig';
import { loadPossibilityFont, isPossibilityReady } from '../possibilityFont';
import {
  CARD_OPEN_STIFFNESS,
  CARD_APPEAR_OPEN_STIFFNESS,
  FOLD_COMMIT_T,
  FOLD_FLICK_VT,
  PAGE_COMMIT_T,
  PAGE_FLICK_VT,
  PAGE_LEFT_REST_T,
  PAGE_REST_T,
  PAGE_TURN_STIFFNESS,
  PALETTE_LERP_STIFFNESS,
} from './cardMotion';

const LEAF_W = 0.96;
const LEAF_H = 1.34;
const LEAF_T = 0.004;
const NOTES_W = LEAF_W * 0.92;
const NOTES_H = LEAF_H * 0.92;
const CORNER = 0.036;
/** Cover fold when open — 115°, not 180°. The left leaf stays standing. */
const OPEN_ANGLE = (115 * Math.PI) / 180;
/** No bisector yaw — that squared the tent to the camera and read as a flat book. */
const OPEN_YAW = 0;
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
const OPEN_GROW = 1.16;
const FIT_SCALE = (RGL_SUBJECT_SIZE * 0.7) / LEAF_H;
/** Match RGLStage SUBJECT_TIP so edge projection lands on the cursor. */
const CARD_STAGE_TIP = 0.04;
/** Thin strip on the cover's opening edge — keep it off the inside pages. */
const FOLD_HANDLE_GEO = new THREE.BoxGeometry(0.1, LEAF_H * 0.92, 0.08);
const PAGE_TURN_FULL = new THREE.PlaneGeometry(LEAF_W * 0.96, LEAF_H * 0.94);
const PAGE_TURN_OUTER = new THREE.PlaneGeometry(LEAF_W * 0.62, LEAF_H * 0.94);
const DRAG_ARM_PX = 8;
const _foldEdge = new THREE.Vector3();
const _pageEdge = new THREE.Vector3();

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

function foldPeek(t) {
  return Math.max(0, Math.min(1, (t - REST_OPEN) / (1 - REST_OPEN)));
}

function openPhi(peek) {
  return peek * OPEN_YAW;
}

/** World position of the cover's free edge at open amount `t` (1 = open). */
function coverEdgeWorld(t, scale, out) {
  const peek = foldPeek(t);
  const theta = -OPEN_ANGLE * t;
  const phi = openPhi(peek);
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

/** Free edge of the inner sheet at turn amount `flipT` (0 = right leaf, 1 = cover). */
function pageEdgeWorld(flipT, openT, scale, out) {
  const peek = foldPeek(openT);
  const coverTheta = -OPEN_ANGLE * openT;
  const theta = coverTheta * THREE.MathUtils.clamp(flipT, 0, 1);
  const phi = openPhi(peek);
  const grow = 1 + (OPEN_GROW - 1) * peek;
  const sc = FIT_SCALE * scale * grow;
  const mid = cardFocus(coverTheta, phi);
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

function solvePageFlipT(ndcX, camera, scale, openT) {
  pageEdgeWorld(0, openT, scale, _pageEdge).project(camera);
  const xRight = _pageEdge.x;
  pageEdgeWorld(1, openT, scale, _pageEdge).project(camera);
  const xLeft = _pageEdge.x;
  const span = xRight - xLeft;
  if (Math.abs(span) < 0.08) {
    return THREE.MathUtils.clamp(1 - (ndcX - xLeft) / 0.7, 0, 1);
  }
  const target = THREE.MathUtils.clamp(ndcX, Math.min(xLeft, xRight), Math.max(xLeft, xRight));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    pageEdgeWorld(mid, openT, scale, _pageEdge).project(camera);
    if (span > 0) {
      if (_pageEdge.x < target) hi = mid;
      else lo = mid;
    } else if (_pageEdge.x > target) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
/** Logical inside-page layout — notes, greeting, and hit tests stay in this space. */
const TEX_W = 512;
const TEX_H = 704;
/** Cover art is authored at 512×704, then scaled onto this texture. Inside writing uses the same. */
const FOIL_DRAW_W = 512;
const FOIL_DRAW_H = 704;
const FOIL_W = 1024;
const FOIL_H = 1408;

const ZONE_COLS = 4;
const ZONE_ROWS = 8;
/** Keep handwriting inside its claimed cells — 0.1 let neighbors collide. */
const ZONE_INSET_RATIO = 0.22;
/** Short notes still take a 2×2 block so neighbors don't sit on top of each other. */
const NOTE_MIN_COLS = 2;
const NOTE_MIN_ROWS = 3;

function zoneNoteUv(col, row) {
  return {
    u: (col + 0.08) / ZONE_COLS,
    v: 1 - (row + 0.08) / ZONE_ROWS,
  };
}

function zoneCenterLocal(col, row) {
  return {
    x: ((col + 0.5) / ZONE_COLS - 0.5) * NOTES_W,
    y: (0.5 - (row + 0.5) / ZONE_ROWS) * NOTES_H,
  };
}

function zoneCornerLocals(col, row) {
  const w = NOTES_W / ZONE_COLS;
  const h = NOTES_H / ZONE_ROWS;
  const c = zoneCenterLocal(col, row);
  const hx = w * 0.46;
  const hy = h * 0.46;
  return [
    { x: c.x - hx, y: c.y + hy },
    { x: c.x + hx, y: c.y + hy },
    { x: c.x - hx, y: c.y - hy },
    { x: c.x + hx, y: c.y - hy },
  ];
}

const _projWorld = new THREE.Vector3();
const _projCam = new THREE.Vector3();

function projectMeshPoint(mesh, camera, gl, local) {
  if (!mesh || !camera || !gl) return null;
  camera.updateMatrixWorld();
  _projWorld.set(local.x, local.y, local.z ?? 0);
  mesh.updateWorldMatrix(true, false);
  mesh.localToWorld(_projWorld);
  _projCam.copy(_projWorld).applyMatrix4(camera.matrixWorldInverse);
  const inFront = _projCam.z < 0;
  _projWorld.project(camera);
  const r = gl.domElement.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return {
    clientX: (_projWorld.x * 0.5 + 0.5) * r.width + r.left,
    clientY: (-_projWorld.y * 0.5 + 0.5) * r.height + r.top,
    visible: inFront,
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

function noteSpread(note) {
  const s = note?.spread;
  return Number.isInteger(s) && s > 0 ? s : 0;
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

function reservedSignZoneKeys(spread = 0) {
  return spread === 0 ? new Set(GREETING_ZONE_KEYS) : new Set();
}

function noteZone(note) {
  if (Number.isInteger(note.col) && Number.isInteger(note.row)) {
    return { page: note.page, col: note.col, row: note.row };
  }
  const { col, row } = zoneFromUv(note.u, note.v);
  return { page: note.page, col, row };
}

function occupiedZoneKeys(notes, exceptId, spread = 0) {
  const taken = reservedSignZoneKeys(spread);
  for (const note of notes || []) {
    if (!note || note.id === exceptId || note.id === '__draft') continue;
    if (noteSpread(note) !== spread) continue;
    for (const cell of claimZonesForNote(note, taken)) {
      taken.add(zoneKey(cell.page, cell.col, cell.row));
    }
  }
  return taken;
}

function freeSignCells(notes, spread = 0) {
  const taken = occupiedZoneKeys(notes, null, spread);
  const cells = [];
  for (const page of ['left', 'right']) {
    for (let row = 0; row < ZONE_ROWS; row++) {
      for (let col = 0; col < ZONE_COLS; col++) {
        if (!taken.has(zoneKey(page, col, row))) cells.push({ page, col, row });
      }
    }
  }
  return cells;
}

function neededSpreadCount(notes) {
  let max = 0;
  for (const n of notes || []) {
    if (!n || n.id === '__draft') continue;
    max = Math.max(max, noteSpread(n));
  }
  return Math.max(1, max + 1);
}

export const CARD_SEED_NOTES = [
  { id: 'chelsea', page: 'left', spread: 0, col: 0, row: 0, ...zoneNoteUv(0, 0), rotate: -6, name: 'Chelsea', text: 'Hope it’s a good one — save me a slice.' },
  { id: 'howard', page: 'left', spread: 0, col: 2, row: 3, ...zoneNoteUv(2, 3), rotate: 4, name: 'Howard', text: 'Another trip around the sun.' },
  { id: 'rob', page: 'left', spread: 0, col: 0, row: 6, ...zoneNoteUv(0, 6), rotate: -3, name: 'Rob', text: 'Get after it, Klas.' },
];

export function cardSeedNotesFor(name = 'Klas') {
  const first = String(name || 'Klas').trim() || 'Klas';
  return CARD_SEED_NOTES.map((note) => (
    note.id === 'rob' ? { ...note, text: `Get after it, ${first}.` } : note
  ));
}

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

const CARD_CHARCOAL = '#35353A';
const CARD_CHARCOAL_WELL = '#242428';

/** Card stock pulled from the swatch accent so palette changes survive studio lighting. */
function cardStockColor(theme, paletteId) {
  const { accent, body } = paletteColorsFor(theme, paletteId);
  if (isPureBlack(body)) return new THREE.Color(CARD_CHARCOAL);
  const c = new THREE.Color(accent);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  const lit = theme === 'light'
    ? Math.min(0.82, hsl.l + 0.1)
    : Math.min(0.46, Math.max(0.28, hsl.l * 0.62));
  const sat = Math.min(0.64, hsl.s * (theme === 'light' ? 0.58 : 0.78));
  c.setHSL(hsl.h, sat, lit);
  return c;
}

function wellBodyColor(stock, theme) {
  const c = stock.clone();
  if (isPureBlack(c)) return new THREE.Color(CARD_CHARCOAL_WELL);
  c.offsetHSL(0, theme === 'light' ? 0.02 : 0.06, theme === 'light' ? -0.07 : -0.1);
  return c;
}

function colorLuma(color) {
  const c = color?.isColor ? color : new THREE.Color(color);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/** UI chrome on the inside pages (zone marks). Writing is silver foil. */
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

export function hasOwnMessage(notes) {
  return (notes || []).some((n) => n && isOwnNote(n) && n.id !== '__draft');
}

function markedZoneKeys(notes, spread = 0) {
  const keys = new Set();
  const taken = reservedSignZoneKeys(spread);
  for (const note of notes || []) {
    if (!note || noteSpread(note) !== spread) continue;
    const cells = claimZonesForNote(note, taken);
    for (const cell of cells) {
      taken.add(zoneKey(cell.page, cell.col, cell.row));
      if (isOwnNote(note)) keys.add(zoneKey(cell.page, cell.col, cell.row));
    }
  }
  return keys;
}

function noteOccupyingZone(notes, page, col, row, spread = 0) {
  const taken = reservedSignZoneKeys(spread);
  let found = null;
  for (const note of notes || []) {
    if (!note || noteSpread(note) !== spread) continue;
    const cells = claimZonesForNote(note, taken);
    for (const cell of cells) {
      taken.add(zoneKey(cell.page, cell.col, cell.row));
      if (cell.page === page && cell.col === col && cell.row === row) found = note;
    }
  }
  return found;
}

function ownNoteInZone(notes, page, col, row, spread = 0) {
  const note = noteOccupyingZone(notes, page, col, row, spread);
  if (!note || !isOwnNote(note) || note.id === '__draft') return null;
  return note;
}

let _noteMeasureCtx = null;
function noteMeasureCtx() {
  if (_noteMeasureCtx) return _noteMeasureCtx;
  if (typeof document === 'undefined') return null;
  _noteMeasureCtx = document.createElement('canvas').getContext('2d');
  return _noteMeasureCtx;
}

function measureNoteBlock(ctx, note, wrapW) {
  ctx.font = NOTE_FONT;
  ctx.textBaseline = 'alphabetic';
  const lines = wrapText(ctx, note?.text || '', wrapW);
  const msgMetrics = ctx.measureText('Hg');
  const ascent = Math.ceil(msgMetrics.actualBoundingBoxAscent || NOTE_LINE_H * 0.72);
  let textW = 0;
  for (const line of lines) textW = Math.max(textW, ctx.measureText(line).width);
  ctx.font = NOTE_SIGN_FONT;
  const sign = `— ${note?.name || ''}`;
  const signMetrics = ctx.measureText(sign);
  textW = Math.max(textW, signMetrics.width);
  const signDescent = Math.ceil(signMetrics.actualBoundingBoxDescent || NOTE_SIGN_H * 0.28);
  const blockH = ascent + lines.length * NOTE_LINE_H + 6 + signDescent;
  return { lines, textW, blockH, ascent };
}

function cellsBounds(cells) {
  let minC = Infinity;
  let minR = Infinity;
  let maxC = -Infinity;
  let maxR = -Infinity;
  for (const cell of cells) {
    minC = Math.min(minC, cell.col);
    minR = Math.min(minR, cell.row);
    maxC = Math.max(maxC, cell.col);
    maxR = Math.max(maxR, cell.row);
  }
  return {
    col: minC,
    row: minR,
    colSpan: maxC - minC + 1,
    rowSpan: maxR - minR + 1,
  };
}

function findFreeRect(page, origin, cols, rows, taken) {
  for (let rShift = 0; rShift < rows; rShift++) {
    for (let cShift = 0; cShift < cols; cShift++) {
      const c0 = origin.col - cShift;
      const r0 = origin.row - rShift;
      if (c0 < 0 || r0 < 0 || c0 + cols > ZONE_COLS || r0 + rows > ZONE_ROWS) continue;
      const cells = [];
      let ok = true;
      for (let r = r0; r < r0 + rows && ok; r++) {
        for (let c = c0; c < c0 + cols; c++) {
          if (
            (c !== origin.col || r !== origin.row)
            && taken.has(zoneKey(page, c, r))
          ) {
            ok = false;
            break;
          }
          cells.push({ page, col: c, row: r });
        }
      }
      if (ok) return cells;
    }
  }
  return null;
}

function largestVerticalStrip(page, origin, taken) {
  const cells = [{ page, col: origin.col, row: origin.row }];
  for (let r = origin.row + 1; r < ZONE_ROWS; r++) {
    if (taken.has(zoneKey(page, origin.col, r))) break;
    cells.push({ page, col: origin.col, row: r });
  }
  const up = [];
  for (let r = origin.row - 1; r >= 0; r--) {
    if (taken.has(zoneKey(page, origin.col, r))) break;
    up.unshift({ page, col: origin.col, row: r });
  }
  return up.concat(cells);
}

function claimZonesForNote(note, taken, w = TEX_W, h = TEX_H, ctx = noteMeasureCtx()) {
  const origin = noteZone(note);
  if (
    !ctx
    || !Number.isInteger(origin.col)
    || !Number.isInteger(origin.row)
  ) {
    return [origin];
  }
  const cellW = w / ZONE_COLS;
  const cellH = h / ZONE_ROWS;
  const inset = Math.min(cellW, cellH) * ZONE_INSET_RATIO;
  const page = origin.page;
  const fits = (cols, rows) => {
    const innerW = cellW * cols - inset * 2;
    const innerH = cellH * rows - inset * 2;
    if (innerW < 8 || innerH < 8) return false;
    return measureNoteBlock(ctx, note, innerW).blockH <= innerH;
  };

  let colsNeeded = NOTE_MIN_COLS;
  let rowsNeeded = NOTE_MIN_ROWS;
  while (rowsNeeded < ZONE_ROWS && !fits(colsNeeded, rowsNeeded)) rowsNeeded += 1;
  while (colsNeeded < ZONE_COLS && !fits(colsNeeded, rowsNeeded)) colsNeeded += 1;

  let cells = findFreeRect(page, origin, colsNeeded, rowsNeeded, taken);
  if (cells) return cells;

  rowsNeeded = NOTE_MIN_ROWS;
  while (rowsNeeded < ZONE_ROWS && !fits(1, rowsNeeded)) rowsNeeded += 1;
  cells = findFreeRect(page, origin, 1, rowsNeeded, taken);
  if (cells) return cells;

  for (let cols = 2; cols <= ZONE_COLS; cols++) {
    let rows = NOTE_MIN_ROWS;
    while (rows < ZONE_ROWS && !fits(cols, rows)) rows += 1;
    cells = findFreeRect(page, origin, cols, rows, taken);
    if (cells) return cells;
  }

  const strip = largestVerticalStrip(page, origin, taken);
  if (strip.length <= rowsNeeded) return strip;
  const down = strip.filter((cell) => cell.row >= origin.row);
  if (down.length >= rowsNeeded) return down.slice(0, rowsNeeded);
  const missing = rowsNeeded - down.length;
  const up = strip.filter((cell) => cell.row < origin.row);
  return up.slice(Math.max(0, up.length - missing)).concat(down);
}

function layoutNote(ctx, note, w, h, allNotes) {
  const edge = w * 0.04;
  const z = noteZone(note);
  const pinToZone = Number.isInteger(z.col) && Number.isInteger(z.row);
  const pad = NOTE_BOX_PAD;
  const cellW = w / ZONE_COLS;
  const cellH = h / ZONE_ROWS;
  const inset = Math.min(cellW, cellH) * ZONE_INSET_RATIO;
  let wrapW = w * (0.78 / ZONE_COLS);
  let x;
  let y;
  let angle;
  let clipW = 0;
  let clipH = 0;
  if (pinToZone) {
    const taken = occupiedZoneKeys(allNotes || [], note.id, noteSpread(note));
    const cells = claimZonesForNote(note, taken, w, h, ctx);
    const bounds = cellsBounds(cells);
    wrapW = Math.max(8, cellW * bounds.colSpan - inset * 2);
    clipW = wrapW;
    clipH = Math.max(8, cellH * bounds.rowSpan - inset * 2);
    x = bounds.col * cellW + inset;
    y = bounds.row * cellH + inset;
    angle = 0;
  }
  const measured = measureNoteBlock(ctx, note, wrapW);
  const { lines, textW, ascent } = measured;
  ctx.textBaseline = pinToZone ? 'alphabetic' : 'top';
  const blockH = pinToZone
    ? measured.blockH
    : lines.length * NOTE_LINE_H + NOTE_SIGN_H;
  if (!pinToZone) {
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
    ascent: pinToZone ? ascent : 0,
    pinToZone,
    clipW,
    clipH,
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

function hitOwnNote(ctx, note, u, v, w, h, allNotes) {
  if (!isOwnNote(note)) return null;
  const layout = layoutNote(ctx, note, w, h, allNotes);
  const p = canvasFromUv(u, v, w, h);
  if (layout.pinToZone && layout.clipW > 0 && layout.clipH > 0) {
    if (
      p.x >= layout.x
      && p.x <= layout.x + layout.clipW
      && p.y >= layout.y
      && p.y <= layout.y + layout.clipH
    ) {
      return { kind: 'move' };
    }
    return null;
  }
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

function drawNote(ctx, note, w, h, ink = '#ffffff', selected = false, allNotes) {
  const layout = layoutNote(ctx, note, w, h, allNotes);
  ctx.save();
  if (layout.pinToZone && layout.clipW > 0 && layout.clipH > 0) {
    ctx.beginPath();
    ctx.rect(layout.x, layout.y, layout.clipW, layout.clipH);
    ctx.clip();
  }
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
  { id: 'classic', name: 'Fireworks' },
  { id: 'script', name: 'Stars' },
  { id: 'quiet', name: 'Quiet' },
  { id: 'burst', name: 'Burst' },
  { id: 'sparks', name: 'Sparks' },
  { id: 'balloons', name: 'Balloons' },
  { id: 'cupcakes', name: 'Cupcake' },
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

function foilSprinkle(ctx, x, y, len = 7, tilt = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-len * 0.5, 0);
  ctx.lineTo(len * 0.5, 0);
  ctx.stroke();
  ctx.restore();
}

function foilEngrave(ctx, paint) {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.globalCompositeOperation = 'source-over';
  paint();
  ctx.restore();
}

function foilCupcake(ctx, x, y, s = 1, tilt = 0, top = 'candle') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(s, s);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-24, 12);
  ctx.lineTo(-16, 38);
  ctx.quadraticCurveTo(-14, 47, -6, 48);
  ctx.lineTo(6, 48);
  ctx.quadraticCurveTo(14, 47, 16, 38);
  ctx.lineTo(24, 12);
  ctx.closePath();
  ctx.fill();

  foilEngrave(ctx, () => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-24, 12);
    ctx.lineTo(-16, 38);
    ctx.quadraticCurveTo(-14, 47, -6, 48);
    ctx.lineTo(6, 48);
    ctx.quadraticCurveTo(14, 47, 16, 38);
    ctx.lineTo(24, 12);
    ctx.closePath();
    ctx.clip();
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    for (const t of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(t * 9, 18);
      ctx.lineTo(t * 6.2, 44);
      ctx.stroke();
    }
    ctx.restore();
  });

  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-16 + i * 8, 11, 6.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(-17, 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(17, 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -3, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -18, 10, 0, Math.PI * 2);
  ctx.fill();

  foilEngrave(ctx, () => {
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-13, 1);
    ctx.quadraticCurveTo(-18, -10, -4, -22);
    ctx.stroke();
  });

  if (top === 'candle') {
    ctx.beginPath();
    ctx.moveTo(-4.4, -26);
    ctx.lineTo(-3.8, -41);
    ctx.quadraticCurveTo(0, -45, 3.8, -41);
    ctx.lineTo(4.4, -26);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -43);
    ctx.lineTo(0, -48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.bezierCurveTo(9.5, -57, 8, -47, 0, -45);
    ctx.bezierCurveTo(-8, -47, -9.5, -57, 0, -68);
    ctx.closePath();
    ctx.fill();
    foilEngrave(ctx, () => {
      ctx.beginPath();
      ctx.ellipse(0, -54, 2.8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(3, -34);
    ctx.quadraticCurveTo(11, -44, 7, -56);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -34, 7.4, 0, Math.PI * 2);
    ctx.fill();
    foilEngrave(ctx, () => {
      ctx.beginPath();
      ctx.arc(-2.4, -36, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

function drawCoverCupcakes(ctx, name) {
  foilCupcake(ctx, 256, 138, 1.05, 0, 'candle');
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
    foilCupcake(ctx, 256, 586, 0.7);
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

function makeFoilDecalMaterial(alphaMap, displace = 0, foilProps = getFoilMetal('silver').props) {
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

function foilAlphaMap(mat) {
  return mat?.alphaMap ?? null;
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

  paint(26, `Dear ${name},`, cx, cy - 44, 1.2);
  paint(34, 'Happy Birthday', cx, cy, 1.5);
  paint(24, 'With love, Roam HQ', cx, cy + 56, 1.2);
}

function paintInsidePage(ctx, side, notes, name, selectedId, spread = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(ctx.canvas.width / TEX_W, 0, 0, ctx.canvas.height / TEX_H, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (side === 'right' && spread === 0) {
    paintInsideGreeting(ctx, name || 'Klas', TEX_W, TEX_H);
  }
  notes
    .filter((n) => n.page === side && noteSpread(n) === spread)
    .forEach((note) => {
      drawNote(
        ctx,
        note,
        TEX_W,
        TEX_H,
        '#ffffff',
        note.id === selectedId && isOwnNote(note),
        notes,
      );
    });
}

function drawInsidePage(side, notes, name, selectedId, spread = 0) {
  return makeFoilTexture((ctx) => paintInsidePage(ctx, side, notes, name, selectedId, spread));
}

function pageNotesStamp(notes, side, selectedId, spread = 0) {
  let stamp = `s${spread}|`;
  for (const note of notes) {
    if (note.page !== side || noteSpread(note) !== spread) continue;
    stamp += `${note.id}:${note.col}:${note.row}:${note.u}:${note.v}:${note.rotate}:${note.text}:${note.id === selectedId ? 1 : 0}|`;
  }
  return stamp;
}

function paintPageTexture(mesh, side, notes, name, selectedId, spread = 0) {
  const tex = foilAlphaMap(mesh?.material);
  const ctx = tex?.image?.getContext?.('2d');
  if (!ctx) return;
  paintInsidePage(ctx, side, notes, name, selectedId, spread);
  tex.needsUpdate = true;
}

function useInsideNotesMat(side, notes, fontsReady, name, selectedId, skipPaintRef, foilProps, spread = 0) {
  const mat = useMemo(() => {
    const tex = drawInsidePage(side, [], name, selectedId, spread);
    return makeFoilDecalMaterial(tex, FOIL_DISPLACE, foilProps);
  }, [side, name, foilProps]);
  const stamp = pageNotesStamp(notes, side, selectedId, spread);
  useLayoutEffect(() => {
    if (skipPaintRef?.current) return;
    const tex = foilAlphaMap(mat);
    if (!tex?.image) return;
    const ctx = tex.image.getContext('2d');
    paintInsidePage(ctx, side, notes, name, selectedId, spread);
    tex.needsUpdate = true;
  }, [mat, side, notes, fontsReady, name, selectedId, stamp, skipPaintRef, spread]);
  return mat;
}

function useFlipPageMat(foilProps) {
  const mat = useMemo(() => {
    const tex = drawInsidePage('left', [], 'Klas', null, 1);
    return makeFoilDecalMaterial(tex, FOIL_DISPLACE, foilProps);
  }, [foilProps]);
  const paint = useCallback((side, notes, name, selectedId, spread) => {
    const tex = foilAlphaMap(mat);
    if (!tex?.image) return;
    paintInsidePage(tex.image.getContext('2d'), side, notes, name, selectedId, spread);
    tex.needsUpdate = true;
  }, [mat]);
  useEffect(() => () => mat.dispose(), [mat]);
  return [mat, paint];
}

function makeZoneMarkTexture() {
  const size = 256;
  const radius = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
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

const ZONE_CELL_W = NOTES_W / ZONE_COLS;
const ZONE_CELL_H = NOTES_H / ZONE_ROWS;
const ZONE_DISMISS_SIZE = Math.min(ZONE_CELL_W, ZONE_CELL_H) * 0.28;

function zoneGroupCenter(bounds) {
  return {
    x: ((bounds.col + bounds.colSpan * 0.5) / ZONE_COLS - 0.5) * NOTES_W,
    y: (0.5 - (bounds.row + bounds.rowSpan * 0.5) / ZONE_ROWS) * NOTES_H,
  };
}

function SignZoneOverlay({ page, hoverRef, notesRef, draftRef, active, onRemoveNote, spread = 0 }) {
  const { gl } = useThree();
  const meshes = useRef([]);
  const groupRef = useRef(null);
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
  const map = useMemo(() => makeZoneMarkTexture(), []);
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
    const group = groupRef.current;
    if (!active) {
      for (let i = 0; i < list.length; i++) {
        if (list[i]) list[i].visible = false;
      }
      if (group) group.visible = false;
      if (dismiss) dismiss.visible = false;
      pinned.current = null;
      return;
    }
    const hover = hoverRef.current;
    const notes = notesRef.current || [];
    const draft = draftRef?.current;
    const taken = occupiedZoneKeys(notes, null, spread);
    const marked = markedZoneKeys(notes, spread);
    const canSign = !hasOwnMessage(notes);
    const draftZone =
      canSign
      && draft
      && !draft.noteId
      && draft.page === page
      && (draft.spread ?? 0) === spread
        ? draft
        : null;
    const hoveredOwn =
      hover?.page === page
        ? ownNoteInZone(notes, page, hover.col, hover.row, spread)
        : null;
    if (hoveredOwn) {
      const origin = noteZone(hoveredOwn);
      pinned.current = { col: origin.col, row: origin.row, id: hoveredOwn.id };
    }
    const draftKeys = new Set();
    let draftCells = [];
    if (draftZone) {
      const draftNote = notes.find(
        (n) => n.id === '__draft' && n.page === page && noteSpread(n) === spread,
      );
      if (draftNote) {
        draftCells = claimZonesForNote(draftNote, taken).filter((cell) => cell.page === page);
        for (const cell of draftCells) {
          draftKeys.add(zoneKey(cell.page, cell.col, cell.row));
        }
      } else {
        draftCells = [{ page, col: draftZone.col, row: draftZone.row }];
        draftKeys.add(zoneKey(page, draftZone.col, draftZone.row));
      }
    }
    let groupCells = draftCells.length > 1 ? draftCells : [];
    if (!groupCells.length) {
      const own = notes.find(
        (n) => n && isOwnNote(n) && n.id !== '__draft' && noteSpread(n) === spread,
      );
      if (own) {
        const free = occupiedZoneKeys(notes, own.id, spread);
        groupCells = claimZonesForNote(own, free).filter((cell) => cell.page === page);
      }
    }
    const grouped = groupCells.length > 1;
    const groupedKeys = new Set(
      grouped ? groupCells.map((cell) => zoneKey(cell.page, cell.col, cell.row)) : [],
    );
    if (group) {
      if (grouped) {
        const bounds = cellsBounds(groupCells);
        const mid = zoneGroupCenter(bounds);
        group.visible = true;
        group.position.set(mid.x, mid.y, 0.0015);
        group.scale.set(bounds.colSpan, bounds.rowSpan, 1);
      } else {
        group.visible = false;
        group.scale.set(1, 1, 1);
      }
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
          && !taken.has(key)
          && !draftKeys.has(key);
        const drafting = draftKeys.has(key) && !groupedKeys.has(key);
        const show = hovering || drafting || (marked.has(key) && !groupedKeys.has(key));
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
    const groupBounds = grouped ? cellsBounds(groupCells) : null;
    const dismissCol = groupBounds ? groupBounds.col + groupBounds.colSpan - 1 : pin.col;
    const dismissRow = groupBounds ? groupBounds.row : pin.row;
    dismiss.visible = true;
    dismiss.position.set(
      ((dismissCol + 0.5) / ZONE_COLS - 0.5) * NOTES_W + ZONE_CELL_W / 2 - ZONE_DISMISS_SIZE * 0.62,
      (0.5 - (dismissRow + 0.5) / ZONE_ROWS) * NOTES_H + ZONE_CELL_H / 2 - ZONE_DISMISS_SIZE * 0.62,
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
        ref={groupRef}
        geometry={geo}
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
      </mesh>
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
  draftRef,
  ink,
  spread = 0,
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
            spread={spread}
          />
          {interactive && (
            <SignZoneOverlay
              page={page}
              hoverRef={hoverRef}
              notesRef={notesRef}
              draftRef={draftRef}
              active={interactive}
              onRemoveNote={onRemoveNote}
              spread={spread}
            />
          )}
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
  spread = 0,
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
    spread,
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
    const all = fns.current.notesRef?.current || fns.current.notes;
    const own = all.filter((n) => n.page === page && isOwnNote(n));
    for (let i = own.length - 1; i >= 0; i--) {
      const hit = hitOwnNote(ctx, own[i], u, v, TEX_W, TEX_H, all);
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
    if (!session.armed) {
      const dist = Math.hypot(e.clientX - session.x, e.clientY - session.y);
      if (dist < DRAG_ARM_PX) return;
      session.armed = true;
    }
    if (draggingRef) draggingRef.current = true;
    const hit = hitFromClient(e.clientX, e.clientY);
    if (!hit) return;
    const { col, row } = zoneFromUv(hit.u, hit.v);
    const taken = occupiedZoneKeys(
      fns.current.notesRef?.current || fns.current.notes,
      session.id,
      fns.current.spread,
    );
    if (taken.has(zoneKey(hit.page, col, row))) return;
    const uv = zoneNoteUv(col, row);
    const patch = { page: hit.page, col, row, u: uv.u, v: uv.v, spread: fns.current.spread };
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
        const spread = fns.current.spread;
        pages.forEach((side) => {
          paintPageTexture(meshes[side], side, notesNow, cardName, selectedId, spread);
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
    window.removeEventListener('pointermove', onWinMove, true);
    window.removeEventListener('pointerup', onWinUp, true);
    window.removeEventListener('pointercancel', onWinUp, true);
  }).current;

  const onPointerDown = (e) => {
    if (!interactive) return;
    down.current = { x: e.clientX, y: e.clientY };
    if (!e.uv) return;
    const hit = hitAtUv(e.uv.x, e.uv.y);
    if (!hit) {
      drag.current = null;
      if (draggingRef) draggingRef.current = false;
      return;
    }
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    fns.current.onSelectNote?.(hit.note.id);
    drag.current = {
      id: hit.note.id,
      kind: 'move',
      note: hit.note,
      page: hit.note.page,
      x: e.clientX,
      y: e.clientY,
      armed: false,
    };
    setCursor('grabbing');
    window.addEventListener('pointermove', onWinMove, true);
    window.addEventListener('pointerup', onWinUp, true);
    window.addEventListener('pointercancel', onWinUp, true);
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
    const spreadNow = fns.current.spread;
    if (ownNoteInZone(notesNow, page, col, row, spreadNow)) {
      setCursor('move');
      return;
    }
    if (hasOwnMessage(notesNow)) {
      setCursor(null);
      return;
    }
    const taken = occupiedZoneKeys(notesNow, null, spreadNow);
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
    const spreadNow = fns.current.spread;
    const occupant = noteOccupyingZone(notesNow, page, col, row, spreadNow);
    const ownHit = hitAtUv(e.uv.x, e.uv.y)?.note
      || (occupant && isOwnNote(occupant) && occupant.id !== '__draft' ? occupant : null);
    const pickCol = ownHit?.col ?? col;
    const pickRow = ownHit?.row ?? row;
    const pickPage = ownHit?.page || page;
    const pickSpread = ownHit ? noteSpread(ownHit) : spreadNow;
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
        spread: pickSpread,
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
    if (occupant?.id === '__draft') {
      const z = noteZone(occupant);
      const uv = zoneNoteUv(z.col, z.row);
      const draftAnchor = projectZoneTopLeft(mesh.current, camera, gl, z.col, z.row)
        || { clientX: e.clientX, clientY: e.clientY };
      onPick?.({
        page: z.page,
        spread: noteSpread(occupant),
        col: z.col,
        row: z.row,
        u: occupant.u ?? uv.u,
        v: occupant.v ?? uv.v,
        clientX: draftAnchor.clientX,
        clientY: draftAnchor.clientY,
        text: occupant.text,
      });
      return;
    }
    if (hasOwnMessage(notesNow) || occupiedZoneKeys(notesNow, null, spreadNow).has(zoneKey(page, col, row))) {
      onSelectNote?.(null);
      return;
    }
    onSelectNote?.(null);
    const uv = zoneNoteUv(col, row);
    onPick?.({
      page,
      spread: spreadNow,
      col,
      row,
      u: uv.u,
      v: uv.v,
      clientX: anchor.clientX,
      clientY: anchor.clientY,
    });
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', onWinMove, true);
    window.removeEventListener('pointerup', onWinUp, true);
    window.removeEventListener('pointercancel', onWinUp, true);
    if (draggingRef) draggingRef.current = false;
  }, [onWinMove, onWinUp, draggingRef]);

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
      setStageCursor(gl, 'default');
    },
    [gl],
  );

  if (!enabled || !onActivate) return null;

  return (
    <mesh
      position={[0, 0, 0.03]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setStageCursor(gl, 'grab');
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setStageCursor(gl, 'default');
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
  pageDrag,
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
      foldDrag.current = null;
      setStageCursor(gl, 'pointer');
    },
    [gl, foldDrag],
  );

  useEffect(() => {
    if (enabled) return undefined;
    unbind.current?.();
    unbind.current = null;
    foldDrag.current = null;
    return undefined;
  }, [enabled, foldDrag]);

  if (!enabled) return null;

  const onPointerDown = (e) => {
    if (noteDragging?.current || pageDrag?.current) return;
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    const startX = e.clientX;
    const startY = e.clientY;
    const startT = openT.current;
    let armed = false;

    const onMove = (ev) => {
      if (!armed) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_ARM_PX) return;
        armed = true;
        onGrabStart?.();
        foldDrag.current = {
          t: startT,
          lastT: startT,
          lastAt: performance.now(),
          vt: 0,
        };
        setStageCursor(gl, 'grabbing');
      }
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
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
      const drag = foldDrag.current;
      foldDrag.current = null;
      if (!drag) {
        setStageCursor(gl, hovering.current ? 'grab' : 'pointer');
        return;
      }
      const tNow = drag.t ?? openT.current;
      const flickClose = (drag.vt ?? 0) < -FOLD_FLICK_VT;
      const commit = tNow <= FOLD_COMMIT_T || flickClose;
      setStageCursor(gl, hovering.current && !commit ? 'grab' : 'pointer');
      if (commit) onClose?.();
    };
    unbind.current?.();
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
    unbind.current = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
    };
  };

  return (
    <mesh
      geometry={FOLD_HANDLE_GEO}
      position={[LEAF_W / 2 + 0.04, 0, 0]}
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

function PageFlickHandle({
  enabled,
  dir,
  area = 'outer',
  scale,
  openT,
  flipT,
  pageDrag,
  foldDrag,
  noteDragging,
  flipRef,
  onGrabStart,
  onDown,
  onTap,
  onRelease,
}) {
  const { gl, camera } = useThree();
  const hovering = useRef(false);
  const unbind = useRef(null);

  useEffect(
    () => () => {
      unbind.current?.();
      unbind.current = null;
    },
    [],
  );

  if (!enabled || !dir) return null;

  const onPointerDown = (e) => {
    if (noteDragging?.current || foldDrag?.current || pageDrag.current) return;
    if (flipRef?.current?.goal != null) return;
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    onDown?.();
    const startX = e.clientX;
    const startY = e.clientY;
    const startT = flipT.current;
    let armed = false;

    const onMove = (ev) => {
      if (!armed) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_ARM_PX) return;
        armed = true;
        onGrabStart?.();
        pageDrag.current = {
          dir,
          t: startT,
          lastT: startT,
          lastAt: performance.now(),
          vt: 0,
        };
        setStageCursor(gl, 'grabbing');
      }
      if (!pageDrag.current) return;
      let next = solvePageFlipT(ndcXFromEvent(ev, gl.domElement), camera, scale, openT.current);
      if (dir > 0) next = Math.min(next, PAGE_LEFT_REST_T);
      const now = performance.now();
      const dt = Math.max(0.008, (now - pageDrag.current.lastAt) / 1000);
      pageDrag.current.vt = (next - pageDrag.current.lastT) / dt;
      pageDrag.current.lastT = next;
      pageDrag.current.lastAt = now;
      pageDrag.current.t = next;
    };
    const onUp = () => {
      unbind.current = null;
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
      const drag = pageDrag.current;
      pageDrag.current = null;
      setStageCursor(gl, hovering.current ? 'grab' : 'pointer');
      if (!armed) {
        onTap?.();
        return;
      }
      if (!drag) return;
      onRelease?.(drag);
    };
    unbind.current?.();
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onUp, true);
    unbind.current = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onUp, true);
    };
  };

  const full = area === 'full';
  const geo = full ? PAGE_TURN_FULL : PAGE_TURN_OUTER;
  const x = full ? 0 : LEAF_W * 0.18;

  return (
    <mesh
      geometry={geo}
      position={[x, 0, 0.02]}
      renderOrder={20}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovering.current = true;
        if (!pageDrag.current) setStageCursor(gl, 'grab');
      }}
      onPointerOut={() => {
        hovering.current = false;
        if (!pageDrag.current) setStageCursor(gl, 'pointer');
      }}
    >
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
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
  name = 'Klas',
  notes = CARD_SEED_NOTES,
  draft = null,
  theme = 'dark',
  paletteId = 'crimson',
  finishId = 'paper',
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
  onInsideClick,
  onPagesChange,
  pageTurnRef,
  zoneAimRef,
  appearOpenKey = 0,
}) {
  const reduceMotion = usePrefersReducedMotion();
  const openT = useRef(open ? 1 : REST_OPEN);
  const hinge = useRef(null);
  const root = useRef(null);
  const noteDragging = useRef(false);
  const foldDrag = useRef(null);
  const pageDrag = useRef(null);
  const pageMeshes = useRef({ left: null, right: null });
  const zoneHoverRef = useRef(null);
  const liveNotesRef = useRef(CARD_SEED_NOTES);
  const draftRef = useRef(draft);
  const autoPickedOpen = useRef(false);
  const slowAppearOpen = useRef(true);
  const flipHinge = useRef(null);
  const stackHinge = useRef(null);
  const flipT = useRef(0);
  const settledSpread = useRef(0);
  const openPeek = useRef(open ? 1 : 0);
  const { gl, camera } = useThree();
  draftRef.current = draft;
  const colors = paletteColorsFor(theme, paletteId);
  const paperColor = cardStockColor(theme, paletteId);
  const wellColor = wellBodyColor(paperColor, theme);
  const pureBlack = isPureBlack(colors.body);
  const foilMetal = getFoilMetal('silver');
  const foilInk = foilMetal.ink;
  const writingInk = insideWritingInk(paperColor, foilInk);
  const cardFinish = getCardFinish(finishId);
  const paletteGoal = useRef({
    body: paperColor,
    well: wellColor,
    black: pureBlack ? 1 : 0,
    foil: foilMetal.props,
    finish: resolveCardFinish(cardFinish, pureBlack ? 1 : 0),
  });
  paletteGoal.current = {
    body: paperColor,
    well: wellColor,
    black: pureBlack ? 1 : 0,
    foil: foilMetal.props,
    finish: resolveCardFinish(cardFinish, pureBlack ? 1 : 0),
  };
  const blackMix = useRef(pureBlack ? 1 : 0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    slowAppearOpen.current = true;
  }, [appearOpenKey]);

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

  const geos = getCardGeos();
  const leafGeo = geos.leaf;
  const rimGeo = geos.rim;
  const wellGeo = geos.well;
  const greetingGeo = geos.greeting;
  const notesGeo = geos.notes;
  const backCoverGeo = geos.backCover;

  const startFinish = resolveCardFinish(cardFinish, pureBlack ? 1 : 0);
  const outsideMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...bodyMaterialProps,
        color: paperColor.clone(),
        ...startFinish.outside,
        side: THREE.DoubleSide,
      }),
    [theme],
  );
  const wellMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...bodyMaterialProps,
        color: wellColor.clone(),
        ...startFinish.well,
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
        spread: draft.spread ?? 0,
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

  const spreadCount = useMemo(() => neededSpreadCount(paintedNotes), [paintedNotes]);
  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState(null);
  const spreadRef = useRef(0);
  const flipRef = useRef(null);
  spreadRef.current = spread;
  flipRef.current = flip;
  const hasNext = spread < spreadCount - 1;
  const hasPrev = spread > 0;
  const showInsert = open && (hasNext || !!flip);
  const showStack = open && hasPrev && !flip;

  useEffect(() => {
    setSpread((s) => Math.min(s, Math.max(0, spreadCount - 1)));
  }, [spreadCount]);

  useLayoutEffect(() => {
    if (!noteDragging.current) liveNotesRef.current = paintedNotes;
  }, [paintedNotes]);

  const leftSpread = flip?.dir < 0 ? flip.to : spread;
  const rightSpread = flip?.dir < 0 ? flip.from : hasNext ? spread + 1 : spread;
  const flipFrontSpread = flip?.dir < 0 ? flip.to : spread;
  const flipBackSpread = flip?.dir < 0 ? flip.from : spread + 1;

  const coverLeftMat = useInsideNotesMat(
    'left',
    paintedNotes,
    fontsReady,
    name,
    selectedNoteId,
    noteDragging,
    foilMetal.props,
    0,
  );
  const insideLeftMat = useInsideNotesMat(
    'left',
    paintedNotes,
    fontsReady,
    name,
    selectedNoteId,
    noteDragging,
    foilMetal.props,
    leftSpread,
  );
  const insideRightMat = useInsideNotesMat(
    'right',
    paintedNotes,
    fontsReady,
    name,
    selectedNoteId,
    noteDragging,
    foilMetal.props,
    rightSpread,
  );
  const [flipFrontMat, paintFlipFront] = useFlipPageMat(foilMetal.props);
  const [flipBackMat, paintFlipBack] = useFlipPageMat(foilMetal.props);

  useLayoutEffect(() => {
    if (!showInsert) return;
    paintFlipFront('right', paintedNotes, name, selectedNoteId, flipFrontSpread);
    paintFlipBack('left', paintedNotes, name, selectedNoteId, flipBackSpread);
  }, [
    showInsert,
    flipFrontSpread,
    flipBackSpread,
    paintedNotes,
    name,
    selectedNoteId,
    paintFlipFront,
    paintFlipBack,
  ]);

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
      slowAppearOpen.current = false;
    } else if (reduceMotion.current) {
      openT.current = target;
      if (open) slowAppearOpen.current = false;
    } else {
      const opening = open && target > openT.current + 0.0008;
      const stiffness = slowAppearOpen.current && opening
        ? CARD_APPEAR_OPEN_STIFFNESS
        : CARD_OPEN_STIFFNESS;
      const kOpen = 1 - Math.exp(-stiffness * clampedDt);
      openT.current += (target - openT.current) * kOpen;
      if (Math.abs(target - openT.current) < 0.0008) {
        openT.current = target;
        if (open) slowAppearOpen.current = false;
      }
    }
    const t = openT.current;
    const peek = foldPeek(t);
    openPeek.current = peek;
    const grow = 1 + (OPEN_GROW - 1) * peek;
    const theta = -OPEN_ANGLE * t;
    const phi = openPhi(peek);
    if (hinge.current) {
      hinge.current.rotation.y = theta;
    }
    const restT = open && hasNext && !flipRef.current ? PAGE_REST_T : 0;
    if (pageDrag.current) {
      flipT.current = pageDrag.current.t;
    } else if (flipRef.current?.goal != null) {
      const turning = flipRef.current;
      const goal = turning.goal;
      if (reduceMotion.current) {
        flipT.current = goal;
      } else {
        const kFlip = 1 - Math.exp(-PAGE_TURN_STIFFNESS * clampedDt);
        flipT.current += (goal - flipT.current) * kFlip;
        if (Math.abs(goal - flipT.current) < 0.002) flipT.current = goal;
      }
      if (flipT.current === goal) {
        const committed = (turning.dir > 0 && goal === PAGE_LEFT_REST_T) || (turning.dir < 0 && goal === 0);
        if (committed) {
          settledSpread.current = turning.to;
          setSpread(turning.to);
        }
        flipT.current = committed ? 0 : restT;
        flipRef.current = null;
        setFlip(null);
      }
    } else if (reduceMotion.current) {
      flipT.current = restT;
    } else {
      const kFlip = 1 - Math.exp(-PAGE_TURN_STIFFNESS * clampedDt);
      flipT.current += (restT - flipT.current) * kFlip;
      if (Math.abs(restT - flipT.current) < 0.002) flipT.current = restT;
    }
    if (flipHinge.current && (showInsert || pageDrag.current)) {
      flipHinge.current.rotation.y = theta * flipT.current;
    }
    if (stackHinge.current) {
      stackHinge.current.rotation.y = theta * PAGE_LEFT_REST_T;
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
    outsideMat.color.lerp(goal.body, kPalette);
    wellMat.color.lerp(goal.well, kPalette);
    const outside = goal.finish.outside;
    const well = goal.finish.well;
    outsideMat.metalness = lerpScalar(outsideMat.metalness, outside.metalness, kPalette);
    outsideMat.roughness = lerpScalar(outsideMat.roughness, outside.roughness, kPalette);
    outsideMat.clearcoat = lerpScalar(outsideMat.clearcoat, outside.clearcoat, kPalette);
    outsideMat.clearcoatRoughness = lerpScalar(outsideMat.clearcoatRoughness, outside.clearcoatRoughness, kPalette);
    outsideMat.reflectivity = lerpScalar(outsideMat.reflectivity, outside.reflectivity, kPalette);
    outsideMat.envMapIntensity = lerpScalar(outsideMat.envMapIntensity, outside.envMapIntensity, kPalette);
    wellMat.metalness = lerpScalar(wellMat.metalness, well.metalness, kPalette);
    wellMat.roughness = lerpScalar(wellMat.roughness, well.roughness, kPalette);
    wellMat.clearcoat = lerpScalar(wellMat.clearcoat, well.clearcoat, kPalette);
    wellMat.clearcoatRoughness = lerpScalar(wellMat.clearcoatRoughness, well.clearcoatRoughness, kPalette);
    wellMat.envMapIntensity = lerpScalar(wellMat.envMapIntensity, well.envMapIntensity, kPalette);
    lerpFoilMaterial(foilMat, goal.foil, kPalette);
    lerpFoilMaterial(frontDecalMat, goal.foil, kPalette);
    lerpFoilMaterial(backDecalMat, goal.foil, kPalette);
    lerpFoilMaterial(insideLeftMat, goal.foil, kPalette);
    lerpFoilMaterial(coverLeftMat, goal.foil, kPalette);
    lerpFoilMaterial(insideRightMat, goal.foil, kPalette);
    lerpFoilMaterial(flipFrontMat, goal.foil, kPalette);
    lerpFoilMaterial(flipBackMat, goal.foil, kPalette);

    if (!open) {
      autoPickedOpen.current = false;
    } else if (
      !autoPickedOpen.current
      && !draft
      && !flip
      && !pageDrag.current
      && !hasNext
      && peek >= 0.96
      && !hasOwnMessage(notes)
    ) {
      const cells = freeSignCells(notes, spread);
      const cell = cells.length ? cells[(Math.random() * cells.length) | 0] : null;
      const mesh = cell ? pageMeshes.current[cell.page] : null;
      const anchor = mesh ? projectZoneTopLeft(mesh, camera, gl, cell.col, cell.row) : null;
      if (cell && anchor) {
        autoPickedOpen.current = true;
        zoneHoverRef.current = { page: cell.page, col: cell.col, row: cell.row };
        const uv = zoneNoteUv(cell.col, cell.row);
        const center = projectMeshPoint(mesh, camera, gl, zoneCenterLocal(cell.col, cell.row));
        if (zoneAimRef) zoneAimRef.current = center || anchor;
        const hit = {
          page: cell.page,
          spread,
          col: cell.col,
          row: cell.row,
          u: uv.u,
          v: uv.v,
          clientX: anchor.clientX,
          clientY: anchor.clientY,
          auto: true,
        };
        queueMicrotask(() => onInsidePick?.(hit));
      } else if (!cells.length || hasOwnMessage(notes)) {
        autoPickedOpen.current = true;
      }
    } else if (open && (draft || hasOwnMessage(notes))) {
      autoPickedOpen.current = true;
    }

    if (zoneAimRef) {
      const d = draftRef.current;
      if (
        d
        && (d.page === 'left' || d.page === 'right')
        && Number.isInteger(d.col)
        && Number.isInteger(d.row)
      ) {
        const mesh = pageMeshes.current[d.page];
        zoneAimRef.current = mesh
          ? projectMeshPoint(mesh, camera, gl, zoneCenterLocal(d.col, d.row))
          : null;
      } else {
        zoneAimRef.current = null;
      }
    }
  });

  const faceZ = LEAF_T / 2;
  const insideZ = -LEAF_T / 2;

  const turnForward = useCallback(() => {
    const s = spreadRef.current;
    if (s >= spreadCount - 1 || flipRef.current?.goal != null) return;
    const next = { from: s, to: s + 1, dir: 1, goal: PAGE_LEFT_REST_T };
    flipRef.current = next;
    setFlip(next);
  }, [spreadCount]);

  const turnBack = useCallback(() => {
    const s = spreadRef.current;
    if (s <= 0 || flipRef.current?.goal != null) return;
    flipT.current = PAGE_LEFT_REST_T;
    const next = { from: s, to: s - 1, dir: -1, goal: 0 };
    flipRef.current = next;
    setFlip(next);
  }, []);

  const readyBackTurn = useCallback(() => {
    const s = spreadRef.current;
    if (s <= 0) return;
    flipT.current = PAGE_LEFT_REST_T;
    const next = { from: s, to: s - 1, dir: -1, goal: null };
    flipRef.current = next;
    setFlip(next);
  }, []);

  const releasePage = useCallback((drag) => {
    const s = spreadRef.current;
    const vt = drag.vt ?? 0;
    const tNow = drag.t ?? flipT.current;
    if (drag.dir > 0) {
      if (s >= spreadCount - 1) return;
      const commit = tNow >= PAGE_COMMIT_T || vt > PAGE_FLICK_VT;
      if (!commit) return;
      const next = { from: s, to: s + 1, dir: 1, goal: PAGE_LEFT_REST_T };
      flipRef.current = next;
      setFlip(next);
      return;
    }
    if (s <= 0) return;
    const commit = tNow <= 1 - PAGE_COMMIT_T || vt < -PAGE_FLICK_VT;
    const next = { from: s, to: s - 1, dir: -1, goal: commit ? 0 : PAGE_LEFT_REST_T };
    flipRef.current = next;
    setFlip(next);
  }, [spreadCount]);

  useEffect(() => {
    onPagesChange?.({ spread, count: spreadCount });
  }, [spread, spreadCount, onPagesChange]);

  if (pageTurnRef) {
    pageTurnRef.current = { next: turnForward, prev: turnBack };
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        turnForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        turnBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, turnForward, turnBack]);

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
    draftRef,
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
            spread={rightSpread}
            interactive={open && !flip && !hasNext}
            pageMeshes={hasNext ? undefined : pageMeshes}
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
          <FaceClickCatcher enabled={!open} onActivate={onInsideClick} />
        </group>
        <PageFlickHandle
          enabled={open && hasNext}
          dir={1}
          area="full"
          scale={scale}
          openT={openT}
          flipT={flipT}
          pageDrag={pageDrag}
          foldDrag={foldDrag}
          noteDragging={noteDragging}
          flipRef={flipRef}
          onGrabStart={onGrabStart}
          onTap={turnForward}
          onRelease={releasePage}
        />
      </group>

      <group ref={stackHinge} position={[0, 0, LEAF_T / 2]} visible={showStack} renderOrder={3}>
        <group position={[LEAF_W / 2, 0, LEAF_T / 2]}>
          <mesh geometry={leafGeo} material={outsideMat} raycast={() => {}} />
          <group position={[0, 0, insideZ - 0.0008]} rotation={[0, Math.PI, 0]}>
            <CardFace
              {...faceProps}
              inset={false}
              notesMat={insideLeftMat}
              page="left"
              spread={spread}
              interactive={open && !flip}
              pageMeshes={pageMeshes}
              onPick={onInsidePick}
            />
            <PageFlickHandle
              enabled={open && hasPrev}
              dir={-1}
              area="outer"
              scale={scale}
              openT={openT}
              flipT={flipT}
              pageDrag={pageDrag}
              foldDrag={foldDrag}
              noteDragging={noteDragging}
              flipRef={flipRef}
              onGrabStart={onGrabStart}
              onDown={readyBackTurn}
              onTap={turnBack}
              onRelease={releasePage}
            />
          </group>
        </group>
      </group>

      <group ref={flipHinge} position={[0, 0, LEAF_T / 2]} visible={showInsert} renderOrder={4}>
        <group position={[LEAF_W / 2, 0, LEAF_T / 2]}>
          <mesh geometry={leafGeo} material={outsideMat} raycast={() => {}} />
          <group position={[0, 0, faceZ + 0.0008]}>
            <CardFace
              {...faceProps}
              inset={false}
              notesMat={flipFrontMat}
              page="right"
              spread={flipFrontSpread}
              interactive={open && !flip && hasNext}
              pageMeshes={hasNext ? pageMeshes : undefined}
              onPick={onInsidePick}
            />
          </group>
          <mesh
            geometry={notesGeo}
            material={flipBackMat}
            position={[0, 0, insideZ - 0.0008]}
            rotation={[0, Math.PI, 0]}
            raycast={() => {}}
          />
          <PageFlickHandle
            enabled={open && hasNext}
            dir={1}
            area="outer"
            scale={scale}
            openT={openT}
            flipT={flipT}
            pageDrag={pageDrag}
            foldDrag={foldDrag}
            noteDragging={noteDragging}
            flipRef={flipRef}
            onGrabStart={onGrabStart}
            onTap={turnForward}
            onRelease={releasePage}
          />
        </group>
      </group>

      <group ref={hinge} position={[0, 0, LEAF_T / 2]} rotation={[0, -OPEN_ANGLE * REST_OPEN, 0]}>
        <group position={[LEAF_W / 2, 0, LEAF_T / 2]}>
          <mesh geometry={leafGeo} material={outsideMat} />
          <group position={[0, 0, faceZ]}>
            <CardFace {...faceProps} raised greetingMat={frontDecalMat} />
            <FaceClickCatcher enabled={!open} onActivate={onInsideClick} />
          </group>
          <group position={[0, 0, insideZ]} rotation={[0, Math.PI, 0]}>
            <CardFace
              {...faceProps}
              inset={false}
              notesMat={coverLeftMat}
              page="left"
              spread={0}
              interactive={open && !flip && !hasPrev}
              pageMeshes={hasPrev ? undefined : pageMeshes}
              onPick={onInsidePick}
            />
            <FaceClickCatcher enabled={!open} onActivate={onInsideClick} />
          </group>
          <CoverFoldHandle
            enabled={open}
            scale={scale}
            openT={openT}
            foldDrag={foldDrag}
            pageDrag={pageDrag}
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

function PageNavChevron({ dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d={dir < 0 ? 'M8.5 2.5L4 7l4.5 4.5' : 'M5.5 2.5L10 7 5.5 11.5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CardPageNav({ visible, hasPrev, hasNext, onPrev, onNext }) {
  return (
    <>
      <button
        type="button"
        className={`rgl-page-nav rgl-page-nav-prev${visible && hasPrev ? ' is-visible' : ''}`}
        disabled={!visible || !hasPrev}
        aria-label="Previous page"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (!hasPrev) return;
          onPrev?.();
        }}
      >
        <PageNavChevron dir={-1} />
      </button>
      <button
        type="button"
        className={`rgl-page-nav rgl-page-nav-next${visible && hasNext ? ' is-visible' : ''}`}
        disabled={!visible || !hasNext}
        aria-label="Next page"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (!hasNext) return;
          onNext?.();
        }}
      >
        <PageNavChevron dir={1} />
      </button>
    </>
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

const DOCK_FADE_MS = 180;

export function useDockFade(open) {
  const [exiting, setExiting] = useState(false);
  const prev = useRef(open);

  if (open !== prev.current) {
    prev.current = open;
    if (open) {
      if (exiting) setExiting(false);
    } else if (!exiting) {
      setExiting(true);
    }
  }

  useEffect(() => {
    if (open || !exiting) return undefined;
    const t = window.setTimeout(() => setExiting(false), DOCK_FADE_MS);
    return () => window.clearTimeout(t);
  }, [open, exiting]);

  return exiting;
}

export function CardSignPop({ draft, value, onChange, onSign, onCancel, aimRef }) {
  const inputRef = useRef(null);
  const dockRef = useRef(null);
  const panelRef = useRef(null);
  const svgRef = useRef(null);
  const lineRef = useRef(null);
  const dotRef = useRef(null);
  const lastDraft = useRef(draft);
  const aimedRef = useRef(false);
  const [aimed, setAimed] = useState(false);
  const open = Boolean(draft);
  const exiting = useDockFade(open);
  if (draft) lastDraft.current = draft;
  const pin = lastDraft.current;
  const present = open || exiting;

  useEffect(() => {
    if (!draft) return undefined;
    const t = window.setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }, 40);
    return () => window.clearTimeout(t);
  }, [draft]);

  useLayoutEffect(() => {
    if (!present) {
      aimedRef.current = false;
      setAimed(false);
      return undefined;
    }
    let raf = 0;
    const tick = () => {
      const svg = svgRef.current;
      const line = lineRef.current;
      const dot = dotRef.current;
      const dock = dockRef.current;
      const panel = panelRef.current;
      const aim = aimRef?.current;
      if (
        svg
        && line
        && dot
        && dock
        && panel
        && aim
        && Number.isFinite(aim.clientX)
        && Number.isFinite(aim.clientY)
      ) {
        const sr = svg.getBoundingClientRect();
        const w = Math.max(1, sr.width);
        const h = Math.max(1, sr.height);
        const y = aim.clientY - sr.top;
        const x2 = aim.clientX - sr.left;
        const panelW = panel.getBoundingClientRect().width;
        const panelH = panel.getBoundingClientRect().height;
        const pad = 16;
        const gap = 96;
        const top = Math.max(pad, Math.min(y - panelH / 2, h - panelH - pad));
        dock.style.top = `${top}px`;
        const rightEdge = Math.max(pad + panelW, Math.min(x2 - gap, w - pad));
        dock.style.right = `${w - rightEdge}px`;
        dock.style.left = 'auto';
        const pr = panel.getBoundingClientRect();
        const x1 = pr.right - sr.left;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y2', String(y));
        dot.setAttribute('cx', String(x2));
        dot.setAttribute('cy', String(y));
        svg.style.visibility = aim.visible === false ? 'hidden' : '';
        if (!aimedRef.current) {
          aimedRef.current = true;
          setAimed(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      const dock = dockRef.current;
      if (dock) {
        dock.style.top = '';
        dock.style.right = '';
        dock.style.left = '';
      }
    };
  }, [present, aimRef]);

  return (
    <>
      <div
        ref={dockRef}
        className={`rgl-face-dock rgl-face-dock-sign${open && aimed ? ' is-on' : ''}${exiting ? ' is-exit' : ''}${aimed ? ' is-aimed' : ''}`}
        aria-hidden={!present}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <form
          ref={panelRef}
          className="rgl-face-dock-panel"
          role="dialog"
          aria-modal={present ? 'true' : undefined}
          aria-labelledby="bday-sign-title"
          onSubmit={(e) => {
            e.preventDefault();
            if (open && value.trim()) onSign();
          }}
        >
          <div className="rgl-face-dock-head">
            <p id="bday-sign-title" className="rgl-face-dock-label">
              {pin?.noteId ? 'Edit' : 'Add a Message'}
            </p>
            <span id="bday-sign-count" className="rgl-face-dock-count" aria-live="polite">
              {value.length} / {MAX_MESSAGE}
            </span>
          </div>
          <textarea
            ref={inputRef}
            className="rgl-face-dock-note"
            value={value}
            maxLength={MAX_MESSAGE}
            rows={3}
            placeholder="Happy birthday…"
            tabIndex={open ? 0 : -1}
            aria-describedby="bday-sign-count"
            onChange={(e) => onChange(e.target.value.slice(0, MAX_MESSAGE))}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                onCancel();
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent?.stopImmediatePropagation?.();
                if (open && value.trim()) onSign();
              }
            }}
          />
          <div className="rgl-face-dock-actions">
            <button
              type="button"
              className="rgl-face-dock-action is-primary"
              disabled={!value.trim()}
              onClick={() => {
                if (open && value.trim()) onSign();
              }}
            >
              {pin?.noteId ? 'Save' : 'Sign'}
            </button>
          </div>
        </form>
      </div>
      {present && (
        <svg
          ref={svgRef}
          className={`rgl-sign-pointer${open && aimed ? ' is-on' : ''}${exiting ? ' is-exit' : ''}`}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" />
          <circle ref={dotRef} cx="0" cy="0" r="3" />
        </svg>
      )}
    </>
  );
}
