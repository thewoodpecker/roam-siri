/* Vendored from https://github.com/thewoodpecker/virtual-office-webgl (index.html).
   Yext tower layout from v1.html LAYOUT_PRESETS[0].
   Imports three@0.160.0 from jsdelivr so the scene can run in a same-origin iframe. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const voParams = new URLSearchParams(window.location.search);
const embed = window.parent !== window || voParams.has("embed");
if (embed) document.documentElement.classList.add("vo-embed");

// v1 layout preset 0: staggered setback tower named "Yext".
// Embeds default to that building; standalone (and ?building=overview) keep the two-tower campus.
const buildingParam = (voParams.get("building") || "").toLowerCase();
const useYextBuilding = buildingParam === "yext" || (embed && buildingParam !== "overview");

const motionQuery =
  typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
let allowAutoRotate = !motionQuery?.matches;
let offscreenPaused = false;
let readyToPause = false;
let rafId = 0;

const isScenePaused = () => offscreenPaused || document.hidden;

const startRenderLoop = () => {
  if (rafId || isScenePaused() || !clock) return;
  clock.getDelta();
  animate();
};

const stopRenderLoop = () => {
  if (!rafId) return;
  cancelAnimationFrame(rafId);
  rafId = 0;
};

const syncRenderLoop = () => {
  if (isScenePaused()) stopRenderLoop();
  else startRenderLoop();
};

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.source !== "roam-virtual-office") return;
  if (typeof data.paused !== "boolean") return;
  // Ignore pause until the tower has been drawn once. The parent observer can
  // fire paused=true while the iframe is still 0×0, which would freeze rooms
  // at scale 0 and leave a black grid.
  if (data.paused && !readyToPause) return;
  offscreenPaused = data.paused;
  syncRenderLoop();
});

document.addEventListener("visibilitychange", syncRenderLoop);
motionQuery?.addEventListener("change", () => {
  allowAutoRotate = !motionQuery.matches;
  if (controls) controls.autoRotate = allowAutoRotate;
});

/* ============================================================
   CONSTANTS & ROOM DATA
   ============================================================ */
const SLAB_H = 0.3;
const ROOM_GAP = 1.0;
const SLAB_OVERHANG = 0.3;
const FLOOR_GAP = 0.7;
const TUBE_T = 0.025;
const TUBE_T_INTERIOR = 0.015;
const NUM_ROOMS = 19;
const ROOM_W = 7, ROOM_D = 7, ROOM_H = 5;
const TOWER_GAP = 8;

const NEON = 0x111118;
const NEON_BRIGHT = 0x5599ee;
const WARM_LIGHT = 0x667799;

const ROOM_COLORS_TODAY = [
  0x66DDFF, 0x3399FF, 0x2266DD, 0x44BBFF,
  0x1188FF, 0x55AAEE, 0x88CCFF, 0x4488DD,
  0x77BBFF, 0x3377CC, 0x5599EE, 0x7799DD,
];
const ROOM_COLORS_TOMORROW = [
  0x33DD88, 0x22CC66, 0x66EEBB, 0x44DD99,
  0x55FFAA, 0x22BB77, 0x44FFCC,
];

function getRoomColor(ri) {
  return ri < 12 ? ROOM_COLORS_TODAY[ri] : ROOM_COLORS_TOMORROW[ri - 12];
}

const ROOM_DATA = [
  { name:'Virtual Office Map', desc:'See your entire virtual office at a glance. Navigate rooms, check who\'s online, and jump to any space instantly.', cat:'today' },
  { name:'Lobby', desc:'Your front door in the cloud. Greet visitors, schedule meetings, and see who just walked in.', cat:'today' },
  { name:'Elevator', desc:'Navigate between floors with quick access to every room in the building.', cat:'today' },
  { name:'Conference Room', desc:'Drop in for a quick sync or a full boardroom session — average meeting time: 8 minutes.', cat:'today' },
  { name:'Immersive Theater', desc:'All-hands, town halls, and presentations at scale — capacity for thousands, built for engagement.', cat:'today' },
  { name:'AInbox Chat', desc:'Your AI assistant is On-It. Summaries, action items, and transcripts — hands-free.', cat:'today' },
  { name:'Game Room', desc:'Unwind and connect. Arcade games, pool, and friendly competition to build team bonds.', cat:'today' },
  { name:'AI Note Taker', desc:'Never miss a detail. AI-powered transcription and smart summaries for every meeting.', cat:'today' },
  { name:'Video Studio', desc:'Professional recording setup for async updates, demos, and content your whole team can watch.', cat:'today' },
  { name:'AI Assistant', desc:'Your always-on AI helper. Ask questions, get summaries, and automate workflows instantly.', cat:'today' },
  { name:'Virtual Events', desc:'Host webinars, panels, and company-wide events with interactive audience features.', cat:'today' },
  { name:'Private Office', desc:'Your own corner office in the cloud. Open door means come on in, locked means heads down.', cat:'today' },
  { name:'Virtual Sales Floor', desc:'A high-energy trading floor where your team closes deals side by side, remotely.', cat:'tomorrow' },
  { name:'Virtual Interview Rooms', desc:'Private conversation suites for structured interviews. Lock the door, focus on the candidate.', cat:'tomorrow' },
  { name:'Lunch Room', desc:'Take a break, grab a coffee, and catch up with colleagues in the virtual cafeteria.', cat:'tomorrow' },
  { name:'Swag Closet', desc:'Company merch, gift packages, and branded goodies — all in one place.', cat:'tomorrow' },
  { name:'Karaoke Room', desc:'Team building at its finest. Sing your heart out with colleagues after hours.', cat:'tomorrow' },
  { name:'Private Rooms', desc:'Semi-private meeting spaces for sensitive conversations and focused 1-on-1s.', cat:'tomorrow' },
  { name:'Agentic Coworkers', desc:'AI agents that work alongside your team — autonomous, capable, always available.', cat:'tomorrow' },
];

const TOWER_A_FLOORS = [[0,1,2,3],[4,5,6],[7,8,9,10],[11]];
const TOWER_B_FLOORS = [[12,13],[14,15,16],[17,18]];
const TODAY_ROOMS = [0,1,2,3,4,5,6,7,8,9,10,11];
const TOMORROW_ROOMS = [12,13,14,15,16,17,18];

// From virtual-office-webgl v1.html LAYOUT_PRESETS[0] ("Yext").
const YEXT_LAYOUT = {
  name: 'Yext',
  floors: [[0,1,3],[2,4],[6,7],[5]],
  offsets: [
    {dx:0, dz:0},{dx:0, dz:0},{dx:0, dz:0},
    {dx:-2, dz:1.5},{dx:2, dz:-1.5},
    {dx:3, dz:2},{dx:-1.5, dz:-2},
    {dx:-2.5, dz:1},
  ],
};

/* ============================================================
   COMPUTED POSITIONS
   ============================================================ */
let ROOM_POS = [];
let ROOM_FLOOR = [];
let OVERVIEW_POS = new THREE.Vector3(30, 20, 30);
let OVERVIEW_TARGET = new THREE.Vector3(0, 10, 0);
const BUILDING_OFFSET = { x: 18, z: 5 };

function computePositions() {
  ROOM_POS = []; ROOM_FLOOR = [];
  if (useYextBuilding) {
    YEXT_LAYOUT.floors.forEach((rooms, fi) => {
      let floorY = 0;
      for (let f = 0; f < fi; f++) floorY += ROOM_H + SLAB_H + FLOOR_GAP;
      const totalW = rooms.length * ROOM_W + (rooms.length - 1) * ROOM_GAP;
      let cx = -totalW / 2;
      rooms.forEach((ri) => {
        const off = YEXT_LAYOUT.offsets[ri] || { dx: 0, dz: 0 };
        ROOM_POS[ri] = { x: cx + ROOM_W / 2 + off.dx, y: floorY, z: off.dz };
        ROOM_FLOOR[ri] = fi;
        cx += ROOM_W + ROOM_GAP;
      });
    });
  } else {
    function computeTower(floors, offsetX) {
      floors.forEach((rooms, fi) => {
        let floorY = 0;
        for (let f = 0; f < fi; f++) floorY += ROOM_H + SLAB_H + FLOOR_GAP;
        const totalW = rooms.length * ROOM_W + (rooms.length - 1) * ROOM_GAP;
        let cx = -totalW / 2;
        rooms.forEach((ri) => {
          const rx = cx + ROOM_W / 2 + offsetX + BUILDING_OFFSET.x;
          const rz = BUILDING_OFFSET.z;
          ROOM_POS[ri] = { x: rx, y: floorY, z: rz };
          ROOM_FLOOR[ri] = fi;
          cx += ROOM_W + ROOM_GAP;
        });
      });
    }
    computeTower(TOWER_A_FLOORS, 0);
    let towerAMaxX = -Infinity;
    TODAY_ROOMS.forEach(ri => {
      if (ROOM_POS[ri]) towerAMaxX = Math.max(towerAMaxX, ROOM_POS[ri].x + ROOM_W / 2);
    });
    const towerBBaseX = towerAMaxX - BUILDING_OFFSET.x + TOWER_GAP;
    let tempMinX = Infinity;
    TOWER_B_FLOORS.forEach(rooms => {
      const totalW = rooms.length * ROOM_W + (rooms.length - 1) * ROOM_GAP;
      tempMinX = Math.min(tempMinX, -totalW / 2);
    });
    computeTower(TOWER_B_FLOORS, towerBBaseX - tempMinX);
  }

  // Compute overview camera from bounding box
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let ri = 0; ri < NUM_ROOMS; ri++) {
    if (!ROOM_POS[ri]) continue;
    const p = ROOM_POS[ri];
    minX = Math.min(minX, p.x - ROOM_W / 2);
    maxX = Math.max(maxX, p.x + ROOM_W / 2);
    maxY = Math.max(maxY, p.y + ROOM_H + SLAB_H);
    minZ = Math.min(minZ, p.z - ROOM_D / 2);
    maxZ = Math.max(maxZ, p.z + ROOM_D / 2);
  }
  const cx2 = (minX + maxX) / 2, cy2 = maxY / 2, cz2 = (minZ + maxZ) / 2;
  const extent = Math.max(maxX - minX, maxY, maxZ - minZ);
  // Embed is clipped to the compare-slider's right half, so pull in closer.
  const dist = extent * (useYextBuilding ? (embed ? 0.72 : 1.05) : 1.1);
  OVERVIEW_TARGET = new THREE.Vector3(cx2, cy2, cz2);
  OVERVIEW_POS = new THREE.Vector3(cx2 + dist, cy2 + dist * 0.55, cz2 + dist);
}

/* ============================================================
   GLOBALS
   ============================================================ */
let scene, camera, renderer, labelRenderer, controls, clock;
const roomGlassMeshes = [];
const roomNeonMats = [];
const roomLights = [];
const roomGlowLights = [];
const roomGroupRefs = [];
const roomLabelDivs = [];
const roomGlowBoxes = [];
const vehicles = [];

let hoveredRoom = -1, selectedRoom = -1;
let mouseMoved = false;
let lastInteraction = Date.now();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let gridMinorMat, gridMajorMat, gridGlowMat;
let frameCount = 0, lastFpsTime = performance.now();
const fpsEl = document.getElementById('fps-counter');

const introAnim = {
  active: true, elapsed: 0,
  staggerDelay: 0.25, roomDuration: 0.8, startYOffset: -8,
};
const camAnim = {
  active: false, progress: 0, duration: 1.4,
  startPos: new THREE.Vector3(), endPos: new THREE.Vector3(),
  startTarget: new THREE.Vector3(), endTarget: new THREE.Vector3(),
};

let tourTimer = 0, tourStep = 0;
const tourScript = [];
let autoTourInterval = null, autoTourIdx = 0;

