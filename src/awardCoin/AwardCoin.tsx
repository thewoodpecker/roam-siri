import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { Group, Points } from "three";
import * as THREE from "three";
import { ExtrudedCoinValue, ExtrudedText } from "./ExtrudedCoinValue";
import { AWARD_METAL_STYLES, type AwardMetal } from "./types";

export const AWARD_COIN_MODEL_URL = "/models/award-coin.obj?v=23";

const BASE_SCALE = 0.48;
const HOVER_SCALE = 0.54;
const HOVER_DURATION = 0.28;
/** Keep in sync with `.award-success-coin` duration in globals.css */
export const SEND_DURATION = 3.4;
/** Bounce overlaps the fade/scale entrance; the coin is full size at t = 0.24 */
const SEND_BOUNCE_START_T = 0.12;
const SEND_BOUNCE_PEAK_T = 0.3;
const SEND_BOUNCE_SETTLE_T = 0.48;
const SEND_SCALE = HOVER_SCALE;
const SEND_SCALE_PEAK = 0.72;
/** Coin arrives at center at t=0.24; +N waits this many seconds after that */
const PLUS_DELAY_S = 0.4;
const PLUS_START_T = 0.24 + PLUS_DELAY_S / SEND_DURATION;
const PLUS_RISE_DUR_T = 0.18;
const PLUS_RISE_END_T = PLUS_START_T + PLUS_RISE_DUR_T;
const PLUS_HOLD_END_T = 0.74;
const PLUS_FADE_END_T = 0.82;

// Must match scripts/generate-award-coin.mjs silhouette
const EDGE_SEGS = 64;
const OUTER_R = 1.0;
const HALF_T = 0.14;
const RIM_Z = HALF_T;
const BACK_Z = -HALF_T;
const STROKE_LIFT = 0.004;
const STROKE_WIDTH = 2.25;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function isRoamLogoPart(name: string) {
  return name === "RoamLogo" || name.startsWith("RoamLogo");
}

function makeLogoMaterial(color: string, disabled?: boolean) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: disabled ? 0.25 : 0.2,
    roughness: disabled ? 0.55 : 0.35,
    emissive: disabled ? "#000000" : color,
    emissiveIntensity: disabled ? 0 : 0.95,
    transparent: !!disabled,
    opacity: disabled ? 0.55 : 1,
    side: THREE.DoubleSide,
    flatShading: false,
  });
}

function circleLoop(z: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= EDGE_SEGS; i++) {
    const a = (i / EDGE_SEGS) * Math.PI * 2 - Math.PI / 2;
    pts.push(new THREE.Vector3(Math.cos(a) * OUTER_R, Math.sin(a) * OUTER_R, z));
  }
  return pts;
}

type AwardCoinMeshProps = {
  value: number;
  metal: AwardMetal;
  disabled?: boolean;
  spinning?: boolean;
  hovered?: boolean;
  sending?: boolean;
  /** Index in the awards grid — used to stagger phase & speed */
  index?: number;
};

export function AwardCoinScene({
  value,
  metal,
  disabled,
  spinning = true,
  hovered = false,
  sending = false,
  index = 0,
}: AwardCoinMeshProps) {
  const lit = (hovered || sending) && !disabled;
  return (
    <>
      <ambientLight intensity={sending ? 1.15 : 0.9} />
      <directionalLight position={[3, 3, 4]} intensity={sending ? 1.85 : 1.55} />
      <directionalLight position={[-2, -1, 2]} intensity={0.55} />
      <directionalLight position={[0, 2, -3]} intensity={0.7} />
      {lit && (
        <pointLight
          position={[0, 0.15, 2.2]}
          intensity={sending ? 6.5 : 3.2}
          distance={sending ? 7 : 5.5}
          decay={2}
        />
      )}
      {sending && (
        <pointLight position={[0, -0.2, 1.6]} intensity={3.2} distance={5} decay={2} />
      )}
      <group position={sending ? [0, -0.42, 0] : [0, 0, 0]}>
        <CoinModel
          value={value}
          metal={metal}
          disabled={disabled}
          spinning={spinning}
          hovered={hovered}
          sending={sending}
          index={index}
        />
        {sending && <SuccessPlusLabel value={value} metal={metal} />}
      </group>
    </>
  );
}

