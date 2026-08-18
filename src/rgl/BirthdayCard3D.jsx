import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BADGE_GOLD_PROPS,
  bodyMaterialProps,
  paletteColorsFor,
  RGL_SUBJECT_SIZE,
} from './materials';
import { CARD_OPEN_STIFFNESS, HINGE_FOLLOW_ANGLE, HINGE_FOLLOW_STIFFNESS, HINGE_FOLLOW_YAW } from './cardMotion';

const LEAF_W = 0.96;
const LEAF_H = 1.34;
const LEAF_T = 0.016;
const CORNER = 0.078;
const OPEN_ANGLE = Math.PI;
/** Outer metal rim sitting proud of the tray — Figma-pendant well. */
const RIM_OUTER_INSET = 0.006;
const RIM_WIDTH = 0.018;
const RIM_DEPTH = 0.005;
const WELL_DEPTH = 0.004;
const WELL_LIFT = 0.001;
const WELL_RECESS = 0.006;
const FOIL_DISPLACE = 0.0008;
/** Resting pose — cracked open so it reads as a card, not a slab. */
const REST_OPEN = 0.15;
const OPEN_GROW = 1.28;
const FIT_SCALE = (RGL_SUBJECT_SIZE * 0.7) / LEAF_H;
const TEX_W = 768;
const TEX_H = 1056;
const FOIL_W = 512;
const FOIL_H = 704;

export const CARD_SEED_NOTES = [
  { id: 'chelsea', page: 'left', u: 0.14, v: 0.68, rotate: -7, name: 'Chelsea', text: 'Hope it’s a good one — save me a slice.' },
  { id: 'howard', page: 'left', u: 0.2, v: 0.28, rotate: 5, name: 'Howard', text: 'Another trip around the sun.' },
  { id: 'rob', page: 'right', u: 0.14, v: 0.7, rotate: -4, name: 'Rob', text: 'Get after it, Klas.' },
  { id: 'jeff', page: 'right', u: 0.22, v: 0.42, rotate: 6, name: 'Jeff', text: 'Happy birthday!' },
  { id: 'grace', page: 'right', u: 0.16, v: 0.16, rotate: -5, name: 'Grace', text: 'Celebrating you from across the map.' },
];

function shadeSmooth(geo, tolerance = 1e-4) {
  geo.deleteAttribute('normal');
  const welded = mergeVertices(geo, tolerance);
  if (welded !== geo) geo.dispose();
  welded.computeVertexNormals();
  return welded;
}

function roundedRectShape(w, h, r) {
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - rr);
  s.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false);
  s.lineTo(x + rr, y + h);
  s.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + rr);
  s.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false);
  return s;
}

function extrudeCentered(shape, depth, bevelSize, bevelThickness, bevelSegments = 6) {
  let geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevelSize > 0,
    bevelThickness,
    bevelSize,
    bevelOffset: 0,
    bevelSegments,
    curveSegments: 14,
    steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  geo = shadeSmooth(geo, 2e-4);
  return geo;
}

function roundedRectHole(w, h, r) {
  const pts = roundedRectShape(w, h, r).getPoints(48);
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
    0.008,
    0.006,
    6,
  );
}

function makeRimGeometry() {
  const outerW = LEAF_W - RIM_OUTER_INSET * 2;
  const outerH = LEAF_H - RIM_OUTER_INSET * 2;
  const { innerW, innerH } = wellSize();
  const rOuter = Math.max(0.02, CORNER - RIM_OUTER_INSET);
  const rInner = Math.max(0.016, rOuter - RIM_WIDTH * 0.45);
  return extrudeCentered(
    roundedRectRingShape(outerW, outerH, innerW, innerH, rOuter, rInner),
    RIM_DEPTH,
    0.0036,
    0.0032,
    5,
  );
}