/* ============================================================
   EASING & CAMERA HELPERS
   ============================================================ */
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
function easeOutBack(t) { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCamera(targetPos, targetLookAt, duration = 1.4) {
  camAnim.startPos.copy(camera.position);
  camAnim.endPos.copy(targetPos);
  camAnim.startTarget.copy(controls.target);
  camAnim.endTarget.copy(targetLookAt);
  camAnim.progress = 0;
  camAnim.duration = duration;
  camAnim.active = true;
  controls.autoRotate = false;
}

function getRoomCam(ri) {
  const p = ROOM_POS[ri];
  return {
    pos: new THREE.Vector3(p.x + ROOM_W * 2.5, p.y + ROOM_H * 2.5, p.z + ROOM_D * 2.5),
    target: new THREE.Vector3(p.x, p.y + ROOM_H * 0.5, p.z),
  };
}

function getIntroDelay(ri) {
  const floors = useYextBuilding ? YEXT_LAYOUT.floors : null;
  if (floors) {
    for (let fi = 0; fi < floors.length; fi++) {
      const idx = floors[fi].indexOf(ri);
      if (idx >= 0) return 0.3 + fi * introAnim.staggerDelay + idx * 0.1;
    }
    return 0;
  }
  for (let fi = 0; fi < TOWER_A_FLOORS.length; fi++) {
    const idx = TOWER_A_FLOORS[fi].indexOf(ri);
    if (idx >= 0) return 0.3 + fi * introAnim.staggerDelay + idx * 0.1;
  }
  const towerBStart = 0.3 + TOWER_A_FLOORS.length * introAnim.staggerDelay + 0.3;
  for (let fi = 0; fi < TOWER_B_FLOORS.length; fi++) {
    const idx = TOWER_B_FLOORS[fi].indexOf(ri);
    if (idx >= 0) return towerBStart + fi * introAnim.staggerDelay + idx * 0.1;
  }
  return 0;
}

/* ============================================================
   GEOMETRY HELPERS
   ============================================================ */
function makeScreenCanvas(type, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  const sc = '#3366aa';
  if (type === 'wave') {
    for (let layer = 0; layer < 3; layer++) {
      const freq1 = 0.03 + layer * 0.012, freq2 = 0.008 + layer * 0.005;
      const amp1 = (0.2 - layer * 0.04) * h, amp2 = (0.12 - layer * 0.02) * h;
      const yOff = h * 0.5 + (layer - 1) * h * 0.12;
      ctx.save(); ctx.shadowColor = sc; ctx.shadowBlur = 12 - layer * 3;
      ctx.strokeStyle = sc; ctx.globalAlpha = 0.3 + layer * 0.1; ctx.lineWidth = 4 - layer;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = yOff + Math.sin(x * freq1 + layer * 2) * amp1 + Math.sin(x * freq2 + layer) * amp2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
      ctx.strokeStyle = sc; ctx.globalAlpha = 0.9 - layer * 0.25; ctx.lineWidth = 2 - layer * 0.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = yOff + Math.sin(x * freq1 + layer * 2) * amp1 + Math.sin(x * freq2 + layer) * amp2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (type === 'pie') {
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.35;
    const slices = [0.35, 0.25, 0.2, 0.12, 0.08];
    let angle = -Math.PI / 2;
    ctx.save(); ctx.shadowColor = sc; ctx.shadowBlur = 14;
    ctx.strokeStyle = sc; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    slices.forEach((pct, i) => {
      const sweep = pct * Math.PI * 2;
      ctx.strokeStyle = sc; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r); ctx.stroke();
      ctx.globalAlpha = 0.3 + i * 0.12; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, angle, angle + sweep); ctx.stroke();
      angle += sweep;
    });
    ctx.globalAlpha = 0.7; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  return new THREE.CanvasTexture(c);
}

function addScreen(group, type, w, h, x, iy, z, rotY) {
  const tex = makeScreenCanvas(type, 512, 256);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
  scr.position.set(x, iy, z);
  if (rotY) scr.rotation.y = rotY;
  group.add(scr);
}

function makeInteriorEdges(w, h, d, mat) {
  return makeNeonEdges(w, h, d, mat, embed ? TUBE_T_INTERIOR * 2.2 : TUBE_T_INTERIOR);
}
function makeNeonEdges(w, h, d, mat, thickness) {
  const hw=w/2, hh=h/2, hd=d/2, t=thickness|| (embed ? TUBE_T * 3.2 : TUBE_T);
  const edges = [
    {s:[w+t,t,t],p:[0,-hh,hd]},{s:[w+t,t,t],p:[0,-hh,-hd]},
    {s:[t,t,d+t],p:[-hw,-hh,0]},{s:[t,t,d+t],p:[hw,-hh,0]},
    {s:[w+t,t,t],p:[0,hh,hd]},{s:[w+t,t,t],p:[0,hh,-hd]},
    {s:[t,t,d+t],p:[-hw,hh,0]},{s:[t,t,d+t],p:[hw,hh,0]},
    {s:[t,h,t],p:[-hw,0,hd]},{s:[t,h,t],p:[hw,0,hd]},
    {s:[t,h,t],p:[-hw,0,-hd]},{s:[t,h,t],p:[hw,0,-hd]},
  ];
  const geos = edges.map(e => { const g = new THREE.BoxGeometry(...e.s); g.translate(...e.p); return g; });
  const merged = mergeGeometries(geos);
  geos.forEach(g => g.dispose());
  return new THREE.Mesh(merged, mat);
}

/* ============================================================
   INTERIOR #0 — Virtual Office Map
   ============================================================ */
function createVirtualOfficeMapInterior(group, iy, sz, neonMat) {
  // Central hologram table
  const tW = 1.5, tH = 0.06, tD = 1.5, legH = 0.7;
  const table = makeInteriorEdges(tW, tH, tD, neonMat);
  table.position.set(0, iy + legH + tH/2, 0); group.add(table);
  [[-0.6,-0.6],[0.6,-0.6],[-0.6,0.6],[0.6,0.6]].forEach(([lx,lz]) => {
    const leg = makeInteriorEdges(0.04, legH, 0.04, neonMat);
    leg.position.set(lx, iy + legH/2, lz); group.add(leg);
  });
  // Miniature buildings on table
  const bY = iy + legH + tH;
  [[0,0,0.5],[0.35,0,0.35],[-0.3,0,0.25]].forEach(([bx,bz,bh]) => {
    const b = makeInteriorEdges(0.2, bh, 0.2, neonMat);
    b.position.set(bx, bY + bh/2, bz); group.add(b);
  });
  // 4 workstations around edges
  const stations = [[-2.2,0,-2],[2.2,0,-2],[-2.2,0,2],[2.2,0,2]];
  stations.forEach(([sx,_,sz2]) => {
    const deskH = 0.75;
    const desk = makeInteriorEdges(1.2, 0.05, 0.6, neonMat);
    desk.position.set(sx, iy + deskH, sz2); group.add(desk);
    [[-0.5,-0.25],[0.5,-0.25],[-0.5,0.25],[0.5,0.25]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, deskH, 0.03, neonMat);
      leg.position.set(sx+lx, iy+deskH/2, sz2+lz); group.add(leg);
    });
    const mon = makeInteriorEdges(0.55, 0.38, 0.03, neonMat);
    mon.position.set(sx, iy + deskH + 0.06 + 0.19, sz2 - 0.15); group.add(mon);
  });
}

/* ============================================================
   INTERIOR #1 — Lobby (ported from V2)
   ============================================================ */
function createLobbyInterior(group, iy, sz, neonMat) {
  const deskW = 2.4, deskH = 0.9, deskD = 0.8;
  const desk = makeInteriorEdges(deskW, deskH, deskD, neonMat);
  desk.position.set(0, iy + deskH/2, sz.d * 0.1); group.add(desk);
  const topEdge = makeInteriorEdges(deskW + 0.2, 0.05, deskD + 0.1, neonMat);
  topEdge.position.set(0, iy + deskH + 0.025, sz.d * 0.1); group.add(topEdge);
  const monW = 0.9, monH = 0.6, monY = iy + deskH + monH/2 + 0.15;
  addScreen(group, 'pie', monW, monH, 0, monY, sz.d * 0.1 - 0.1, 0);
  const monFrame = makeInteriorEdges(monW, monH, 0.03, neonMat);
  monFrame.position.set(0, monY, sz.d * 0.1 - 0.1); group.add(monFrame);
  const pole = makeInteriorEdges(0.05, 0.15, 0.05, neonMat);
  pole.position.set(0, iy + deskH + 0.075, sz.d * 0.1 - 0.1); group.add(pole);
  const elevW = 1.6, elevH = sz.h * 0.7, elevD = 0.15, elevY = iy + elevH/2;
  const elevFrame = makeInteriorEdges(elevW, elevH, elevD, neonMat);
  elevFrame.position.set(0, elevY, -sz.d/2 + elevD/2 + 0.1); group.add(elevFrame);
  const doorLine = makeInteriorEdges(0.03, elevH - 0.2, 0.03, neonMat);
  doorLine.position.set(0, elevY, -sz.d/2 + 0.2); group.add(doorLine);
  const indFrame = makeInteriorEdges(0.5, 0.2, 0.03, neonMat);
  indFrame.position.set(0, iy + elevH + 0.2, -sz.d/2 + 0.2); group.add(indFrame);
}

/* ============================================================
   INTERIOR #2 — Elevator
   ============================================================ */
function createElevatorInterior(group, iy, sz, neonMat) {
  // Tall shaft frame
  const shaftW = 1.6, shaftH = sz.h * 0.85, shaftD = 0.15;
  const shaft = makeInteriorEdges(shaftW, shaftH, shaftD, neonMat);
  shaft.position.set(0, iy + shaftH/2, -sz.d/2 + shaftD/2 + 0.2); group.add(shaft);
  // Door center line
  const doorLine = makeInteriorEdges(0.03, shaftH - 0.3, 0.03, neonMat);
  doorLine.position.set(0, iy + shaftH/2, -sz.d/2 + 0.3); group.add(doorLine);
  // 5 floor indicator panels on side wall
  for (let i = 0; i < 5; i++) {
    const indY = iy + 1.0 + i * 0.5;
    const ind = makeInteriorEdges(0.3, 0.2, 0.03, neonMat);
    ind.position.set(sz.w/2 - 0.2, indY, -sz.d/2 + 0.5); group.add(ind);
  }
  // Call button box
  const btn = makeInteriorEdges(0.15, 0.25, 0.06, neonMat);
  btn.position.set(shaftW/2 + 0.4, iy + 1.2, -sz.d/2 + 0.3); group.add(btn);
  // Door frame decorative surround
  const frameTop = makeInteriorEdges(shaftW + 0.3, 0.1, 0.06, neonMat);
  frameTop.position.set(0, iy + shaftH + 0.1, -sz.d/2 + 0.3); group.add(frameTop);
}

/* ============================================================
   INTERIOR #3 — Conference Room (ported from V2)
   ============================================================ */