function easeInCubic(t: number) {
  return t * t * t;
}

/** Rim strokes and the face numeral are not the body material, so the exit fade has to reach them too. */
function fadeUnmanagedMaterials(root: THREE.Object3D, opacity: number, managed: THREE.Material[]) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (managed.includes(mat)) continue;
      if (!mat.transparent) {
        mat.transparent = true;
        mat.needsUpdate = true;
      }
      mat.opacity = opacity;
      mat.depthWrite = opacity > 0.9;
    }
  });
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Fraction of send size at the start of the pop-in and the end of the pop-out. */
const SEND_POP_SCALE = 0.28;
/** Exit starts where the old drop did, and runs through the stage fade at 92–100%. */
const SEND_EXIT_START_T = 0.78;

/** Grow onto the avatar through the old arrival mark (t = 0.24). */
function sendEntranceScale(t: number): number {
  if (t >= 0.24) return 1;
  return SEND_POP_SCALE + (1 - SEND_POP_SCALE) * easeOutCubic(t / 0.24);
}

/** Reverse of the entrance: ease back toward ~28% from t = 0.78 to the end. */
function sendExitScale(t: number): number {
  if (t <= SEND_EXIT_START_T) return 1;
  const p = Math.min(1, (t - SEND_EXIT_START_T) / (1 - SEND_EXIT_START_T));
  return 1 + (SEND_POP_SCALE - 1) * easeInCubic(p);
}

/** Scale bounce for the success coin — overshoots after the entrance, then settles. */
function sendBounceScale(t: number): number {
  if (t < SEND_BOUNCE_START_T) {
    const p = t / SEND_BOUNCE_START_T;
    return BASE_SCALE + (SEND_SCALE - BASE_SCALE) * easeOutCubic(p);
  }

  if (t < SEND_BOUNCE_PEAK_T) {
    const p = (t - SEND_BOUNCE_START_T) / (SEND_BOUNCE_PEAK_T - SEND_BOUNCE_START_T);
    return SEND_SCALE + (SEND_SCALE_PEAK - SEND_SCALE) * easeOutCubic(p);
  }

  if (t < SEND_BOUNCE_SETTLE_T) {
    const p = (t - SEND_BOUNCE_PEAK_T) / (SEND_BOUNCE_SETTLE_T - SEND_BOUNCE_PEAK_T);
    const undershoot = SEND_SCALE * 0.9;
    if (p < 0.55) {
      const q = easeInOutCubic(p / 0.55);
      return SEND_SCALE_PEAK + (undershoot - SEND_SCALE_PEAK) * q;
    }
    const q = easeOutCubic((p - 0.55) / 0.45);
    return undershoot + (SEND_SCALE - undershoot) * q;
  }

  return SEND_SCALE;
}