function makeWellGeometry() {
  const { innerW, innerH } = wellSize();
  const gap = 0.003;
  const r = Math.max(0.014, CORNER - RIM_OUTER_INSET - RIM_WIDTH * 0.45 - gap * 0.3);
  return extrudeCentered(
    roundedRectShape(innerW - gap, innerH - gap, r),
    WELL_DEPTH,
    0.0024,
    0.002,
    4,
  );
}

function makeSpineGeometry() {
  return extrudeCentered(
    roundedRectShape(0.02, LEAF_H * 0.9, 0.007),
    LEAF_T + RIM_DEPTH * 0.35,
    0.0024,
    0.002,
    3,
  );
}

function brighterCardBody(hex, theme) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  if (theme === 'light') {
    c.setHSL(hsl.h, Math.min(1, hsl.s * 1.08 + 0.04), Math.min(0.96, hsl.l + 0.04));
  } else {
    c.setHSL(
      hsl.h,
      Math.min(1, hsl.s * 1.25 + 0.1),
      Math.min(0.5, hsl.l * 1.75 + 0.12),
    );
  }
  return c;
}

function wellBodyColor(hex, theme) {
  const c = brighterCardBody(hex, theme);
  c.offsetHSL(0, theme === 'light' ? 0.02 : 0.06, theme === 'light' ? -0.07 : -0.1);
  return c;
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

function drawNote(ctx, note, w, h) {
  const x = note.u * w;
  const y = (1 - note.v) * h;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((note.rotate || 0) * Math.PI) / 180);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '700 78px Caveat, "Segoe Script", cursive';
  ctx.lineWidth = 3.2;
  const lineH = 84;
  const lines = wrapText(ctx, note.text, w * 0.46);
  lines.forEach((line, i) => {
    ctx.strokeText(line, 0, i * lineH);
    ctx.fillText(line, 0, i * lineH);
  });
  ctx.font = '700 88px Caveat, "Segoe Script", cursive';
  ctx.lineWidth = 3.6;
  const sign = `— ${note.name}`;
  const signY = lines.length * lineH + 10;
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

function drawCoverFoil(ctx, name) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';

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

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 42px "Possibility"';
  ctx.fillText('Happy Birthday', 256, 268);
  ctx.font = '700 92px Caveat, "Segoe Script", cursive';
  ctx.fillText(name, 256, 372);
}

function makeFoilTexture(draw, width = FOIL_W, height = FOIL_H) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 8;
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

function drawFrontTexture(name) {
  return makeFoilTexture((ctx) => drawCoverFoil(ctx, name));
}

function drawBackTexture() {
  return makeFoilTexture((ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 18px "Possibility"';
    fillTrackedText(ctx, 'THE OFFICE OF THE FUTURE', w / 2, h * 0.9, 1.8);
  });
}

function makeFoilDecalMaterial(alphaMap, displace = 0) {
  return new THREE.MeshPhysicalMaterial({
    ...BADGE_GOLD_PROPS,
    alphaMap,
    displacementMap: displace ? alphaMap : null,
    displacementScale: displace,
    displacementBias: 0,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: true,
  });
}

function drawInsideFoil(side, notes) {
  return makeFoilTexture((ctx, w, h) => {
    notes
      .filter((n) => n.page === side)
      .forEach((note) => drawNote(ctx, note, w, h));
  }, TEX_W, TEX_H);
}