function createConferenceInterior(group, iy, sz, neonMat) {
  addScreen(group, 'pie', sz.w * 0.7, sz.h * 0.5, 0, iy + sz.h * 0.55, -sz.d/2 + 0.2, 0);
  const frame = makeInteriorEdges(sz.w * 0.7, sz.h * 0.5, 0.05, neonMat);
  frame.position.set(0, iy + sz.h * 0.55, -sz.d/2 + 0.2); group.add(frame);
  const tW = sz.w * 0.65, tH = 0.75, tD = 1.6;
  const table = makeInteriorEdges(tW, 0.06, tD, neonMat);
  table.position.set(0, iy + tH, 0); group.add(table);
  [[-tW/2+0.15,-tD/2+0.1],[tW/2-0.15,-tD/2+0.1],[-tW/2+0.15,tD/2-0.1],[tW/2-0.15,tD/2-0.1]].forEach(([lx,lz]) => {
    const leg = makeInteriorEdges(0.04, tH, 0.04, neonMat);
    leg.position.set(lx, iy + tH/2, lz); group.add(leg);
  });
  const seatY = iy + 0.42, chairW = 0.4, chairD = 0.35;
  function addLegs(cx, cz, hw, hd) {
    [[-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, seatY-iy, 0.03, neonMat);
      leg.position.set(cx+lx, iy+(seatY-iy)/2, cz+lz); group.add(leg);
    });
  }
  for (let i = 0; i < 4; i++) {
    const cx = -tW/2 + 0.5 + i * (tW-1)/3;
    const s1 = makeInteriorEdges(chairW, 0.05, chairD, neonMat);
    s1.position.set(cx, seatY, -tD/2-0.5); group.add(s1);
    addLegs(cx, -tD/2-0.5, chairW/2-0.04, chairD/2-0.04);
    const s2 = makeInteriorEdges(chairW, 0.05, chairD, neonMat);
    s2.position.set(cx, seatY, tD/2+0.5); group.add(s2);
    addLegs(cx, tD/2+0.5, chairW/2-0.04, chairD/2-0.04);
  }
  [-tW/2-0.55, tW/2+0.55].forEach(ex => {
    const s = makeInteriorEdges(chairD, 0.05, chairW, neonMat);
    s.position.set(ex, seatY, 0); group.add(s);
    [[-chairD/2+0.04,-chairW/2+0.04],[chairD/2-0.04,-chairW/2+0.04],
     [-chairD/2+0.04,chairW/2-0.04],[chairD/2-0.04,chairW/2-0.04]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, seatY-iy, 0.03, neonMat);
      leg.position.set(ex+lx, iy+(seatY-iy)/2, lz); group.add(leg);
    });
  });
}

/* ============================================================
   INTERIOR #4 — Immersive Theater (ported from V2)
   ============================================================ */
function createTheaterInterior(group, iy, sz, neonMat) {
  const stageD = sz.d*0.3, stageH = 0.5, stageW = sz.w*0.85;
  const stageZ = -sz.d/2 + stageD/2 + 0.2;
  const stage = makeInteriorEdges(stageW, stageH, stageD, neonMat);
  stage.position.set(0, iy+stageH/2, stageZ); group.add(stage);
  for (let s = 0; s < 3; s++) {
    const stepH = stageH*((s+1)/3), stepZ = stageZ + stageD/2 + (2-s)*0.35 + 0.175;
    const step = makeInteriorEdges(1.8, stepH, 0.35, neonMat);
    step.position.set(0, iy+stepH/2, stepZ); group.add(step);
  }
  const screenW = sz.w*0.85, screenH = sz.h*0.55, screenZ = -sz.d/2+0.15;
  const screenY = iy + stageH + screenH/2 + 0.3;
  addScreen(group, 'wave', screenW, screenH, 0, screenY, screenZ, 0);
  const frame = makeInteriorEdges(screenW, screenH, 0.05, neonMat);
  frame.position.set(0, screenY, screenZ); group.add(frame);
  const rowStartZ = stageZ + stageD/2 + 1.8;
  for (let r = 0; r < 4; r++) {
    const rowZ = rowStartZ + r * 1.1;
    if (rowZ > sz.d/2 - 0.5) continue;
    [-1,1].forEach(side => {
      const bankW = 5*(0.5+0.15)-0.15;
      const bankCX = side*(0.4 + bankW/2);
      for (let s = 0; s < 5; s++) {
        const sx = bankCX - bankW/2 + s*0.65 + 0.25;
        if (Math.abs(sx) > sz.w/2-0.4) continue;
        const seat = makeInteriorEdges(0.5, 0.05, 0.4, neonMat);
        seat.position.set(sx, iy+0.45, rowZ); group.add(seat);
        [-0.22, 0.22].forEach(dx => {
          const leg = makeInteriorEdges(0.03, 0.45, 0.03, neonMat);
          leg.position.set(sx+dx, iy+0.225, rowZ); group.add(leg);
        });
      }
    });
  }
}

/* ============================================================
   INTERIOR #5 — AInbox Chat (adapted from V2)
   ============================================================ */
function createAInboxInterior(group, iy, sz, neonMat) {
  // Circular chat table
  const tableR = 1.4, tableH = 0.75, segments = 8;
  for (let i = 0; i < segments; i++) {
    const a1 = (i/segments)*Math.PI*2, a2 = ((i+1)/segments)*Math.PI*2;
    const x1 = Math.cos(a1)*tableR, z1 = Math.sin(a1)*tableR;
    const x2 = Math.cos(a2)*tableR, z2 = Math.sin(a2)*tableR;
    const dx = x2-x1, dz = z2-z1, len = Math.sqrt(dx*dx+dz*dz);
    const edge = makeInteriorEdges(len, 0.04, 0.04, neonMat);
    edge.position.set((x1+x2)/2, iy+tableH, (z1+z2)/2);
    edge.rotation.y = -Math.atan2(dz, dx); group.add(edge);
  }
  const ped = makeInteriorEdges(0.15, tableH-0.1, 0.15, neonMat);
  ped.position.set(0, iy+(tableH-0.1)/2, 0); group.add(ped);
  const base = makeInteriorEdges(0.8, 0.04, 0.8, neonMat);
  base.position.set(0, iy+0.02, 0); group.add(base);
  // Message board screens on walls
  [[-sz.w/2+0.2, 0, Math.PI/2],[sz.w/2-0.2, 0, -Math.PI/2]].forEach(([wx,wz,ry]) => {
    const scr = makeInteriorEdges(sz.d*0.5, sz.h*0.35, 0.04, neonMat);
    scr.position.set(wx, iy+sz.h*0.55, wz); group.add(scr);
    addScreen(group, 'wave', sz.d*0.5, sz.h*0.35, wx, iy+sz.h*0.55, wz, ry);
  });
  // 6 seats
  const seatR = tableR + 0.6;
  for (let i = 0; i < 6; i++) {
    const ang = (i/6)*Math.PI*2;
    const sx = Math.cos(ang)*seatR, sz2 = Math.sin(ang)*seatR;
    const chairRot = -ang + Math.PI;
    const seat = makeInteriorEdges(0.45, 0.05, 0.4, neonMat);
    seat.position.set(sx, iy+0.42, sz2); seat.rotation.y = chairRot; group.add(seat);
    [[-0.18,-0.15],[0.18,-0.15],[-0.18,0.15],[0.18,0.15]].forEach(([lx,lz]) => {
      const cosA = Math.cos(chairRot), sinA = Math.sin(chairRot);
      const leg = makeInteriorEdges(0.03, 0.42, 0.03, neonMat);
      leg.position.set(sx+lx*cosA-lz*sinA, iy+0.21, sz2+lx*sinA+lz*cosA); group.add(leg);
    });
  }
}

/* ============================================================
   INTERIOR #6 — Game Room
   ============================================================ */
function createGameRoomInterior(group, iy, sz, neonMat) {
  // Central game table (pool/foosball)
  const tW = 2.2, tH = 0.85, tD = 1.2;
  const table = makeInteriorEdges(tW, 0.06, tD, neonMat);
  table.position.set(0, iy+tH, 0); group.add(table);
  [[-tW/2+0.1,-tD/2+0.1],[tW/2-0.1,-tD/2+0.1],[-tW/2+0.1,tD/2-0.1],[tW/2-0.1,tD/2-0.1]].forEach(([lx,lz]) => {
    const leg = makeInteriorEdges(0.04, tH, 0.04, neonMat);
    leg.position.set(lx, iy+tH/2, lz); group.add(leg);
  });
  // Net line across middle
  const net = makeInteriorEdges(0.02, 0.15, tD-0.2, neonMat);
  net.position.set(0, iy+tH+0.08, 0); group.add(net);
  // 4 arcade cabinets in corners
  const arcadePos = [[-2.5,0,-2.5],[2.5,0,-2.5],[-2.5,0,2.5],[2.5,0,2.5]];
  arcadePos.forEach(([ax,_,az]) => {
    const cabH = 1.8, cabW = 0.7, cabD = 0.6;
    const cab = makeInteriorEdges(cabW, cabH, cabD, neonMat);
    cab.position.set(ax, iy+cabH/2, az); group.add(cab);
    // Screen inset
    const scr = makeInteriorEdges(cabW*0.7, cabH*0.35, 0.03, neonMat);
    scr.position.set(ax, iy+cabH*0.65, az + cabD/2 - 0.05); group.add(scr);
  });
  // Trophy shelf on wall
  const shelfW = sz.w*0.5;
  const shelf = makeInteriorEdges(shelfW, 0.04, 0.25, neonMat);
  shelf.position.set(0, iy+2.0, -sz.d/2+0.2); group.add(shelf);
  // Trophy items
  [-0.6, 0, 0.6].forEach(tx => {
    const trophy = makeInteriorEdges(0.15, 0.3, 0.1, neonMat);
    trophy.position.set(tx, iy+2.19, -sz.d/2+0.2); group.add(trophy);
  });
}

/* ============================================================
   INTERIOR #7 — AI Note Taker
   ============================================================ */
function createAINoteTakerInterior(group, iy, sz, neonMat) {
  // L-shaped desk
  const deskH = 0.75;
  const d1 = makeInteriorEdges(2.0, 0.05, 0.8, neonMat);
  d1.position.set(0, iy+deskH, -0.3); group.add(d1);
  const d2 = makeInteriorEdges(0.8, 0.05, 1.2, neonMat);
  d2.position.set(-0.6, iy+deskH, 0.2); group.add(d2);
  // Desk legs
  [[-0.9,-0.65],[0.9,-0.65],[0.9,0.05],[-0.9,0.75]].forEach(([lx,lz]) => {
    const leg = makeInteriorEdges(0.03, deskH, 0.03, neonMat);
    leg.position.set(lx, iy+deskH/2, lz); group.add(leg);
  });
  // Dual monitor frames
  [-0.4, 0.4].forEach(mx => {
    const mon = makeInteriorEdges(0.55, 0.38, 0.03, neonMat);
    mon.position.set(mx, iy+deskH+0.06+0.19, -0.5); group.add(mon);
    addScreen(group, 'wave', 0.55, 0.38, mx, iy+deskH+0.06+0.19, -0.5, 0);
    const stand = makeInteriorEdges(0.03, 0.06, 0.03, neonMat);
    stand.position.set(mx, iy+deskH+0.03, -0.5); group.add(stand);
  });
  // Notepad frame
  const notepad = makeInteriorEdges(0.4, 0.02, 0.3, neonMat);
  notepad.position.set(0.5, iy+deskH+0.06, 0); group.add(notepad);
  // Microphone stand
  const micPole = makeInteriorEdges(0.03, 1.2, 0.03, neonMat);
  micPole.position.set(-2.0, iy+0.6, 0); group.add(micPole);
  const micHead = makeInteriorEdges(0.12, 0.08, 0.08, neonMat);
  micHead.position.set(-2.0, iy+1.25, 0); group.add(micHead);
  // Mic base
  const micBase = makeInteriorEdges(0.3, 0.04, 0.3, neonMat);
  micBase.position.set(-2.0, iy+0.02, 0); group.add(micBase);
}

/* ============================================================
   INTERIOR #8 — Video Studio (ported from V2)
   ============================================================ */