/** Extruded +N rises from behind the coin into place (no scale pulse). */
function SuccessPlusLabel({ value, metal }: { value: number; metal: AwardMetal }) {
  const group = useRef<Group>(null);
  const opacity = useRef(0);
  const [renderOpacity, setRenderOpacity] = useState(0);
  const elapsed = useRef(0);
  const lastBucket = useRef(-1);

  useFrame((_, delta) => {
    if (!group.current) return;
    elapsed.current = Math.min(SEND_DURATION, elapsed.current + delta);
    const t = elapsed.current / SEND_DURATION;

    const startY = 0.06;
    const targetY = 1.18;
    let nextOpacity = 0;
    let y = startY;
    let z = -0.25;

    if (t >= PLUS_START_T && t < PLUS_RISE_END_T) {
      const p = easeOutCubic((t - PLUS_START_T) / PLUS_RISE_DUR_T);
      nextOpacity = Math.min(1, p * 1.35);
      y = startY + (targetY - startY) * p;
      z = -0.25 + 0.75 * p;
    } else if (t >= PLUS_RISE_END_T && t < PLUS_HOLD_END_T) {
      nextOpacity = 1;
      y = targetY;
      z = 0.5;
    } else if (t >= PLUS_HOLD_END_T && t < PLUS_FADE_END_T) {
      const p = (t - PLUS_HOLD_END_T) / (PLUS_FADE_END_T - PLUS_HOLD_END_T);
      nextOpacity = 1 - p;
      y = targetY;
      z = 0.5;
    }

    opacity.current = nextOpacity;
    group.current.position.set(0, y, z);
    group.current.scale.setScalar(1);

    const bucket = Math.round(nextOpacity * 20);
    if (bucket !== lastBucket.current) {
      lastBucket.current = bucket;
      setRenderOpacity(nextOpacity);
    }
  });

  const fontSize = value >= 100 ? 0.3 : value >= 10 ? 0.34 : 0.36;

  return (
    <group ref={group} visible={renderOpacity > 0.02}>
      <SuccessSparks metal={metal} />
      <ExtrudedText
        text={`+${value}`}
        metal={metal}
        fontSize={fontSize}
        hovered
        opacity={renderOpacity}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

const SPARK_COUNT = 42;
/** Spark travel + fade window as a fraction of SEND_DURATION after each particle's delay */
const SPARK_LIFE = 0.42;

let circleSparkTexture: THREE.CanvasTexture | null = null;

function getCircleSparkTexture() {
  if (circleSparkTexture) return circleSparkTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    circleSparkTexture = new THREE.CanvasTexture(canvas);
    return circleSparkTexture;
  }
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.9)");
  g.addColorStop(0.7, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  circleSparkTexture = new THREE.CanvasTexture(canvas);
  circleSparkTexture.needsUpdate = true;
  return circleSparkTexture;
}

/** Burst of circular additive sparks behind +N; each fades out at end of life. */
function SuccessSparks({ metal }: { metal: AwardMetal }) {
  const pointsRef = useRef<Points>(null);
  const elapsed = useRef(0);
  const style = AWARD_METAL_STYLES[metal];

  const seeds = useMemo(() => {
    const dirs = new Float32Array(SPARK_COUNT * 3);
    const speeds = new Float32Array(SPARK_COUNT);
    const delays = new Float32Array(SPARK_COUNT);
    const baseColors = new Float32Array(SPARK_COUNT * 3);
    const body = new THREE.Color(style.body);
    const highlight = new THREE.Color(style.text);
    for (let i = 0; i < SPARK_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const elev = -0.15 + Math.random() * 1.05;
      const spread = 0.55 + Math.random() * 0.7;
      dirs[i * 3] = Math.cos(theta) * spread;
      dirs[i * 3 + 1] = elev;
      dirs[i * 3 + 2] = -0.35 - Math.random() * 0.55;
      speeds[i] = 0.7 + Math.random() * 1.15;
      delays[i] = Math.random() * 0.1;
      const c = i % 3 === 0 ? highlight : body;
      baseColors[i * 3] = c.r;
      baseColors[i * 3 + 1] = c.g;
      baseColors[i * 3 + 2] = c.b;
    }
    return { dirs, speeds, delays, baseColors };
  }, [style]);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(SPARK_COUNT * 3);
    const colors = new Float32Array(SPARK_COUNT * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      map: getCircleSparkTexture(),
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    return { geometry, material };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    elapsed.current = Math.min(SEND_DURATION, elapsed.current + delta);
    const t = elapsed.current / SEND_DURATION;

    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const col = geometry.getAttribute("color") as THREE.BufferAttribute;
    const { dirs, speeds, delays, baseColors } = seeds;

    let anyVisible = false;

    for (let i = 0; i < SPARK_COUNT; i++) {
      const start = PLUS_START_T + delays[i];
      if (t < start) {
        pos.setXYZ(i, 0, 0, -0.12);
        col.setXYZ(i, 0, 0, 0);
        continue;
      }

      const local = Math.min(1, (t - start) / SPARK_LIFE);
      const eased = easeOutCubic(local);
      const dist = eased * speeds[i] * 1.15;
      const drag = 1 - eased * 0.28;
      pos.setXYZ(
        i,
        dirs[i * 3] * dist * drag,
        dirs[i * 3 + 1] * dist * drag,
        dirs[i * 3 + 2] * dist * 0.55 - 0.14,
      );

      // Bright early, fade out through the last ~40% of life
      let lifeFade: number;
      if (local < 0.6) {
        lifeFade = local < 0.12 ? easeOutCubic(local / 0.12) : 1;
      } else {
        lifeFade = 1 - easeInCubic((local - 0.6) / 0.4);
      }

      // Also drop with the +N label exit
      const labelFade =
        t < PLUS_HOLD_END_T
          ? 1
          : t < PLUS_FADE_END_T
            ? 1 - (t - PLUS_HOLD_END_T) / (PLUS_FADE_END_T - PLUS_HOLD_END_T)
            : 0;
      const fade = Math.max(0, lifeFade * labelFade);

      col.setXYZ(
        i,
        baseColors[i * 3] * fade,
        baseColors[i * 3 + 1] * fade,
        baseColors[i * 3 + 2] * fade,
      );

      if (fade > 0.02) anyVisible = true;
    }

    pos.needsUpdate = true;
    col.needsUpdate = true;
    material.size = 0.075;
    points.visible = anyVisible;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={1}
    />
  );
}

function CoinModel({
  value,
  metal,
  disabled,
  spinning,
  hovered = false,
  sending = false,
  index = 0,
}: AwardCoinMeshProps) {
  const group = useRef<Group>(null);
  const source = useLoader(OBJLoader, AWARD_COIN_MODEL_URL);
  const style = AWARD_METAL_STYLES[metal];

  // Amount face forward (π), plus per-coin phase so they don't spin in lockstep
  const startY = Math.PI + index * ((Math.PI * 2) / 6);
  const spinSpeed = 1.55 + index * 0.14;
  const floatPhase = index * 0.9;
  const floatSpeed = 1.35 + index * 0.08;
  const floatAmp = 0.045;

  const hoverTarget = useRef(0);
  const hoverFrom = useRef(0);
  const hoverTo = useRef(0);
  const hoverElapsed = useRef(HOVER_DURATION);
  const hoverAmount = useRef(0);
  const sendElapsed = useRef(0);
  const wasSending = useRef(false);

  const frontStroke = useMemo(() => circleLoop(RIM_Z + STROKE_LIFT), []);
  const backStroke = useMemo(() => circleLoop(BACK_Z - STROKE_LIFT), []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: disabled ? style.bodyDisabled : style.body,
        metalness: disabled ? Math.min(style.metalness, 0.7) : style.metalness,
        roughness: disabled ? Math.max(style.roughness, 0.5) : style.roughness,
        emissive: style.emissive ?? "#000000",
        emissiveIntensity: disabled ? 0 : (style.emissiveIntensity ?? 0),
        transparent: disabled,
        opacity: disabled ? 0.55 : 1,
        side: THREE.FrontSide,
        flatShading: false,
      }),
    [disabled, style],
  );

  // Outer/middle/inner use per-metal palette steps
  const logoMaterials = useMemo(() => {
    const outer = disabled ? style.strokeDisabled : style.logoRingOuter;
    const middle = disabled ? style.strokeDisabled : style.logoRingMiddle;
    const inner = disabled ? style.strokeDisabled : style.logoRingInner;
    return {
      outer: makeLogoMaterial(outer, disabled),
      middle: makeLogoMaterial(middle, disabled),
      inner: makeLogoMaterial(inner, disabled),
    };
  }, [disabled, style]);

  const { bodyMesh, logoMesh } = useMemo(() => {
    const body = source.clone(true);
    const logo = source.clone(true);
    const bodyRemove: THREE.Object3D[] = [];
    const logoRemove: THREE.Object3D[] = [];

    body.traverse((child) => {
      if (isRoamLogoPart(child.name)) {
        bodyRemove.push(child);
        return;
      }
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        let p: THREE.Object3D | null = m;
        while (p) {
          if (isRoamLogoPart(p.name)) {
            bodyRemove.push(m);
            return;
          }
          p = p.parent;
        }
        m.material = material;
        m.castShadow = true;
        m.geometry.computeVertexNormals();
      }
    });
    for (const obj of bodyRemove) obj.parent?.remove(obj);

    logo.traverse((child) => {
      if (child.name === "AwardCoinBody") {
        logoRemove.push(child);
        return;
      }
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        let logoName: string | null = null;
        let p: THREE.Object3D | null = m;
        while (p) {
          if (isRoamLogoPart(p.name)) {
            logoName = p.name;
            break;
          }
          if (p.name === "AwardCoinBody") break;
          p = p.parent;
        }
        if (!logoName) {
          logoRemove.push(m);
          return;
        }
        if (logoName === "RoamLogoMiddle") {
          m.material = logoMaterials.middle;
        } else if (logoName === "RoamLogoInner") {
          m.material = logoMaterials.inner;
        } else {
          m.material = logoMaterials.outer;
        }
        m.castShadow = true;
        // Draw above edge strokes so silhouette lines never sit on the rings
        m.renderOrder = 2;
        m.geometry.computeVertexNormals();
      }
    });
    for (const obj of logoRemove) obj.parent?.remove(obj);

    return { bodyMesh: body, logoMesh: logo };
  }, [source, material, logoMaterials]);

  useEffect(() => {
    return () => {
      material.dispose();
      logoMaterials.outer.dispose();
      logoMaterials.middle.dispose();
      logoMaterials.inner.dispose();
    };
  }, [material, logoMaterials]);

  // Set initial pose once — never via JSX props, or React re-renders reset the spin
  useLayoutEffect(() => {
    if (!group.current) return;
    group.current.rotation.set(0.08, startY, 0);
    group.current.scale.setScalar(BASE_SCALE);
  }, [startY]);

  const baseBodyGlow = disabled ? 0 : (style.emissiveIntensity ?? 0);
  const baseLogoGlow = disabled ? 0 : 0.95;

  useFrame((state, delta) => {
    if (!group.current) return;

    if (sending) {
      if (!wasSending.current) {
        sendElapsed.current = 0;
      }
      wasSending.current = true;
      sendElapsed.current = Math.min(SEND_DURATION, sendElapsed.current + delta);
      const t = sendElapsed.current / SEND_DURATION;

      // Starts fast, eases slower into the center (fewer revs than before)
      let spinMul: number;
      if (t < 0.24) {
        const p = easeInCubic(t / 0.24);
        spinMul = 12 - (12 - 1.05) * p;
      } else if (t < 0.78) {
        spinMul = 1.05;
      } else {
        const p = (t - 0.78) / 0.22;
        spinMul = 1.05 + p * 1.2;
      }

      // Strong glow while held at center
      const atCenter = t >= 0.24 && t < 0.78;
      const pulse =
        t >= 0.24 && t <= 0.48
          ? 1 + 0.4 * Math.sin(((t - 0.24) / 0.24) * Math.PI * 2)
          : t < 0.24
            ? 0.45 + (t / 0.24) * 0.55
            : atCenter
              ? 1.15 + 0.25 * Math.sin(state.clock.elapsedTime * 3.2)
              : 0.4 * (1 - (t - 0.78) / 0.22);

      hoverAmount.current = 1;
      // Fade and scale out in place. +N is a sibling and keeps its own fade.
      // The rim strokes are a separate line material and stay fully opaque
      // unless this fade reaches them — that's the gold ring left on the avatar.
      let exitFade = 1;
      if (t >= SEND_EXIT_START_T) {
        const p = easeInCubic((t - SEND_EXIT_START_T) / (1 - SEND_EXIT_START_T));
        exitFade = 1 - p;
      }
      const glowScale = exitFade;
      material.emissiveIntensity = (baseBodyGlow + (atCenter ? 2.1 : 1.0) + pulse * (atCenter ? 1.6 : 1.1)) * glowScale;
      const logoGlow = (baseLogoGlow + (atCenter ? 1.1 : 0.4) + pulse * (atCenter ? 1.15 : 0.7)) * glowScale;
      logoMaterials.outer.emissiveIntensity = logoGlow;
      logoMaterials.middle.emissiveIntensity = logoGlow;
      logoMaterials.inner.emissiveIntensity = logoGlow;
      group.current.scale.setScalar(sendBounceScale(t) * sendEntranceScale(t) * sendExitScale(t));

      const floatY =
        Math.sin(state.clock.elapsedTime * floatSpeed + floatPhase) * floatAmp * 0.4;
      group.current.position.y = floatY;
      // Once the fade is done, drop the whole coin so a last bright rim can't sit on the photo.
      group.current.visible = exitFade > 0.02;

      material.transparent = true;
      material.opacity = exitFade;
      material.depthWrite = exitFade > 0.9;
      logoMaterials.outer.transparent = true;
      logoMaterials.middle.transparent = true;
      logoMaterials.inner.transparent = true;
      logoMaterials.outer.opacity = exitFade;
      logoMaterials.middle.opacity = exitFade;
      logoMaterials.inner.opacity = exitFade;
      logoMaterials.outer.depthWrite = exitFade > 0.9;
      logoMaterials.middle.depthWrite = exitFade > 0.9;
      logoMaterials.inner.depthWrite = exitFade > 0.9;
      fadeUnmanagedMaterials(group.current, exitFade, [
        material,
        logoMaterials.outer,
        logoMaterials.middle,
        logoMaterials.inner,
      ]);

      if (spinning) {
        group.current.rotation.y += delta * spinSpeed * spinMul;
      }
      return;
    }

    if (wasSending.current) {
      group.current.visible = true;
      material.opacity = disabled ? 0.55 : 1;
      material.transparent = !!disabled;
      material.depthWrite = true;
      logoMaterials.outer.opacity = disabled ? 0.55 : 1;
      logoMaterials.middle.opacity = disabled ? 0.55 : 1;
      logoMaterials.inner.opacity = disabled ? 0.55 : 1;
      logoMaterials.outer.transparent = !!disabled;
      logoMaterials.middle.transparent = !!disabled;
      logoMaterials.inner.transparent = !!disabled;
      logoMaterials.outer.depthWrite = true;
      logoMaterials.middle.depthWrite = true;
      logoMaterials.inner.depthWrite = true;
      fadeUnmanagedMaterials(group.current, disabled ? 0.55 : 1, [
        material,
        logoMaterials.outer,
        logoMaterials.middle,
        logoMaterials.inner,
      ]);
      hoverAmount.current = hovered && !disabled ? 1 : 0;
      hoverFrom.current = hoverAmount.current;
      hoverTo.current = hoverAmount.current;
      hoverElapsed.current = HOVER_DURATION;
      wasSending.current = false;
    }

    const nextTarget = hovered && !disabled ? 1 : 0;
    if (nextTarget !== hoverTo.current) {
      hoverFrom.current = hoverAmount.current;
      hoverTo.current = nextTarget;
      hoverElapsed.current = 0;
    }
    hoverTarget.current = nextTarget;

    if (hoverElapsed.current < HOVER_DURATION) {
      hoverElapsed.current = Math.min(HOVER_DURATION, hoverElapsed.current + delta);
      const t = hoverElapsed.current / HOVER_DURATION;
      hoverAmount.current =
        hoverFrom.current + (hoverTo.current - hoverFrom.current) * easeInOutCubic(t);
    } else {
      hoverAmount.current = hoverTo.current;
    }

    const glow = hoverAmount.current;
    material.emissiveIntensity = baseBodyGlow + glow * 1.35;
    const logoGlow = baseLogoGlow + glow * 0.7;
    logoMaterials.outer.emissiveIntensity = logoGlow;
    logoMaterials.middle.emissiveIntensity = logoGlow;
    logoMaterials.inner.emissiveIntensity = logoGlow;

    const scale = BASE_SCALE + (HOVER_SCALE - BASE_SCALE) * glow;
    group.current.scale.setScalar(scale);

    group.current.position.y =
      Math.sin(state.clock.elapsedTime * floatSpeed + floatPhase) * floatAmp;

    if (spinning) {
      group.current.rotation.y += delta * spinSpeed;
    }
  });

  const strokeColor = disabled ? style.strokeDisabled : style.stroke;
  const strokeOpacity = disabled ? 0.55 : 1;

  return (
    <group ref={group}>
      <primitive object={bodyMesh} />
      <ExtrudedCoinValue
        value={value}
        metal={metal}
        disabled={disabled}
        hovered={hovered || sending}
      />
      {/* Outer rim silhouette only — never on Roam rings */}
      <Line
        points={frontStroke}
        color={strokeColor}
        lineWidth={STROKE_WIDTH}
        transparent={disabled}
        opacity={strokeOpacity}
        depthTest
        renderOrder={0}
      />
      <Line
        points={backStroke}
        color={strokeColor}
        lineWidth={STROKE_WIDTH}
        transparent={disabled}
        opacity={strokeOpacity}
        depthTest
        renderOrder={0}
      />
      <primitive object={logoMesh} />
    </group>
  );
}