function CardFace({
  raised,
  rimGeo,
  wellGeo,
  rimMat,
  wellMat,
  greetingGeo,
  greetingMat,
  notesGeo,
  notesMat,
  page,
  interactive,
  onPick,
  children,
}) {
  const rimZ = raised ? RIM_DEPTH / 2 : -RIM_DEPTH / 2 + 0.0012;
  const wellZ = raised
    ? WELL_LIFT + WELL_DEPTH / 2
    : -WELL_RECESS + WELL_DEPTH / 2;
  const wellFront = wellZ + WELL_DEPTH / 2;
  const notesZ = wellFront + 0.001;
  const greetZ = notesZ + 0.002;

  return (
    <group>
      <mesh geometry={rimGeo} material={rimMat} position={[0, 0, rimZ]} raycast={() => {}} />
      <mesh geometry={wellGeo} material={wellMat} position={[0, 0, wellZ]} raycast={() => {}} />
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
            onPick={onPick}
          />
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
  onPick,
}) {
  const down = useRef(null);

  const onPointerDown = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    down.current = { x: e.clientX, y: e.clientY };
  };

  const onClick = (e) => {
    if (!interactive || !e.uv) return;
    const start = down.current;
    down.current = null;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
    e.stopPropagation();
    e.nativeEvent?.stopPropagation?.();
    e.nativeEvent?.stopImmediatePropagation?.();
    onPick?.({
      page,
      u: page === 'left' ? 1 - e.uv.x : e.uv.x,
      v: e.uv.y,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  return (
    <mesh
      geometry={geometry}
      material={material}
      renderOrder={2}
      onPointerDown={onPointerDown}
      onClick={onClick}
    />
  );
}

function makeSparkMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.28, 'rgba(255,255,255,0.75)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const FW_ORIGINS = [
  { x: -0.32, y: 0.46, delay: 0.0 },
  { x: 0.34, y: 0.38, delay: 0.85 },
  { x: -0.34, y: -0.44, delay: 1.55 },
  { x: 0.33, y: -0.4, delay: 2.25 },
];
const FW_PER_BURST = 20;
const FW_PERIOD = 3.4;
const FW_COUNT = FW_ORIGINS.length * FW_PER_BURST;

function FrontFireworks({ active, accent }) {
  const reduceMotion = usePrefersReducedMotion();
  const points = useRef(null);
  const vis = useRef(active ? 1 : 0);
  const elapsed = useRef(0);
  const sparkMap = useMemo(() => makeSparkMap(), []);
  const { positions, colors, baseColors, seeds } = useMemo(() => {
    const positions = new Float32Array(FW_COUNT * 3);
    const colors = new Float32Array(FW_COUNT * 3);
    const baseColors = new Float32Array(FW_COUNT * 3);
    const seeds = new Float32Array(FW_COUNT * 4);
    const gold = new THREE.Color('#FFE7A0');
    const hot = new THREE.Color('#FFFFFF');
    const tint = new THREE.Color(accent);
    for (let b = 0; b < FW_ORIGINS.length; b++) {
      for (let i = 0; i < FW_PER_BURST; i++) {
        const idx = b * FW_PER_BURST + i;
        const a = ((i + 0.37) / FW_PER_BURST) * Math.PI * 2;
        const speed = 0.22 + (i % 5) * 0.035;
        seeds[idx * 4] = Math.cos(a) * speed;
        seeds[idx * 4 + 1] = Math.sin(a) * speed;
        seeds[idx * 4 + 2] = (i % 7) * 0.004;
        seeds[idx * 4 + 3] = 0.7 + (i % 4) * 0.12;
        const mix = i % 3 === 0 ? hot : i % 3 === 1 ? gold : tint;
        baseColors[idx * 3] = mix.r;
        baseColors[idx * 3 + 1] = mix.g;
        baseColors[idx * 3 + 2] = mix.b;
        colors[idx * 3] = mix.r;
        colors[idx * 3 + 1] = mix.g;
        colors[idx * 3 + 2] = mix.b;
      }
    }
    return { positions, colors, baseColors, seeds };
  }, [accent]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useEffect(() => () => {
    geom.dispose();
    sparkMap.dispose();
  }, [geom, sparkMap]);

  useFrame((_, dt) => {
    const target = active && !reduceMotion.current ? 1 : 0;
    vis.current += (target - vis.current) * (1 - Math.exp(-10 * Math.min(dt, 0.05)));
    if (vis.current < 0.01) {
      if (points.current) points.current.visible = false;
      return;
    }
    if (points.current) points.current.visible = true;
    elapsed.current += dt;
    const pos = geom.attributes.position.array;
    const col = geom.attributes.color.array;
    for (let b = 0; b < FW_ORIGINS.length; b++) {
      const origin = FW_ORIGINS[b];
      const cycle = ((elapsed.current + origin.delay) % FW_PERIOD) / FW_PERIOD;
      if (cycle >= 0.55) {
        for (let i = 0; i < FW_PER_BURST; i++) {
          const idx = b * FW_PER_BURST + i;
          pos[idx * 3 + 2] = -1;
          col[idx * 3] = 0;
          col[idx * 3 + 1] = 0;
          col[idx * 3 + 2] = 0;
        }
        continue;
      }
      const t = cycle / 0.55;
      const life = 1 - t * t;
      const expand = 1 - (1 - t) * (1 - t);
      const a = life * vis.current;
      for (let i = 0; i < FW_PER_BURST; i++) {
        const idx = b * FW_PER_BURST + i;
        const drag = seeds[idx * 4 + 3];
        pos[idx * 3] = origin.x + seeds[idx * 4] * expand * drag;
        pos[idx * 3 + 1] = origin.y + seeds[idx * 4 + 1] * expand * drag - expand * expand * 0.06;
        pos[idx * 3 + 2] = seeds[idx * 4 + 2] * expand;
        col[idx * 3] = baseColors[idx * 3] * a;
        col[idx * 3 + 1] = baseColors[idx * 3 + 1] * a;
        col[idx * 3 + 2] = baseColors[idx * 3 + 2] * a;
      }
    }
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geom} frustumCulled={false} raycast={() => {}}>
      <pointsMaterial
        map={sparkMap}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        size={0.07}
        sizeAttenuation
        opacity={1}
      />
    </points>
  );
}

function loadCardFonts() {
  const fonts = document.fonts;
  if (!fonts) return Promise.resolve();
  const possibility = new FontFace(
    'Possibility',
    'url(/fonts/Possibility-Bold.otf)',
    { weight: '700', style: 'normal' },
  );
  return possibility
    .load()
    .then((face) => {
      fonts.add(face);
      return Promise.all([
        fonts.load('700 18px "Possibility"'),
        fonts.load('700 28px "Possibility"'),
        fonts.load('700 42px "Possibility"'),
        fonts.load('700 78px Caveat'),
        fonts.load('700 88px Caveat'),
        fonts.load('700 92px Caveat'),
        fonts.ready,
      ]);
    })
    .catch(() => fonts.ready);
}

/**
 * Birthday greeting card — same studio materials as the pack gifts,
 * two thin leaves hinged at the spine. `open` drives the fold.
 */
export default function BirthdayCard3D({
  open = false,
  followPointer = false,
  name = 'Klas',
  notes = CARD_SEED_NOTES,
  theme = 'dark',
  paletteId = 'gold',
  scale = 1,
  onInsidePick,
}) {
  const reduceMotion = usePrefersReducedMotion();
  const openT = useRef(open ? 1 : REST_OPEN);
  const hinge = useRef(null);
  const root = useRef(null);
  const pointerX = useRef(0);
  const followX = useRef(0);
  const { gl } = useThree();
  const colors = paletteColorsFor(theme, paletteId);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCardFonts().then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!followPointer) {
      pointerX.current = 0;
      return undefined;
    }
    const onMove = (e) => {
      const el = gl.domElement;
      const r = el.getBoundingClientRect();
      if (r.width <= 0) return;
      pointerX.current = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [followPointer, gl]);

  const leafGeo = useMemo(() => makeLeafGeometry(), []);
  const rimGeo = useMemo(() => makeRimGeometry(), []);
  const wellGeo = useMemo(() => makeWellGeometry(), []);
  const spineGeo = useMemo(() => makeSpineGeometry(), []);
  const { innerW, innerH } = wellSize();
  const greetingGeo = useMemo(
    () => new THREE.PlaneGeometry(LEAF_W * 0.68, LEAF_H * 0.68, 72, 100),
    [],
  );
  const notesGeo = useMemo(
    () => new THREE.PlaneGeometry(innerW * 0.96, innerH * 0.96, 64, 88),
    [innerW, innerH],
  );
  const backCoverGeo = useMemo(
    () => new THREE.PlaneGeometry(innerW * 0.92, innerH * 0.92, 64, 88),
    [innerW, innerH],
  );

  const outsideMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...bodyMaterialProps,
        color: brighterCardBody(colors.body, theme),
        roughness: 0.3,
        metalness: 0.22,
        clearcoat: 0.55,
        clearcoatRoughness: 0.28,
        reflectivity: 0.62,
        side: THREE.DoubleSide,
      }),
    [theme, colors.body],
  );
  const wellMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...bodyMaterialProps,
        color: wellBodyColor(colors.body, theme),
        roughness: 0.52,
        metalness: 0.05,
        clearcoat: 0.18,
        clearcoatRoughness: 0.55,
        side: THREE.DoubleSide,
      }),
    [theme, colors.body],
  );
  const foilMat = useMemo(
    () => new THREE.MeshPhysicalMaterial(BADGE_GOLD_PROPS),
    [],
  );

  const frontTex = useMemo(() => drawFrontTexture(name), [name, fontsReady]);
  const backTex = useMemo(() => drawBackTexture(), [fontsReady]);
  const insideLeftTex = useMemo(
    () => drawInsideFoil('left', notes),
    [notes, fontsReady],
  );
  const insideRightTex = useMemo(
    () => drawInsideFoil('right', notes),
    [notes, fontsReady],
  );

  const frontDecalMat = useMemo(
    () => makeFoilDecalMaterial(frontTex, FOIL_DISPLACE),
    [frontTex],
  );
  const backDecalMat = useMemo(
    () => makeFoilDecalMaterial(backTex, FOIL_DISPLACE),
    [backTex],
  );
  const insideLeftMat = useMemo(
    () => makeFoilDecalMaterial(insideLeftTex, FOIL_DISPLACE),
    [insideLeftTex],
  );
  const insideRightMat = useMemo(
    () => makeFoilDecalMaterial(insideRightTex, FOIL_DISPLACE),
    [insideRightTex],
  );

  useEffect(() => () => leafGeo.dispose(), [leafGeo]);
  useEffect(() => () => rimGeo.dispose(), [rimGeo]);
  useEffect(() => () => wellGeo.dispose(), [wellGeo]);
  useEffect(() => () => spineGeo.dispose(), [spineGeo]);
  useEffect(() => () => greetingGeo.dispose(), [greetingGeo]);
  useEffect(() => () => notesGeo.dispose(), [notesGeo]);
  useEffect(() => () => backCoverGeo.dispose(), [backCoverGeo]);
  useEffect(() => () => outsideMat.dispose(), [outsideMat]);
  useEffect(() => () => wellMat.dispose(), [wellMat]);
  useEffect(() => () => foilMat.dispose(), [foilMat]);
  useEffect(() => () => frontTex.dispose(), [frontTex]);
  useEffect(() => () => backTex.dispose(), [backTex]);
  useEffect(() => () => insideLeftTex.dispose(), [insideLeftTex]);
  useEffect(() => () => insideRightTex.dispose(), [insideRightTex]);
  useEffect(() => () => frontDecalMat.dispose(), [frontDecalMat]);
  useEffect(() => () => backDecalMat.dispose(), [backDecalMat]);
  useEffect(() => () => insideLeftMat.dispose(), [insideLeftMat]);
  useEffect(() => () => insideRightMat.dispose(), [insideRightMat]);

  useFrame((_, dt) => {
    const target = open ? 1 : REST_OPEN;
    const clampedDt = Math.min(dt, 0.05);
    if (reduceMotion.current) {
      openT.current = target;
      followX.current = 0;
    } else {
      const kOpen = 1 - Math.exp(-CARD_OPEN_STIFFNESS * clampedDt);
      openT.current += (target - openT.current) * kOpen;
      if (Math.abs(target - openT.current) < 0.0008) openT.current = target;

      const want = followPointer ? pointerX.current : 0;
      const kFollow = 1 - Math.exp(-HINGE_FOLLOW_STIFFNESS * clampedDt);
      followX.current += (want - followX.current) * kFollow;
      if (Math.abs(want - followX.current) < 0.0008) followX.current = want;
    }
    const t = openT.current;
    const u = (t - REST_OPEN) / (1 - REST_OPEN);
    const peek = Math.max(0, Math.min(1, u));
    const grow = 1 + (OPEN_GROW - 1) * peek;
    const x = followX.current * peek;
    if (hinge.current) {
      hinge.current.rotation.y = -OPEN_ANGLE * t - x * HINGE_FOLLOW_ANGLE;
    }
    if (root.current) {
      root.current.scale.setScalar(FIT_SCALE * scale * grow);
      root.current.position.x = -LEAF_W * 0.5 * (1 - t) * FIT_SCALE * scale * grow;
      root.current.rotation.y = -x * HINGE_FOLLOW_YAW;
    }
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
  };

  return (
    <group ref={root} scale={FIT_SCALE * scale} position={[-LEAF_W * 0.5 * (1 - REST_OPEN) * FIT_SCALE * scale, 0, 0]}>
      <group position={[LEAF_W / 2, 0, 0]}>
        <mesh geometry={leafGeo} material={outsideMat} />
        <group position={[0, 0, faceZ]}>
          <CardFace
            {...faceProps}
            raised={false}
            notesMat={insideRightMat}
            page="right"
            interactive={open}
            onPick={onInsidePick}
          />
        </group>
        <group position={[0, 0, insideZ]} rotation={[0, Math.PI, 0]}>
          <CardFace
            {...faceProps}
            raised
            greetingGeo={backCoverGeo}
            greetingMat={backDecalMat}
          />
        </group>
      </group>

      <mesh geometry={spineGeo} material={foilMat} position={[0, 0, 0]} />

      <group ref={hinge} position={[0, 0, LEAF_T / 2]} rotation={[0, -OPEN_ANGLE * REST_OPEN, 0]}>
        <group position={[LEAF_W / 2, 0, LEAF_T / 2]}>
          <mesh geometry={leafGeo} material={outsideMat} />
          <group position={[0, 0, faceZ]}>
            <CardFace {...faceProps} raised greetingMat={frontDecalMat}>
              <group position={[0, 0, RIM_DEPTH + 0.01]}>
                <FrontFireworks active={!open} accent={colors.accent} />
              </group>
            </CardFace>
          </group>
          <group position={[0, 0, insideZ]} rotation={[0, Math.PI, 0]}>
            <CardFace
              {...faceProps}
              raised={false}
              notesMat={insideLeftMat}
              page="left"
              interactive={open}
              onPick={onInsidePick}
            />
          </group>
        </group>
      </group>
    </group>
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
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onClick?.();
      }}
    >
      {open ? 'Close' : 'Open'}
    </button>
  );
}

/** Traffic-light close, pinned to the app-window titlebar. */
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
      <span className="rgl-window-close-x" aria-hidden="true" />
    </button>
  );
}

export function CardSignPop({ draft, value, onChange, onSign, onCancel }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!draft) return undefined;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [draft]);

  if (!draft) return null;

  return (
    <form
      className="bday-sign-pop"
      style={{ left: draft.x, top: draft.y }}
      onSubmit={(e) => {
        e.preventDefault();
        onSign();
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <textarea
        ref={inputRef}
        className="bday-sign-pop-input"
        value={value}
        maxLength={MAX_MESSAGE}
        rows={3}
        placeholder="Write a birthday message…"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onCancel();
          }
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSign();
          }
        }}
      />
      <div className="bday-sign-pop-bar">
        <span className="bday-sign-pop-count">
          {value.length}/{MAX_MESSAGE}
        </span>
        <button type="button" className="bday-sign-pop-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="bday-sign-pop-sign" disabled={!value.trim()}>
          Sign
        </button>
      </div>
    </form>
  );
}