function createVideoStudioInterior(group, iy, sz, neonMat) {
  const ceilY = iy + sz.h;
  [[-0.2,0.2],[0.2,0.2],[0,-0.25]].forEach(([lx,lz]) => {
    const leg = makeInteriorEdges(0.03, 1.1, 0.03, neonMat);
    leg.position.set(lx, iy+0.55, lz); group.add(leg);
  });
  const tripodHead = makeInteriorEdges(0.4, 0.06, 0.06, neonMat);
  tripodHead.position.set(0, iy+1.15, 0); group.add(tripodHead);
  const camBody = makeInteriorEdges(0.6, 0.35, 0.4, neonMat);
  camBody.position.set(0, iy+1.4, 0); group.add(camBody);
  const lens = makeInteriorEdges(0.15, 0.15, 0.3, neonMat);
  lens.position.set(0, iy+1.38, -0.3); group.add(lens);
  const viewfinder = makeInteriorEdges(0.12, 0.1, 0.15, neonMat);
  viewfinder.position.set(-0.15, iy+1.63, 0.1); group.add(viewfinder);
  const rec = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07),
    new THREE.MeshBasicMaterial({ color: 0x661111 }));
  rec.position.set(0.28, iy+1.55, 0); group.add(rec);
  const backdrop = makeInteriorEdges(sz.w*0.65, sz.h*0.75, 0.05, neonMat);
  backdrop.position.set(0, iy+sz.h*0.42, -sz.d/2+0.3); group.add(backdrop);
  [[-sz.w*0.25,-sz.d*0.15],[sz.w*0.25,sz.d*0.15]].forEach(([lx,lz]) => {
    const rod = makeInteriorEdges(0.03, 0.8, 0.03, neonMat);
    rod.position.set(lx, ceilY-0.4, lz); group.add(rod);
    const housing = makeInteriorEdges(0.5, 0.1, 0.4, neonMat);
    housing.position.set(lx, ceilY-0.85, lz); group.add(housing);
  });
}

/* ============================================================
   INTERIOR #9 — AI Assistant
   ============================================================ */
function createAIAssistantInterior(group, iy, sz, neonMat) {
  // Central AI core — 3 nested cubes
  const coreY = iy + sz.h * 0.4;
  [1.2, 0.8, 0.45].forEach(s => {
    const cube = makeInteriorEdges(s, s, s, neonMat);
    cube.position.set(0, coreY, 0); group.add(cube);
  });
  // 4 satellite terminals at cardinal directions
  const termR = 2.2;
  [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dz]) => {
    const tx = dx * termR, tz = dz * termR;
    const deskH = 0.75;
    const desk = makeInteriorEdges(1.0, 0.05, 0.5, neonMat);
    desk.position.set(tx, iy+deskH, tz); group.add(desk);
    [[-0.4,-0.2],[0.4,-0.2],[-0.4,0.2],[0.4,0.2]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, deskH, 0.03, neonMat);
      leg.position.set(tx+lx, iy+deskH/2, tz+lz); group.add(leg);
    });
    const rot = Math.atan2(-dx, -dz);
    const mon = makeInteriorEdges(0.55, 0.38, 0.03, neonMat);
    mon.position.set(tx, iy+deskH+0.06+0.19, tz);
    mon.rotation.y = rot; group.add(mon);
  });
}

/* ============================================================
   INTERIOR #10 — Virtual Events
   ============================================================ */
function createVirtualEventsInterior(group, iy, sz, neonMat) {
  // Wide stage platform
  const stageW = sz.w*0.8, stageH = 0.4, stageD = sz.d*0.25;
  const stageZ = -sz.d/2 + stageD/2 + 0.2;
  const stage = makeInteriorEdges(stageW, stageH, stageD, neonMat);
  stage.position.set(0, iy+stageH/2, stageZ); group.add(stage);
  // Podium
  const podium = makeInteriorEdges(0.5, 1.0, 0.4, neonMat);
  podium.position.set(-1.0, iy+stageH+0.5, stageZ); group.add(podium);
  // Large screen behind stage
  const screenW = sz.w*0.75, screenH = sz.h*0.5;
  addScreen(group, 'wave', screenW, screenH, 0, iy+stageH+screenH/2+0.3, -sz.d/2+0.15, 0);
  const frame = makeInteriorEdges(screenW, screenH, 0.05, neonMat);
  frame.position.set(0, iy+stageH+screenH/2+0.3, -sz.d/2+0.15); group.add(frame);
  // 3 rows audience seating
  const rowStart = stageZ + stageD/2 + 1.5;
  for (let r = 0; r < 3; r++) {
    const rowZ = rowStart + r * 1.2;
    if (rowZ > sz.d/2-0.5) continue;
    for (let s = -3; s <= 3; s++) {
      const sx = s * 0.65;
      if (Math.abs(sx) > sz.w/2-0.5) continue;
      const seat = makeInteriorEdges(0.45, 0.05, 0.35, neonMat);
      seat.position.set(sx, iy+0.42, rowZ); group.add(seat);
      [-0.18,0.18].forEach(dx => {
        const leg = makeInteriorEdges(0.03, 0.42, 0.03, neonMat);
        leg.position.set(sx+dx, iy+0.21, rowZ); group.add(leg);
      });
    }
  }
  // 2 spotlight rigs from ceiling
  const ceilY = iy + sz.h;
  [-1.5, 1.5].forEach(sx => {
    const rod = makeInteriorEdges(0.03, 0.6, 0.03, neonMat);
    rod.position.set(sx, ceilY-0.3, stageZ); group.add(rod);
    const light = makeInteriorEdges(0.3, 0.15, 0.2, neonMat);
    light.position.set(sx, ceilY-0.68, stageZ); group.add(light);
  });
}

/* ============================================================
   INTERIOR #11 — Private Office (ported from V2)
   ============================================================ */
function createPrivateOfficeInterior(group, iy, sz, neonMat) {
  const deskW = 1.8, deskH = 0.75, deskD = 0.8, deskZ = -0.4;
  const desk = makeInteriorEdges(deskW, deskH, deskD, neonMat);
  desk.position.set(0, iy+deskH/2, deskZ); group.add(desk);
  const top = makeInteriorEdges(deskW+0.08, 0.04, deskD+0.04, neonMat);
  top.position.set(0, iy+deskH+0.02, deskZ); group.add(top);
  const monFrame = makeInteriorEdges(0.7, 0.45, 0.03, neonMat);
  monFrame.position.set(0, iy+deskH+0.06+0.225, deskZ-0.15); group.add(monFrame);
  const monStand = makeInteriorEdges(0.04, 0.06, 0.04, neonMat);
  monStand.position.set(0, iy+deskH+0.03, deskZ-0.15); group.add(monStand);
  const chairZ = deskZ - deskD/2 - 0.55;
  const seat = makeInteriorEdges(0.5, 0.06, 0.45, neonMat);
  seat.position.set(0, iy+0.42, chairZ); group.add(seat);
  const pole = makeInteriorEdges(0.05, 0.32, 0.05, neonMat);
  pole.position.set(0, iy+0.16, chairZ); group.add(pole);
  for (let a = 0; a < 5; a++) {
    const ang = (a/5)*Math.PI*2;
    const leg = makeInteriorEdges(0.28, 0.03, 0.03, neonMat);
    leg.position.set(Math.sin(ang)*0.16, iy+0.015, chairZ+Math.cos(ang)*0.16);
    leg.rotation.y = -ang; group.add(leg);
  }
  const px = sz.w/2-0.6, pz = sz.d/2-0.6;
  const pot = makeInteriorEdges(0.35, 0.3, 0.35, neonMat);
  pot.position.set(px, iy+0.15, pz); group.add(pot);
  const stem = makeInteriorEdges(0.04, 0.6, 0.04, neonMat);
  stem.position.set(px, iy+0.6, pz); group.add(stem);
  [[0.25,0.15],[-0.2,0.2],[0.05,-0.22]].forEach(([lx,lz]) => {
    const leaf = makeInteriorEdges(0.3, 0.04, 0.15, neonMat);
    leaf.position.set(px+lx, iy+0.8, pz+lz); group.add(leaf);
  });
  const shelfW = sz.w*0.5;
  for (let s = 0; s < 3; s++) {
    const shelfY = iy+1.2+s*0.7;
    const shelf = makeInteriorEdges(shelfW, 0.04, 0.25, neonMat);
    shelf.position.set(0, shelfY, -sz.d/2+0.2); group.add(shelf);
    [-shelfW/2+0.1,shelfW/2-0.1].forEach(bx => {
      const br = makeInteriorEdges(0.03, 0.15, 0.03, neonMat);
      br.position.set(bx, shelfY-0.09, -sz.d/2+0.15); group.add(br);
    });
  }
}

/* ============================================================
   INTERIOR #12 — Virtual Sales Floor (adapted from V2)
   ============================================================ */
function createSalesFloorInterior(group, iy, sz, neonMat) {
  const podPositions = [
    {x:-sz.w*0.22, z:-sz.d*0.15}, {x:sz.w*0.22, z:-sz.d*0.15},
    {x:-sz.w*0.22, z:sz.d*0.2}, {x:sz.w*0.22, z:sz.d*0.2},
  ];
  podPositions.forEach(pp => {
    const deskH = 0.75;
    const d1 = makeInteriorEdges(1.6, 0.05, 0.6, neonMat);
    d1.position.set(pp.x, iy+deskH, pp.z); group.add(d1);
    [[pp.x-0.7,pp.z-0.25],[pp.x+0.7,pp.z-0.25],[pp.x+0.7,pp.z+0.25],[pp.x-0.7,pp.z+0.25]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, deskH, 0.03, neonMat);
      leg.position.set(lx, iy+deskH/2, lz); group.add(leg);
    });
    const monY = iy + deskH + 0.25;
    for (let m = -1; m <= 1; m++) {
      const mFrame = makeInteriorEdges(0.45, 0.32, 0.03, neonMat);
      mFrame.position.set(pp.x+m*0.5, monY, pp.z-0.2); group.add(mFrame);
    }
  });
  // Gong pillar
  const gongH = 2.5;
  const gongPole = makeInteriorEdges(0.06, gongH, 0.06, neonMat);
  gongPole.position.set(0, iy+gongH/2, 0); group.add(gongPole);
  // Circular gong frame (octagon approximation)
  const gongR = 0.35;
  for (let i = 0; i < 8; i++) {
    const a1 = (i/8)*Math.PI*2, a2 = ((i+1)/8)*Math.PI*2;
    const x1 = Math.cos(a1)*gongR, z1 = Math.sin(a1)*gongR;
    const x2 = Math.cos(a2)*gongR, z2 = Math.sin(a2)*gongR;
    const len = Math.sqrt((x2-x1)**2+(z2-z1)**2);
    const seg = makeInteriorEdges(len, 0.03, 0.03, neonMat);
    seg.position.set((x1+x2)/2, iy+gongH-0.3, (z1+z2)/2);
    seg.rotation.y = -Math.atan2(z2-z1, x2-x1); group.add(seg);
  }
  // Leaderboard screen on wall
  const lbW = sz.w*0.4, lbH = sz.h*0.4;
  const lbFrame = makeInteriorEdges(lbW, lbH, 0.04, neonMat);
  lbFrame.position.set(0, iy+sz.h*0.6, -sz.d/2+0.2); group.add(lbFrame);
  addScreen(group, 'wave', lbW, lbH, 0, iy+sz.h*0.6, -sz.d/2+0.18, 0);
}

/* ============================================================
   INTERIOR #13 — Virtual Interview Rooms (ported from V2)
   ============================================================ */
function createInterviewInterior(group, iy, sz, neonMat) {
  const deskW = 2.2, deskH = 0.75, deskD = 1.0, deskZ = -0.3;
  const desk = makeInteriorEdges(deskW, deskH, deskD, neonMat);
  desk.position.set(0, iy+deskH/2, deskZ); group.add(desk);
  const top = makeInteriorEdges(deskW+0.1, 0.04, deskD+0.05, neonMat);
  top.position.set(0, iy+deskH+0.02, deskZ); group.add(top);
  // Interviewer chair
  const chairZ = deskZ - deskD/2 - 0.6;
  const seat = makeInteriorEdges(0.55, 0.08, 0.5, neonMat);
  seat.position.set(0, iy+0.45, chairZ); group.add(seat);
  const pole = makeInteriorEdges(0.06, 0.35, 0.06, neonMat);
  pole.position.set(0, iy+0.175, chairZ); group.add(pole);
  for (let a = 0; a < 5; a++) {
    const ang = (a/5)*Math.PI*2;
    const leg = makeInteriorEdges(0.3, 0.04, 0.04, neonMat);
    leg.position.set(Math.sin(ang)*0.18, iy+0.02, chairZ+Math.cos(ang)*0.18);
    leg.rotation.y = -ang; group.add(leg);
  }
  // 2 candidate chairs
  const guestZ = deskZ + deskD/2 + 0.7;
  [-0.7, 0.7].forEach(gx => {
    const gs = makeInteriorEdges(0.45, 0.06, 0.4, neonMat);
    gs.position.set(gx, iy+0.42, guestZ); group.add(gs);
    [[-0.18,-0.15],[0.18,-0.15],[-0.18,0.15],[0.18,0.15]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, 0.42, 0.03, neonMat);
      leg.position.set(gx+lx, iy+0.21, guestZ+lz); group.add(leg);
    });
  });
  // Screen on wall
  const scrW = sz.w*0.5, scrH = sz.h*0.35;
  const scr = makeInteriorEdges(scrW, scrH, 0.04, neonMat);
  scr.position.set(0, iy+sz.h*0.6, -sz.d/2+0.2); group.add(scr);
}

/* ============================================================
   INTERIOR #14 — Lunch Room
   ============================================================ */
function createLunchRoomInterior(group, iy, sz, neonMat) {
  // Long dining table
  const tW = 3.0, tH = 0.75, tD = 1.0;
  const table = makeInteriorEdges(tW, 0.06, tD, neonMat);
  table.position.set(0, iy+tH, 0.3); group.add(table);
  [[-tW/2+0.1,-tD/2+0.1],[tW/2-0.1,-tD/2+0.1],[-tW/2+0.1,tD/2-0.1],[tW/2-0.1,tD/2-0.1]].forEach(([lx,lz]) => {
    const leg = makeInteriorEdges(0.04, tH, 0.04, neonMat);
    leg.position.set(lx, iy+tH/2, 0.3+lz); group.add(leg);
  });
  // 6 chairs (3 per side)
  for (let i = 0; i < 3; i++) {
    const cx = -1.0 + i * 1.0;
    [-0.8, 0.8].forEach(side => {
      const cs = makeInteriorEdges(0.4, 0.05, 0.35, neonMat);
      cs.position.set(cx, iy+0.42, 0.3+side*(tD/2+0.4)); group.add(cs);
      [[-0.15,-0.12],[0.15,-0.12],[-0.15,0.12],[0.15,0.12]].forEach(([lx,lz]) => {
        const leg = makeInteriorEdges(0.03, 0.42, 0.03, neonMat);
        leg.position.set(cx+lx, iy+0.21, 0.3+side*(tD/2+0.4)+lz); group.add(leg);
      });
    });
  }
  // L-shaped counter in corner
  const ctrH = 0.9;
  const ctr1 = makeInteriorEdges(2.0, ctrH, 0.5, neonMat);
  ctr1.position.set(-sz.w/2+1.2, iy+ctrH/2, -sz.d/2+0.4); group.add(ctr1);
  const ctr2 = makeInteriorEdges(0.5, ctrH, 1.5, neonMat);
  ctr2.position.set(-sz.w/2+0.4, iy+ctrH/2, -sz.d/2+1.2); group.add(ctr2);
  // Cabinet frames on wall
  for (let i = 0; i < 2; i++) {
    const cab = makeInteriorEdges(0.8, 0.6, 0.3, neonMat);
    cab.position.set(-sz.w/2+0.8+i*1.1, iy+1.8, -sz.d/2+0.25); group.add(cab);
  }
}

/* ============================================================
   INTERIOR #15 — Swag Closet
   ============================================================ */
function createSwagClosetInterior(group, iy, sz, neonMat) {
  // Clothing rack (horizontal bar on legs)
  const rackW = 2.0, rackH = 1.6;
  const bar = makeInteriorEdges(rackW, 0.04, 0.04, neonMat);
  bar.position.set(0, iy+rackH, 0); group.add(bar);
  [[-rackW/2,0],[rackW/2,0]].forEach(([lx]) => {
    const leg = makeInteriorEdges(0.04, rackH, 0.04, neonMat);
    leg.position.set(lx, iy+rackH/2, 0); group.add(leg);
    const foot = makeInteriorEdges(0.3, 0.03, 0.3, neonMat);
    foot.position.set(lx, iy+0.015, 0); group.add(foot);
  });
  // Hanging items (small rectangles)
  [-0.6, -0.2, 0.2, 0.6].forEach(hx => {
    const hanger = makeInteriorEdges(0.3, 0.6, 0.04, neonMat);
    hanger.position.set(hx, iy+rackH-0.35, 0); group.add(hanger);
  });
  // 3 wall shelves with items
  for (let i = 0; i < 3; i++) {
    const shelfY = iy + 1.0 + i * 0.7;
    const shelf = makeInteriorEdges(sz.w*0.35, 0.04, 0.25, neonMat);
    shelf.position.set(sz.w/2-0.8, shelfY, -sz.d/2+0.2); group.add(shelf);
    // Small items on shelf
    [-0.4, 0, 0.4].forEach(ix => {
      const item = makeInteriorEdges(0.15, 0.12, 0.1, neonMat);
      item.position.set(sz.w/2-0.8+ix, shelfY+0.1, -sz.d/2+0.2); group.add(item);
    });
  }
  // Gift box stack (3 stacked cubes)
  const boxX = -sz.w/2+1.0, boxZ = sz.d/2-0.8;
  [0.5, 0.4, 0.3].forEach((s, i) => {
    let bY = iy;
    for (let j = 0; j < i; j++) bY += [0.5,0.4,0.3][j];
    const box = makeInteriorEdges(s, s, s, neonMat);
    box.position.set(boxX, bY+s/2, boxZ); group.add(box);
  });
}

/* ============================================================
   INTERIOR #16 — Karaoke Room
   ============================================================ */
function createKaraokeInterior(group, iy, sz, neonMat) {
  // Small stage platform
  const stageW = sz.w*0.6, stageH = 0.3, stageD = sz.d*0.3;
  const stageZ = -sz.d/2+stageD/2+0.3;
  const stage = makeInteriorEdges(stageW, stageH, stageD, neonMat);
  stage.position.set(0, iy+stageH/2, stageZ); group.add(stage);
  // Microphone stand
  const micPole = makeInteriorEdges(0.03, 1.3, 0.03, neonMat);
  micPole.position.set(0, iy+stageH+0.65, stageZ); group.add(micPole);
  const micHead = makeInteriorEdges(0.08, 0.06, 0.06, neonMat);
  micHead.position.set(0, iy+stageH+1.35, stageZ); group.add(micHead);
  const micBase = makeInteriorEdges(0.25, 0.03, 0.25, neonMat);
  micBase.position.set(0, iy+stageH+0.015, stageZ); group.add(micBase);
  // Large screen on wall
  const scrW = sz.w*0.7, scrH = sz.h*0.45;
  addScreen(group, 'wave', scrW, scrH, 0, iy+stageH+scrH/2+0.4, -sz.d/2+0.15, 0);
  const frame = makeInteriorEdges(scrW, scrH, 0.05, neonMat);
  frame.position.set(0, iy+stageH+scrH/2+0.4, -sz.d/2+0.15); group.add(frame);
  // Disco ball (3 intersecting rings)
  const ceilY = iy + sz.h;
  const ballY = ceilY - 1.0, ballR = 0.3;
  const rod = makeInteriorEdges(0.02, 0.5, 0.02, neonMat);
  rod.position.set(0, ceilY-0.25, stageZ); group.add(rod);
  // XY ring
  for (let i = 0; i < 12; i++) {
    const a1 = (i/12)*Math.PI*2, a2 = ((i+1)/12)*Math.PI*2;
    const x1 = Math.cos(a1)*ballR, y1 = Math.sin(a1)*ballR;
    const x2 = Math.cos(a2)*ballR, y2 = Math.sin(a2)*ballR;
    const len = Math.sqrt((x2-x1)**2+(y2-y1)**2);
    const seg = makeInteriorEdges(len, 0.02, 0.02, neonMat);
    seg.position.set((x1+x2)/2, ballY+(y1+y2)/2, stageZ);
    seg.rotation.z = Math.atan2(y2-y1, x2-x1); group.add(seg);
  }
  // XZ ring
  for (let i = 0; i < 12; i++) {
    const a1 = (i/12)*Math.PI*2, a2 = ((i+1)/12)*Math.PI*2;
    const x1 = Math.cos(a1)*ballR, z1 = Math.sin(a1)*ballR;
    const x2 = Math.cos(a2)*ballR, z2 = Math.sin(a2)*ballR;
    const len = Math.sqrt((x2-x1)**2+(z2-z1)**2);
    const seg = makeInteriorEdges(len, 0.02, 0.02, neonMat);
    seg.position.set((x1+x2)/2, ballY, stageZ+(z1+z2)/2);
    seg.rotation.y = -Math.atan2(z2-z1, x2-x1); group.add(seg);
  }
  // Seating area
  for (let i = 0; i < 4; i++) {
    const sx = -1.2 + i * 0.8;
    const seat = makeInteriorEdges(0.45, 0.05, 0.4, neonMat);
    seat.position.set(sx, iy+0.42, sz.d/2-1.0); group.add(seat);
  }
}

/* ============================================================
   INTERIOR #17 — Private Rooms (ghost aesthetic)
   ============================================================ */
function createPrivateRoomsInterior(group, iy, sz, neonMat) {
  // Small round table (octagon)
  const tR = 0.5, tH = 0.65;
  for (let i = 0; i < 8; i++) {
    const a1 = (i/8)*Math.PI*2, a2 = ((i+1)/8)*Math.PI*2;
    const x1 = Math.cos(a1)*tR, z1 = Math.sin(a1)*tR;
    const x2 = Math.cos(a2)*tR, z2 = Math.sin(a2)*tR;
    const len = Math.sqrt((x2-x1)**2+(z2-z1)**2);
    const edge = makeInteriorEdges(len, 0.04, 0.04, neonMat);
    edge.position.set((x1+x2)/2, iy+tH, (z1+z2)/2);
    edge.rotation.y = -Math.atan2(z2-z1, x2-x1); group.add(edge);
  }
  const ped = makeInteriorEdges(0.1, tH-0.1, 0.1, neonMat);
  ped.position.set(0, iy+(tH-0.1)/2, 0); group.add(ped);
  // 2 armchairs
  [-1.2, 1.2].forEach(cx => {
    // Seat
    const seat = makeInteriorEdges(0.6, 0.08, 0.55, neonMat);
    seat.position.set(cx, iy+0.38, 0); group.add(seat);
    // Backrest
    const back = makeInteriorEdges(0.6, 0.5, 0.06, neonMat);
    back.position.set(cx, iy+0.65, cx > 0 ? 0.25 : -0.25); group.add(back);
    // Armrests
    [-0.28, 0.28].forEach(az => {
      const arm = makeInteriorEdges(0.06, 0.2, 0.45, neonMat);
      arm.position.set(cx+az, iy+0.5, 0); group.add(arm);
    });
    // Legs
    [[-0.25,-0.22],[0.25,-0.22],[-0.25,0.22],[0.25,0.22]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, 0.35, 0.03, neonMat);
      leg.position.set(cx+lx, iy+0.175, lz); group.add(leg);
    });
  });
}

/* ============================================================
   INTERIOR #18 — Agentic Coworkers (ported from V2)
   ============================================================ */
function createAgentCoworkersInterior(group, iy, sz, neonMat) {
  // Central server rack
  const rackW = 0.6, rackH = sz.h*0.7, rackD = 0.6;
  const rack = makeInteriorEdges(rackW, rackH, rackD, neonMat);
  rack.position.set(0, iy+rackH/2, 0); group.add(rack);
  for (let s = 0; s < 5; s++) {
    const shelf = makeInteriorEdges(rackW-0.1, 0.03, rackD-0.1, neonMat);
    shelf.position.set(0, iy+0.4+s*(rackH/5), 0); group.add(shelf);
  }
  // 6 workstation pods in a ring
  const podR = sz.w*0.3;
  for (let i = 0; i < 6; i++) {
    const ang = (i/6)*Math.PI*2;
    const px = Math.cos(ang)*podR, pz = Math.sin(ang)*podR;
    const rot = -ang + Math.PI;
    const deskH = 0.75;
    const desk = makeInteriorEdges(1.4, 0.05, 0.6, neonMat);
    desk.position.set(px, iy+deskH, pz); desk.rotation.y = rot; group.add(desk);
    const cosR = Math.cos(rot), sinR = Math.sin(rot);
    [[-0.6,-0.25],[0.6,-0.25],[-0.6,0.25],[0.6,0.25]].forEach(([lx,lz]) => {
      const leg = makeInteriorEdges(0.03, deskH, 0.03, neonMat);
      leg.position.set(px+lx*cosR-lz*sinR, iy+deskH/2, pz+lx*sinR+lz*cosR); group.add(leg);
    });
    const monOff = -0.15;
    const monFrame = makeInteriorEdges(0.7, 0.45, 0.03, neonMat);
    monFrame.position.set(px-monOff*sinR, iy+deskH+0.06+0.225, pz+monOff*cosR);
    monFrame.rotation.y = rot; group.add(monFrame);
    addScreen(group, 'wave', 0.7, 0.45, px-monOff*sinR, iy+deskH+0.06+0.225, pz+monOff*cosR, rot);
  }
}

/* ============================================================
   INTERIOR DISPATCH
   ============================================================ */
const interiorCreators = [
  createVirtualOfficeMapInterior, createLobbyInterior, createElevatorInterior,
  createConferenceInterior, createTheaterInterior, createAInboxInterior,
  createGameRoomInterior, createAINoteTakerInterior, createVideoStudioInterior,
  createAIAssistantInterior, createVirtualEventsInterior, createPrivateOfficeInterior,
  createSalesFloorInterior, createInterviewInterior, createLunchRoomInterior,
  createSwagClosetInterior, createKaraokeInterior, createPrivateRoomsInterior,
  createAgentCoworkersInterior,
];

/* ============================================================
   BUILDING CONSTRUCTION
   ============================================================ */
function createBuilding() {
  const sz = { w: ROOM_W, d: ROOM_D, h: ROOM_H };
  const slabW = sz.w + SLAB_OVERHANG * 2;
  const slabD = sz.d + SLAB_OVERHANG * 2;

  for (let ri = 0; ri < NUM_ROOMS; ri++) {
    if (!ROOM_POS[ri]) continue;
    const { x: rx, y: floorY, z: rz } = ROOM_POS[ri];
    const roomGroup = new THREE.Group();
    roomGroup.position.set(rx, floorY, rz);

    const color = getRoomColor(ri);
    const isTomorrow = ri >= 12;
    const neonMat = new THREE.MeshBasicMaterial({
      color, transparent: isTomorrow, opacity: isTomorrow ? 0.55 : 1.0
    });
    roomNeonMats[ri] = neonMat;

    // Bottom slab
    const slabEdges = makeNeonEdges(slabW, SLAB_H, slabD, neonMat);
    slabEdges.position.y = SLAB_H / 2;
    roomGroup.add(slabEdges);

    // Floor glow
    const floorGlowMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.08, side: THREE.DoubleSide
    });
    const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(sz.w, sz.d), floorGlowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = SLAB_H + 0.02;
    roomGroup.add(floorGlow);

    // Glass box (invisible, for raycasting)
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(sz.w, sz.h, sz.d),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    glass.position.y = SLAB_H + sz.h / 2;
    roomGroup.add(glass);
    roomGlassMeshes[ri] = glass;

    // Embed overview is hairline-thin at slider size — a faint fill reads as a tower.
    if (embed) {
      const fill = new THREE.Mesh(
        new THREE.BoxGeometry(sz.w, sz.h, sz.d),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.16, depthWrite: false,
        })
      );
      fill.position.y = SLAB_H + sz.h / 2;
      roomGroup.add(fill);
    }

    // Glass neon edges
    const glassEdges = makeNeonEdges(sz.w, sz.h, sz.d, neonMat);
    glassEdges.position.y = SLAB_H + sz.h / 2;
    roomGroup.add(glassEdges);

    // Roof cap
    const roofMat = new THREE.MeshBasicMaterial({
      color: NEON, transparent: isTomorrow, opacity: isTomorrow ? 0.55 : 1.0
    });
    const roofEdges = makeNeonEdges(slabW, SLAB_H, slabD, roofMat);
    roofEdges.position.y = SLAB_H + sz.h + SLAB_H / 2;
    roomGroup.add(roofEdges);

    // Selection glow box
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.BackSide });
    const glowBox = new THREE.Mesh(new THREE.BoxGeometry(sz.w+0.6, sz.h+0.6, sz.d+0.6), glowMat);
    glowBox.position.y = SLAB_H + sz.h / 2;
    roomGroup.add(glowBox);
    roomGlowBoxes[ri] = glowMat;

    // Interior light
    const pl = new THREE.PointLight(color, 3.0, sz.w * 1.5, 2);
    pl.position.set(0, SLAB_H + sz.h * 0.6, 0);
    roomGroup.add(pl);
    roomLights[ri] = pl;

    const gl = new THREE.PointLight(color, 1.5, sz.w * 2, 2);
    gl.position.set(0, SLAB_H + sz.h * 0.4, 0);
    roomGroup.add(gl);
    roomGlowLights[ri] = gl;

    // Interior content
    const interiorGroup = new THREE.Group();
    const iy = SLAB_H + 0.01;
    interiorCreators[ri](interiorGroup, iy, sz, neonMat);
    roomGroup.add(interiorGroup);

    // CSS2D label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'floor-label';
    labelDiv.textContent = ROOM_DATA[ri].name;
    const shade = color;
    const r = (shade >> 16) & 0xff, g = (shade >> 8) & 0xff, b = shade & 0xff;
    labelDiv.style.color = `rgb(${r},${g},${b})`;
    labelDiv.style.opacity = '0';
    labelDiv.style.transition = 'opacity 0.4s ease';
    const labelObj = new CSS2DObject(labelDiv);
    labelObj.position.set(0, SLAB_H + sz.h + 1.0, 0);
    roomGroup.add(labelObj);
    roomLabelDivs[ri] = labelDiv;

    // Embed skips the scale-up intro so the tower is visible on the first frame.
    if (embed) {
      roomGroup.scale.set(1, 1, 1);
      roomGroup.position.y = floorY;
    } else {
      roomGroup.scale.set(0, 0, 0);
      roomGroup.position.y = floorY + introAnim.startYOffset;
    }

    scene.add(roomGroup);
    roomGroupRefs[ri] = roomGroup;
  }

  if (!useYextBuilding) createSectionLabels();
}

let sectionLabelToday = null, sectionLabelTomorrow = null;
let sectionLabelTodayTargetY = 0, sectionLabelTomorrowTargetY = 0;

function createSectionLabels() {
  // Compute tower centers and top
  let tAMinX = Infinity, tAMaxX = -Infinity, tAMaxY = 0;
  TODAY_ROOMS.forEach(ri => {
    const p = ROOM_POS[ri];
    tAMinX = Math.min(tAMinX, p.x - ROOM_W/2);
    tAMaxX = Math.max(tAMaxX, p.x + ROOM_W/2);
    tAMaxY = Math.max(tAMaxY, p.y + ROOM_H + SLAB_H);
  });
  let tBMinX = Infinity, tBMaxX = -Infinity, tBMaxY = 0;
  TOMORROW_ROOMS.forEach(ri => {
    const p = ROOM_POS[ri];
    tBMinX = Math.min(tBMinX, p.x - ROOM_W/2);
    tBMaxX = Math.max(tBMaxX, p.x + ROOM_W/2);
    tBMaxY = Math.max(tBMaxY, p.y + ROOM_H + SLAB_H);
  });

  // TODAY label
  const todayDiv = document.createElement('div');
  todayDiv.className = 'section-header-label';
  todayDiv.textContent = 'TODAY';
  todayDiv.style.color = '#66DDFF';
  todayDiv.style.opacity = '0';
  sectionLabelToday = new CSS2DObject(todayDiv);
  sectionLabelTodayTargetY = tAMaxY + 2;
  sectionLabelToday.position.set((tAMinX+tAMaxX)/2, tAMaxY + 2 + introAnim.startYOffset, BUILDING_OFFSET.z);
  scene.add(sectionLabelToday);

  // TOMORROW label
  const tomorrowDiv = document.createElement('div');
  tomorrowDiv.className = 'section-header-label';
  tomorrowDiv.textContent = 'TOMORROW';
  tomorrowDiv.style.color = '#33DD88';
  tomorrowDiv.style.opacity = '0';
  sectionLabelTomorrow = new CSS2DObject(tomorrowDiv);
  sectionLabelTomorrowTargetY = tBMaxY + 2;
  sectionLabelTomorrow.position.set((tBMinX+tBMaxX)/2, tBMaxY + 2 + introAnim.startYOffset, BUILDING_OFFSET.z);
  scene.add(sectionLabelTomorrow);
}

/* ============================================================
   ENVIRONMENT
   ============================================================ */
function createEnvironment() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.matrixAutoUpdate = false; ground.updateMatrix();
  scene.add(ground);
  createTronGrid();
  createRoads();
  createVehicles();
}

function createTronGrid() {
  const extent = 100;
  gridMinorMat = new THREE.LineBasicMaterial({ color: 0x1a3366, transparent: true, opacity: 0.5 });
  const minorVerts = [];
  for (let i = -extent; i <= extent; i += 2) {
    minorVerts.push(-extent, 0, i, extent, 0, i);
    minorVerts.push(i, 0, -extent, i, 0, extent);
  }
  const minorGeo = new THREE.BufferGeometry();
  minorGeo.setAttribute('position', new THREE.Float32BufferAttribute(minorVerts, 3));
  scene.add(new THREE.LineSegments(minorGeo, gridMinorMat));

  gridMajorMat = new THREE.LineBasicMaterial({ color: 0x2a5599, transparent: true, opacity: 0.8 });
  const majorVerts = [];
  for (let i = -extent; i <= extent; i += 10) {
    majorVerts.push(-extent, 0, i, extent, 0, i);
    majorVerts.push(i, 0, -extent, i, 0, extent);
  }
  const majorGeo = new THREE.BufferGeometry();
  majorGeo.setAttribute('position', new THREE.Float32BufferAttribute(majorVerts, 3));
  scene.add(new THREE.LineSegments(majorGeo, gridMajorMat));

  gridGlowMat = new THREE.MeshBasicMaterial({ color: 0x2255aa, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  [[-extent,0],[extent,0],[0,-extent],[0,extent]].forEach(([x,z], i) => {
    const isX = i < 2;
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(isX ? 0.3 : extent*2, isX ? extent*2 : 0.3), gridGlowMat);
    strip.rotation.x = -Math.PI/2; strip.position.set(x, 0.01, z);
    strip.matrixAutoUpdate = false; strip.updateMatrix(); scene.add(strip);
  });
}

function createRoads() {
  const surfMat = new THREE.MeshBasicMaterial({ color: 0x1a3366, transparent: true, opacity: 0.12 });
  const makeEdgeMat = (op) => new THREE.MeshBasicMaterial({ color: 0x2a5599, transparent: true, opacity: op });
  const centerMat = new THREE.MeshBasicMaterial({ color: NEON_BRIGHT, transparent: true, opacity: 0.5 });

  // Road X (z=28)
  const roadX = new THREE.Mesh(new THREE.PlaneGeometry(120, 6), surfMat);
  roadX.rotation.x = -Math.PI/2; roadX.position.set(0, 0.01, 28);
  roadX.matrixAutoUpdate = false; roadX.updateMatrix(); scene.add(roadX);
  [-3, 3].forEach(off => {
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.5), makeEdgeMat(0.08));
    glow.rotation.x = -Math.PI/2; glow.position.set(0, 0.015, 28+off);
    glow.matrixAutoUpdate = false; glow.updateMatrix(); scene.add(glow);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.08), makeEdgeMat(0.6));
    line.rotation.x = -Math.PI/2; line.position.set(0, 0.02, 28+off);
    line.matrixAutoUpdate = false; line.updateMatrix(); scene.add(line);
  });
  const dashXGeos = [];
  for (let dx = -60; dx < 60; dx += 4) {
    const g = new THREE.PlaneGeometry(1.5, 0.05);
    g.rotateX(-Math.PI/2); g.translate(dx, 0.02, 28); dashXGeos.push(g);
  }
  const dashXMerged = new THREE.Mesh(mergeGeometries(dashXGeos), centerMat);
  dashXGeos.forEach(g => g.dispose());
  dashXMerged.matrixAutoUpdate = false; dashXMerged.updateMatrix(); scene.add(dashXMerged);

  // Road Z (x=60)
  const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(6, 120), surfMat.clone());
  roadZ.rotation.x = -Math.PI/2; roadZ.position.set(60, 0.01, 0);
  roadZ.matrixAutoUpdate = false; roadZ.updateMatrix(); scene.add(roadZ);
  [-3, 3].forEach(off => {
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 120), makeEdgeMat(0.08));
    glow.rotation.x = -Math.PI/2; glow.position.set(60+off, 0.015, 0);
    glow.matrixAutoUpdate = false; glow.updateMatrix(); scene.add(glow);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 120), makeEdgeMat(0.6));
    line.rotation.x = -Math.PI/2; line.position.set(60+off, 0.02, 0);
    line.matrixAutoUpdate = false; line.updateMatrix(); scene.add(line);
  });
  const dashZGeos = [];
  for (let dz = -60; dz < 60; dz += 4) {
    const g = new THREE.PlaneGeometry(0.05, 1.5);
    g.rotateX(-Math.PI/2); g.translate(60, 0.02, dz); dashZGeos.push(g);
  }
  const dashZMerged = new THREE.Mesh(mergeGeometries(dashZGeos), centerMat.clone());
  dashZGeos.forEach(g => g.dispose());
  dashZMerged.matrixAutoUpdate = false; dashZMerged.updateMatrix(); scene.add(dashZMerged);
}

function createVehicles() {
  const bikeColors = [0x3399ff,0x44bbff,0x2277dd,0x55aaff,0x2288ee,0x3399cc];
  const configs = [
    { road:'x', z:27, dir:1, speed:12+Math.random()*6 },
    { road:'x', z:29, dir:-1, speed:10+Math.random()*6 },
    { road:'x', z:26.5, dir:1, speed:16+Math.random()*4 },
    { road:'z', x:59, dir:1, speed:10+Math.random()*6 },
    { road:'z', x:61, dir:-1, speed:14+Math.random()*4 },
    { road:'z', x:58.5, dir:1, speed:12+Math.random()*4 },
  ];
  configs.forEach((cfg, ci) => {
    const g = new THREE.Group();
    const col = bikeColors[ci % bikeColors.length];
    const glowMat = new THREE.MeshBasicMaterial({ color: col });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.7 });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0x661122 });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.8), darkMat));
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.7), darkMat);
    cabin.position.set(-0.1*cfg.dir, 0.35, 0); g.add(cabin);
    [0.25,-0.25].forEach(dz => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.14), glowMat);
      hl.position.set(0.9*cfg.dir, 0.05, dz); g.add(hl);
    });
    [0.25,-0.25].forEach(dz => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.12), tailMat);
      tl.position.set(-0.92*cfg.dir, 0.05, dz); g.add(tl);
    });
    const stripMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 });
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.7), stripMat);
    strip.rotation.x = -Math.PI/2; strip.position.y = -0.19; g.add(strip);
    const groundGlowMat2 = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const groundGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), groundGlowMat2);
    groundGlow.rotation.x = -Math.PI/2; groundGlow.position.set(0.6*cfg.dir, -0.19, 0); g.add(groundGlow);

    const trailMats = [], trailMeshes = [];
    for (let ti = 0; ti < 20; ti++) {
      const tMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide });
      const tMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.08), tMat);
      tMesh.rotation.x = -Math.PI/2; tMesh.position.y = 0.02; tMesh.visible = false;
      scene.add(tMesh); trailMats.push(tMat); trailMeshes.push(tMesh);
    }

    const startPos = (Math.random() - 0.5) * 100;
    if (cfg.road === 'x') { g.position.set(startPos, 0.3, cfg.z); }
    else { g.position.set(cfg.x, 0.3, startPos); g.rotation.y = Math.PI/2; }
    scene.add(g);
    vehicles.push({ group: g, ...cfg, pos: startPos, trailMeshes, trailMats, trailIdx: 0, trailTimer: 0 });
  });
}

/* ============================================================
   LIGHTING
   ============================================================ */
function setupLighting() {
  scene.add(new THREE.HemisphereLight(0x111122, 0x040408, 0.35));
  const dir = new THREE.DirectionalLight(0xaabbcc, 0.25);
  dir.position.set(25, 40, 25); scene.add(dir);
  [[0,3,7],[0,10,-7],[16,16,0],[-16,22,0]].forEach(p => {
    const al = new THREE.PointLight(WARM_LIGHT, 0.25, 25, 2);
    al.position.set(...p); scene.add(al);
  });
}

/* ============================================================
   FOCUS / DIM SYSTEM
   ============================================================ */
function dimRoom(ri, factor) {
  const g = roomGroupRefs[ri];
  if (!g) return;
  g.traverse(c => {
    if (c.isLight) {
      if (c._baseIntensity === undefined) c._baseIntensity = c.intensity;
      c.intensity = c._baseIntensity * factor;
      return;
    }
    if (!c.material) return;
    if (c.material._baseColor === undefined && c.material.color)
      c.material._baseColor = c.material.color.clone();
    if (c.material._baseOpacity === undefined)
      c.material._baseOpacity = c.material.opacity;
    if (c.material._baseColor)
      c.material.color.copy(c.material._baseColor).multiplyScalar(factor);
    if (c.material._baseOpacity < 1) {
      c.material.transparent = true;
      c.material.opacity = c.material._baseOpacity * factor;
    }
  });
  if (roomLabelDivs[ri]) roomLabelDivs[ri].style.opacity = String(factor);
}

function focusRoom(idx) {
  if (idx < 0 || idx >= NUM_ROOMS) return;
  selectedRoom = idx;
  for (let i = 0; i < NUM_ROOMS; i++) {
    if (i === idx) {
      // Brighten selected room — restore base colors at full intensity + full opacity
      const g = roomGroupRefs[i];
      if (g) g.traverse(c => {
        if (!c.material) return;
        if (c.material._baseColor === undefined && c.material.color)
          c.material._baseColor = c.material.color.clone();
        if (c.material._baseOpacity === undefined)
          c.material._baseOpacity = c.material.opacity;
        if (c.material._baseColor)
          c.material.color.copy(c.material._baseColor);
        if (c.material.transparent && c.material._baseOpacity !== undefined)
          c.material.opacity = c.material._baseOpacity;
        if (c.isLight && c._baseIntensity !== undefined)
          c.intensity = c._baseIntensity * 1.3;
      });
      if (roomLabelDivs[i]) {
        roomLabelDivs[i].style.opacity = '1';
        roomLabelDivs[i].classList.add('visible');
      }
    } else {
      dimRoom(i, 0.55);
      if (roomLabelDivs[i]) roomLabelDivs[i].classList.remove('visible');
    }
  }
  const cam = getRoomCam(idx);
  animateCamera(cam.pos, cam.target);
  setTimeout(() => showOverlay(idx), 800);
  // Update floor panel active state
  document.querySelectorAll('#floor-panel button[data-room]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.room) === idx);
    if (parseInt(btn.dataset.room) === idx)
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function unfocusRooms() {
  selectedRoom = -1;
  hoveredRoom = -1;
  hideOverlay();
  for (let i = 0; i < NUM_ROOMS; i++) {
    dimRoom(i, 1.0);
    if (roomLabelDivs[i]) {
      const shade = getRoomColor(i);
      const r = (shade >> 16) & 0xff, g = (shade >> 8) & 0xff, b = shade & 0xff;
      roomLabelDivs[i].style.color = `rgb(${r},${g},${b})`;
      roomLabelDivs[i].classList.remove('visible');
    }
  }
  document.querySelectorAll('#floor-panel button[data-room]').forEach(btn => btn.classList.remove('active'));
}

function resetView() {
  unfocusRooms();
  animateCamera(OVERVIEW_POS, OVERVIEW_TARGET);
}

/* ============================================================
   INFO OVERLAY
   ============================================================ */
function showOverlay(idx) {
  const cat = ROOM_DATA[idx].cat;
  document.getElementById('overlay-floor-num').textContent = `Floor ${ROOM_FLOOR[idx] + 1}`;
  const catEl = document.getElementById('overlay-category');
  catEl.textContent = cat.toUpperCase();
  catEl.className = 'category-tag ' + cat;
  document.getElementById('overlay-title').textContent = ROOM_DATA[idx].name;
  document.getElementById('overlay-desc').textContent = ROOM_DATA[idx].desc;
  const overlay = document.getElementById('info-overlay');
  overlay.style.display = 'block';
  if (window.innerWidth <= 768) { overlay.style.left = ''; overlay.style.top = ''; return; }
  const btn = document.querySelector(`#floor-panel button[data-room="${idx}"]`);
  if (btn) {
    const rect = btn.getBoundingClientRect();
    overlay.style.left = rect.right + 'px';
    overlay.style.top = Math.max(8, rect.top - 20) + 'px';
  }
}

function hideOverlay() {
  document.getElementById('info-overlay').style.display = 'none';
}

/* ============================================================
   RAYCASTING & INTERACTION
   ============================================================ */
function onPointerMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  mouseMoved = true;
  lastInteraction = Date.now();
}

function checkHover() {
  if (camAnim.active) return;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(roomGlassMeshes);
  let newHover = -1;
  if (hits.length > 0) newHover = roomGlassMeshes.indexOf(hits[0].object);
  if (newHover !== hoveredRoom) {
    if (hoveredRoom >= 0 && hoveredRoom !== selectedRoom && roomLabelDivs[hoveredRoom])
      roomLabelDivs[hoveredRoom].classList.remove('visible');
    if (newHover >= 0 && newHover !== selectedRoom) {
      if (selectedRoom < 0 && roomLabelDivs[newHover])
        roomLabelDivs[newHover].classList.add('visible');
      document.body.style.cursor = 'pointer';
    } else if (newHover < 0) {
      document.body.style.cursor = 'default';
    }
    hoveredRoom = newHover;
  }
}

function onClick(e) {
  if (e.button !== 0) return;
  lastInteraction = Date.now();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(roomGlassMeshes);
  if (hits.length > 0) {
    const idx = roomGlassMeshes.indexOf(hits[0].object);
    if (idx >= 0) { stopAutoTour(); focusRoom(idx); }
  }
}

function onContextMenu(e) {
  e.preventDefault();
  lastInteraction = Date.now();
  stopAutoTour();
  resetView();
}

/* ============================================================
   FLOOR PANEL
   ============================================================ */
function buildFloorPanel() {
  const panel = document.getElementById('floor-panel');
  panel.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'floor-buttons';

  // Overview button
  const ovBtn = document.createElement('button');
  ovBtn.className = 'overview';
  ovBtn.textContent = '◎ Overview';
  ovBtn.addEventListener('click', () => { lastInteraction = Date.now(); stopAutoTour(); resetView(); });
  wrap.appendChild(ovBtn);

  function addRoomButtons(floors, className) {
    for (let fi = floors.length - 1; fi >= 0; fi--) {
      floors[fi].forEach(ri => {
        if (!ROOM_POS[ri]) return;
        const btn = document.createElement('button');
        btn.dataset.room = ri;
        btn.textContent = ROOM_DATA[ri].name;
        btn.classList.add(className);
        btn.addEventListener('click', () => { lastInteraction = Date.now(); stopAutoTour(); focusRoom(ri); });
        wrap.appendChild(btn);
      });
    }
  }

  if (useYextBuilding) {
    addRoomButtons(YEXT_LAYOUT.floors, 'today');
  } else {
    const todayLabel = document.createElement('div');
    todayLabel.className = 'section-label';
    todayLabel.textContent = 'TODAY';
    wrap.appendChild(todayLabel);
    addRoomButtons(TOWER_A_FLOORS, 'today');

    const tmLabel = document.createElement('div');
    tmLabel.className = 'section-label tomorrow';
    tmLabel.textContent = 'TOMORROW';
    wrap.appendChild(tmLabel);
    addRoomButtons(TOWER_B_FLOORS, 'tomorrow');
  }
  panel.appendChild(wrap);

  // Auto-tour button
  const oldAuto = document.getElementById('autoplay-toggle');
  if (oldAuto) oldAuto.remove();
  const autoBtn = document.createElement('button');
  autoBtn.id = 'autoplay-toggle';
  autoBtn.textContent = autoTourInterval ? '■ Stop Tour' : '▶ Auto Tour';
  autoBtn.addEventListener('click', () => {
    if (autoTourInterval) stopAutoTour(); else startAutoTour();
  });
  document.body.appendChild(autoBtn);
}

/* ============================================================
   AUTO-TOUR
   ============================================================ */
function getAutoTourOrder() {
  const floors = useYextBuilding ? YEXT_LAYOUT.floors : null;
  if (floors) {
    const order = [];
    for (let fi = floors.length - 1; fi >= 0; fi--)
      floors[fi].forEach(ri => order.push(ri));
    return order;
  }
  const order = [];
  for (let fi = TOWER_A_FLOORS.length - 1; fi >= 0; fi--)
    TOWER_A_FLOORS[fi].forEach(ri => order.push(ri));
  for (let fi = TOWER_B_FLOORS.length - 1; fi >= 0; fi--)
    TOWER_B_FLOORS[fi].forEach(ri => order.push(ri));
  return order;
}

function updateAutoplayButton() {
  const btn = document.getElementById('autoplay-toggle');
  if (btn) btn.textContent = autoTourInterval ? '■ Stop Tour' : '▶ Auto Tour';
}

function startAutoTour() {
  clearInterval(autoTourInterval);
  const order = getAutoTourOrder();
  autoTourIdx = -1;
  resetView();
  autoTourInterval = setInterval(() => {
    autoTourIdx++;
    if (autoTourIdx >= order.length) { autoTourIdx = -1; resetView(); }
    else focusRoom(order[autoTourIdx]);
  }, 2500);
  updateAutoplayButton();
}

function stopAutoTour() {
  clearInterval(autoTourInterval);
  autoTourInterval = null;
  updateAutoplayButton();
}

/* ============================================================
   RESIZE
   ============================================================ */
function applyEmbedFraming() {
  if (!embed || !camera || !renderer) return;
  const w = Math.max(1, renderer.domElement.clientWidth || window.innerWidth);
  const h = Math.max(1, renderer.domElement.clientHeight || window.innerHeight);
  if (w < 8 || h < 8) return;
  // Compare slider clips the left 50% of this canvas. Shift the frustum so the
  // Yext tower sits in the visible right half instead of on the divider.
  camera.setViewOffset(w, h, -Math.round(w * 0.26), 0, w, h);
}

function onResize() {
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  camera.aspect = w / h;
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  applyEmbedFraming();
  camera.updateProjectionMatrix();
}

/* ============================================================
   ANIMATION LOOP
   ============================================================ */
function animate() {
  if (isScenePaused()) {
    rafId = 0;
    return;
  }
  rafId = requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  // Camera animation
  if (camAnim.active) {
    camAnim.progress += delta / camAnim.duration;
    if (camAnim.progress >= 1) { camAnim.progress = 1; camAnim.active = false; }
    const t = easeInOutCubic(camAnim.progress);
    camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, t);
    controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, t);
  }

  // Scripted tour (runs once on load)
  tourTimer += delta;
  if (tourStep < tourScript.length && tourTimer >= tourScript[tourStep].at) {
    const step = tourScript[tourStep];
    if (step.action === 'focus') {
      focusRoom(step.room);
    } else if (step.action === 'zoomOut') {
      unfocusRooms();
      animateCamera(OVERVIEW_POS, OVERVIEW_TARGET, 1.4);
    }
    tourStep++;
  }

  // Resume auto-rotate after scripted tour
  if (allowAutoRotate && tourStep >= tourScript.length && !camAnim.active && selectedRoom < 0) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
  }

  // Auto-rotate during auto-tour
  if (!allowAutoRotate) {
    controls.autoRotate = false;
  } else if (!camAnim.active && autoTourInterval && selectedRoom >= 0) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15;
  } else if (!camAnim.active && selectedRoom < 0 && Date.now() - lastInteraction > 3000) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
  }

  controls.update();
  if (mouseMoved) { checkHover(); mouseMoved = false; }

  // Intro appearance animation
  if (introAnim.active) {
    introAnim.elapsed += delta;
    let allDone = true;
    for (let ri = 0; ri < NUM_ROOMS; ri++) {
      if (!ROOM_POS[ri]) continue;
      const delay = getIntroDelay(ri);
      const t = Math.max(0, Math.min(1, (introAnim.elapsed - delay) / introAnim.roomDuration));
      if (t < 1) allDone = false;
      const eased = easeOutBack(t);
      const scaleCurve = easeOutCubic(t);
      const g = roomGroupRefs[ri];
      if (!g) continue;
      g.position.y = ROOM_POS[ri].y + introAnim.startYOffset * (1 - eased);
      g.scale.setScalar(scaleCurve);
      if (t > 0.6 && roomLabelDivs[ri])
        roomLabelDivs[ri].style.opacity = String(Math.min(1, (t - 0.6) / 0.4));
    }
    // Animate section labels with their tower's top floor
    if (!useYextBuilding && sectionLabelToday) {
      const lastTodayFloor = TOWER_A_FLOORS.length - 1;
      const lastTodayRoom = TOWER_A_FLOORS[lastTodayFloor][TOWER_A_FLOORS[lastTodayFloor].length - 1];
      const todayDelay = getIntroDelay(lastTodayRoom);
      const tL = Math.max(0, Math.min(1, (introAnim.elapsed - todayDelay) / introAnim.roomDuration));
      const easedL = easeOutBack(tL);
      sectionLabelToday.position.y = sectionLabelTodayTargetY + introAnim.startYOffset * (1 - easedL);
      sectionLabelToday.element.style.opacity = String(tL > 0.3 ? Math.min(1, (tL - 0.3) / 0.5) : 0);
    }
    if (!useYextBuilding && sectionLabelTomorrow) {
      const lastTmrwFloor = TOWER_B_FLOORS.length - 1;
      const lastTmrwRoom = TOWER_B_FLOORS[lastTmrwFloor][TOWER_B_FLOORS[lastTmrwFloor].length - 1];
      const tmrwDelay = getIntroDelay(lastTmrwRoom);
      const tL = Math.max(0, Math.min(1, (introAnim.elapsed - tmrwDelay) / introAnim.roomDuration));
      const easedL = easeOutBack(tL);
      sectionLabelTomorrow.position.y = sectionLabelTomorrowTargetY + introAnim.startYOffset * (1 - easedL);
      sectionLabelTomorrow.element.style.opacity = String(tL > 0.3 ? Math.min(1, (tL - 0.3) / 0.5) : 0);
    }
    if (allDone) introAnim.active = false;
  }

  // Tomorrow holographic pulse
  if (!introAnim.active && selectedRoom < 0 && !useYextBuilding) {
    const tomorrowPulse = 0.55 + 0.15 * Math.sin(elapsed * 1.5);
    TOMORROW_ROOMS.forEach(ri => {
      if (roomNeonMats[ri]) {
        roomNeonMats[ri].opacity = tomorrowPulse;
        roomNeonMats[ri].transparent = true;
      }
    });
  }

  // Subtle pulse on room neons (skip focused room)
  if (!introAnim.active) {
    const pulse = 0.02 * Math.sin(elapsed * 2);
    roomNeonMats.forEach((mat, i) => {
      if (selectedRoom >= 0 && i !== selectedRoom) return;
      const shade = getRoomColor(i);
      const br = ((shade >> 16) & 0xff) / 255;
      const bg = ((shade >> 8) & 0xff) / 255;
      const bb = (shade & 0xff) / 255;
      mat.color.setRGB(br + pulse * 0.5, bg + pulse * 0.6, bb + pulse);
    });
  }

  // Animate vehicles
  vehicles.forEach(v => {
    v.pos += v.speed * v.dir * delta;
    if (v.pos > 60) v.pos = -60;
    if (v.pos < -60) v.pos = 60;
    if (v.road === 'x') v.group.position.x = v.pos;
    else v.group.position.z = v.pos;
    v.trailTimer += delta;
    if (v.trailTimer > 0.04) {
      v.trailTimer = 0;
      const tm = v.trailMeshes[v.trailIdx];
      const tmat = v.trailMats[v.trailIdx];
      if (v.road === 'x') { tm.position.set(v.pos, 0.02, v.group.position.z); tm.rotation.z = 0; }
      else { tm.position.set(v.group.position.x, 0.02, v.pos); tm.rotation.z = Math.PI/2; }
      tmat.opacity = 0.4; tm.visible = true;
      v.trailIdx = (v.trailIdx + 1) % v.trailMeshes.length;
    }
    v.trailMats.forEach((tmat, i) => {
      if (tmat.opacity > 0) {
        tmat.opacity -= delta * 0.5;
        if (tmat.opacity <= 0) { tmat.opacity = 0; v.trailMeshes[i].visible = false; }
      }
    });
  });

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  readyToPause = true;

  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    if (fpsEl) fpsEl.textContent = `${frameCount} FPS`;
    frameCount = 0; lastFpsTime = now;
  }
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, embed ? 0.0012 : 0.004);
  if (embed) introAnim.active = false;

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 500);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = embed ? 1.35 : 1.0;
  document.body.prepend(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 10;
  controls.maxDistance = 250;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.autoRotate = allowAutoRotate;
  controls.autoRotateSpeed = 1.2;
  if (!allowAutoRotate) introAnim.elapsed = 20;

  setupLighting();
  computePositions();
  camera.position.copy(OVERVIEW_POS);
  controls.target.copy(OVERVIEW_TARGET);
  applyEmbedFraming();
  createBuilding();
  buildFloorPanel();
  createEnvironment();

  // Event listeners
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onClick);
  renderer.domElement.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(onResize).observe(document.documentElement);
  }

  // Overlay buttons
  document.getElementById('overlay-close-btn').addEventListener('click', hideOverlay);
  document.getElementById('overlay-overview-btn').addEventListener('click', () => {
    lastInteraction = Date.now(); stopAutoTour(); resetView();
  });

  // Mobile floors toggle
  document.getElementById('mobile-floors-btn').addEventListener('click', () => {
    document.getElementById('floor-panel').classList.toggle('open');
  });
  renderer.domElement.addEventListener('pointerdown', () => {
    document.getElementById('floor-panel').classList.remove('open');
  });

  animate();
}

/* ============================================================
   START
   ============================================================ */
init();
